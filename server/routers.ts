import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { downloadAndUploadVideo, cleanupOldTempFiles } from "./videoDownloader";
import { createDownload, getDownloadsByUserId, deleteDownload } from "./db";
import { TRPCError } from "@trpc/server";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  downloads: router({
    // Télécharger une vidéo (public)
    download: publicProcedure
      .input(z.object({ url: z.string().url() }))
      .mutation(async ({ input, ctx }) => {
        try {
          // Télécharger et uploader la vidéo
          const result = await downloadAndUploadVideo(input.url);

          if (!result.success) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: result.error || "Erreur lors du téléchargement",
            });
          }

          // Si l'utilisateur est authentifié, sauvegarder dans la base de données
          if (ctx.user) {
            try {
              await createDownload({
                userId: ctx.user.id,
                videoUrl: input.url,
                filename: result.filename!,
                s3Key: result.s3Key,
                s3Url: result.s3Url,
                status: "completed",
              });
            } catch (dbError) {
              console.error("[Download] Failed to save to database:", dbError);
              // Continuer même si la sauvegarde échoue
            }
          }

          // Nettoyer les fichiers temporaires
          cleanupOldTempFiles();

          return {
            success: true,
            filename: result.filename,
            downloadUrl: result.s3Url,
          };
        } catch (error: any) {
          console.error("[Download] Error:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message:
              error?.message || "Erreur lors du téléchargement de la vidéo",
          });
        }
      }),

    // Récupérer l'historique (protected)
    history: protectedProcedure.query(async ({ ctx }) => {
      try {
        const downloads = await getDownloadsByUserId(ctx.user!.id);
        return downloads;
      } catch (error) {
        console.error("[History] Error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erreur lors de la récupération de l'historique",
        });
      }
    }),

    // Supprimer un téléchargement (protected)
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        try {
          await deleteDownload(input.id);
          return { success: true };
        } catch (error) {
          console.error("[Delete] Error:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Erreur lors de la suppression",
          });
        }
      }),
  }),
});

export type AppRouter = typeof appRouter;
