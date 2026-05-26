# Vens-Downloader - Todo List

## Frontend - Pages & UI

- [x] Page d'accueil (Home) avec design élégant mobile-first
- [x] Champ de saisie URL avec validation
- [x] Bouton de téléchargement avec états (normal, loading, success, error)
- [x] Spinner/Loader pendant le traitement
- [x] Messages d'erreur explicites (URL invalide, plateforme non supportée, etc.)
- [x] Page Login avec bouton connexion Google/Manus OAuth
- [x] Page Dashboard utilisateur avec historique des téléchargements
- [x] Navigation mobile avec 3 liens (Accueil, Connexion, Dashboard)
- [x] Design élégant avec typographie raffinée et espacements généreux
- [x] Responsive design (mobile + desktop)

## Backend - API tRPC

- [x] Procédure tRPC pour télécharger une vidéo (public)
- [x] Procédure tRPC pour récupérer l'historique (protected)
- [x] Procédure tRPC pour supprimer un téléchargement de l'historique (protected)

## Backend - Logique de téléchargement

- [x] Installer et configurer yt-dlp-exec
- [x] Implémenter la logique de téléchargement vidéo
- [x] Validation d'URL avant téléchargement
- [x] Gestion des erreurs (plateforme non supportée, URL invalide, etc.)
- [x] Génération de noms de fichiers uniques

## Backend - Stockage S3

- [x] Configurer l'upload des vidéos vers S3
- [x] Générer des liens de téléchargement temporaires (presigned URLs)
- [x] Implémenter le nettoyage automatique des fichiers temporaires
- [x] Sauvegarder les métadonnées dans la base de données

## Base de données

- [x] Créer la table `downloads` avec champs : id, userId, videoUrl, filename, s3Key, s3Url, status, createdAt, expiresAt
- [x] Créer les migrations Drizzle
- [x] Ajouter les query helpers dans server/db.ts

## Authentification

- [x] Intégrer Manus OAuth (déjà configuré)
- [x] Protéger les routes dashboard avec authentification
- [x] Afficher le profil utilisateur dans le dashboard
- [x] Implémenter le bouton de déconnexion

## Tests & Optimisation

- [x] Tests vitest pour les procédures tRPC (5 tests passants)
- [ ] Tester le téléchargement vidéo sur plusieurs plateformes (manuel)
- [ ] Tester l'authentification et l'accès au dashboard (manuel)
- [ ] Vérifier le responsive design sur mobile/desktop (manuel)

## Déploiement

- [x] Créer un checkpoint final (v1.0 - 198a6f4f)
- [ ] Publier le site sur manus.space
- [ ] Fournir l'URL permanente à l'utilisateur
