# Sayadi Group — Site vitrine & e-commerce

Projet full-stack pour **Sayadi Group** (fabricant de panneaux décoratifs claustra en GRC, depuis 1959) :
- **Backend** : Spring Boot 3 + PostgreSQL + Spring Security (JWT)
- **Frontoffice** : Angular 19 (standalone components) — site vitrine & e-commerce visiteur
- **Backoffice** : Angular 19 (standalone components) — interface d'administration

Frontoffice et backoffice sont deux projets Angular totalement indépendants (chacun son
`package.json`, ses `node_modules`, son `angular.json`, buildables et déployables séparément).

## Structure du projet

```
sayediprojet/
├── backend/           # API Spring Boot (Java 17, Maven)
├── frontoffice/       # Application Angular — site visiteur (port 4200 par défaut)
├── backoffice/        # Application Angular — back-office admin (port 4201)
└── docker-compose.yml # PostgreSQL prêt à l'emploi
```

## 1. Base de données PostgreSQL

Option A — via Docker (recommandé) :
```bash
docker compose up -d
```

Option B — PostgreSQL déjà installé localement :
```bash
sudo -u postgres psql \
  -c "CREATE USER sayadi WITH PASSWORD 'sayadi';" \
  -c "CREATE DATABASE sayadi_db OWNER sayadi;"
```

## 2. Lancer le backend

```bash
cd backend
./mvnw spring-boot:run
```

- API disponible sur `http://localhost:8080/api`
- Documentation Swagger : `http://localhost:8080/swagger-ui.html`
- Un compte administrateur est créé automatiquement au premier démarrage :
  - email : `admin@sayadi.tn`
  - mot de passe : `Admin@1959`
- 5 catégories sont créées (GRC, Article de jardin, Marbre, Cheminée, Revêtement mural),
  reprenant l'organisation du site existant. Seule la catégorie **GRC** contient des produits
  pour l'instant (4 panneaux Claustra : SKAYA, ZAYTOUNA, Orient 5), avec les photos extraites
  du flyer catalogue fourni. Les autres catégories sont prêtes à être complétées via l'admin.
- 4 couleurs sont pré-remplies (Blanc cassé, Sable, Gris anthracite, Terracotta) et associées
  aux produits GRC.

Variables d'environnement utiles (voir `application.yml`) :
`DB_NAME`, `DB_USER`, `DB_PASSWORD`, `JWT_SECRET`, `CORS_ORIGIN`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`.

## 3. Lancer le frontoffice (site visiteur)

```bash
cd frontoffice
npm install
npm start
```

- Application disponible sur `http://localhost:4200`
- En développement, le frontoffice appelle l'API sur `http://localhost:8088/api`
  (voir `src/environments/environment.development.ts`)

## 4. Lancer le backoffice (admin)

```bash
cd backoffice
npm install
npm start
```

- Application disponible sur `http://localhost:4201`
- Connexion avec un compte `ROLE_ADMIN` (voir compte admin créé automatiquement plus haut)
- En développement, le backoffice appelle l'API sur `http://localhost:8088/api`
  (voir `src/environments/environment.development.ts`)

## Fonctionnalités incluses

Ce projet reprend et modernise les fonctionnalités identifiées dans votre ancienne
application Angular (`src/`) : catégories multiples, coloris par produit, statut
architecte/professionnel, devis, demandes de collaboration et prise de rendez-vous.

- **Vitrine** : accueil, page « À propos » (histoire depuis 1959), page contact
- **Boutique** : catalogue filtrable par catégorie et par coloris, recherche, fiche
  produit détaillée avec sélection de coloris
- **E-commerce** : panier, création de compte / connexion (JWT), commande, historique
  des commandes
- **Devis** : formulaire dédié (`/devis`) ainsi qu'un formulaire par produit pour les
  articles « sur devis » (comme dans le catalogue actuel)
- **Rendez-vous** : prise de rendez-vous en showroom (`/rendez-vous`), fonctionnelle
  de bout en bout (l'ancienne version n'était pas connectée à un backend)
- **Espace architecte** : les professionnels peuvent demander à devenir partenaires
  (`/collaboration`) ; une fois la demande acceptée par un admin, le compte obtient le
  rôle `ROLE_ARCHITECT` qui donne accès à une remise de 15 % automatique sur le panier
  et au téléchargement de la fiche technique PDF du produit
- **Formulaire de contact** général
- **Back-office** : application `backoffice/` dédiée (protégée par rôle `ROLE_ADMIN`) pour
  gérer produits, couleurs, rendez-vous et collaborations, avec tableau de bord

### Note sur le rôle architecte

Après qu'un administrateur accepte une demande de collaboration, l'utilisateur doit se
reconnecter pour que son nouveau rôle soit pris en compte côté frontend (le rôle est
inclus dans la réponse de connexion, pas rafraîchi automatiquement en temps réel).

## Prochaines étapes suggérées

- Paiement en ligne (carte bancaire / virement) si nécessaire
- Emails transactionnels (confirmation de commande, réponse aux devis)
- Déploiement (Docker pour le backend, build statique pour le frontoffice et le
  backoffice derrière Nginx, chacun sur son propre sous-domaine ou chemin)
