package com.unicorn.backend.admin;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class InvestorStatsResponse {
    private long totalInvestors;
    private long verifiedInvestors;
    private long pendingVerifications;
    private BigDecimal totalInvestmentBudget;
}
