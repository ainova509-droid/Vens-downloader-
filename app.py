#!/usr/bin/env python3
"""
Vens-Downloader Mobile - Version optimisée téléphone
Support : TikTok (sans filigrane), YouTube, Instagram, Twitter, Facebook, Twitch
"""

import os
import uuid
import time
import threading
import logging
from flask import Flask, request, jsonify, send_file, after_this_request
from flask_cors import CORS
import yt_dlp

# Configuration
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# Dossiers
DOWNLOAD_FOLDER = "downloads"
os.makedirs(DOWNLOAD_FOLDER, exist_ok=True)

# Configuration
MAX_FILE_SIZE = 500 * 1024 * 1024  # 500MB
FILE_LIFETIME = 3600  # 1 heure

SUPPORTED_PLATFORMS = {
    'tiktok': 'TikTok (sans filigrane)',
    'youtube': 'YouTube',
    'instagram': 'Instagram', 
    'twitter': 'Twitter/X',
    'facebook': 'Facebook',
    'twitch': 'Twitch'
}

# ========== NETTOYAGE AUTO ==========
def cleanup_old_files():
    while True:
        try:
            now = time.time()
            for filename in os.listdir(DOWNLOAD_FOLDER):
                filepath = os.path.join(DOWNLOAD_FOLDER, filename)
                if os.path.isfile(filepath):
                    if now - os.path.getmtime(filepath) > FILE_LIFETIME:
                        os.remove(filepath)
                        logger.info(f"Nettoyé: {filename}")
        except Exception as e:
            logger.error(f"Erreur nettoyage: {e}")
        time.sleep(1800)

threading.Thread(target=cleanup_old_files, daemon=True).start()

# ========== FONCTIONS ==========
def detect_platform(url):
    url_lower = url.lower()
    for platform, name in SUPPORTED_PLATFORMS.items():
        if platform in url_lower:
            return platform, name
    return None, None

def get_video_info(url):
    """Extraire les infos sans télécharger"""
    try:
        ydl_opts = {
            'quiet': True,
            'no_warnings': True,
            'extract_flat': False,
            'format': 'best[height<=1080]',
        }
        
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=False)
            
            # Construction des formats disponibles
            formats = []
            seen = set()
            
            if 'formats' in info:
                for f in info['formats']:
                    if f.get('vcodec') != 'none' and f.get('acodec') != 'none':
                        height = f.get('height', 0)
                        if height and height not in seen:
                            seen.add(height)
                            formats.append({
                                'format_id': f['format_id'],
                                'quality': f"{height}p" if height else "HD",
                                'ext': f.get('ext', 'mp4')
                            })
                
                # Trier par qualité
                formats.sort(key=lambda x: int(x['quality'].replace('p', '') or 0), reverse=True)
            
            # Ajouter option audio
            formats.append({
                'format_id': 'bestaudio',
                'quality': '🎵 Audio MP3',
                'ext': 'mp3'
            })
            
            return {
                'success': True,
                'title': info.get('title', 'Vidéo'),
                'duration': info.get('duration', 0),
                'thumbnail': info.get('thumbnail', ''),
                'uploader': info.get('uploader', 'Inconnu'),
                'formats': formats
            }
    except Exception as e:
        logger.error(f"Erreur get_info: {e}")
        return {'success': False, 'error': str(e)}

def get_direct_video_url(url, format_id='best'):
    """Récupérer l'URL directe (sans télécharger le fichier)"""
    try:
        ydl_opts = {
            'format': format_id,
            'quiet': True,
            'no_warnings': True,
        }
        
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=False)
            
            # Pour l'audio
            if format_id == 'bestaudio':
                for f in info.get('formats', []):
                    if f.get('acodec') != 'none' and f.get('vcodec') == 'none':
                        return f.get('url')
            
            # Pour la vidéo
            if 'url' in info:
                return info['url']
            
            # Sinon chercher dans formats
            for f in info.get('formats', []):
                if f.get('format_id') == format_id or (format_id == 'best' and f.get('vcodec') != 'none'):
                    return f.get('url')
            
            return None
    except Exception as e:
        logger.error(f"Erreur direct_url: {e}")
        return None

def download_and_get_file(url, format_id='best'):
    """Télécharger et retourner le chemin du fichier"""
    try:
        ext = 'mp3' if format_id == 'bestaudio' else 'mp4'
        filename = f"{uuid.uuid4().hex}.{ext}"
        filepath = os.path.join(DOWNLOAD_FOLDER, filename)
        
        ydl_opts = {
            'format': 'bestaudio' if format_id == 'bestaudio' else format_id,
            'outtmpl': filepath,
            'quiet': True,
            'no_warnings': True,
        }
        
        # Conversion audio MP3
        if format_id == 'bestaudio':
            ydl_opts['postprocessors'] = [{
                'key': 'FFmpegExtractAudio',
                'preferredcodec': 'mp3',
                'preferredquality': '192',
            }]
        
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            ydl.extract_info(url, download=True)
            
            # Vérifier fichier existant
            if os.path.exists(filepath):
                return filepath
            
            # Chercher fichier mp3
            mp3_path = filepath.replace('.mp4', '.mp3')
            if os.path.exists(mp3_path):
                return mp3_path
            
            return None
    except Exception as e:
        logger.error(f"Erreur download_file: {e}")
        return None

# ========== ROUTES API ==========

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok', 'message': 'Vens-Downloader Mobile'})

@app.route('/api/platforms', methods=['GET'])
def get_platforms():
    return jsonify({'platforms': SUPPORTED_PLATFORMS})

@app.route('/api/info', methods=['POST'])
def info():
    data = request.get_json()
    url = data.get('url', '').strip()
    
    if not url:
        return jsonify({'error': 'URL requise'}), 400
    
    platform, platform_name = detect_platform(url)
    if not platform:
        return jsonify({'error': 'Plateforme non supportée'}), 400
    
    result = get_video_info(url)
    if not result.get('success'):
        return jsonify({'error': result.get('error', 'Erreur inconnue')}), 500
    
    result['platform'] = platform_name
    return jsonify(result)

@app.route('/api/direct-url', methods=['POST'])
def direct_url():
    """
    🟢 ROUTE PRINCIPALE POUR MOBILE
    Retourne l'URL directe → l'utilisateur fait "Long press → Enregistrer"
    """
    data = request.get_json()
    url = data.get('url', '').strip()
    format_id = data.get('format', 'best')
    
    if not url:
        return jsonify({'error': 'URL requise'}), 400
    
    platform, _ = detect_platform(url)
    if not platform:
        return jsonify({'error': 'Plateforme non supportée'}), 400
    
    direct_url = get_direct_video_url(url, format_id)
    
    if direct_url:
        return jsonify({
            'success': True,
            'direct_url': direct_url,
            'title': f"vens_{uuid.uuid4().hex[:8]}"
        })
    else:
        # Fallback : télécharger le fichier
        return jsonify({'error': 'Impossible d\'obtenir l\'URL directe, utilisez le téléchargement fichier'}), 500

@app.route('/api/download-file', methods=['POST'])
def download_file():
    """
    Route alternative : téléchargement du fichier complet
    """
    data = request.get_json()
    url = data.get('url', '').strip()
    format_id = data.get('format', 'best')
    
    if not url:
        return jsonify({'error': 'URL requise'}), 400
    
    filepath = download_and_get_file(url, format_id)
    
    if not filepath or not os.path.exists(filepath):
        return jsonify({'error': 'Échec du téléchargement'}), 500
    
    file_size = os.path.getsize(filepath)
    if file_size > MAX_FILE_SIZE:
        os.remove(filepath)
        return jsonify({'error': f'Fichier trop gros : {file_size/1024/1024:.1f}MB'}), 400
    
    @after_this_request
    def cleanup(response):
        try:
            os.remove(filepath)
        except:
            pass
        return response
    
    return send_file(
        filepath,
        as_attachment=True,
        download_name=os.path.basename(filepath),
        mimetype='video/mp4' if filepath.endswith('.mp4') else 'audio/mpeg'
    )

@app.route('/api/share', methods=['POST'])
def share_info():
    """Pour navigator.share sur mobile"""
    data = request.get_json()
    url = data.get('url', '').strip()
    
    if not url:
        return jsonify({'error': 'URL requise'}), 400
    
    result = get_video_info(url)
    if not result.get('success'):
        return jsonify({'error': result.get('error')}), 500
    
    return jsonify({
        'title': result['title'],
        'text': f'Regardez cette vidéo sur Vens-Downloader',
        'url': url
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=False, threaded=True)
