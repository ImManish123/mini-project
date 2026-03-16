package com.smarthome.config;

import com.smarthome.entity.*;
import com.smarthome.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final ServiceCategoryRepository categoryRepository;
    private final VendorRepository vendorRepository;
    private final ParkingSlotRepository parkingSlotRepository;
    private final ReviewRepository reviewRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        // Create admin user if not exists
        if (!userRepository.existsByEmail("admin@smarthome.com")) {
            User admin = User.builder()
                    .name("Admin")
                    .email("admin@smarthome.com")
                    .password(passwordEncoder.encode("admin123"))
                    .role(Role.ADMIN)
                    .phone("9999999999")
                    .address("Admin Office")
                    .active(true)
                    .build();
            userRepository.save(admin);
        }

        // Create demo customers
        if (!userRepository.existsByEmail("customer@test.com")) {
            User customer = User.builder()
                    .name("John Doe")
                    .email("customer@test.com")
                    .password(passwordEncoder.encode("customer123"))
                    .role(Role.CUSTOMER)
                    .phone("8888888888")
                    .address("123 Main Street, City")
                    .active(true)
                    .build();
            userRepository.save(customer);
        }

        if (!userRepository.existsByEmail("rahul@test.com")) {
            userRepository.save(User.builder()
                    .name("Rahul Sharma")
                    .email("rahul@test.com")
                    .password(passwordEncoder.encode("customer123"))
                    .role(Role.CUSTOMER)
                    .phone("9876543210")
                    .address("Flat 201, Block B, Green Valley Apartments, Mumbai")
                    .active(true)
                    .build());
        }

        if (!userRepository.existsByEmail("priya@test.com")) {
            userRepository.save(User.builder()
                    .name("Priya Kapoor")
                    .email("priya@test.com")
                    .password(passwordEncoder.encode("customer123"))
                    .role(Role.CUSTOMER)
                    .phone("9123456789")
                    .address("Flat 305, Tower C, Lakeside Residency, Bangalore")
                    .active(true)
                    .build());
        }

        if (!userRepository.existsByEmail("amit@test.com")) {
            userRepository.save(User.builder()
                    .name("Amit Patel")
                    .email("amit@test.com")
                    .password(passwordEncoder.encode("customer123"))
                    .role(Role.CUSTOMER)
                    .phone("9988776655")
                    .address("Flat 102, Sunrise Heights, Pune")
                    .active(true)
                    .build());
        }

        if (!userRepository.existsByEmail("sneha@test.com")) {
            userRepository.save(User.builder()
                    .name("Sneha Reddy")
                    .email("sneha@test.com")
                    .password(passwordEncoder.encode("customer123"))
                    .role(Role.CUSTOMER)
                    .phone("9090909090")
                    .address("Flat 408, Palm Grove, Hyderabad")
                    .active(true)
                    .build());
        }

        // Create named demo workers (with known credentials)
        if (!userRepository.existsByEmail("worker@test.com")) {
            userRepository.save(User.builder()
                    .name("Ravi Kumar")
                    .email("worker@test.com")
                    .password(passwordEncoder.encode("worker123"))
                    .role(Role.WORKER)
                    .phone("7000100001")
                    .address("12, Service Lane, Delhi")
                    .active(true)
                    .build());
        }

        if (!userRepository.existsByEmail("suresh@test.com")) {
            userRepository.save(User.builder()
                    .name("Suresh Yadav")
                    .email("suresh@test.com")
                    .password(passwordEncoder.encode("worker123"))
                    .role(Role.WORKER)
                    .phone("7000100002")
                    .address("45, MG Road, Chennai")
                    .active(true)
                    .build());
        }

        if (!userRepository.existsByEmail("meena@test.com")) {
            userRepository.save(User.builder()
                    .name("Meena Kumari")
                    .email("meena@test.com")
                    .password(passwordEncoder.encode("worker123"))
                    .role(Role.WORKER)
                    .phone("7000100003")
                    .address("78, Residency Road, Bangalore")
                    .active(true)
                    .build());
        }

        // Merge duplicate categories: reassign vendors from old name to new name, then delete old
        mergeDuplicateCategory("Plumbing", "Plumber");
        mergeDuplicateCategory("Electrical", "Electrician");
        mergeDuplicateCategory("WiFi & Internet", "WiFi");
        mergeDuplicateCategory("Cable TV", "Cable");
        mergeDuplicateCategory("Milk Delivery", "Milk");

        // Create service categories if not exist (each checked individually)
        createCategoryIfNotExists("Cleaning", "Professional home cleaning services including deep cleaning, bathroom cleaning, kitchen cleaning, and more.", "ðŸ§¹", "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400");
        createCategoryIfNotExists("Plumber", "Expert plumbing services for leaks, pipe repairs, bathroom fittings, water heater installation, and drainage solutions.", "ðŸ”§", "https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=400");
        createCategoryIfNotExists("Electrician", "Certified electricians for wiring, switchboard repair, fan installation, inverter setup, and electrical safety inspections.", "âš¡", "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400");
        createCategoryIfNotExists("Appliance Repair", "Repair services for AC, washing machine, refrigerator, microwave, TV, and other home appliances.", "ðŸ”¨", "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400");
        createCategoryIfNotExists("Beauty & Wellness", "At-home beauty services including facial, manicure, pedicure, hair styling, spa treatments, and grooming.", "ðŸ’†", "https://images.unsplash.com/photo-1560750588-73207b1ef5b8?w=400");
        createCategoryIfNotExists("Pest Control", "Comprehensive pest control for cockroaches, termites, mosquitoes, bed bugs, and rodents.", "ðŸ›¡ï¸", "https://images.unsplash.com/photo-1632935190835-3624b6882b8a?w=400");
        createCategoryIfNotExists("Hair Cut", "Professional hair cutting services including men's haircut, women's haircut, kids haircut, styling, and grooming at your doorstep.", "âœ‚ï¸", "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=400");
        createCategoryIfNotExists("Movers", "Professional packing, moving, and relocation services for homes and offices within the city and intercity.", "ðŸš›", "https://images.unsplash.com/photo-1600518464441-9154a4dea21b?w=400");
        createCategoryIfNotExists("WiFi", "WiFi setup, router configuration, internet troubleshooting, and network optimization services.", "ðŸ“¶", "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=400");
        createCategoryIfNotExists("Cable", "Cable TV installation, dish antenna setup, set-top box configuration, and channel troubleshooting services.", "ðŸ“º", "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400");
        createCategoryIfNotExists("Electricity", "Electricity meter installation, new connection setup, power backup solutions, and electricity bill support services.", "ðŸ’¡", "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=400");
        createCategoryIfNotExists("Water Supply", "Water tank cleaning, water purifier installation, pipeline repair, and water supply connection services.", "ðŸ’§", "https://images.unsplash.com/photo-1581093458791-9f3c3250a8b0?w=400");
        createCategoryIfNotExists("Gas Connection", "LPG gas connection, gas pipeline installation, gas stove repair, and gas safety inspection services.", "ðŸ”¥", "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400");
        createCategoryIfNotExists("Milk", "Daily fresh milk delivery to your doorstep including cow milk, buffalo milk, toned milk, and organic options.", "ðŸ¥›", "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400");
        createCategoryIfNotExists("Newspaper", "Daily newspaper and magazine delivery services including English, Hindi, and regional language publications.", "ðŸ“°", "https://images.unsplash.com/photo-1504711434969-e33886168d6c?w=400");
        createCategoryIfNotExists("Cleaning Staff", "Dedicated daily, weekly, or monthly cleaning staff for your home including cook, maid, and housekeeping services.", "ðŸ§‘â€ðŸ³", "https://images.unsplash.com/photo-1556911220-bff31c812dba?w=400");
        createCategoryIfNotExists("Courier Partners", "Courier pickup, parcel delivery, document dispatch, and same-day express delivery services.", "ðŸ“¦", "https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=400");
        createCategoryIfNotExists("Laundry", "Professional laundry and dry cleaning services including wash, iron, fold, and doorstep pickup and delivery.", "ðŸ‘”", "https://images.unsplash.com/photo-1545173168-9f1947eebb7f?w=400");

        // Ensure every category has at least 2 default vendors with worker accounts
        seedVendorsForAllCategories();
        // Update existing reviews to have ATS scores for demo
        java.util.List<Review> existingReviews = reviewRepository.findAll();
        for (Review r : existingReviews) {
            if (r.getAtsScore() == null) {
                r.setAtsScore(80 + (int)(Math.random() * 20));
                reviewRepository.save(r);
            }
        }

        // Create sample reviews/testimonials
        if (reviewRepository.count() == 0) {
            User customerUser = userRepository.findByEmail("customer@test.com").orElse(null);
            // Get worker users by role (since auto-generated workers have dynamic emails)
            java.util.List<User> workers = userRepository.findAll().stream()
                    .filter(u -> u.getRole() == Role.WORKER)
                    .limit(3)
                    .toList();
            User worker1User = workers.size() > 0 ? workers.get(0) : null;
            User worker2User = workers.size() > 1 ? workers.get(1) : null;
            User worker3User = workers.size() > 2 ? workers.get(2) : null;

            java.util.List<Vendor> allVendors = vendorRepository.findAll();

            if (customerUser != null && allVendors.size() >= 6) {
                createReview(customerUser, allVendors.get(0), 5, "Excellent cleaning service! The team was very professional and thorough. My apartment has never been this clean. Highly recommend to all residents!");
                createReview(customerUser, allVendors.get(2), 5, "The electrician was very knowledgeable and fixed our wiring issue quickly. Very punctual and professional. Great service for our apartment community.");
            }
            if (worker1User != null && allVendors.size() >= 4) {
                createReview(worker1User, allVendors.get(1), 5, "Quick Fix Plumbing saved us during an emergency leak at midnight. They arrived within 30 minutes and resolved the issue. Best plumbing service in our community!");
                createReview(worker1User, allVendors.get(3), 4, "Got our washing machine repaired in just one visit. The technician explained everything clearly. Very reasonable pricing for apartment residents.");
            }
            if (worker2User != null && allVendors.size() >= 6) {
                createReview(worker2User, allVendors.get(4), 5, "Amazing beauty service at home! The beautician was skilled and used premium products. Perfect for when you don't want to leave the apartment complex.");
                createReview(worker2User, allVendors.get(5), 4, "Thorough pest control treatment for our entire flat. No cockroaches since the treatment. They also provided useful tips for prevention.");
            }
            if (worker3User != null && allVendors.size() >= 2) {
                createReview(worker3User, allVendors.get(0), 4, "Booked deep cleaning before a festival. The team was friendly and efficient. Used eco-friendly products which is great for families with kids.");
                createReview(worker3User, allVendors.get(1), 5, "Excellent plumbing work for our bathroom renovation. Very skilled team and completed the work on the promised date. Will definitely book again!");
            }
        }

        // Create parking slots - Allocated (1 per home) + Additional bookable slots
        if (parkingSlotRepository.count() == 0) {
            // Fetch users for allocation
            User customerUser2 = userRepository.findByEmail("customer@test.com").orElse(null);
            // Get first 2 worker users for allocation
            java.util.List<User> workerUsers = userRepository.findAll().stream()
                    .filter(u -> u.getRole() == Role.WORKER)
                    .limit(2)
                    .toList();
            User workerUser1 = workerUsers.size() > 0 ? workerUsers.get(0) : null;
            User workerUser2 = workerUsers.size() > 1 ? workerUsers.get(1) : null;

            // Allocated slots (1 per resident/flat) - these are included with the home
            createAllocatedParkingSlot("R-101", "Ground Floor", SlotType.FOUR_WHEELER, 0.0, "Block A - Flat 101", "101", customerUser2);
            createAllocatedParkingSlot("R-102", "Ground Floor", SlotType.FOUR_WHEELER, 0.0, "Block A - Flat 102", "102", workerUser1);
            createAllocatedParkingSlot("R-103", "Ground Floor", SlotType.FOUR_WHEELER, 0.0, "Block A - Flat 103", "103", workerUser2);
            createAllocatedParkingSlot("R-201", "1st Floor", SlotType.FOUR_WHEELER, 0.0, "Block A - Flat 201", "201", null);
            createAllocatedParkingSlot("R-202", "1st Floor", SlotType.FOUR_WHEELER, 0.0, "Block A - Flat 202", "202", null);
            createAllocatedParkingSlot("R-301", "1st Floor", SlotType.TWO_WHEELER, 0.0, "Block A - Flat 301", "301", null);

            // Additional bookable slots (for residents needing extra parking)
            createParkingSlot("A-01", "Basement 1", SlotType.FOUR_WHEELER, 50.0, "Additional Parking - Near Entrance");
            createParkingSlot("A-02", "Basement 1", SlotType.FOUR_WHEELER, 50.0, "Additional Parking - Near Entrance");
            createParkingSlot("A-03", "Basement 1", SlotType.FOUR_WHEELER, 40.0, "Additional Parking - Near Staircase");
            createParkingSlot("A-04", "Basement 1", SlotType.HANDICAPPED, 30.0, "Additional Parking - Near Elevator (Accessible)");
            createParkingSlot("A-05", "Basement 2", SlotType.TWO_WHEELER, 20.0, "Additional Parking - Two-wheeler zone");
            createParkingSlot("A-06", "Basement 2", SlotType.TWO_WHEELER, 20.0, "Additional Parking - Two-wheeler zone");
            createParkingSlot("A-07", "Basement 2", SlotType.TWO_WHEELER, 15.0, "Additional Parking - Two-wheeler zone");
            createParkingSlot("A-08", "Basement 2", SlotType.FOUR_WHEELER, 35.0, "Additional Parking - Covered");
        }
    }

    private void seedVendorsForAllCategories() {
        // Worker name pools
        String[][] workerNames = {
            {"Rajesh Kumar", "Mumbai, Maharashtra", "7777770001"},
            {"Suresh Sharma", "Delhi, NCR", "7777770002"},
            {"Priya Patel", "Bangalore, Karnataka", "7777770003"},
            {"Amit Verma", "Chennai, Tamil Nadu", "7777770004"},
            {"Deepak Singh", "Hyderabad, Telangana", "7777770005"},
            {"Sneha Reddy", "Pune, Maharashtra", "7777770006"},
            {"Vikram Rao", "Kolkata, West Bengal", "7777770007"},
            {"Anita Gupta", "Jaipur, Rajasthan", "7777770008"},
            {"Manoj Tiwari", "Lucknow, Uttar Pradesh", "7777770009"},
            {"Kavitha Nair", "Kochi, Kerala", "7777770010"},
            {"Ravi Shankar", "Ahmedabad, Gujarat", "7777770011"},
            {"Meena Kumari", "Bhopal, Madhya Pradesh", "7777770012"},
            {"Arjun Das", "Patna, Bihar", "7777770013"},
            {"Lakshmi Devi", "Visakhapatnam, AP", "7777770014"},
            {"Sanjay Mishra", "Nagpur, Maharashtra", "7777770015"},
            {"Pooja Yadav", "Indore, Madhya Pradesh", "7777770016"},
            {"Rahul Joshi", "Chandigarh, Punjab", "7777770017"},
            {"Divya Menon", "Thiruvananthapuram, Kerala", "7777770018"},
            {"Kiran Bhat", "Mysore, Karnataka", "7777770019"},
            {"Sunita Chaudhary", "Noida, Uttar Pradesh", "7777770020"},
            {"Ganesh Pillai", "Coimbatore, Tamil Nadu", "7777770021"},
            {"Rekha Iyer", "Madurai, Tamil Nadu", "7777770022"},
            {"Naveen Reddy", "Secunderabad, Telangana", "7777770023"},
            {"Bhavani Krishnan", "Salem, Tamil Nadu", "7777770024"},
            {"Mohan Lal", "Gurgaon, Haryana", "7777770025"},
            {"Jaya Srinivasan", "Navi Mumbai, Maharashtra", "7777770026"},
            {"Prakash Hegde", "Mangalore, Karnataka", "7777770027"},
            {"Shanti Bose", "Guwahati, Assam", "7777770028"},
            {"Arun Thakur", "Dehradun, Uttarakhand", "7777770029"},
            {"Nisha Rawat", "Shimla, Himachal Pradesh", "7777770030"},
            {"Vinod Kapoor", "Amritsar, Punjab", "7777770031"},
            {"Radha Venkat", "Trichy, Tamil Nadu", "7777770032"},
            {"Sunil Patil", "Aurangabad, Maharashtra", "7777770033"},
            {"Uma Mahesh", "Warangal, Telangana", "7777770034"},
            {"Dinesh Chand", "Varanasi, Uttar Pradesh", "7777770035"},
            {"Padma Rani", "Vijayawada, AP", "7777770036"},
        };

        // Vendor templates per category name: {vendorName1, desc1, price1, exp1, rating1, area1, vendorName2, desc2, price2, exp2, rating2, area2}
        java.util.Map<String, String[][]> categoryVendorTemplates = new java.util.LinkedHashMap<>();
        categoryVendorTemplates.put("Cleaning", new String[][]{
            {"Sparkle Clean Services", "Professional deep cleaning team with eco-friendly products", "499", "5", "4.5", "Mumbai, Pune"},
            {"Fresh Home Cleaners", "Affordable daily and weekly cleaning solutions", "399", "3", "4.2", "Delhi, Noida"}
        });
        categoryVendorTemplates.put("Plumber", new String[][]{
            {"Quick Fix Plumbing", "Emergency plumbing services available 24/7", "299", "8", "4.7", "Bangalore, Mysore"},
            {"AquaPro Solutions", "Experienced in all types of plumbing work", "349", "6", "4.4", "Chennai, Coimbatore"},
            {"ProPipe Plumbers", "Licensed plumbers for residential repairs, installations, and emergency services", "349", "9", "4.6", "All Major Cities"}
        });
        categoryVendorTemplates.put("Electrician", new String[][]{
            {"PowerUp Electricals", "Licensed electricians for residential and commercial work", "399", "10", "4.8", "Mumbai, Thane"},
            {"Bright Spark Electric", "Specializing in modern electrical installations", "299", "4", "4.3", "Hyderabad, Secunderabad"},
            {"WirePro Electricians", "Certified electricians for wiring, switchboard repair, and appliance installation", "349", "11", "4.8", "All Major Cities"}
        });
        categoryVendorTemplates.put("Appliance Repair", new String[][]{
            {"FixIt Appliance Repair", "Multi-brand appliance repair experts", "449", "7", "4.6", "Delhi, Gurgaon"},
            {"CoolCare Services", "AC and refrigerator specialists", "549", "5", "4.1", "Pune, Nashik"}
        });
        categoryVendorTemplates.put("Beauty & Wellness", new String[][]{
            {"GlowUp Beauty Studio", "Premium at-home beauty and spa services", "699", "6", "4.9", "Mumbai, Navi Mumbai"},
            {"StyleNest Salon", "Expert beauticians for all occasions", "599", "4", "4.5", "Bangalore, Whitefield"}
        });
        categoryVendorTemplates.put("Pest Control", new String[][]{
            {"ShieldGuard Pest Control", "Complete pest elimination with warranty", "799", "9", "4.7", "All Major Cities"},
            {"BugFree Solutions", "Eco-friendly pest control methods", "599", "5", "4.3", "Hyderabad, Vizag"}
        });
        categoryVendorTemplates.put("Hair Cut", new String[][]{
            {"Stylish Cuts Salon", "Expert barbers for men's and women's haircuts available 24/7", "199", "8", "4.8", "Mumbai, Pune"},
            {"TrimPro Hair Studio", "Professional hair styling and grooming services", "249", "6", "4.5", "Bangalore, Mysore"}
        });
        categoryVendorTemplates.put("Movers", new String[][]{
            {"SwiftMove Packers", "Full-service packing, loading, and relocation with insurance coverage", "2999", "10", "4.6", "All Major Cities"},
            {"SafeShift Movers", "Affordable and reliable local and intercity moving services", "1999", "7", "4.3", "Mumbai, Pune, Nashik"}
        });
        categoryVendorTemplates.put("WiFi", new String[][]{
            {"NetConnect Solutions", "High-speed broadband installation and WiFi optimization", "499", "5", "4.5", "All Major Cities"},
            {"SpeedLink Internet", "Fiber optic and broadband setup with 24/7 support", "399", "8", "4.7", "Bangalore, Hyderabad"},
            {"FastNet WiFi", "WiFi router setup, mesh network installation, and speed optimization", "399", "5", "4.6", "All Major Cities"}
        });
        categoryVendorTemplates.put("Cable", new String[][]{
            {"ClearView Cable", "HD cable TV setup with 500+ channels and set-top box installation", "299", "12", "4.4", "Mumbai, Delhi, Chennai"},
            {"DigitalVision TV", "DTH and cable TV installation with smart TV integration", "249", "6", "4.2", "Bangalore, Hyderabad"},
            {"TrueSignal Cable", "HD cable connection, set-top box installation, and signal troubleshooting", "249", "8", "4.5", "All Major Cities"}
        });
        categoryVendorTemplates.put("Electricity", new String[][]{
            {"PowerGrid Connect", "New electricity connections, meter installation, and power backup solutions", "599", "15", "4.8", "All Major Cities"},
            {"VoltSafe Electricals", "Electricity meter services, wiring, and safety inspections", "449", "9", "4.5", "Delhi, Gurgaon, Noida"}
        });
        categoryVendorTemplates.put("Water Supply", new String[][]{
            {"AquaPure Services", "Water purifier installation, tank cleaning, and pipeline maintenance", "349", "8", "4.6", "All Major Cities"},
            {"ClearFlow Water", "Water supply connection, plumbing, and purification services", "299", "5", "4.3", "Chennai, Bangalore"}
        });
        categoryVendorTemplates.put("Gas Connection", new String[][]{
            {"GasSafe Connect", "LPG gas connection, pipeline installation, and safety checks", "199", "10", "4.7", "All Major Cities"},
            {"FlameGuard Services", "Gas stove repair, pipeline fitting, and leak detection", "249", "7", "4.4", "Mumbai, Pune, Nagpur"}
        });
        categoryVendorTemplates.put("Milk", new String[][]{
            {"FreshFarm Dairy", "Farm-fresh cow and buffalo milk delivered daily at your doorstep", "60", "6", "4.8", "All Major Cities"},
            {"PureMilk Express", "Organic and toned milk varieties with flexible delivery schedules", "55", "4", "4.5", "Mumbai, Pune, Delhi"},
            {"DailyDairy Fresh", "Farm-fresh milk delivered daily before 6 AM with organic options", "55", "4", "4.7", "All Major Cities"}
        });
        categoryVendorTemplates.put("Newspaper", new String[][]{
            {"DailyRead Services", "English, Hindi, and regional newspaper delivery before 7 AM", "30", "15", "4.6", "All Major Cities"},
            {"MorningPost Express", "Newspaper and magazine subscription with doorstep delivery", "25", "10", "4.4", "Bangalore, Chennai"}
        });
        categoryVendorTemplates.put("Cleaning Staff", new String[][]{
            {"HomeHelp Staff", "Trained and verified maids, cooks, and housekeeping staff on monthly basis", "8000", "8", "4.7", "All Major Cities"},
            {"CleanCrew Domestic", "Daily and weekly cleaning staff with background verification", "6000", "5", "4.4", "Mumbai, Delhi, Bangalore"}
        });
        categoryVendorTemplates.put("Courier Partners", new String[][]{
            {"QuickShip Couriers", "Same-day courier pickup and delivery for documents and parcels", "99", "10", "4.6", "All Major Cities"},
            {"SwiftParcel Express", "Express courier services with real-time tracking and insurance", "79", "7", "4.3", "Delhi, Mumbai, Chennai"}
        });
        categoryVendorTemplates.put("Laundry", new String[][]{
            {"FreshPress Laundry", "Professional wash, dry clean, and iron with doorstep pickup and delivery", "149", "6", "4.7", "All Major Cities"},
            {"CleanFold Express", "Affordable laundry and dry cleaning with 24-hour turnaround", "99", "4", "4.4", "Bangalore, Hyderabad"}
        });

        int workerIndex = 0;

        // Get all categories from DB
        java.util.List<ServiceCategory> allCategories = categoryRepository.findAll();

        for (ServiceCategory cat : allCategories) {
            // Check if this category already has approved vendors
            java.util.List<Vendor> existingVendors = vendorRepository.findByCategoryIdAndApprovedTrueAndBlockedFalse(cat.getId());
            if (!existingVendors.isEmpty()) {
                continue; // Already has vendors, skip
            }

            // Look up templates for this category, or generate generic ones
            String[][] templates = categoryVendorTemplates.get(cat.getCategoryName());
            if (templates == null) {
                // Generate generic vendors for any new/unknown category
                templates = new String[][]{
                    {cat.getCategoryName() + " Pro Services", "Professional " + cat.getCategoryName().toLowerCase() + " services with experienced staff and best quality", "299", "5", "4.5", "All Major Cities"},
                    {cat.getCategoryName() + " Expert Solutions", "Trusted " + cat.getCategoryName().toLowerCase() + " experts providing reliable and affordable services", "249", "3", "4.3", "All Major Cities"}
                };
            }

            for (String[] t : templates) {
                // Check vendor doesn't already exist by name
                String vendorName = t[0];
                boolean vendorExists = vendorRepository.findByCategoryId(cat.getId()).stream()
                        .anyMatch(v -> v.getName().equals(vendorName));
                if (vendorExists) continue;

                // Create a unique worker user for this vendor
                String[] worker = workerNames[workerIndex % workerNames.length];
                String workerEmail = "worker_" + cat.getId() + "_" + workerIndex + "@smarthome.com";
                User workerUser;
                if (!userRepository.existsByEmail(workerEmail)) {
                    workerUser = User.builder()
                            .name(worker[0])
                            .email(workerEmail)
                            .password(passwordEncoder.encode("worker123"))
                            .role(Role.WORKER)
                            .phone(worker[2])
                            .address(worker[1])
                            .active(true)
                            .build();
                    userRepository.save(workerUser);
                } else {
                    workerUser = userRepository.findByEmail(workerEmail).orElse(null);
                }
                workerIndex++;

                createVendor(vendorName, cat,
                        Integer.parseInt(t[3]),
                        Double.parseDouble(t[4]),
                        Double.parseDouble(t[2]),
                        t[5], t[1], workerUser);
            }
        }
    }

    private void createCategoryIfNotExists(String name, String description, String icon, String imageUrl) {
        if (!categoryRepository.existsByCategoryName(name)) {
            createCategory(name, description, icon, imageUrl);
        } else {
            // Update imageUrl, icon, description if missing
            java.util.Optional<ServiceCategory> existing = categoryRepository.findByCategoryName(name);
            if (existing.isPresent()) {
                ServiceCategory cat = existing.get();
                boolean updated = false;
                if (cat.getImageUrl() == null || cat.getImageUrl().isBlank()) {
                    cat.setImageUrl(imageUrl);
                    updated = true;
                }
                if (cat.getIcon() == null || cat.getIcon().isBlank()) {
                    cat.setIcon(icon);
                    updated = true;
                }
                if (cat.getDescription() == null || cat.getDescription().isBlank()) {
                    cat.setDescription(description);
                    updated = true;
                }
                if (updated) {
                    categoryRepository.save(cat);
                }
            }
        }
    }

    private void mergeDuplicateCategory(String oldName, String newName) {
        java.util.Optional<ServiceCategory> oldCat = categoryRepository.findByCategoryName(oldName);
        if (oldCat.isEmpty()) return; // nothing to merge

        // Ensure new category exists
        java.util.Optional<ServiceCategory> newCat = categoryRepository.findByCategoryName(newName);
        ServiceCategory target;
        if (newCat.isPresent()) {
            target = newCat.get();
        } else {
            // Create the new category with old category's details
            ServiceCategory old = oldCat.get();
            target = ServiceCategory.builder()
                    .categoryName(newName)
                    .description(old.getDescription())
                    .icon(old.getIcon())
                    .imageUrl(old.getImageUrl())
                    .active(true)
                    .build();
            categoryRepository.save(target);
        }

        // Move all vendors from old category to new category
        java.util.List<Vendor> vendors = vendorRepository.findByCategoryId(oldCat.get().getId());
        for (Vendor v : vendors) {
            v.setCategory(target);
            vendorRepository.save(v);
        }

        // Delete the old category
        categoryRepository.delete(oldCat.get());
    }

    private void createCategory(String name, String description, String icon, String imageUrl) {
        ServiceCategory category = ServiceCategory.builder()
                .categoryName(name)
                .description(description)
                .icon(icon)
                .imageUrl(imageUrl)
                .active(true)
                .build();
        categoryRepository.save(category);
    }

    private void createVendor(String name, ServiceCategory category, int experience, double rating, double price, String area, String description, User workerUser) {
        Vendor vendor = Vendor.builder()
                .name(name)
                .category(category)
                .experienceYears(experience)
                .rating(rating)
                .totalReviews((int) (Math.random() * 100 + 10))
                .price(price)
                .serviceArea(area)
                .description(description)
                .availabilityStatus(true)
                .approved(true)
                .blocked(false)
                .user(workerUser)
                .build();
        vendorRepository.save(vendor);
    }

    private void createParkingSlot(String slotNumber, String floor, SlotType slotType, Double pricePerHour, String location) {
        ParkingSlot slot = ParkingSlot.builder()
                .slotNumber(slotNumber)
                .floor(floor)
                .slotType(slotType)
                .status(ParkingSlotStatus.AVAILABLE)
                .pricePerHour(pricePerHour)
                .location(location)
                .isAllocated(false)
                .active(true)
                .build();
        parkingSlotRepository.save(slot);
    }

    // Note: Seed reviews are created without a booking association intentionally.
    // In production, reviews require a completed booking, but for demo/seed data this is bypassed.
    private void createReview(User user, Vendor vendor, int rating, String comment) {
        Review review = Review.builder()
                .user(user)
                .vendor(vendor)
                .rating(rating)
                .comment(comment)
                .atsScore(80 + (int)(Math.random() * 20))
                .createdAt(java.time.LocalDateTime.now().minusDays((int)(Math.random() * 30)))
                .build();
        reviewRepository.save(review);
    }

    private void createAllocatedParkingSlot(String slotNumber, String floor, SlotType slotType, Double pricePerHour, String location, String flatNumber, User user) {
        ParkingSlot slot = ParkingSlot.builder()
                .slotNumber(slotNumber)
                .floor(floor)
                .slotType(slotType)
                .status(ParkingSlotStatus.ALLOCATED)
                .pricePerHour(pricePerHour)
                .location(location)
                .flatNumber(flatNumber)
                .allocatedToUser(user)
                .isAllocated(true)
                .active(true)
                .build();
        parkingSlotRepository.save(slot);
    }
}

