import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Loader2, Download, AlertCircle, CheckCircle } from "lucide-react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function Home() {
  const { user } = useAuth();
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const downloadMutation = trpc.downloads.download.useMutation();

  const handleDownload = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!url.trim()) {
      setError("Veuillez entrer une URL valide");
      return;
    }

    try {
      setLoading(true);
      const result = await downloadMutation.mutateAsync({ url: url.trim() });

      if (result.success) {
        setSuccess(true);
        setUrl("");
        toast.success("Vidéo téléchargée avec succès !");

        // Redirection vers le lien de téléchargement après 1.5s
        setTimeout(() => {
          if (result.downloadUrl) {
            window.location.href = result.downloadUrl;
          }
        }, 1500);
      }
    } catch (err: any) {
      const errorMessage =
        err?.message || "Erreur lors du téléchargement. Veuillez réessayer.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-2xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
            Vens-Downloader
          </h1>
          <p className="text-slate-600 mt-1 text-sm">
            Téléchargez vos vidéos en un clic
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-8 sm:py-12">
        <Card className="bg-white shadow-lg rounded-2xl p-6 sm:p-8">
          {/* Form */}
          <form onSubmit={handleDownload} className="space-y-6">
            <div>
              <label
                htmlFor="url"
                className="block text-sm font-semibold text-slate-700 mb-3"
              >
                Collez le lien de la vidéo
              </label>
              <Input
                id="url"
                type="url"
                placeholder="https://www.youtube.com/watch?v=..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={loading}
                className="h-12 text-base border-slate-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
              />
              <p className="text-xs text-slate-500 mt-2">
                YouTube, TikTok, Instagram, Vimeo et plus...
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-900">{error}</p>
                </div>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-green-900">
                    Téléchargement en cours... Votre fichier va bientôt arriver.
                  </p>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading || !url.trim()}
              className="w-full h-12 text-base font-semibold bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Téléchargement en cours...
                </>
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  Télécharger
                </>
              )}
            </Button>
          </form>

          {/* Info Box */}
          <div className="mt-8 pt-8 border-t border-slate-200">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">
              Plateformes supportées
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {["YouTube", "TikTok", "Instagram", "Vimeo", "Facebook", "Twitter"].map(
                (platform) => (
                  <div
                    key={platform}
                    className="px-3 py-2 bg-slate-100 text-slate-700 text-xs font-medium rounded-lg text-center"
                  >
                    {platform}
                  </div>
                )
              )}
            </div>
          </div>
        </Card>

        {/* Features */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
          <div className="bg-white rounded-lg p-4 shadow-sm border border-slate-200">
            <div className="text-2xl mb-2">⚡</div>
            <h4 className="font-semibold text-slate-900 text-sm">Rapide</h4>
            <p className="text-xs text-slate-600 mt-1">
              Téléchargement en quelques secondes
            </p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border border-slate-200">
            <div className="text-2xl mb-2">🔒</div>
            <h4 className="font-semibold text-slate-900 text-sm">Sécurisé</h4>
            <p className="text-xs text-slate-600 mt-1">
              Liens temporaires et suppression auto
            </p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border border-slate-200">
            <div className="text-2xl mb-2">📱</div>
            <h4 className="font-semibold text-slate-900 text-sm">Mobile</h4>
            <p className="text-xs text-slate-600 mt-1">
              Fonctionne sur tous les appareils
            </p>
          </div>
        </div>
      </main>

      {/* Mobile Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-lg">
        <div className="max-w-2xl mx-auto px-4 flex justify-around items-center h-16">
          <Link href="/" className="flex-1 flex justify-center">
            <button className="flex flex-col items-center justify-center gap-1 py-2 px-3 text-blue-600 font-semibold text-xs">
              <span className="text-lg">🏠</span>
              Accueil
            </button>
          </Link>
          <Link href="/login" className="flex-1 flex justify-center">
            <button className="flex flex-col items-center justify-center gap-1 py-2 px-3 text-slate-600 hover:text-slate-900 text-xs">
              <span className="text-lg">🔐</span>
              Connexion
            </button>
          </Link>
          <Link href="/dashboard" className="flex-1 flex justify-center">
            <button className="flex flex-col items-center justify-center gap-1 py-2 px-3 text-slate-600 hover:text-slate-900 text-xs">
              <span className="text-lg">📊</span>
              Dashboard
            </button>
          </Link>
        </div>
      </nav>

      {/* Padding for mobile nav */}
      <div className="h-16" />
    </div>
  );
}
