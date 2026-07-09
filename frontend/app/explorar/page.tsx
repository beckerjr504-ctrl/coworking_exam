"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { CalendarDays, Heart, Loader2, Tag, Users } from "lucide-react";
import api from "@/lib/api";

interface Space {
  id: number;
  name: string;
  description?: string;
  location: string;
  capacity: number;
  type: string;
  price: number;
  imageUrl?: string;
}

export default function ExplorarPage() {
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [filterType, setFilterType] = useState("TODOS");
  const [loading, setLoading] = useState(true);
  const [savingFavoriteId, setSavingFavoriteId] = useState<number | null>(null);
  const [selectedSpaceId, setSelectedSpaceId] = useState<number | null>(null);
  const [reservationDate, setReservationDate] = useState("");
  const [reservationStartTime, setReservationStartTime] = useState("");
  const [reservationEndTime, setReservationEndTime] = useState("");
  const [reservationReason, setReservationReason] = useState("");
  const [submittingReservation, setSubmittingReservation] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitMessage, setSubmitMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        const [spacesRes, favoritesRes] = await Promise.all([
          api.get("/spaces"),
          api.get("/favorites/me"),
        ]);

        setSpaces(spacesRes.data);
        setFavorites(favoritesRes.data.map((fav: any) => fav.spaceId));
      } catch (err) {
        setError("No se pudieron cargar los espacios. Intenta de nuevo más tarde.");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const selectedSpace = spaces.find((space) => space.id === selectedSpaceId) ?? null;

  async function handleCreateReservation(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitError("");
    setSubmitMessage("");

    if (!selectedSpaceId) {
      setSubmitError("Selecciona un espacio antes de crear tu reserva.");
      return;
    }

    if (!reservationDate || !reservationStartTime || !reservationEndTime) {
      setSubmitError("Completa todos los campos de fecha y horario.");
      return;
    }

    const startDate = new Date(`${reservationDate}T${reservationStartTime}:00`);
    const endDate = new Date(`${reservationDate}T${reservationEndTime}:00`);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      setSubmitError("Formato de fecha u hora inválido.");
      return;
    }

    if (endDate <= startDate) {
      setSubmitError("La hora de fin debe ser posterior a la hora de inicio.");
      return;
    }

    setSubmittingReservation(true);
    try {
      await api.post("/reservations", {
        spaceId: selectedSpaceId,
        startTime: startDate.toISOString(),
        endTime: endDate.toISOString(),
        reason: reservationReason || undefined,
      });
      setSubmitMessage("Reserva creada correctamente.");
      setReservationDate("");
      setReservationStartTime("");
      setReservationEndTime("");
      setReservationReason("");
    } catch (err: any) {
      setSubmitError(err?.response?.data?.message || "No se pudo crear la reserva.");
    } finally {
      setSubmittingReservation(false);
    }
  }

  const filteredSpaces = useMemo(() => {
    if (filterType === "TODOS") return spaces;
    return spaces.filter((space) => space.type === filterType);
  }, [spaces, filterType]);

  async function toggleFavorite(spaceId: number, isFavorite: boolean) {
    setSavingFavoriteId(spaceId);
    try {
      if (isFavorite) {
        await api.delete(`/favorites/${spaceId}`);
        setFavorites((prev) => prev.filter((id) => id !== spaceId));
      } else {
        await api.post(`/favorites/${spaceId}`);
        setFavorites((prev) => [...prev, spaceId]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSavingFavoriteId(null);
    }
  }

  return (
    <div className="flex flex-1 flex-col bg-gray-50 px-4 py-6 sm:px-6">
      <div className="mx-auto w-full max-w-7xl">
        <div className="mb-6 flex flex-col gap-4 rounded-2xl bg-white px-5 py-5 shadow-sm border border-gray-200 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-emerald-600">Explorar</p>
            <h1 className="mt-2 text-3xl font-semibold text-gray-900">Encuentra tu espacio ideal</h1>
            <p className="mt-2 max-w-2xl text-sm text-gray-500">
              Filtra por tipo y descubre espacios disponibles para trabajar, reunirte o presentar.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {[
              { label: "Todos", value: "TODOS" },
              { label: "Sala", value: "SALA" },
              { label: "Escritorio", value: "ESCRITORIO" },
              { label: "Auditorio", value: "AUDITORIO" },
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setFilterType(option.value)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  filterType === option.value
                    ? "bg-emerald-600 text-white"
                    : "border border-gray-200 bg-white text-gray-600 hover:bg-emerald-50"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="grid min-h-[320px] place-items-center rounded-2xl border border-gray-200 bg-white shadow-sm">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
          </div>
        ) : (
          <div className="grid gap-5 xl:grid-cols-[2fr_1fr]">
            <div className="grid gap-5 sm:grid-cols-2">
              {filteredSpaces.map((space) => {
                const isFavorite = favorites.includes(space.id);

                return (
                  <div
                    key={space.id}
                    className="group overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-transform duration-200 hover:-translate-y-1 hover:shadow-md"
                  >
                    <Link href={`/explorar/${space.id}`} className="block">
                      <div className="relative h-48 w-full overflow-hidden bg-gray-100">
                        {space.imageUrl ? (
                          <img
                            src={space.imageUrl}
                            alt={space.name}
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
                          <h2 className="text-xl font-semibold text-gray-900">{space.name}</h2>
                          <p className="text-sm text-gray-500">{space.location}</p>
                        </div>

                        <div className="flex flex-wrap gap-2 text-sm uppercase tracking-[0.12em] text-gray-500">
                          <span>{space.type}</span>
                          <span>{space.capacity} personas</span>
                        </div>

                        <p className="text-sm text-gray-700 line-clamp-2">{space.description || "Espacio disponible para tus reuniones y sesiones de trabajo."}</p>

                        <div className="flex items-center justify-between gap-2 text-sm">
                          <span className="text-lg font-semibold text-gray-900">${space.price.toFixed(2)}</span>
                          <span className="text-gray-500">por hora</span>
                        </div>

                        <div className="mt-4">
                          <span className="inline-flex rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition duration-200 group-hover:bg-emerald-700">
                            Ver espacio
                          </span>
                        </div>
                      </div>
                    </Link>

                    <div className="flex items-center justify-between gap-3 border-t border-gray-100 px-5 py-4">
                      <button
                        type="button"
                        onClick={() => setSelectedSpaceId(space.id)}
                        className="inline-flex items-center justify-center rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
                      >
                        Reservar aquí
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleFavorite(space.id, isFavorite)}
                        disabled={savingFavoriteId === space.id}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-gray-500 shadow-sm transition hover:bg-gray-50 disabled:opacity-60"
                      >
                        <Heart
                          className={`h-5 w-5 ${
                            isFavorite ? "fill-emerald-600 text-emerald-600" : "text-gray-400"
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium uppercase tracking-[0.24em] text-emerald-600">Reserva rápida</p>
                  <h2 className="mt-2 text-2xl font-semibold text-gray-900">Crea tu reserva</h2>
                  <p className="mt-2 text-sm text-gray-500">
                    Selecciona un espacio y genera tu reserva directamente desde aquí.
                  </p>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                  <p className="text-sm text-gray-500">Espacio seleccionado</p>
                  <p className="mt-2 text-lg font-semibold text-gray-900">
                    {selectedSpace ? selectedSpace.name : "Ninguno seleccionado"}
                  </p>
                  {selectedSpace ? (
                    <p className="mt-1 text-sm text-gray-500">{selectedSpace.location}</p>
                  ) : (
                    <p className="mt-1 text-sm text-gray-500">Haz clic en "Reservar aquí" en cualquier tarjeta.</p>
                  )}
                </div>

                <form onSubmit={handleCreateReservation} className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="space-y-2">
                      <span className="text-sm font-medium text-gray-700">Fecha</span>
                      <input
                        type="date"
                        value={reservationDate}
                        onChange={(event) => setReservationDate(event.target.value)}
                        className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                      />
                    </label>
                    <label className="space-y-2">
                      <span className="text-sm font-medium text-gray-700">Hora inicio</span>
                      <input
                        type="time"
                        value={reservationStartTime}
                        onChange={(event) => setReservationStartTime(event.target.value)}
                        className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                      />
                    </label>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="space-y-2">
                      <span className="text-sm font-medium text-gray-700">Hora fin</span>
                      <input
                        type="time"
                        value={reservationEndTime}
                        onChange={(event) => setReservationEndTime(event.target.value)}
                        className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                      />
                    </label>
                    <label className="space-y-2">
                      <span className="text-sm font-medium text-gray-700">Motivo (opcional)</span>
                      <input
                        type="text"
                        value={reservationReason}
                        onChange={(event) => setReservationReason(event.target.value)}
                        placeholder="Reunión con cliente"
                        className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                      />
                    </label>
                  </div>

                  {submitMessage && (
                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                      {submitMessage}
                    </div>
                  )}
                  {submitError && (
                    <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                      {submitError}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={submittingReservation || !selectedSpace}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60"
                  >
                    {submittingReservation ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                    Reservar espacio
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
