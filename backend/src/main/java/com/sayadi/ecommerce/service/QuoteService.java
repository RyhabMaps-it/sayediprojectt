package com.sayadi.ecommerce.service;

import com.sayadi.ecommerce.domain.Product;
import com.sayadi.ecommerce.dto.QuoteDto;
import com.sayadi.ecommerce.dto.QuoteRequestDto;
import com.sayadi.ecommerce.exception.ResourceNotFoundException;
import com.sayadi.ecommerce.mapper.QuoteMapper;
import com.sayadi.ecommerce.repository.ProductRepository;
import com.sayadi.ecommerce.repository.QuoteRequestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class QuoteService {

    private final QuoteRequestRepository quoteRequestRepository;
    private final ProductRepository productRepository;
    private final QuoteMapper quoteMapper;

    public void submit(QuoteRequestDto request) {
        Product product = request.getProductId() != null
                ? productRepository.findById(request.getProductId()).orElse(null)
                : null;

        quoteRequestRepository.save(quoteMapper.toEntity(request, product));
    }

    @Transactional(readOnly = true)
    public List<QuoteDto> findAll() {
        return quoteRequestRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt")).stream()
                .map(quoteMapper::toDto)
                .toList();
    }

    public void delete(Long id) {
        if (!quoteRequestRepository.existsById(id)) {
            throw new ResourceNotFoundException("Demande de devis introuvable");
        }
        quoteRequestRepository.deleteById(id);
    }
}
