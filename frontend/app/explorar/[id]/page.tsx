"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { CalendarDays, MapPin, Users, Tag, Loader2, Star } from "lucide-react";

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

interface Review {
  id: number;
  rating: number;
  comment?: string;
  user: { id: number; name: string };
}

interface Amenity {
  id: number;
  name: string;
}

interface Reservation {
  id: number;
  spaceId: number;
  startTime: string;
  endTime: string;
  status: string;
  reason?: string;
}

export default function SpaceDetailPage() {
  const params = useParams();
  const spaceId = params?.id;
  const [space, setSpace] = useState<Space | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [cancelingId, setCancelingId] = useState<number | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [reason, setReason] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewMessage, setReviewMessage] = useState<string | null>(null);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const { user } = useAuth();

  const averageRating = useMemo(() => {
    if (!reviews.length) return 0;
    return reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
  }, [reviews]);

  useEffect(() => {
    if (!spaceId) return;

    async function loadData() {
      setLoading(true);
      try {
        const [spaceRes, reviewsRes, amenitiesRes, reservationsRes] = await Promise.all([
          api.get(`/spaces/${spaceId}`),
          api.get(`/reviews/space/${spaceId}`),
          api.get(`/amenities`),
          api.get(`/reservations/me`),
        ]);

        setSpace(spaceRes.data);
        setReviews(reviewsRes.data);
        setAmenities(amenitiesRes.data);
        setReservations(
          (reservationsRes.data as Reservation[]).filter(
            (reservation) => reservation.spaceId === Number(spaceId),
          ),
        );
      } catch (err: any) {
        setError("No se pudo cargar la información del espacio. Intenta de nuevo más tarde.");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [spaceId]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    setError(null);

    if (!spaceId) {
      setError("ID de espacio no válido.");
      return;
    }

    if (!date || !startTime || !endTime) {
      setError("Completa fecha, hora de inicio y hora de fin.");
      return;
    }

    const startDate = new Date(`${date}T${startTime}:00`);
    const endDate = new Date(`${date}T${endTime}:00`);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      setError("Formato de fecha u hora inválido.");
      return;
    }

    if (endDate <= startDate) {
      setError("La hora de fin debe ser posterior a la hora de inicio.");
      return;
    }

    setSubmitting(true);
    try {
      const response = await api.post("/reservations", {
        spaceId: Number(spaceId),
        startTime: startDate.toISOString(),
        endTime: endDate.toISOString(),
        reason: reason || undefined,
      });
      setReservations((prev) => [...prev, response.data]);
      setMessage("Reserva creada correctamente.");
      setDate("");
      setStartTime("");
      setEndTime("");
      setReason("");
    } catch (err: any) {
      setError(err?.response?.data?.message || "No se pudo completar la reserva.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSubmitReview(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setReviewMessage(null);
    setReviewError(null);

    if (!spaceId) {
      setReviewError("ID de espacio no válido.");
      return;
    }

    if (!user) {
      setReviewError("Debes iniciar sesión para dejar una reseña.");
      return;
    }

    if (!reviewComment.trim()) {
      setReviewError("Escribe un comentario antes de enviar.");
      return;
    }

    try {
      await api.post("/reviews", {
        spaceId: Number(spaceId),
        rating: reviewRating,
        comment: reviewComment,
      });
      setReviewMessage("Reseña enviada correctamente.");
      setReviewRating(5);
      setReviewComment("");
      const updatedReviews = await api.get(`/reviews/space/${spaceId}`);
      setReviews(updatedReviews.data);
    } catch (err: any) {
      setReviewError(err?.response?.data?.message || "No se pudo enviar la reseña.");
    }
  }

  async function handleCancel(reservationId: number) {
    setCancelingId(reservationId);
    setMessage(null);
    setError(null);

    try {
      await api.patch(`/reservations/${reservationId}/status`, { status: "CANCELLED" });
      setReservations((prev) =>
        prev.map((reservation) =>
          reservation.id === reservationId
            ? { ...reservation, status: "CANCELLED" }
            : reservation,
        ),
      );
      setMessage("Reserva cancelada correctamente.");
    } catch (err: any) {
      setError(err?.response?.data?.message || "No se pudo cancelar la reserva.");
    } finally {
      setCancelingId(null);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-96px)] items-center justify-center px-4 py-12 sm:px-6">
        <div className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white px-8 py-10 shadow-sm">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
          <span className="text-sm font-medium text-gray-700">Cargando espacio...</span>
        </div>
      </div>
    );
  }

  if (!space) {
    return (
      <div className="flex min-h-[calc(100vh-96px)] items-center justify-center px-4 py-12 sm:px-6">
        <div className="rounded-2xl border border-gray-200 bg-white px-8 py-10 shadow-sm text-center">
          <p className="text-sm font-medium text-gray-700">Espacio no encontrado.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col bg-gray-50 px-4 py-6 sm:px-6">
      <div className="mx-auto w-full max-w-7xl space-y-6">
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          <div className="relative h-72 w-full bg-gray-100 sm:h-96">
            {space.imageUrl ? (
              <img
                src={space.imageUrl}
                alt={space.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-gray-500">
                Imagen no disponible
              </div>
            )}
          </div>

          <div className="space-y-4 p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium uppercase tracking-[0.24em] text-emerald-600">{space.type}</p>
                <h1 className="text-3xl font-semibold text-gray-900">{space.name}</h1>
                <p className="text-sm text-gray-500">{space.location}</p>
              </div>
              <div className="rounded-2xl border border-gray-200 bg-emerald-50 px-4 py-3 text-right">
                <p className="text-sm text-gray-500">Precio por hora</p>
                <p className="mt-1 text-2xl font-semibold text-emerald-700">${space.price.toFixed(2)}</p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-[1.4fr_0.8fr]">
              <div className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <MapPin className="h-4 w-4" />
                      Ubicación
                    </div>
                    <p className="mt-3 text-gray-900">{space.location}</p>
                  </div>
                  <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Users className="h-4 w-4" />
                      Capacidad
                    </div>
                    <p className="mt-3 text-gray-900">{space.capacity} personas</p>
                  </div>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                  <h2 className="text-lg font-semibold text-gray-900">Descripción</h2>
                  <p className="mt-3 text-gray-600">{space.description || "Espacio cómodo y bien equipado para tus actividades."}</p>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">Reseñas</h2>
                      <p className="text-sm text-gray-500">Promedio y comentarios recientes</p>
                    </div>
                    <div className="rounded-full bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700">
                      {averageRating.toFixed(1)} / 5
                    </div>
                  </div>

                  <div className="mt-4 space-y-4">
                    {reviews.length ? (
                      reviews.map((review) => (
                        <div key={review.id} className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                          <div className="flex items-center justify-between gap-3">
                            <p className="font-medium text-gray-900">{review.user.name}</p>
                            <span className="text-sm text-gray-500">{review.rating} / 5</span>
                          </div>
                          <p className="mt-2 text-gray-600">{review.comment || "Sin comentario adicional."}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500">Este espacio aún no tiene reseñas.</p>
                    )}
                  </div>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                  <h2 className="text-lg font-semibold text-gray-900">Comodidades</h2>
                  <div className="mt-4 grid gap-2 sm:grid-cols-2">
                    {amenities.length ? (
                      amenities.map((amenity) => (
                        <span
                          key={amenity.id}
                          className="inline-flex items-center justify-center rounded-full border border-gray-200 bg-emerald-50 px-3 py-2 text-sm text-gray-700"
                        >
                          {amenity.name}
                        </span>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500">No hay comodidades disponibles.</p>
                    )}
                  </div>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                  <h2 className="text-lg font-semibold text-gray-900">Deja tu reseña</h2>
                  <p className="mt-2 text-sm text-gray-500">
                    Califica el espacio con estrellas y comenta tu experiencia.
                  </p>

                  {reviewMessage && (
                    <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                      {reviewMessage}
                    </div>
                  )}
                  {reviewError && (
                    <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                      {reviewError}
                    </div>
                  )}

                  <form onSubmit={handleSubmitReview} className="mt-5 space-y-4">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">Calificación</label>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((value) => (
                          <button
                            key={value}
                            type="button"
                            onClick={() => setReviewRating(value)}
                            className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl border px-3 transition ${
                              reviewRating >= value
                                ? "border-emerald-600 bg-emerald-50 text-emerald-700"
                                : "border-gray-200 bg-white text-gray-400 hover:border-emerald-300"
                            }`}
                          >
                            <Star className="h-5 w-5" />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">Comentario</label>
                      <textarea
                        value={reviewComment}
                        onChange={(event) => setReviewComment(event.target.value)}
                        rows={4}
                        className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                        placeholder="Escribe tu opinión sobre el espacio..."
                      />
                    </div>

                    <button
                      type="submit"
                      className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
                    >
                      <Star className="h-4 w-4" />
                      Enviar reseña
                    </button>
                  </form>
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                  <h2 className="text-lg font-semibold text-gray-900">Reserva este horario</h2>
                  <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">Fecha</label>
                      <input
                        type="date"
                        value={date}
                        onChange={(event) => setDate(event.target.value)}
                        className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                      />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Hora inicio</label>
                        <input
                          type="time"
                          value={startTime}
                          onChange={(event) => setStartTime(event.target.value)}
                          className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Hora fin</label>
                        <input
                          type="time"
                          value={endTime}
                          onChange={(event) => setEndTime(event.target.value)}
                          className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                        />
                      </div>
                    </div>

                    {message && (
                      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                        {message}
                      </div>
                    )}

                    {error && (
                      <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {error}
                      </div>
                    )}

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Motivo (opcional)</label>
                        <input
                          type="text"
                          value={reason}
                          onChange={(event) => setReason(event.target.value)}
                          placeholder="Ej. Reunión de equipo"
                          className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={submitting}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60"
                      >
                        {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                        Reservar este horario
                      </button>
                    </div>
                  </form>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">Reservas para este espacio</h2>
                      <p className="text-sm text-gray-500">Administra las reservas actuales y cancela si es necesario.</p>
                    </div>
                  </div>

                  <div className="mt-5 space-y-3">
                    {reservations.length ? (
                      reservations.map((reservation) => (
                        <div key={reservation.id} className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                              <p className="text-sm text-gray-500">Reserva #{reservation.id}</p>
                              <p className="mt-1 text-sm text-gray-900">
                                {new Date(reservation.startTime).toLocaleDateString('es-ES')} · {new Date(reservation.startTime).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                                {' '}– {' '}
                                {new Date(reservation.endTime).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="rounded-full border bg-white px-3 py-1 text-xs font-semibold text-gray-700 ring-1 ring-gray-200">
                                {reservation.status}
                              </span>
                              {reservation.status !== 'CANCELLED' && (
                                <button
                                  type="button"
                                  onClick={() => handleCancel(reservation.id)}
                                  disabled={cancelingId === reservation.id}
                                  className="inline-flex items-center justify-center rounded-2xl bg-red-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-red-700 disabled:opacity-60"
                                >
                                  {cancelingId === reservation.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    'Cancelar'
                                  )}
                                </button>
                              )}
                            </div>
                          </div>
                          {reservation.reason ? (
                            <p className="mt-3 text-sm text-gray-600">Motivo: {reservation.reason}</p>
                          ) : null}
                        </div>
                      ))
                    ) : (
                      <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-4 text-sm text-gray-500">
                        No hay reservas creadas para este espacio todavía.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
