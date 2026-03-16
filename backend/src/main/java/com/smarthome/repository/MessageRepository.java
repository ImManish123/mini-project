package com.smarthome.repository;

import com.smarthome.entity.Message;
import com.smarthome.entity.MessageType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {
    List<Message> findByBookingIdOrderByCreatedAtDesc(Long bookingId);

    List<Message> findBySenderIdOrderByCreatedAtDesc(Long senderId);

    List<Message> findByReceiverIdOrderByCreatedAtDesc(Long receiverId);

    @Query("SELECT m FROM Message m WHERE m.sender.id = :userId OR m.receiver.id = :userId ORDER BY m.createdAt DESC")
    List<Message> findByUserId(@Param("userId") Long userId);

    List<Message> findByReadByAdminFalseOrderByCreatedAtDesc();

    List<Message> findAllByOrderByCreatedAtDesc();

    @Query("SELECT COUNT(m) FROM Message m WHERE m.receiver.id = :userId AND m.readByReceiver = false")
    long countUnreadByReceiver(@Param("userId") Long userId);

    @Query("SELECT COUNT(m) FROM Message m WHERE m.readByAdmin = false")
    long countUnreadByAdmin();

    List<Message> findByMessageTypeOrderByCreatedAtDesc(MessageType messageType);
}
