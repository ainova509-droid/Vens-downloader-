import { exec } from "yt-dlp-exec";
import { storagePut } from "./storage";
import { nanoid } from "nanoid";
import fs from "fs";
import path from "path";
import os from "os";

const TEMP_DIR = path.join(os.tmpdir(), "vens-downloader");

// Créer le répertoire temporaire s'il n'existe pas
if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, { recursive: true });
}

export interface DownloadResult {
  success: boolean;
  filename?: string;
  s3Key?: string;
  s3Url?: string;
  error?: string;
}

/**
 * Valide une URL avant le téléchargement
 */
export function validateUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    const supportedDomains = [
      "youtube.com",
      "youtu.be",
      "tiktok.com",
      "instagram.com",
      "vimeo.com",
      "facebook.com",
      "twitter.com",
      "x.com",
    ];

    return supportedDomains.some(
      (domain) =>
        urlObj.hostname.includes(domain) ||
        urlObj.hostname.includes(domain.replace(".com", ""))
    );
  } catch {
    return false;
  }
}

/**
 * Télécharge une vidéo et l'upload vers S3
 */
export async function downloadAndUploadVideo(
  videoUrl: string
): Promise<DownloadResult> {
  const tempId = nanoid(8);
  const tempPath = path.join(TEMP_DIR, tempId);

  try {
    // Valider l'URL
    if (!validateUrl(videoUrl)) {
      return {
        success: false,
        error:
          "Plateforme non supportée. Essayez YouTube, TikTok, Instagram, Vimeo, Facebook ou Twitter.",
      };
    }

    // Créer un dossier temporaire pour ce téléchargement
    fs.mkdirSync(tempPath, { recursive: true });

    // Télécharger la vidéo
    const outputTemplate = path.join(tempPath, "%(title)s.%(ext)s");

    await exec(videoUrl, {
      output: outputTemplate,
      quiet: true,
      noWarnings: true,
      format: "best[ext=mp4]/best",
    });

    // Trouver le fichier téléchargé
    const files = fs.readdirSync(tempPath);
    const videoFile = files.find(
      (f) => f.endsWith(".mp4") || f.endsWith(".mkv") || f.endsWith(".webm")
    );

    if (!videoFile) {
      return {
        success: false,
        error: "Impossible de télécharger la vidéo. Veuillez réessayer.",
      };
    }

    const videoPath = path.join(tempPath, videoFile);
    const fileBuffer = fs.readFileSync(videoPath);

    // Upload vers S3
    const s3Key = `downloads/${nanoid()}/${videoFile}`;
    const { url: s3Url } = await storagePut(s3Key, fileBuffer, "video/mp4");

    // Nettoyer le fichier temporaire
    fs.rmSync(tempPath, { recursive: true, force: true });

    return {
      success: true,
      filename: videoFile,
      s3Key,
      s3Url,
    };
  } catch (error: any) {
    // Nettoyer en cas d'erreur
    try {
      fs.rmSync(tempPath, { recursive: true, force: true });
    } catch {}

    const errorMessage = error?.message || "Erreur lors du téléchargement";

    // Déterminer le type d'erreur
    if (
      errorMessage.includes("Unsupported URL") ||
      errorMessage.includes("ERROR")
    ) {
      return {
        success: false,
        error: "URL invalide ou contenu non accessible.",
      };
    }

    if (errorMessage.includes("429")) {
      return {
        success: false,
        error: "Trop de requêtes. Veuillez réessayer dans quelques minutes.",
      };
    }

    return {
      success: false,
      error: "Erreur lors du téléchargement. Veuillez réessayer.",
    };
  }
}

/**
 * Nettoie les fichiers temporaires de plus de 1 heure
 */
export function cleanupOldTempFiles(maxAgeHours: number = 1): void {
  try {
    if (!fs.existsSync(TEMP_DIR)) return;

    const now = Date.now();
    const maxAge = maxAgeHours * 60 * 60 * 1000;

    const dirs = fs.readdirSync(TEMP_DIR);
    dirs.forEach((dir) => {
      const dirPath = path.join(TEMP_DIR, dir);
      const stats = fs.statSync(dirPath);

      if (now - stats.mtimeMs > maxAge) {
        fs.rmSync(dirPath, { recursive: true, force: true });
        console.log(`[Cleanup] Removed old temp directory: ${dir}`);
      }
    });
  } catch (error) {
    console.error("[Cleanup] Error cleaning up temp files:", error);
  }
}
