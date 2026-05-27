import type { Express } from "express";
import type { Server } from "http";
import { createServer as createViteServer } from "vite";
import path from "path";
import fs from "fs";

// Détecter si on est en mode développement
const isDev = process.env.NODE_ENV === "development";

/**
 * Configure Vite pour le développement
 * - Ajoute les middlewares Vite
 - Sert les fichiers React avec HMR
 */
export async function setupVite(app: Express, server: Server) {
  if (!isDev) {
    console.log("⚠️ setupVite appelé en production, utilisez serveStatic à la place");
    return;
  }

  const clientPath = path.resolve(process.cwd(), "client");
  const indexPath = path.resolve(clientPath, "index.html");

  // Vérifier que le dossier client existe
  if (!fs.existsSync(clientPath)) {
    console.error("❌ Dossier client non trouvé:", clientPath);
    console.log("💡 Créez un dossier client/ avec votre application React");
    process.exit(1);
  }

  // Créer le serveur Vite
  const vite = await createViteServer({
    root: clientPath,
    server: {
      middlewareMode: true,
      hmr: {
        server,
      },
    },
    appType: "custom",
  });

  // Utiliser les middlewares Vite
  app.use(vite.middlewares);

  // Servir l'index.html transformé par Vite
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;

    // Ignorer les routes API
    if (url.startsWith("/api")) {
      return next();
    }

    try {
      // Lire le template HTML
      let template = fs.readFileSync(indexPath, "utf-8");
      
      // Transformer avec Vite (injecte les scripts HMR, etc.)
      template = await vite.transformIndexHtml(url, template);
      
      // Envoyer la réponse
      res.status(200).set({ "Content-Type": "text/html" }).end(template);
    } catch (e: any) {
      vite.ssrFixStacktrace(e);
      console.error("❌ Erreur Vite:", e.message);
      next(e);
    }
  });
}

/**
 * Sert les fichiers statiques en production
 * - Les fichiers sont dans dist/client après build
 */
export function serveStatic(app: Express) {
  const distPath = path.resolve(process.cwd(), "dist/client");
  const indexPath = path.resolve(distPath, "index.html");

  // Vérifier que le dossier dist existe
  if (!fs.existsSync(distPath)) {
    console.error("❌ Dossier dist/client non trouvé:", distPath);
    console.log("💡 Construisez d'abord le frontend avec: npm run build");
    process.exit(1);
  }

  // Servir les fichiers statiques
  app.use(express.static(distPath));

  // Toutes les routes non-API servent index.html (SPA)
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api")) {
      return next();
    }
    res.sendFile(indexPath);
  });
}
