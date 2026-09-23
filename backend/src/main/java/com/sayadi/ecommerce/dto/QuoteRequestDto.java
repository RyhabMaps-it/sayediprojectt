package com.sayadi.ecommerce.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.List;

@Data
public class QuoteRequestDto {

    @NotBlank
    private String name;

    @NotBlank
    @Email
    private String email;

    private String phone;

    private String subject;

    private Long productId;

    @NotBlank
    private String message;

    @Size(max = AttachmentRules.MAX_FILES, message = "5 pièces jointes maximum")
    private List<@Pattern(regexp = AttachmentRules.URL_PATTERN, message = "Pièce jointe invalide") String> attachments;
}
