package com.smarthome.service;

import com.smarthome.entity.*;
import com.smarthome.exception.ResourceNotFoundException;
import com.smarthome.repository.MessageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MessageService {

    private final MessageRepository messageRepository;

    public List<Message> getAllMessages() {
        return messageRepository.findAllByOrderByCreatedAtDesc();
    }

    public List<Message> getMessagesByBooking(Long bookingId) {
        return messageRepository.findByBookingIdOrderByCreatedAtDesc(bookingId);
    }

    public List<Message> getMessagesByUser(Long userId) {
        return messageRepository.findByUserId(userId);
    }

    public List<Message> getUnreadByAdmin() {
        return messageRepository.findByReadByAdminFalseOrderByCreatedAtDesc();
    }

    public long countUnreadByReceiver(Long userId) {
        return messageRepository.countUnreadByReceiver(userId);
    }

    public long countUnreadByAdmin() {
        return messageRepository.countUnreadByAdmin();
    }

    @Transactional
    public Message createBookingRequestMessage(Booking booking) {
        Message message = Message.builder()
                .booking(booking)
                .sender(booking.getUser())
                .receiver(booking.getVendor().getUser())
                .content("New booking request from " + booking.getUser().getName() +
                        " for " + booking.getVendor().getCategory().getCategoryName() +
                        " service on " + booking.getBookingDate() + " at " + booking.getTimeSlot() +
                        ". Amount: ₹" + booking.getTotalAmount())
                .messageType(MessageType.BOOKING_REQUEST)
                .readByReceiver(false)
                .readByAdmin(false)
                .build();
        return messageRepository.save(message);
    }

    @Transactional
    public Message createAcceptMessage(Booking booking, User worker) {
        Message message = Message.builder()
                .booking(booking)
                .sender(worker)
                .receiver(booking.getUser())
                .content("Your booking #" + booking.getId() + " for " +
                        booking.getVendor().getCategory().getCategoryName() +
                        " has been ACCEPTED by " + worker.getName() +
                        ". Service scheduled for " + booking.getBookingDate() + " at " + booking.getTimeSlot())
                .messageType(MessageType.BOOKING_ACCEPTED)
                .readByReceiver(false)
                .readByAdmin(false)
                .build();
        return messageRepository.save(message);
    }

    @Transactional
    public Message createDeclineMessage(Booking booking, User worker, String reason) {
        Message message = Message.builder()
                .booking(booking)
                .sender(worker)
                .receiver(booking.getUser())
                .content("Your booking #" + booking.getId() + " for " +
                        booking.getVendor().getCategory().getCategoryName() +
                        " has been DECLINED by " + worker.getName() +
                        (reason != null ? ". Reason: " + reason : ""))
                .messageType(MessageType.BOOKING_DECLINED)
                .readByReceiver(false)
                .readByAdmin(false)
                .build();
        return messageRepository.save(message);
    }

    @Transactional
    public Message createGeneralMessage(User sender, User receiver, Booking booking, String content) {
        Message message = Message.builder()
                .booking(booking)
                .sender(sender)
                .receiver(receiver)
                .content(content)
                .messageType(MessageType.GENERAL)
                .readByReceiver(false)
                .readByAdmin(false)
                .build();
        return messageRepository.save(message);
    }

    @Transactional
    public void markAsReadByReceiver(Long messageId) {
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new ResourceNotFoundException("Message not found"));
        message.setReadByReceiver(true);
        messageRepository.save(message);
    }

    @Transactional
    public void markAllAsReadByReceiver(Long userId) {
        List<Message> messages = messageRepository.findByReceiverIdOrderByCreatedAtDesc(userId);
        messages.forEach(m -> m.setReadByReceiver(true));
        messageRepository.saveAll(messages);
    }

    @Transactional
    public void markAsReadByAdmin(Long messageId) {
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new ResourceNotFoundException("Message not found"));
        message.setReadByAdmin(true);
        messageRepository.save(message);
    }

    @Transactional
    public void markAllAsReadByAdmin() {
        List<Message> messages = messageRepository.findByReadByAdminFalseOrderByCreatedAtDesc();
        messages.forEach(m -> m.setReadByAdmin(true));
        messageRepository.saveAll(messages);
    }

    @Transactional
    public void deleteMessage(Long id) {
        messageRepository.deleteById(id);
    }
}
