package com.sayadi.ecommerce.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.List;

@Data
public class CollaborationRequest {

    @NotBlank
    private String phone;

    @NotBlank
    private String message;

    @Size(max = AttachmentRules.MAX_FILES, message = "5 pièces jointes maximum")
    private List<@Pattern(regexp = AttachmentRules.URL_PATTERN, message = "Pièce jointe invalide") String> attachments;
}
