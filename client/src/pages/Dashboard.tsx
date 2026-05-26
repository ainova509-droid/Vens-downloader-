import { useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { LogOut, Download, Trash2, Calendar, Link as LinkIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function Dashboard() {
  const { user, logout, isAuthenticated, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();

  // Redirection si non authentifié
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      setLocation("/login");
    }
  }, [authLoading, isAuthenticated, setLocation]);

  // Récupérer l'historique des téléchargements
  const { data: downloads, isLoading, refetch } = trpc.downloads.history.useQuery(
    undefined,
    {
      enabled: isAuthenticated,
    }
  );

  const deleteMutation = trpc.downloads.delete.useMutation({
    onSuccess: () => {
      toast.success("Téléchargement supprimé");
      refetch();
    },
    onError: (error: any) => {
      toast.error(error.message || "Erreur lors de la suppression");
    },
  });

  const handleLogout = async () => {
    await logout();
    setLocation("/");
  };

  const handleDelete = (id: number) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce téléchargement ?")) {
      deleteMutation.mutate({ id });
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-slate-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
            <p className="text-slate-600 text-sm mt-1">
              Bienvenue, <span className="font-semibold">{user?.name || "Utilisateur"}</span>
            </p>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Déconnexion
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-8 sm:py-12">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <Card className="bg-white shadow-sm rounded-lg p-6 border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">
                  Total de téléchargements
                </p>
                <p className="text-3xl font-bold text-slate-900 mt-2">
                  {downloads?.length || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Download className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </Card>

          <Card className="bg-white shadow-sm rounded-lg p-6 border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">
                  Dernière activité
                </p>
                <p className="text-lg font-semibold text-slate-900 mt-2">
                  {downloads && downloads.length > 0
                    ? formatDate(downloads[0]?.createdAt)
                    : "Aucune"}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Downloads History */}
        <Card className="bg-white shadow-lg rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-slate-200">
            <h2 className="text-xl font-bold text-slate-900">
              Historique des téléchargements
            </h2>
          </div>

          {isLoading ? (
            <div className="p-8 flex items-center justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            </div>
          ) : downloads && downloads.length > 0 ? (
            <div className="divide-y divide-slate-200">
              {downloads.map((download: any) => (
                <div
                  key={download.id}
                  className="p-4 sm:p-6 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-slate-900 truncate">
                        {download.filename}
                      </h3>
                      <div className="flex items-center gap-4 mt-2 text-sm text-slate-600">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {formatDate(download.createdAt)}
                        </div>
                        <div className="flex items-center gap-1">
                          <LinkIcon className="w-4 h-4" />
                          {download.status}
                        </div>
                      </div>
                      {download.s3Url && (
                        <a
                          href={download.s3Url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-700 text-xs mt-2 inline-flex items-center gap-1"
                        >
                          <LinkIcon className="w-3 h-3" />
                          Accéder au fichier
                        </a>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {download.s3Url && (
                        <a
                          href={download.s3Url}
                          download
                          className="inline-flex items-center justify-center w-10 h-10 bg-blue-100 text-blue-600 hover:bg-blue-200 rounded-lg transition-colors"
                          title="Télécharger"
                        >
                          <Download className="w-5 h-5" />
                        </a>
                      )}
                      <button
                        onClick={() => handleDelete(download.id)}
                        disabled={deleteMutation.isPending}
                        className="inline-flex items-center justify-center w-10 h-10 bg-red-100 text-red-600 hover:bg-red-200 rounded-lg transition-colors disabled:opacity-50"
                        title="Supprimer"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Download className="w-8 h-8 text-slate-400" />
              </div>
              <p className="text-slate-600 font-medium">
                Aucun téléchargement pour le moment
              </p>
              <p className="text-slate-500 text-sm mt-1">
                Commencez par télécharger une vidéo depuis l'accueil
              </p>
              <Link href="/">
                <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                  Aller à l'accueil
                </button>
              </Link>
            </div>
          )}
        </Card>
      </main>

      {/* Mobile Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-lg">
        <div className="max-w-4xl mx-auto px-4 flex justify-around items-center h-16">
          <Link href="/" className="flex-1 flex justify-center">
            <button className="flex flex-col items-center justify-center gap-1 py-2 px-3 text-slate-600 hover:text-slate-900 text-xs">
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
            <button className="flex flex-col items-center justify-center gap-1 py-2 px-3 text-blue-600 font-semibold text-xs">
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
