import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { bookingAPI, reviewAPI, complaintAPI } from '../../services/api';
import StatusBadge from '../../components/common/StatusBadge';
import StarRating from '../../components/common/StarRating';
import { toast } from 'react-toastify';
import { FaArrowLeft, FaStar, FaExclamationTriangle, FaRobot, FaMagic, FaCheckCircle, FaMapMarkerAlt } from 'react-icons/fa';
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const BookingDetail = () => {
  const { id } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showReview, setShowReview] = useState(false);
  const [atsQuestions, setAtsQuestions] = useState([]);
  const [atsAnswers, setAtsAnswers] = useState({});
  const [atsResult, setAtsResult] = useState(null);
  const [loadingAts, setLoadingAts] = useState(false);
  const [reviewStep, setReviewStep] = useState(1);
  const [review, setReview] = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [sentimentData, setSentimentData] = useState(null);
  const [analyzingComment, setAnalyzingComment] = useState(false);
  const [showComplaint, setShowComplaint] = useState(false);
  const [complaint, setComplaint] = useState({ title: '', description: '' });
  const [submittingComplaint, setSubmittingComplaint] = useState(false);
  const [workerLocation, setWorkerLocation] = useState(null);
  const stompClientRef = React.useRef(null);

  const loadBooking = useCallback(async () => {
    try {
      const res = await bookingAPI.getById(id);
      setBooking(res.data);
      if (res.data.workerLatitude && res.data.workerLongitude) {
        setWorkerLocation({
           latitude: res.data.workerLatitude,
           longitude: res.data.workerLongitude
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { loadBooking(); }, [loadBooking]);

  useEffect(() => {
    if (booking && booking.status === 'ON_THE_WAY') {
      const socket = new SockJS('http://localhost:8080/ws');
      const stompClient = Stomp.over(socket);
      stompClient.debug = () => {};

      stompClientRef.current = stompClient;
      stompClient.connect({}, () => {
        stompClient.subscribe('/topic/booking-location/' + id, (message) => {
          const payload = JSON.parse(message.body);
          setWorkerLocation({
            latitude: payload.latitude,
            longitude: payload.longitude
          });
        });
      });

      return () => {
        if (stompClientRef.current) {
          stompClientRef.current.deactivate();
        }
      };
    }
  }, [booking, id]);

  const handleCancel = async () => {
    if (!window.confirm('Cancel this booking?')) return;
    try {
      await bookingAPI.cancel(id, 'Cancelled by customer');
      toast.success('Booking cancelled');
      loadBooking();
    } catch (err) {
      toast.error('Failed to cancel');
    }
  };

  const handlePay = async () => {
    try {
      await bookingAPI.pay(id);
      toast.success('Payment successful!');
      loadBooking();
    } catch (err) {
      toast.error('Payment failed');
    }
  };

  const handleStartReview = async () => {
    setShowReview(true);
    setReviewStep(1);
    setLoadingAts(true);
    try {
      const cat = booking.vendor?.category?.categoryName || 'General Service';
      const res = await reviewAPI.getAtsQuestions(cat);
      setAtsQuestions(res.data || []);
      setAtsAnswers({});
      setAtsResult(null);
      setReview({ rating: 5, comment: '' });
    } catch(err) {
       toast.error('Failed to load ATS questions');
    } finally {
       setLoadingAts(false);
    }
  };

  const handleAtsChange = (idx, value) => {
    setAtsAnswers({ ...atsAnswers, [`Q${idx}`]: `${atsQuestions[idx]} - CUSTOMER ANSWER: ${value}` });
  };

  const handleSubmitAts = async () => {
    setLoadingAts(true);
    try {
      const res = await reviewAPI.calculateAtsScore(atsAnswers);
      setAtsResult(res.data);
      setReviewStep(2);
    } catch(err) {
      toast.error('Failed to calculate ATS score. Proceeding to general review.');
      setReviewStep(2);
    } finally {
      setLoadingAts(false);
    }
  };

  const handleAnalyzeSentiment = async () => {
    if (!review.comment || review.comment.trim().length < 5) {
      toast.warning('Please write at least a few words for AI analysis');
      return;
    }
    setAnalyzingComment(true);
    try {
      const res = await reviewAPI.analyzeSentiment(review.comment);
      setSentimentData(res.data);
      toast.success('AI analysis complete!');
    } catch (err) {
      toast.error('AI analysis failed. You can still submit manually.');
    } finally {
      setAnalyzingComment(false);
    }
  };

  const handleAcceptAIRating = () => {
    if (sentimentData) {
      setReview({ ...review, rating: sentimentData.suggestedRating });
      toast.info('Rating updated');
    }
  };

  const handleReview = async (e) => {
    e.preventDefault();
    setSubmittingReview(true);
    try {
      await reviewAPI.create({
        vendorId: booking.vendor.id,
        bookingId: booking.id,
        rating: review.rating,
        comment: review.comment,
        atsScore: atsResult ? atsResult.atsScore : null,
        atsFeedback: atsResult ? atsResult.aiExplanation : null,
        sentimentScore: sentimentData?.sentimentScore || null,
        sentimentLabel: sentimentData?.sentimentLabel || null,
        aiSuggestedRating: sentimentData?.suggestedRating || null
      });
      toast.success('Review submitted! Thank you!');
      setShowReview(false);
      setSentimentData(null);
    } catch (err) {
      toast.error('Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleComplaint = async (e) => {
    e.preventDefault();
    if (!complaint.title || !complaint.description) {
      toast.error('Please fill all fields');
      return;
    }
    setSubmittingComplaint(true);
    try {
      await complaintAPI.fileComplaint({
        title: complaint.title,
        description: complaint.description,
        category: 'SERVICE_COMPLAINT',
        location: booking.serviceAddress || 'N/A'
      });
      toast.success('Complaint filed successfully! Admin will review it.');
      setShowComplaint(false);
      setComplaint({ title: '', description: '' });
    } catch (err) {
      toast.error('Failed to file complaint');
    } finally {
      setSubmittingComplaint(false);
    }
  };

  const statuses = ['PENDING', 'CONFIRMED', 'ON_THE_WAY', 'IN_PROGRESS', 'COMPLETED'];
  const currentIdx = booking ? statuses.indexOf(booking.status) : -1;

  if (loading) return <div>Loading...</div>;
  if (!booking) return <div>Booking not found</div>;

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div className="container">
          <Link to="/my-bookings" className="text-white text-decoration-none mb-2 d-inline-block">
            <FaArrowLeft className="me-2" />Back to Bookings
          </Link>
          <h2 className="fw-bold text-white">Booking #{booking.id}</h2>
        </div>
      </div>
      <div className="container py-5">

      {showReview && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', overflowY: 'auto' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Service Feedback</h5>
                <button type="button" className="btn-close" onClick={() => setShowReview(false)}></button>
              </div>
              <div className="modal-body">
                {reviewStep === 1 ? (
                  <div>
                    <h6 className="text-primary mb-3"><FaRobot className="me-2"/> AI Automated Tracking Score (ATS)</h6>
                    <p className="text-muted small">Please answer the following questions to help us evaluate the service quality.</p>
                    {loadingAts ? (
                      <div className="text-center py-4"><span className="spinner-border spinner-border-sm me-2"></span> Generating questions with AI...</div>
                    ) : (
                      <div>
                        {atsQuestions.length === 0 ? (
                           <p>No ATS questions available. You can skip this step.</p>
                        ) : atsQuestions.map((q, idx) => (
                          <div key={idx} className="mb-3">
                            <label className="form-label fw-semibold">{idx + 1}. {q}</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Your answer..."
                              value={atsAnswers[`Q${idx}`]?.replace(q + ' - CUSTOMER ANSWER: ', '') || ''}
                              onChange={(e) => handleAtsChange(idx, e.target.value)}
                            />
                          </div>
                        ))}
                        
                        <div className="d-flex gap-2 mt-4">
                          <button className="btn btn-primary flex-grow-1" onClick={handleSubmitAts} disabled={loadingAts || Object.keys(atsAnswers).length < atsQuestions.length}>
                            Calculate ATS Score & Proceed
                          </button>
                          <button className="btn btn-outline-secondary flex-grow-1" onClick={() => setReviewStep(2)}>
                            Skip & Give Normal Feedback
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    {atsResult && (
                      <div className="alert alert-info border-0 shadow-sm border-start border-4 border-primary">
                         <h6 className="alert-heading border-bottom pb-2 fw-bold d-flex justify-content-between align-items-center text-primary">
                            <span className="d-flex align-items-center"><FaCheckCircle className="me-2"/> ATS Score Result</span>
                            <span className="badge bg-primary fs-6 py-2 px-3 rounded-pill">{atsResult.atsScore} <small className="fw-normal">/ 100</small></span>
                         </h6>
                         <p className="mb-1 small mt-2">{atsResult.aiExplanation}</p>
                      </div>
                    )}
                    <form onSubmit={handleReview}>
                      <div className="mb-3">
                        <label className="form-label fw-bold">Overall Rating</label>
                        <div className="d-flex gap-2">
                          {[1,2,3,4,5].map(num => (
                            <FaStar 
                              key={num} 
                              size={24}
                              className={num <= review.rating ? 'text-warning' : 'text-secondary'}
                              style={{cursor:'pointer', transition: 'transform 0.2s'}}
                              onClick={() => setReview({...review, rating: num})}
                            />
                          ))}
                        </div>
                      </div>
                      <div className="mb-3">
                        <label className="form-label fw-bold">Additional Comments</label>
                        <textarea className="form-control" rows="3" placeholder="Tell us more about your experience..." value={review.comment} onChange={e => setReview({...review, comment: e.target.value})}></textarea>
                      </div>
                      <button type="submit" className="btn btn-success w-100 py-2 fw-bold" disabled={submittingReview}>
                        {submittingReview ? 'Submitting...' : 'Submit Final Review'}
                      </button>
                    </form>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

        <div className="row g-4">
          <div className="col-lg-8">
            {booking.status !== 'CANCELLED' && (
              <div className="card border-0 shadow-sm mb-4">
                <div className="card-body p-4">
                  <h5 className="fw-bold mb-4">Booking Status</h5>
                  <div className="status-timeline">
                    {statuses.map((status, idx) => (
                      <div key={status} className={'timeline-step ' + (idx <= currentIdx ? 'active' : '')}>
                        <div className="timeline-dot"></div>
                        <span className="timeline-label">{status.replace(/_/g, ' ')}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {workerLocation && booking.status === 'ON_THE_WAY' && (
              <div className="card border-0 shadow-sm mb-4" style={{border: '2px solid #0d6efd'}}>
                <div className="card-body p-4">
                  <h5 className="fw-bold mb-3 text-primary d-flex align-items-center">
                    <FaMapMarkerAlt className="me-2 text-danger" /> 
                    Worker Live Location
                    <span className="badge bg-danger ms-auto" style={{animation: 'pulse 2s infinite'}}>LIVE</span>
                  </h5>
                  <div style={{ height: '300px', borderRadius: '12px', overflow: 'hidden' }}>
                    <MapContainer center={[workerLocation.latitude, workerLocation.longitude]} zoom={15} style={{ height: '100%', width: '100%' }}>
                      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                      <Marker position={[workerLocation.latitude, workerLocation.longitude]}>
                        <Popup>Worker is en route...</Popup>
                      </Marker>
                    </MapContainer>
                  </div>
                </div>
              </div>
            )}

            <div className="card border-0 shadow-sm mb-4">
              <div className="card-body p-4">
                <h5 className="fw-bold mb-3">Booking Details</h5>
                <div className="row g-3">
                  <div className="col-md-6">
                    <small className="text-muted">Service Provider</small>
                    <p className="fw-semibold mb-2">{booking.vendor?.name}</p>
                  </div>
                  <div className="col-md-6">
                    <small className="text-muted">Categor</small>
                    <p className="fw-semibold mb-2">{booking.vendor?.category?.categoryName}</p>
                  </div>
                  <div className="col-md-6">
                    <small className="text-muted">Date</small>
                    <p className="fw-semibold mb-2">{new Date(booking.bookingDate).toLocaleDateString()}</p>
                  </div>
                  <div className="col-md-6">
                    <small className="text-muted">Time Slot</small>
                    <p className="fw-semibold mb-2">{booking.timeSlot}</p>
                  </div>
                  <div className="col-md-6">
                    <small className="text-muted">Status</small>
                    <p className="mb-2"><StatusBadge status={booking.status} /></p>
                  </div>
                  <div className="col-md-6">
                    <small className="text-muted">Payment</small>
                    <p className="mb-2"><StatusBadge status={booking.paymentStatus} /></p>
                  </div>
                </div>
              </div>
            </div>

          </div>
          <div className="col-lg-4">
            {booking.status === 'PENDING' && (
               <button className="btn btn-outline-danger w-100 mb-3" onClick={handleCancel}>Cancel</button>
            )}
            {booking.status === 'COMPLETED' && booking.paymentStatus === 'PENDING' && (
               <button className="btn btn-success w-100 mb-3" onClick={handlePay}>Pay</button>
            )}
            {booking.status === 'COMPLETED' && (
               <button className="btn btn-primary w-100 mb-3 shadow-sm" onClick={handleStartReview}><FaMagic className="me-2" />Leave ATS Feedback</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default BookingDetail;
