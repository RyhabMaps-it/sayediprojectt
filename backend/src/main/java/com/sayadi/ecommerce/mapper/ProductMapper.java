package com.sayadi.ecommerce.mapper;

import com.sayadi.ecommerce.domain.Category;
import com.sayadi.ecommerce.domain.Color;
import com.sayadi.ecommerce.domain.Product;
import com.sayadi.ecommerce.domain.ProductImage;
import com.sayadi.ecommerce.dto.ProductDto;
import com.sayadi.ecommerce.dto.ProductRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class ProductMapper {

    private final ColorMapper colorMapper;

    public ProductDto toDto(Product product) {
        return ProductDto.builder()
                .id(product.getId())
                .name(product.getName())
                .slug(product.getSlug())
                .description(product.getDescription())
                .categoryName(product.getCategory().getName())
                .categorySlug(product.getCategory().getSlug())
                .material(product.getMaterial())
                .heightCm(product.getHeightCm())
                .widthCm(product.getWidthCm())
                .depthCm(product.getDepthCm())
                .colorOptions(product.getColorOptions())
                .units(product.getUnits())
                .colors(product.getColors().stream().map(colorMapper::toDto).collect(Collectors.toSet()))
                .price(product.getPrice())
                .priceOnRequest(product.isPriceOnRequest())
                .hasTechnicalSheet(product.isHasTechnicalSheet())
                .sku(product.getSku())
                .stockQuantity(product.getStockQuantity())
                .images(product.getImages().stream().map(ProductImage::getUrl).toList())
                .build();
    }

    /** Builds a new transient Product from a create request. Images are attached separately by the caller. */
    public Product toEntity(ProductRequest request, String slug, Category category, Set<Color> colors) {
        return Product.builder()
                .name(request.getName())
                .slug(slug)
                .description(request.getDescription())
                .category(category)
                .material(request.getMaterial())
                .heightCm(request.getHeightCm())
                .widthCm(request.getWidthCm())
                .depthCm(request.getDepthCm())
                .colorOptions(request.getColorOptions())
                .units(request.getUnits())
                .colors(colors)
                .price(request.getPrice())
                .priceOnRequest(request.isPriceOnRequest())
                .hasTechnicalSheet(request.isHasTechnicalSheet())
                .sku(normalizeSku(request.getSku()))
                .stockQuantity(request.getStockQuantity())
                .build();
    }

    /** Applies an update request onto an existing managed Product entity. */
    public void updateEntity(Product product, ProductRequest request, Category category, Set<Color> colors) {
        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setCategory(category);
        product.setMaterial(request.getMaterial());
        product.setHeightCm(request.getHeightCm());
        product.setWidthCm(request.getWidthCm());
        product.setDepthCm(request.getDepthCm());
        product.setColorOptions(request.getColorOptions());
        product.setUnits(request.getUnits());
        product.setColors(colors);
        product.setPrice(request.getPrice());
        product.setPriceOnRequest(request.isPriceOnRequest());
        product.setHasTechnicalSheet(request.isHasTechnicalSheet());
        product.setSku(normalizeSku(request.getSku()));
        product.setStockQuantity(request.getStockQuantity());
    }

    /** Blank SKUs are stored as null so the unique constraint only applies to real values. */
    private String normalizeSku(String sku) {
        return sku == null || sku.isBlank() ? null : sku.trim();
    }

    public List<ProductImage> toImages(Product product, List<String> urls) {
        List<ProductImage> images = new ArrayList<>();
        if (urls == null) {
            return images;
        }
        int position = 0;
        for (String url : urls) {
            images.add(ProductImage.builder().product(product).url(url).position(position++).build());
        }
        return images;
    }
}
