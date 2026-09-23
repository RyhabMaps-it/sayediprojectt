package com.sayadi.ecommerce.service;

import com.sayadi.ecommerce.domain.Category;
import com.sayadi.ecommerce.domain.Color;
import com.sayadi.ecommerce.domain.Product;
import com.sayadi.ecommerce.dto.ProductDto;
import com.sayadi.ecommerce.dto.ProductRequest;
import com.sayadi.ecommerce.exception.BadRequestException;
import com.sayadi.ecommerce.exception.ResourceNotFoundException;
import com.sayadi.ecommerce.mapper.ProductMapper;
import com.sayadi.ecommerce.repository.CategoryRepository;
import com.sayadi.ecommerce.repository.ColorRepository;
import com.sayadi.ecommerce.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.text.Normalizer;
import java.util.HashSet;
import java.util.Locale;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final ColorRepository colorRepository;
    private final ProductMapper productMapper;

    public Page<ProductDto> findAll(String categorySlug, String search, Pageable pageable) {
        Page<Product> page;
        if (StringUtils.hasText(categorySlug)) {
            page = productRepository.findByActiveTrueAndCategorySlug(categorySlug, pageable);
        } else if (StringUtils.hasText(search)) {
            page = productRepository.findByActiveTrueAndNameContainingIgnoreCase(search, pageable);
        } else {
            page = productRepository.findByActiveTrue(pageable);
        }
        return page.map(productMapper::toDto);
    }

    public ProductDto findBySlug(String slug) {
        Product product = productRepository.findBySlugAndActiveTrue(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Produit introuvable: " + slug));
        return productMapper.toDto(product);
    }

    @Transactional
    public ProductDto create(ProductRequest request) {
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Catégorie introuvable"));

        String slug = slugify(request.getName());
        if (productRepository.existsBySlug(slug)) {
            slug = slug + "-" + System.currentTimeMillis();
        }

        Product product = productMapper.toEntity(request, slug, category, resolveColors(request.getColorIds()));
        product.setImages(productMapper.toImages(product, request.getImages()));

        product = productRepository.save(product);
        return productMapper.toDto(product);
    }

    @Transactional
    public ProductDto update(Long id, ProductRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Produit introuvable"));

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Catégorie introuvable"));

        productMapper.updateEntity(product, request, category, resolveColors(request.getColorIds()));

        if (request.getImages() != null) {
            product.getImages().clear();
            product.getImages().addAll(productMapper.toImages(product, request.getImages()));
        }

        return productMapper.toDto(productRepository.save(product));
    }

    @Transactional
    public void delete(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Produit introuvable"));
        product.setActive(false);
        productRepository.save(product);
    }

    public Product getEntityOrThrow(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Produit introuvable: " + id));
    }

    public Resource getTechnicalSheet(Long id) {
        Product product = getEntityOrThrow(id);
        if (!product.isHasTechnicalSheet()) {
            throw new ResourceNotFoundException("Aucune fiche technique disponible pour ce produit");
        }
        return new ClassPathResource("documents/claustra-catalog-flyer.pdf");
    }

    private Set<Color> resolveColors(Set<Long> colorIds) {
        if (colorIds == null || colorIds.isEmpty()) {
            return new HashSet<>();
        }
        return new HashSet<>(colorRepository.findAllById(colorIds));
    }

    private String slugify(String input) {
        String noAccents = Normalizer.normalize(input, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "");
        String slug = noAccents.toLowerCase(Locale.FRENCH)
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("(^-|-$)", "");
        if (!StringUtils.hasText(slug)) {
            throw new BadRequestException("Nom de produit invalide");
        }
        return slug;
    }
}
