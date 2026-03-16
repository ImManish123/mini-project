package com.smarthome.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStats {
    private long totalBookings;
    private long pendingBookings;
    private long completedBookings;
    private long cancelledBookings;
    private long totalVendors;
    private long activeVendors;
    private long blockedVendors;
    private long totalCustomers;
    private double totalRevenue;
    private double monthlyRevenue;
    private long todayBookings;
}
