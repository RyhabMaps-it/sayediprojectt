package com.sayadi.ecommerce.mapper;

import com.sayadi.ecommerce.domain.Catalogue;
import com.sayadi.ecommerce.dto.CatalogueDto;
import com.sayadi.ecommerce.dto.CatalogueRequest;
import org.springframework.stereotype.Component;

@Component
public class CatalogueMapper {

    public CatalogueDto toDto(Catalogue catalogue) {
        return CatalogueDto.builder()
                .id(catalogue.getId())
                .title(catalogue.getTitle())
                .fileUrl(catalogue.getFileUrl())
                .coverImageUrl(catalogue.getCoverImageUrl())
                .build();
    }

    public Catalogue toEntity(CatalogueRequest request) {
        return Catalogue.builder()
                .title(request.getTitle())
                .fileUrl(request.getFileUrl())
                .coverImageUrl(request.getCoverImageUrl())
                .build();
    }
}
