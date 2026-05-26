import os
import yt_dlp
from flask import Flask, render_template, request, send_file, flash, redirect, url_for
from werkzeug.utils import secure_filename

app = Flask(__name__)
app.secret_key = os.environ.get('SECRET_KEY', 'dev-secret-key-change-in-production')

DOWNLOAD_FOLDER = 'downloads'
ALLOWED_EXTENSIONS = {'mp4', 'mkv', 'webm', 'mov', 'avi'}

# Créer le dossier de téléchargement s'il n'existe pas
if not os.path.exists(DOWNLOAD_FOLDER):
    os.makedirs(DOWNLOAD_FOLDER)


def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/download', methods=['POST'])
def download():
    url = request.form.get('url')
    
    if not url:
        flash('Veuillez entrer une URL valide.', 'error')
        return redirect(url_for('index'))
    
    try:
        # Configuration de yt-dlp
        ydl_opts = {
            'format': 'best[ext=mp4]/best',
            'outtmpl': os.path.join(DOWNLOAD_FOLDER, '%(title)s.%(ext)s'),
            'quiet': False,
            'no_warnings': False,
        }
        
        # Télécharger la vidéo
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=True)
            filename = ydl.prepare_filename(info)
            filepath = os.path.join(DOWNLOAD_FOLDER, os.path.basename(filename))
            
            if os.path.exists(filepath):
                return send_file(filepath, as_attachment=True)
            else:
                flash('Erreur : le fichier n\'a pas pu être trouvé.', 'error')
                return redirect(url_for('index'))
    
    except yt_dlp.utils.DownloadError as e:
        flash(f'Erreur de téléchargement : {str(e)}', 'error')
        return redirect(url_for('index'))
    except Exception as e:
        flash(f'Erreur : {str(e)}', 'error')
        return redirect(url_for('index'))


@app.route('/cleanup', methods=['POST'])
def cleanup():
    """Nettoie les fichiers temporaires"""
    import time
    import glob
    
    now = time.time()
    max_age = 3600  # 1 heure
    
    for filepath in glob.glob(os.path.join(DOWNLOAD_FOLDER, '*')):
        if os.path.isfile(filepath):
            if os.stat(filepath).st_mtime < now - max_age:
                try:
                    os.remove(filepath)
                except Exception as e:
                    print(f'Erreur lors de la suppression de {filepath}: {e}')
    
    return 'Nettoyage effectué'


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(debug=False, host='0.0.0.0', port=port)
