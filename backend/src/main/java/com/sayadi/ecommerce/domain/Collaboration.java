package com.sayadi.ecommerce.domain;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "collaboration")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Collaboration {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String phone;

    @Column(nullable = false, length = 2000)
    private String message;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private CollaborationStatus status = CollaborationStatus.PENDING;

    @ElementCollection
    @CollectionTable(name = "collaboration_attachment", joinColumns = @JoinColumn(name = "collaboration_id"))
    @OrderColumn(name = "position")
    @Column(name = "url", nullable = false)
    @Builder.Default
    private List<String> attachments = new ArrayList<>();

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = Instant.now();
    }
}
