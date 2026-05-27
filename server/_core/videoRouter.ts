import { router, publicProcedure } from "./trpc";
import { z } from "zod";
import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";

const execAsync = promisify(exec);
const DOWNLOAD_DIR = path.join(process.cwd(), "downloads");

if (!fs.existsSync(DOWNLOAD_DIR)) {
  fs.mkdirSync(DOWNLOAD_DIR, { recursive: true });
}

// Nettoyage auto toutes les heures
setInterval(() => {
  const now = Date.now();
  fs.readdir(DOWNLOAD_DIR, (err, files) => {
    if (err) return;
    files.forEach((file) => {
      const filepath = path.join(DOWNLOAD_DIR, file);
      fs.stat(filepath, (err, stats) => {
        if (err) return;
        if (now - stats.mtimeMs > 3600000) {
          fs.unlink(filepath, () => {});
        }
      });
    });
  });
}, 1800000);

const UrlSchema = z.object({ url: z.string().url() });
const DownloadSchema = z.object({ url: z.string().url(), format: z.string().default("best") });

export const videoRouter = router({
  // Obtenir les infos d'une vidéo
  getInfo: publicProcedure.input(UrlSchema).mutation(async ({ input }) => {
    try {
      const { stdout } = await execAsync(`yt-dlp -j --no-warnings "${input.url}"`);
      const info = JSON.parse(stdout);
      
      const formats: { format_id: string; quality: string; ext: string }[] = [];
      const seen = new Set<number>();
      
      if (info.formats) {
        for (const f of info.formats) {
          if (f.vcodec !== "none" && f.acodec !== "none") {
            const height = f.height || 0;
            if (height && !seen.has(height)) {
              seen.add(height);
              formats.push({
                format_id: f.format_id,
                quality: `${height}p`,
                ext: f.ext || "mp4",
              });
            }
          }
        }
        formats.sort((a, b) => (parseInt(b.quality) || 0) - (parseInt(a.quality) || 0));
      }
      
      formats.push({ format_id: "bestaudio", quality: "🎵 Audio MP3", ext: "mp3" });
      
      return {
        success: true,
        title: info.title || "Vidéo",
        duration: info.duration || 0,
        thumbnail: info.thumbnail || "",
        uploader: info.uploader || "Inconnu",
        formats,
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }),
  
  // Obtenir l'URL directe (pour mobile - long press)
  getDirectUrl: publicProcedure.input(DownloadSchema).mutation(async ({ input }) => {
    try {
      const format = input.format === "bestaudio" ? "bestaudio" : input.format;
      const { stdout } = await execAsync(`yt-dlp -g -f ${format} --no-warnings "${input.url}"`);
      const directUrl = stdout.trim();
      
      if (directUrl) {
        return { success: true, direct_url: directUrl };
      }
      return { success: false, error: "Impossible d'obtenir l'URL directe" };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }),
});
