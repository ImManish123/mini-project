package com.smarthome.controller;

import com.smarthome.dto.LocationPayload;
import com.smarthome.entity.Booking;
import com.smarthome.repository.BookingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.transaction.annotation.Transactional;

@Controller
@RequiredArgsConstructor
public class LocationWebSocketController {

    private final SimpMessagingTemplate messagingTemplate;
    private final BookingRepository bookingRepository;

    @MessageMapping("/location/update")
    @Transactional
    public void updateLocation(@Payload LocationPayload payload) {
        // Save to DB
        bookingRepository.findById(payload.getBookingId()).ifPresent(booking -> {
            booking.setWorkerLatitude(payload.getLatitude());
            booking.setWorkerLongitude(payload.getLongitude());
            bookingRepository.save(booking);
        });
        
        // Broadcast the location to subscribers of this specific booking
        messagingTemplate.convertAndSend("/topic/booking-location/" + payload.getBookingId(), payload);
    }
}
