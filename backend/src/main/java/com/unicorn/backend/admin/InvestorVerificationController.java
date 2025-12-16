package com.unicorn.backend.admin;

import com.unicorn.backend.investor.InvestorProfile;
import com.unicorn.backend.investor.InvestorProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Controller for managing investor verification queue.
 */
@RestController
@RequestMapping("/api/v1/admin/investors")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class InvestorVerificationController {

        private final InvestorProfileRepository investorProfileRepository;

        /**
         * Get list of investors pending verification.
         * 
         * GET /api/v1/admin/investors/queue
         */
        @GetMapping("/queue")
        public ResponseEntity<List<InvestorVerificationResponse>> getVerificationQueue() {
                List<InvestorProfile> pendingInvestors = investorProfileRepository.findPendingVerificationQueue();

                List<InvestorVerificationResponse> response = pendingInvestors.stream()
                                .map(this::toVerificationResponse)
                                .toList();

                return ResponseEntity.ok(response);
        }

        /**
         * Approve investor for verification/payment.
         * This marks the profile as ready for payment.
         * 
         * POST /api/v1/admin/investors/{id}/approve-verification
         */
        @PostMapping("/{id}/approve-verification")
        public ResponseEntity<Map<String, String>> approveForPayment(@PathVariable UUID id) {
                InvestorProfile profile = investorProfileRepository.findById(id)
                                .orElseThrow(() -> new RuntimeException("Investor profile not found: " + id));

                // Set readyForPayment to true
                profile.setReadyForPayment(true);
                profile.setVerificationNotes("Approved for payment on " + LocalDateTime.now());
                investorProfileRepository.save(profile);

                // TODO: Send notification/email to investor
                // notificationService.sendVerificationApprovalNotification(profile.getUser());

                return ResponseEntity.ok(Map.of(
                                "message", "Investor approved for payment. Notification sent.",
                                "investorId", id.toString()));
        }

        /**
         * Debug endpoint.
         */
        @GetMapping("/ping")
        public ResponseEntity<String> ping() {
                return ResponseEntity.ok("pong");
        }

        /**
         * Get investor statistics.
         * 
         * GET /api/v1/admin/investors/stats
         */
        @GetMapping("/stats")
        public ResponseEntity<InvestorStatsResponse> getInvestorStats() {
                try {
                        long total = investorProfileRepository.count();
                        long verified = investorProfileRepository.countVerifiedInvestors();

                        // Get count of investors who have requested verification but are not yet
                        // verified
                        List<InvestorProfile> queue = investorProfileRepository.findPendingVerificationQueue();
                        long queueCount = queue.size();

                        java.math.BigDecimal totalBudget = investorProfileRepository.sumInvestmentBudget();

                        return ResponseEntity.ok(InvestorStatsResponse.builder()
                                        .totalInvestors(total)
                                        .verifiedInvestors(verified)
                                        .pendingVerifications(queueCount)
                                        .totalInvestmentBudget(
                                                        totalBudget != null ? totalBudget : java.math.BigDecimal.ZERO)
                                        .build());
                } catch (Exception e) {
                        System.err.println("ERROR in getInvestorStats: " + e.getMessage());
                        e.printStackTrace();
                        throw e;
                }
        }

        /**
         * Reject investor verification request.
         *
         * POST /api/v1/admin/investors/{id}/reject-verification
         */
        @PostMapping("/{id}/reject-verification")
        public ResponseEntity<Map<String, String>> rejectVerification(
                        @PathVariable UUID id,
                        @RequestBody(required = false) Map<String, String> body) {

                InvestorProfile profile = investorProfileRepository.findById(id)
                                .orElseThrow(() -> new RuntimeException("Investor profile not found: " + id));

                String reason = body != null ? body.get("reason") : "Verification request rejected";

                profile.setVerificationRequested(false);
                profile.setVerificationNotes("Rejected: " + reason + " on " + LocalDateTime.now());
                investorProfileRepository.save(profile);

                // TODO: Send rejection notification
                // notificationService.sendVerificationRejectionNotification(profile.getUser(),
                // reason);

                return ResponseEntity.ok(Map.of(
                                "message", "Verification request rejected.",
                                "investorId", id.toString()));
        }

        /**
         * Complete investor verification (called after payment webhook).
         * 
         * POST /api/v1/admin/investors/{id}/complete-verification
         */
        @PostMapping("/{id}/complete-verification")
        public ResponseEntity<Map<String, String>> completeVerification(@PathVariable UUID id) {
                InvestorProfile profile = investorProfileRepository.findById(id)
                                .orElseThrow(() -> new RuntimeException("Investor profile not found: " + id));

                profile.setIsVerified(true);
                profile.setVerifiedAt(LocalDateTime.now());
                profile.setVerificationNotes("Verification completed on " + LocalDateTime.now());
                investorProfileRepository.save(profile);

                return ResponseEntity.ok(Map.of(
                                "message", "Investor verification completed.",
                                "investorId", id.toString()));
        }

        private InvestorVerificationResponse toVerificationResponse(InvestorProfile profile) {
                return InvestorVerificationResponse.builder()
                                .id(profile.getId())
                                .userId(profile.getUser().getId())
                                .userEmail(profile.getUser().getEmail())
                                .bio(profile.getBio())
                                .investmentBudget(profile.getInvestmentBudget())
                                .preferredIndustries(profile.getPreferredIndustries())
                                .linkedInUrl(profile.getLinkedInUrl())
                                .verificationRequestedAt(profile.getVerificationRequestedAt())
                                .build();
        }
}
