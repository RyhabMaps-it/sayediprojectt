package com.sayadi.ecommerce.dto;

/** Shared validation for files attached by visitors to public forms. */
public final class AttachmentRules {

    public static final int MAX_FILES = 5;

    /** Only files previously uploaded through /api/attachments are accepted. */
    public static final String URL_PATTERN = "^/uploads/attachments/[0-9a-f-]{36}\\.(jpg|png|webp|pdf)$";

    private AttachmentRules() {
    }
}
