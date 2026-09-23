package com.sayadi.ecommerce.service;

import com.sayadi.ecommerce.exception.BadRequestException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;

@Service
public class FileStorageService {

    /** Types accepted from the back-office (trusted admins). */
    private static final Map<String, String> ADMIN_TYPES = Map.of(
            "image/jpeg", "jpg",
            "image/png", "png",
            "image/webp", "webp",
            "image/gif", "gif",
            "image/svg+xml", "svg",
            "application/pdf", "pdf"
    );

    /** Types accepted from anonymous visitors: no SVG, which can embed scripts. */
    private static final Map<String, String> PUBLIC_TYPES = Map.of(
            "image/jpeg", "jpg",
            "image/png", "png",
            "image/webp", "webp",
            "application/pdf", "pdf"
    );

    public static final String ATTACHMENTS_DIR = "attachments";
    private static final long PUBLIC_MAX_BYTES = 10L * 1024 * 1024;

    private final Path uploadRoot;

    public FileStorageService(@Value("${app.upload.dir}") String uploadDir) throws IOException {
        this.uploadRoot = Path.of(uploadDir).toAbsolutePath().normalize();
        Files.createDirectories(uploadRoot);
    }

    public String store(MultipartFile file) {
        return store(file, ADMIN_TYPES, null, "Type de fichier non autorisé (JPG, PNG, WEBP, GIF, SVG ou PDF)");
    }

    public String storePublicAttachment(MultipartFile file) {
        if (file != null && file.getSize() > PUBLIC_MAX_BYTES) {
            throw new BadRequestException("Fichier trop volumineux (10 Mo maximum)");
        }
        return store(file, PUBLIC_TYPES, ATTACHMENTS_DIR, "Type de fichier non autorisé (JPG, PNG, WEBP ou PDF)");
    }

    private String store(MultipartFile file, Map<String, String> allowedTypes, String subDir, String typeError) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Aucun fichier reçu");
        }
        String contentType = file.getContentType() == null ? "" : file.getContentType().toLowerCase(Locale.ROOT);
        String extension = allowedTypes.get(contentType);
        if (extension == null) {
            throw new BadRequestException(typeError);
        }

        String filename = UUID.randomUUID() + "." + extension;
        Path directory = subDir == null ? uploadRoot : uploadRoot.resolve(subDir);
        try (InputStream in = file.getInputStream()) {
            Files.createDirectories(directory);
            Files.copy(in, directory.resolve(filename), StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            throw new IllegalStateException("Impossible d'enregistrer le fichier", e);
        }
        return subDir == null ? "/uploads/" + filename : "/uploads/" + subDir + "/" + filename;
    }
}
