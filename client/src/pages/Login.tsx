import { useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link, useLocation } from "wouter";
import { getLoginUrl } from "@/const";
import { LogIn, ArrowLeft } from "lucide-react";

export default function Login() {
  const { user, loading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  // Si déjà authentifié, rediriger vers le dashboard
  useEffect(() => {
    if (isAuthenticated && user) {
      setLocation("/dashboard");
    }
  }, [isAuthenticated, user, setLocation]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-2xl mx-auto px-4 py-6">
          <Link href="/">
            <button className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors">
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm font-medium">Retour</span>
            </button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-8 sm:py-12 flex items-center justify-center">
        <Card className="bg-white shadow-lg rounded-2xl p-6 sm:p-8 w-full max-w-md">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-50 rounded-full flex items-center justify-center">
              <LogIn className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-center text-slate-900 mb-2">
            Connexion
          </h1>
          <p className="text-center text-slate-600 text-sm mb-8">
            Connectez-vous pour accéder à votre historique de téléchargements et
            gérer vos fichiers.
          </p>

          {/* Login Button */}
          <Button
            onClick={() => {
              window.location.href = getLoginUrl();
            }}
            disabled={loading}
            className="w-full h-12 text-base font-semibold bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Chargement...
              </>
            ) : (
              <>
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Se connecter avec Google
              </>
            )}
          </Button>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-slate-500">ou</span>
            </div>
          </div>

          {/* Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-900">
              <span className="font-semibold">Astuce :</span> Vous pouvez aussi
              télécharger des vidéos sans vous connecter. La connexion vous permet
              de sauvegarder votre historique.
            </p>
          </div>

          {/* Back to Home */}
          <Link href="/">
            <button className="w-full h-10 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors">
              Retour à l'accueil
            </button>
          </Link>
        </Card>
      </main>

      {/* Mobile Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-lg">
        <div className="max-w-2xl mx-auto px-4 flex justify-around items-center h-16">
          <Link href="/" className="flex-1 flex justify-center">
            <button className="flex flex-col items-center justify-center gap-1 py-2 px-3 text-slate-600 hover:text-slate-900 text-xs">
              <span className="text-lg">🏠</span>
              Accueil
            </button>
          </Link>
          <Link href="/login" className="flex-1 flex justify-center">
            <button className="flex flex-col items-center justify-center gap-1 py-2 px-3 text-blue-600 font-semibold text-xs">
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
