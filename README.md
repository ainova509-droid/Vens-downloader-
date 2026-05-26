# Vens-Downloader

Un téléchargeur de vidéos web simple et efficace construit avec Flask et yt-dlp.

## Fonctionnalités

- Interface web simple et intuitive
- Téléchargement de vidéos depuis YouTube, TikTok, Instagram, Vimeo et bien d'autres
- Nettoyage automatique des fichiers temporaires
- Déploiement facile sur Render, Railway ou Heroku

## Installation Locale

### Prérequis
- Python 3.8+
- pip ou pipenv

### Étapes

1. **Cloner le dépôt**
```bash
git clone https://github.com/ainova509-droid/Vens-downloader-.git
cd Vens-downloader
```

2. **Créer un environnement virtuel**
```bash
python -m venv venv
source venv/bin/activate  # Sur Windows: venv\Scripts\activate
```

3. **Installer les dépendances**
```bash
pip install -r requirements.txt
```

4. **Lancer l'application**
```bash
python app.py
```

L'application sera accessible à `http://localhost:5000`

## Déploiement

### Sur Render
1. Connectez votre dépôt GitHub à Render
2. Créez un nouveau service Web
3. Sélectionnez ce dépôt
4. Render détectera automatiquement le `Procfile` et `requirements.txt`
5. Déployez !

### Sur Railway
1. Connectez votre dépôt GitHub à Railway
2. Créez un nouveau projet
3. Railway détectera automatiquement la configuration
4. Déployez !

### Sur Heroku
```bash
heroku login
heroku create vens-downloader
git push heroku main
```

## Structure du Projet

```
Vens-Downloader/
├── app.py                    # Application Flask principale
├── requirements.txt          # Dépendances Python
├── Procfile                  # Configuration déploiement
├── runtime.txt              # Version Python
├── README.md                # Documentation
├── templates/
│   └── index.html           # Page web principale
└── downloads/               # Dossier pour vidéos temporaires
```

## Utilisation

1. Ouvrez l'application dans votre navigateur
2. Collez l'URL d'une vidéo (YouTube, TikTok, Instagram, etc.)
3. Cliquez sur "Télécharger"
4. Le fichier vidéo sera téléchargé automatiquement

## Plateformes Supportées

- YouTube
- TikTok
- Instagram
- Vimeo
- Facebook
- Twitter/X
- Et bien d'autres (grâce à yt-dlp)

## Sécurité

- Les fichiers temporaires sont automatiquement supprimés après 1 heure
- Pas de stockage permanent des vidéos
- Pas de données utilisateur collectées

## Licence

MIT

## Support

Pour toute question ou problème, veuillez ouvrir une issue sur GitHub.
