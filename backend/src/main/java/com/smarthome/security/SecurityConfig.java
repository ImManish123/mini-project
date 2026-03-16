package com.smarthome.security;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final CustomUserDetailsService userDetailsService;
    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/ws/**").permitAll()
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/categories/all").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/categories").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/categories/{id}").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/vendors/all").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/vendors").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/vendors/{id}").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/vendors/top-rated").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/vendors/category/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/vendors/*/slots").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/reviews/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/reviews/analyze-sentiment").authenticated()
                        .requestMatchers(HttpMethod.GET, "/api/parking/slots").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/parking/slots/available").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/parking/slots/available/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/parking/slots/my-allocated").authenticated()
                        .requestMatchers(HttpMethod.GET, "/api/parking/slots/{id}").permitAll()
                        .requestMatchers("/api/users/profile").authenticated()
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")
                        .requestMatchers("/api/worker/**").hasRole("WORKER")
                        .requestMatchers("/api/messages/admin/**").hasRole("ADMIN")
                        .requestMatchers("/api/bookings/**").authenticated()
                        .requestMatchers("/api/parking/bookings/**").authenticated()
                        .requestMatchers("/api/parking/stats").hasRole("ADMIN")
                        .requestMatchers("/api/parking/slots/all").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/parking/slots").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/parking/slots/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PATCH, "/api/parking/slots/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/parking/slots/**").hasRole("ADMIN")
                        // Complaint endpoints
                        .requestMatchers("/api/complaints/my-complaints").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/complaints").authenticated()
                        .requestMatchers("/api/complaints/worker/**").hasRole("WORKER")
                        .requestMatchers("/api/complaints/stats").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/complaints/active").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/complaints/status/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/complaints/category/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PATCH, "/api/complaints/*/status").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PATCH, "/api/complaints/*/priority").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PATCH, "/api/complaints/*/assign").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PATCH, "/api/complaints/*/respond").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/complaints/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/complaints").hasRole("ADMIN")
                        .requestMatchers("/api/complaints/**").authenticated()
                        .requestMatchers("/api/messages/**").authenticated()
                        // SOS endpoints
                        .requestMatchers("/api/sos/stats").hasRole("ADMIN")
                        .requestMatchers("/api/sos/status/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PATCH, "/api/sos/*/status").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/sos").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/sos").authenticated()
                        .requestMatchers("/api/sos/my-alerts").authenticated()
                        .requestMatchers(HttpMethod.PATCH, "/api/sos/*/cancel").authenticated()
                        // Lift booking endpoints
                        .requestMatchers("/api/lift-bookings/stats").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PATCH, "/api/lift-bookings/*/status").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/lift-bookings").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/lift-bookings").authenticated()
                        .requestMatchers("/api/lift-bookings/my-bookings").authenticated()
                        .requestMatchers(HttpMethod.PATCH, "/api/lift-bookings/*/cancel").authenticated()
                        .requestMatchers("/api/lift-bookings/date/**").authenticated()
                        .anyRequest().authenticated())
                .authenticationProvider(authenticationProvider())
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of("http://localhost:3000"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "X-Requested-With"));
        configuration.setExposedHeaders(List.of("Authorization"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
