"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Heart, Loader2 } from "lucide-react";
import api from "@/lib/api";

interface FavoriteItem {
  spaceId: number;
  space: {
    id: number;
    name: string;
    location: string;
    capacity: number;
    type: string;
    price: number;
    imageUrl?: string;
  };
}

export default function FavoritosPage() {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchFavorites() {
      try {
        const res = await api.get("/favorites/me");
        setFavorites(res.data);
      } catch (err) {
        setError("No se pudieron cargar tus favoritos.");
      } finally {
        setLoading(false);
      }
    }

    fetchFavorites();
  }, []);

  const handleRemove = async (spaceId: number) => {
    setRemoving(spaceId);
    setError(null);
    try {
      await api.delete(`/favorites/${spaceId}`);
      setFavorites((prev) => prev.filter((item) => item.spaceId !== spaceId));
    } catch (err: any) {
      setError(err?.response?.data?.message || "No se pudo quitar de favoritos.");
    } finally {
      setRemoving(null);
    }
  };

  return (
    <div className="flex flex-1 flex-col bg-gray-50 px-4 py-6 sm:px-6">
      <div className="mx-auto w-full max-w-7xl">
        <div className="mb-6 rounded-2xl border border-gray-200 bg-white px-6 py-6 shadow-sm">
          <h1 className="text-3xl font-semibold text-gray-900">Favoritos</h1>
          <p className="mt-2 text-sm text-gray-500">
            Tus espacios favoritos aparecen aquí para que puedas reservarlos rápido.
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="grid min-h-[320px] place-items-center rounded-2xl border border-gray-200 bg-white shadow-sm">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
          </div>
        ) : favorites.length ? (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {favorites.map((favorite) => (
              <div
                key={favorite.spaceId}
                className="group overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-transform duration-200 hover:-translate-y-1 hover:shadow-md"
              >
                <Link href={`/explorar/${favorite.space.id}`} className="block">
                  <div className="relative h-48 w-full overflow-hidden bg-gray-100">
                    {favorite.space.imageUrl ? (
                      <img
                        src={favorite.space.imageUrl}
                        alt={favorite.space.name}
                        className="h-full w-full object-cover transition duration-200 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-sm text-gray-500">
                        Sin imagen disponible
                      </div>
                    )}
                  </div>

                  <div className="space-y-3 p-5">
                    <div className="space-y-1">
                      <h2 className="text-xl font-semibold text-gray-900">{favorite.space.name}</h2>
                      <p className="text-sm text-gray-500">{favorite.space.location}</p>
                    </div>

                    <div className="flex flex-wrap gap-2 text-sm uppercase tracking-[0.12em] text-gray-500">
                      <span>{favorite.space.type}</span>
                      <span>{favorite.space.capacity} personas</span>
                    </div>

                    <div className="flex items-center justify-between gap-2 text-sm">
                      <span className="text-lg font-semibold text-gray-900">${favorite.space.price.toFixed(2)}</span>
                      <span className="text-gray-500">por hora</span>
                    </div>
                  </div>
                </Link>

                <div className="border-t border-gray-100 px-5 py-4">
                  <button
                    type="button"
                    onClick={() => handleRemove(favorite.spaceId)}
                    disabled={removing === favorite.spaceId}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-60"
                  >
                    {removing === favorite.spaceId ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Quitar favorito"
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-gray-200 bg-white px-6 py-10 text-center shadow-sm">
            <p className="text-sm text-gray-500">No tienes espacios en favoritos todavía.</p>
          </div>
        )}
      </div>
    </div>
  );
}
