package com.sayadi.ecommerce.service;

import com.sayadi.ecommerce.domain.Catalogue;
import com.sayadi.ecommerce.dto.CatalogueDto;
import com.sayadi.ecommerce.dto.CatalogueRequest;
import com.sayadi.ecommerce.exception.BadRequestException;
import com.sayadi.ecommerce.exception.ResourceNotFoundException;
import com.sayadi.ecommerce.mapper.CatalogueMapper;
import com.sayadi.ecommerce.repository.CatalogueRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CatalogueService {

    private final CatalogueRepository catalogueRepository;
    private final CatalogueMapper catalogueMapper;

    public List<CatalogueDto> findAll() {
        return catalogueRepository.findAll().stream().map(catalogueMapper::toDto).toList();
    }

    public CatalogueDto create(CatalogueRequest request) {
        if (catalogueRepository.existsByTitle(request.getTitle())) {
            throw new BadRequestException("Ce catalogue existe déjà");
        }
        Catalogue catalogue = catalogueMapper.toEntity(request);
        return catalogueMapper.toDto(catalogueRepository.save(catalogue));
    }

    public void delete(Long id) {
        if (!catalogueRepository.existsById(id)) {
            throw new ResourceNotFoundException("Catalogue introuvable");
        }
        catalogueRepository.deleteById(id);
    }
}
