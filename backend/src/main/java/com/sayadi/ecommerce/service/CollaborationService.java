package com.sayadi.ecommerce.service;

import com.sayadi.ecommerce.domain.Collaboration;
import com.sayadi.ecommerce.domain.CollaborationStatus;
import com.sayadi.ecommerce.domain.Role;
import com.sayadi.ecommerce.domain.User;
import com.sayadi.ecommerce.dto.CollaborationDto;
import com.sayadi.ecommerce.dto.CollaborationRequest;
import com.sayadi.ecommerce.exception.ResourceNotFoundException;
import com.sayadi.ecommerce.mapper.CollaborationMapper;
import com.sayadi.ecommerce.repository.CollaborationRepository;
import com.sayadi.ecommerce.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CollaborationService {

    private final CollaborationRepository collaborationRepository;
    private final UserRepository userRepository;
    private final CollaborationMapper collaborationMapper;

    @Transactional
    public CollaborationDto submit(Long userId, CollaborationRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur introuvable"));

        Collaboration collaboration = collaborationMapper.toEntity(request, user);

        return collaborationMapper.toDto(collaborationRepository.save(collaboration));
    }

    public List<CollaborationDto> findMine(Long userId) {
        return collaborationRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(collaborationMapper::toDto).toList();
    }

    public List<CollaborationDto> findAll() {
        return collaborationRepository.findAll().stream().map(collaborationMapper::toDto).toList();
    }

    @Transactional
    public CollaborationDto accept(Long id) {
        Collaboration collaboration = collaborationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Demande introuvable"));

        collaboration.setStatus(CollaborationStatus.ACCEPTED);
        collaboration.getUser().getRoles().add(Role.ROLE_ARCHITECT);

        return collaborationMapper.toDto(collaborationRepository.save(collaboration));
    }

    public void delete(Long id) {
        if (!collaborationRepository.existsById(id)) {
            throw new ResourceNotFoundException("Demande introuvable");
        }
        collaborationRepository.deleteById(id);
    }
}
