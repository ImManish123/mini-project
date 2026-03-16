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
          </div>
        </div>
      </div>
    </div>
  );
};
export default BookingDetail;
