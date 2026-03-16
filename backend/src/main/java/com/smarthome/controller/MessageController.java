package com.smarthome.controller;

import com.smarthome.dto.ApiResponse;
import com.smarthome.entity.Message;
import com.smarthome.entity.User;
import com.smarthome.exception.AccessDeniedException;
import com.smarthome.exception.ResourceNotFoundException;
import com.smarthome.repository.MessageRepository;
import com.smarthome.repository.UserRepository;
import com.smarthome.service.MessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/messages")
@RequiredArgsConstructor
public class MessageController {

    private final MessageService messageService;
    private final UserRepository userRepository;
    private final MessageRepository messageRepository;

    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    @GetMapping
    public ResponseEntity<List<Message>> getAllMessages() {
        return ResponseEntity.ok(messageService.getAllMessages());
    }

    @GetMapping("/my-messages")
    public ResponseEntity<List<Message>> getMyMessages() {
        User user = getCurrentUser();
        return ResponseEntity.ok(messageService.getMessagesByUser(user.getId()));
    }

    @GetMapping("/booking/{bookingId}")
    public ResponseEntity<List<Message>> getBookingMessages(@PathVariable Long bookingId) {
        return ResponseEntity.ok(messageService.getMessagesByBooking(bookingId));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Long>> getUnreadCount() {
        User user = getCurrentUser();
        return ResponseEntity.ok(Map.of("count", messageService.countUnreadByReceiver(user.getId())));
    }

    @GetMapping("/admin/unread-count")
    public ResponseEntity<Map<String, Long>> getAdminUnreadCount() {
        return ResponseEntity.ok(Map.of("count", messageService.countUnreadByAdmin()));
    }

    @GetMapping("/admin/all")
    public ResponseEntity<List<Message>> getAdminAllMessages() {
        return ResponseEntity.ok(messageService.getAllMessages());
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<ApiResponse> markAsRead(@PathVariable Long id) {
        User currentUser = getCurrentUser();
        Message message = messageRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Message not found"));
        if (!message.getReceiver().getId().equals(currentUser.getId())) {
            throw new AccessDeniedException("You can only mark your own messages as read");
        }
        messageService.markAsReadByReceiver(id);
        return ResponseEntity.ok(ApiResponse.success("Marked as read", null));
    }

    @PatchMapping("/read-all")
    public ResponseEntity<ApiResponse> markAllAsRead() {
        User user = getCurrentUser();
        messageService.markAllAsReadByReceiver(user.getId());
        return ResponseEntity.ok(ApiResponse.success("All marked as read", null));
    }

    @PatchMapping("/admin/{id}/read")
    public ResponseEntity<ApiResponse> adminMarkAsRead(@PathVariable Long id) {
        messageService.markAsReadByAdmin(id);
        return ResponseEntity.ok(ApiResponse.success("Marked as read by admin", null));
    }

    @PatchMapping("/admin/read-all")
    public ResponseEntity<ApiResponse> adminMarkAllAsRead() {
        messageService.markAllAsReadByAdmin();
        return ResponseEntity.ok(ApiResponse.success("All marked as read by admin", null));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse> deleteMessage(@PathVariable Long id) {
        User currentUser = getCurrentUser();
        Message message = messageRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Message not found"));
        if (!message.getReceiver().getId().equals(currentUser.getId()) && 
            !message.getSender().getId().equals(currentUser.getId())) {
            throw new AccessDeniedException("You can only delete your own messages");
        }
        messageService.deleteMessage(id);
        return ResponseEntity.ok(ApiResponse.success("Message deleted", null));
    }
}
