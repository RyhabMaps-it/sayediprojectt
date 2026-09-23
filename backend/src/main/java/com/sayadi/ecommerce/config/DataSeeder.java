package com.sayadi.ecommerce.config;

import com.sayadi.ecommerce.domain.*;
import com.sayadi.ecommerce.repository.CatalogueRepository;
import com.sayadi.ecommerce.repository.CategoryRepository;
import com.sayadi.ecommerce.repository.ColorRepository;
import com.sayadi.ecommerce.repository.ProductRepository;
import com.sayadi.ecommerce.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final ColorRepository colorRepository;
    private final CatalogueRepository catalogueRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.seed.admin-email}")
    private String adminEmail;

    @Value("${app.seed.admin-password}")
    private String adminPassword;

    @Override
    @Transactional
    public void run(String... args) {
        seedAdmin();
        seedCatalog();
        seedCatalogues();
    }

    private void seedAdmin() {
        if (userRepository.existsByEmail(adminEmail)) {
            return;
        }
        User admin = User.builder()
                .firstName("Sayadi")
                .lastName("Admin")
                .email(adminEmail)
                .password(passwordEncoder.encode(adminPassword))
                .roles(Set.of(Role.ROLE_ADMIN, Role.ROLE_USER))
                .build();
        userRepository.save(admin);
    }

    private void seedCatalog() {
        if (categoryRepository.count() > 0) {
            return;
        }

        // Couleurs disponibles "au choix" sur les panneaux GRC
        Color blanc = colorRepository.save(Color.builder().name("Blanc cassé").code("#F5F0E6").build());
        Color sable = colorRepository.save(Color.builder().name("Sable").code("#D8C6A1").build());
        Color gris = colorRepository.save(Color.builder().name("Gris anthracite").code("#3F3F3F").build());
        Color terracotta = colorRepository.save(Color.builder().name("Terracotta").code("#B5651D").build());

        // Les 5 gammes de produits de Sayadi Group
        Category grc = categoryRepository.save(Category.builder()
                .name("GRC")
                .slug("grc")
                .description("Panneaux décoratifs claustra et éléments architecturaux en GRC (béton renforcé " +
                        "de fibre de verre), motifs géométriques inspirés de l'art andalou.")
                .imageUrl("/images/products/claustra-skaya-2.jpg")
                .build());

        categoryRepository.save(Category.builder()
                .name("Article de jardin")
                .slug("article-de-jardin")
                .description("Objets décoratifs pour l'aménagement extérieur : fontaines, vasques, éléments de jardin en GRC.")
                .build());

        categoryRepository.save(Category.builder()
                .name("Marbre")
                .slug("marbre")
                .description("Éléments en marbre et pierre naturelle pour salles de bain et espaces sanitaires.")
                .build());

        categoryRepository.save(Category.builder()
                .name("Cheminée")
                .slug("cheminee")
                .description("Habillages et éléments de cheminée sur mesure, en pierre reconstituée ou marbre.")
                .build());

        categoryRepository.save(Category.builder()
                .name("Revêtement mural")
                .slug("revetement-mural")
                .description("Plaquettes et parements muraux décoratifs pour façades et intérieurs.")
                .build());

        Product skaya = Product.builder()
                .name("Claustra SKAYA")
                .slug("claustra-skaya")
                .description("Panneau claustra SKAYA en GRC, motif étoilé andalou, idéal pour clôtures et brise-vue extérieurs.")
                .category(grc)
                .material("GRC (Béton renforcé de fibre de verre)")
                .heightCm("100")
                .widthCm("50")
                .depthCm("4")
                .colorOptions("Au choix")
                .units("pièce")
                .colors(Set.of(blanc, sable, gris, terracotta))
                .priceOnRequest(true)
                .hasTechnicalSheet(true)
                .sku("CLA-SKAYA-100x50")
                .stockQuantity(50)
                .build();
        skaya.setImages(List.of(
                ProductImage.builder().product(skaya).url("/images/products/claustra-skaya-1.jpg").position(0).build(),
                ProductImage.builder().product(skaya).url("/images/products/claustra-skaya-2.jpg").position(1).build()
        ));
        productRepository.save(skaya);

        Product zaytouna = Product.builder()
                .name("Claustra ZAYTOUNA")
                .slug("claustra-zaytouna")
                .description("Grand panneau claustra ZAYTOUNA en GRC, motif étoile à 8 branches, format carré pour murs et séparations.")
                .category(grc)
                .material("GRC (Béton renforcé de fibre de verre)")
                .heightCm("312")
                .widthCm("312")
                .depthCm("12")
                .colorOptions("Au choix")
                .units("pièce")
                .colors(Set.of(blanc, sable, gris, terracotta))
                .priceOnRequest(true)
                .hasTechnicalSheet(true)
                .sku("CLA-ZAYTOUNA-312x312")
                .stockQuantity(20)
                .build();
        zaytouna.setImages(List.of(
                ProductImage.builder().product(zaytouna).url("/images/products/claustra-zaytouna-1.jpg").position(0).build()
        ));
        productRepository.save(zaytouna);

        Product orient5Depart = Product.builder()
                .name("Claustra Orient 5 - Départ inférieur")
                .slug("claustra-orient5-depart-inferieur")
                .description("Module de départ inférieur de la série Orient 5, motif étoilé complexe, pour compositions modulaires en GRC.")
                .category(grc)
                .material("GRC (Béton renforcé de fibre de verre)")
                .heightCm("114")
                .widthCm("90")
                .depthCm("4.5")
                .colorOptions("Au choix")
                .units("pièce")
                .colors(Set.of(blanc, sable, gris, terracotta))
                .priceOnRequest(true)
                .hasTechnicalSheet(true)
                .sku("CLA-ORIENT5-DEP-114x90")
                .stockQuantity(30)
                .build();
        orient5Depart.setImages(List.of(
                ProductImage.builder().product(orient5Depart).url("/images/products/claustra-orient5-depart-1.jpg").position(0).build()
        ));
        productRepository.save(orient5Depart);

        Product orient5Central = Product.builder()
                .name("Claustra Orient 5 - Partie centrale")
                .slug("claustra-orient5-partie-centrale")
                .description("Module central de la série Orient 5, motif étoilé complexe, pour compositions modulaires en GRC.")
                .category(grc)
                .material("GRC (Béton renforcé de fibre de verre)")
                .heightCm("138")
                .widthCm("90")
                .depthCm("4.5")
                .colorOptions("Au choix")
                .units("pièce")
                .colors(Set.of(blanc, sable, gris, terracotta))
                .priceOnRequest(true)
                .hasTechnicalSheet(true)
                .sku("CLA-ORIENT5-CTR-138x90")
                .stockQuantity(30)
                .build();
        orient5Central.setImages(List.of(
                ProductImage.builder().product(orient5Central).url("/images/products/claustra-orient5-central-1.jpg").position(0).build()
        ));
        productRepository.save(orient5Central);
    }

    private void seedCatalogues() {
        if (catalogueRepository.count() > 0) {
            return;
        }

        catalogueRepository.save(Catalogue.builder()
                .title("Catalogue Claustra 2026")
                .fileUrl("/catalogues/claustra-catalog-flyer.pdf")
                .build());
    }
}
