package com.smarthome.service;

import com.smarthome.dto.BookingRequest;
import com.smarthome.entity.*;
import com.smarthome.exception.BadRequestException;
import com.smarthome.exception.ResourceNotFoundException;
import com.smarthome.repository.BookingRepository;
import com.smarthome.repository.VendorRepository;
import com.smarthome.repository.UserRepository;
import com.smarthome.repository.MessageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class BookingService {

    private final BookingRepository bookingRepository;
    private final VendorRepository vendorRepository;
    private final UserRepository userRepository;
    private final MessageRepository messageRepository;

    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }

    public Booking getBookingById(Long id) {
        return bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + id));
    }

    public List<Booking> getBookingsByUser(Long userId) {
        return bookingRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public List<Booking> getUpcomingBookings(Long userId) {
        return bookingRepository.findUpcomingBookings(userId);
    }

    public List<Booking> getCompletedBookings(Long userId) {
        return bookingRepository.findCompletedBookings(userId);
    }

    @Transactional
    public Booking createBooking(Long userId, BookingRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Vendor vendor = vendorRepository.findById(request.getVendorId())
                .orElseThrow(() -> new ResourceNotFoundException("Vendor not found"));

        if (!vendor.getApproved() || vendor.getBlocked()) {
            throw new BadRequestException("Vendor is not available for booking");
        }

        // Validate pincode - check if worker serves this area
        if (request.getServicePincode() != null && !request.getServicePincode().isEmpty()) {
            if (!vendor.servesPincode(request.getServicePincode())) {
                throw new BadRequestException("This service provider does not serve pincode: " + request.getServicePincode() + 
                    ". Available pincodes: " + (vendor.getServicePincodes() != null ? vendor.getServicePincodes() : "All areas"));
            }
        }

        // Check slot availability
        List<Booking> existingBookings = bookingRepository.findActiveBookingsByVendorAndDate(
                vendor.getId(), request.getBookingDate());
        boolean slotTaken = existingBookings.stream()
                .anyMatch(b -> b.getTimeSlot().equals(request.getTimeSlot()));
        if (slotTaken) {
            throw new BadRequestException("Selected time slot is already booked");
        }

        PaymentStatus paymentStatus = "CASH_ON_SERVICE".equals(request.getPaymentMethod())
                ? PaymentStatus.CASH_ON_SERVICE
                : PaymentStatus.PENDING;

        Booking booking = Booking.builder()
                .user(user)
                .vendor(vendor)
                .bookingDate(request.getBookingDate())
                .timeSlot(request.getTimeSlot())
                .serviceAddress(request.getServiceAddress() != null ? request.getServiceAddress() : user.getAddress())
                .servicePincode(request.getServicePincode())
                .status(BookingStatus.PENDING)
                .paymentStatus(paymentStatus)
                .totalAmount(vendor.getPrice())
                .notes(request.getNotes())
                .build();

        Booking saved = bookingRepository.save(booking);

        // Auto-create booking request message if vendor has a linked user
        if (vendor.getUser() != null) {
            String instructions = "\n\n📋 INSTRUCTIONS:\n" +
                    "1. Review the booking details carefully\n" +
                    "2. Accept or Decline within 24 hours\n" +
                    "3. If accepted, arrive 10 mins before scheduled time\n" +
                    "4. Carry valid ID and required tools\n" +
                    "5. Maintain professional conduct\n" +
                    "6. Collect payment after service completion";

            Message msg = Message.builder()
                    .booking(saved)
                    .sender(user)
                    .receiver(vendor.getUser())
                    .content("🔔 NEW BOOKING REQUEST\n\n" +
                            "Customer: " + user.getName() + "\n" +
                            "Phone: " + (user.getPhone() != null ? user.getPhone() : "Not provided") + "\n" +
                            "Service: " + vendor.getCategory().getCategoryName() + "\n" +
                            "Date: " + request.getBookingDate() + "\n" +
                            "Time: " + request.getTimeSlot() + "\n" +
                            "Address: " + (request.getServiceAddress() != null ? request.getServiceAddress() : user.getAddress()) + "\n" +
                            "Amount: ₹" + vendor.getPrice() + "\n" +
                            (request.getNotes() != null ? "Notes: " + request.getNotes() + "\n" : "") +
                            instructions)
                    .messageType(MessageType.BOOKING_REQUEST)
                    .readByReceiver(false)
                    .readByAdmin(false)
                    .build();
            messageRepository.save(msg);
        }

        return saved;
    }

    @Transactional
    public Booking updateBookingStatus(Long id, String status) {
        Booking booking = getBookingById(id);
        BookingStatus newStatus = BookingStatus.valueOf(status.toUpperCase());
        booking.setStatus(newStatus);
        
        if (BookingStatus.COMPLETED.name().equals(status.toUpperCase())) {
            if (booking.getPaymentStatus() == PaymentStatus.CASH_ON_SERVICE) {
                booking.setPaymentStatus(PaymentStatus.PAID);
            }
        }
        
        Booking saved = bookingRepository.save(booking);

        // Send notifications when admin updates status
        if (newStatus == BookingStatus.CONFIRMED) {
            // Notify worker
            if (booking.getVendor().getUser() != null) {
                Message workerMsg = Message.builder()
                        .booking(saved)
                        .sender(null)
                        .receiver(booking.getVendor().getUser())
                        .content("✅ BOOKING CONFIRMED BY ADMIN\n\n" +
                                "Booking #" + saved.getId() + " has been confirmed.\n" +
                                "Customer: " + booking.getUser().getName() + "\n" +
                                "Phone: " + (booking.getUser().getPhone() != null ? booking.getUser().getPhone() : "Not provided") + "\n" +
                                "Date: " + saved.getBookingDate() + "\n" +
                                "Time: " + saved.getTimeSlot() + "\n" +
                                "Address: " + saved.getServiceAddress() + "\n" +
                                (saved.getServicePincode() != null ? "Pincode: " + saved.getServicePincode() + "\n" : "") +
                                "Amount: ₹" + saved.getTotalAmount() + "\n\n" +
                                "Please arrive on time and provide excellent service!")
                        .messageType(MessageType.BOOKING_ACCEPTED)
                        .readByReceiver(false)
                        .readByAdmin(true)
                        .build();
                messageRepository.save(workerMsg);
            }
            // Notify customer
            Message customerMsg = Message.builder()
                    .booking(saved)
                    .sender(null)
                    .receiver(booking.getUser())
                    .content("✅ BOOKING CONFIRMED\n\n" +
                            "Your booking #" + saved.getId() + " for " +
                            saved.getVendor().getCategory().getCategoryName() +
                            " has been confirmed!\n" +
                            "Worker: " + saved.getVendor().getName() + "\n" +
                            "Date: " + saved.getBookingDate() + "\n" +
                            "Time: " + saved.getTimeSlot() + "\n" +
                            "Amount: ₹" + saved.getTotalAmount())
                    .messageType(MessageType.BOOKING_ACCEPTED)
                    .readByReceiver(false)
                    .readByAdmin(true)
                    .build();
            messageRepository.save(customerMsg);
        }

        return saved;
    }

    @Transactional
    public Booking cancelBooking(Long id, String reason) {
        Booking booking = getBookingById(id);
        if (booking.getStatus() == BookingStatus.COMPLETED) {
            throw new BadRequestException("Cannot cancel a completed booking");
        }
        booking.setStatus(BookingStatus.CANCELLED);
        booking.setCancellationReason(reason);
        
        if (booking.getPaymentStatus() == PaymentStatus.PAID) {
            booking.setPaymentStatus(PaymentStatus.REFUNDED);
        }
        
        return bookingRepository.save(booking);
    }

    @Transactional
    public Booking simulatePayment(Long id) {
        Booking booking = getBookingById(id);
        booking.setPaymentStatus(PaymentStatus.PAID);
        return bookingRepository.save(booking);
    }

    public long countByStatus(BookingStatus status) {
        return bookingRepository.countByStatus(status);
    }

    public Double getTotalRevenue() {
        return bookingRepository.getTotalRevenue();
    }

    public Double getMonthlyRevenue() {
        LocalDate now = LocalDate.now();
        LocalDate startOfMonth = now.withDayOfMonth(1);
        return bookingRepository.getRevenueByDateRange(startOfMonth, now);
    }

    public long getTodayBookings() {
        return bookingRepository.countBookingsByDate(LocalDate.now());
    }

    // Worker-specific methods
    public List<Booking> getBookingsByWorker(Long workerUserId) {
        return bookingRepository.findByWorkerUserId(workerUserId);
    }

    public List<Booking> getWorkerBookingsByStatus(Long workerUserId, BookingStatus status) {
        return bookingRepository.findByWorkerUserIdAndStatus(workerUserId, status);
    }

    // Get available bookings in worker's service area that they can accept
    public List<Booking> getAvailableBookingsForWorker(Vendor workerVendor) {
        if (workerVendor == null || workerVendor.getCategory() == null) {
            return List.of();
        }
        
        Long categoryId = workerVendor.getCategory().getId();
        String workerPincodes = workerVendor.getServicePincodes();
        
        // Get all pending bookings in worker's category
        List<Booking> pendingBookings = bookingRepository.findPendingBookingsByCategory(categoryId);
        
        // Filter by worker's service pincodes
        if (workerPincodes != null && !workerPincodes.isEmpty()) {
            String[] pincodes = workerPincodes.split(",");
            return pendingBookings.stream()
                    .filter(b -> {
                        String bookingPincode = b.getServicePincode();
                        if (bookingPincode == null || bookingPincode.isEmpty()) return true;
                        for (String p : pincodes) {
                            if (p.trim().equals(bookingPincode.trim())) return true;
                        }
                        return false;
                    })
                    .toList();
        }
        return pendingBookings; // Worker serves all areas
    }

    @Transactional
    public Booking acceptBooking(Long bookingId, Long workerUserId) {
        Booking booking = getBookingById(bookingId);
        
        // Check if booking is still pending (prevents multiple workers accepting)
        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new BadRequestException("This booking has already been " + booking.getStatus().name().toLowerCase() + " by another worker");
        }
        
        // Get the worker's vendor profile
        Vendor workerVendor = vendorRepository.findByUserId(workerUserId);
        if (workerVendor == null) {
            throw new ResourceNotFoundException("Worker vendor profile not found");
        }
        
        // Verify the booking is in the same category
        if (!booking.getVendor().getCategory().getId().equals(workerVendor.getCategory().getId())) {
            throw new BadRequestException("You can only accept bookings in your service category");
        }
        
        // Verify worker serves the booking's pincode
        if (booking.getServicePincode() != null && !booking.getServicePincode().isEmpty()) {
            if (!workerVendor.servesPincode(booking.getServicePincode())) {
                throw new BadRequestException("You do not serve this pincode area");
            }
        }
        
        // Assign this booking to the accepting worker's vendor
        booking.setVendor(workerVendor);
        booking.setStatus(BookingStatus.CONFIRMED);
        Booking saved = bookingRepository.save(booking);

        // Create accepted message
        User worker = userRepository.findById(workerUserId).orElse(null);
        if (worker != null) {
            Message msg = Message.builder()
                    .booking(saved)
                    .sender(worker)
                    .receiver(booking.getUser())
                    .content("Your booking #" + saved.getId() + " for " +
                            saved.getVendor().getCategory().getCategoryName() +
                            " has been ACCEPTED by " + worker.getName() +
                            ". Scheduled for " + saved.getBookingDate() + " at " + saved.getTimeSlot())
                    .messageType(MessageType.BOOKING_ACCEPTED)
                    .readByReceiver(false)
                    .readByAdmin(false)
                    .build();
            messageRepository.save(msg);
        }

        return saved;
    }

    @Transactional
    public Booking declineBooking(Long bookingId, Long workerUserId, String reason) {
        Booking booking = getBookingById(bookingId);
        if (booking.getVendor().getUser() == null || !booking.getVendor().getUser().getId().equals(workerUserId)) {
            throw new com.smarthome.exception.AccessDeniedException("You are not authorized to decline this booking");
        }
        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new BadRequestException("Only pending bookings can be declined");
        }
        booking.setStatus(BookingStatus.DECLINED);
        booking.setCancellationReason(reason);
        Booking saved = bookingRepository.save(booking);

        User worker = userRepository.findById(workerUserId).orElse(null);
        if (worker != null) {
            Message msg = Message.builder()
                    .booking(saved)
                    .sender(worker)
                    .receiver(booking.getUser())
                    .content("Your booking #" + saved.getId() + " for " +
                            saved.getVendor().getCategory().getCategoryName() +
                            " has been DECLINED by " + worker.getName() +
                            (reason != null ? ". Reason: " + reason : ""))
                    .messageType(MessageType.BOOKING_DECLINED)
                    .readByReceiver(false)
                    .readByAdmin(false)
                    .build();
            messageRepository.save(msg);
        }

        return saved;
    }

    public long countWorkerBookingsByStatus(Long workerUserId, BookingStatus status) {
        return bookingRepository.countByWorkerUserIdAndStatus(workerUserId, status);
    }

    public long countDeclined() {
        return bookingRepository.countDeclined();
    }

    // Admin decline booking
    @Transactional
    public Booking adminDeclineBooking(Long bookingId, String reason) {
        Booking booking = getBookingById(bookingId);
        if (booking.getStatus() == BookingStatus.COMPLETED) {
            throw new BadRequestException("Cannot decline a completed booking");
        }
        booking.setStatus(BookingStatus.DECLINED);
        booking.setCancellationReason("Admin declined: " + (reason != null ? reason : "No reason provided"));
        
        if (booking.getPaymentStatus() == PaymentStatus.PAID) {
            booking.setPaymentStatus(PaymentStatus.REFUNDED);
        }
        
        Booking saved = bookingRepository.save(booking);

        // Notify customer
        Message customerMsg = Message.builder()
                .booking(saved)
                .sender(null)
                .receiver(booking.getUser())
                .content("⚠️ BOOKING DECLINED BY ADMIN\n\n" +
                        "Your booking #" + saved.getId() + " for " +
                        saved.getVendor().getCategory().getCategoryName() +
                        " has been declined by the administrator.\n" +
                        (reason != null ? "Reason: " + reason : ""))
                .messageType(MessageType.BOOKING_DECLINED)
                .readByReceiver(false)
                .readByAdmin(true)
                .build();
        messageRepository.save(customerMsg);

        // Notify worker if exists
        if (booking.getVendor().getUser() != null) {
            Message workerMsg = Message.builder()
                    .booking(saved)
                    .sender(null)
                    .receiver(booking.getVendor().getUser())
                    .content("⚠️ BOOKING DECLINED BY ADMIN\n\n" +
                            "Booking #" + saved.getId() + " from customer " +
                            booking.getUser().getName() + " has been declined by the administrator.\n" +
                            (reason != null ? "Reason: " + reason : ""))
                    .messageType(MessageType.BOOKING_DECLINED)
                    .readByReceiver(false)
                    .readByAdmin(true)
                    .build();
            messageRepository.save(workerMsg);
        }

        return saved;
    }
}
