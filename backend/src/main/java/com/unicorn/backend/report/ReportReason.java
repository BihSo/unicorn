package com.unicorn.backend.report;

/**
 * Enum representing the reason for a report.
 */
public enum ReportReason {
    SPAM("Spam or promotional content"),
    HARASSMENT("Harassment or abusive behavior"),
    INAPPROPRIATE_CONTENT("Offensive or inappropriate content"),
    FRAUD("Fraudulent or misleading information"),
    DUPLICATE("Duplicate account or content"),
    COPYRIGHT("Copyright infringement"),
    IMPERSONATION("Impersonation or identity theft"),
    ADULT_CONTENT("Adult or sexual content"),
    VIOLENCE("Violence or threats"),
    HATE_SPEECH("Hate speech or discrimination"),
    MISINFORMATION("Misinformation or false claims"),
    OTHER("Other reason");

    private final String description;

    ReportReason(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}
