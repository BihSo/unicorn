package com.unicorn.backend.appconfig;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.NonNull;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class MaintenanceFilter extends OncePerRequestFilter {

    private final AppConfigService appConfigService;

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain) throws ServletException, IOException {

        // Skip check if maintenance is disabled (Instant RAM check)
        if (!appConfigService.isMaintenanceModeEnabled()) {
            filterChain.doFilter(request, response);
            return;
        }

        String path = request.getServletPath();

        // Allow Swagger endpoints if any (optional, but good practice)
        if (path.contains("swagger") || path.contains("api-docs")) {
            filterChain.doFilter(request, response);
            return;
        }

        // Allow public endpoints and auth endpoints explicitly so clients don't crash
        // and can login
        if (path.startsWith("/api/v1/public") || path.startsWith("/api/v1/auth")) {
            filterChain.doFilter(request, response);
            return;
        }

        // Check if user is Admin (SecurityContext is populated by JwtFilter before
        // this)
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        boolean isAdmin = auth != null && auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN") || a.getAuthority().equals("ROLE_SUPER_ADMIN"));

        if (isAdmin) {
            filterChain.doFilter(request, response);
            return;
        }

        // Reject for normal users
        response.setStatus(HttpServletResponse.SC_SERVICE_UNAVAILABLE);
        response.setContentType("application/json");
        new ObjectMapper().writeValue(response.getOutputStream(), Map.of(
                "error", "Service Unavailable",
                "message", "The system is currently under maintenance. Please try again later.",
                "code", "MAINTENANCE_MODE"));
    }
}
