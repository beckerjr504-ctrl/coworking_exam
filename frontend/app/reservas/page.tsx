"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, Star, MessageSquare } from "lucide-react";
import api from "@/lib/api";

interface Space {
  id: number;
  name: string;
  location: string;
}

interface Reservation {
  id: number;
  spaceId: number;
  startTime: string;
  endTime: string;
  status: string;
  space: Space;
}

export default function ReservasPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [modalReservation, setModalReservation] = useState<Reservation | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reviewComments, setReviewComments] = useState<Record<number, string>>({});
  const [reviewRatings, setReviewRatings] = useState<Record<number, number>>({});
  const [reviewSubmittingId, setReviewSubmittingId] = useState<number | null>(null);

  useEffect(() => {
    async function fetchReservations() {
      try {
        const res = await api.get("/reservations/me");
        setReservations(res.data);
      } catch (err: any) {
        setError("No se pudieron cargar tus reservas. Intenta de nuevo más tarde.");
      } finally {
        setLoading(false);
      }
    }

    fetchReservations();
  }, []);

  const statusStyles = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-50 text-yellow-700 ring-yellow-200";
      case "CONFIRMED":
        return "bg-emerald-50 text-emerald-700 ring-emerald-200";
      case "CANCELLED":
        return "bg-red-50 text-red-700 ring-red-200";
      case "COMPLETED":
        return "bg-gray-100 text-gray-700 ring-gray-200";
      default:
        return "bg-gray-100 text-gray-700 ring-gray-200";
    }
  };

  const handleCancel = async (reservationId: number) => {
    setActionLoading(reservationId);
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
      setActionLoading(null);
    }
  };

  const openReviewModal = (reservation: Reservation) => {
    setModalReservation(reservation);
    setReviewRating(5);
    setReviewComment("");
    setMessage(null);
    setError(null);
  };

  const closeReviewModal = () => {
    setModalReservation(null);
  };

  const handleSubmitReview = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!modalReservation) return;

    setActionLoading(modalReservation.id);
    setMessage(null);
    setError(null);

    try {
      await api.post("/reviews", {
        spaceId: modalReservation.spaceId,
        rating: reviewRating,
        comment: reviewComment,
      });
      setMessage("Reseña enviada correctamente.");
      closeReviewModal();
    } catch (err: any) {
      setError(err?.response?.data?.message || "No se pudo enviar la reseña.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleSubmitInlineReview = async (reservationId: number, spaceId: number) => {
    const rating = reviewRatings[reservationId] ?? 5;
    const comment = reviewComments[reservationId] ?? "";

    setReviewSubmittingId(reservationId);
    setMessage(null);
    setError(null);

    try {
      await api.post("/reviews", {
        spaceId,
        rating,
        comment,
      });
      setMessage("Comentario enviado correctamente.");
      setReviewComments((prev) => ({ ...prev, [reservationId]: "" }));
      setReviewRatings((prev) => ({ ...prev, [reservationId]: 5 }));
    } catch (err: any) {
      setError(err?.response?.data?.message || "No se pudo enviar el comentario.");
    } finally {
      setReviewSubmittingId(null);
    }
  };

  const formattedDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString("es-ES", {
      weekday: "short",
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formattedTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="flex flex-1 flex-col bg-gray-50 px-4 py-6 sm:px-6">
      <div className="mx-auto w-full max-w-6xl">
        <div className="mb-6 rounded-2xl border border-gray-200 bg-white px-6 py-6 shadow-sm">
          <h1 className="text-3xl font-semibold text-gray-900">Mis reservas</h1>
          <p className="mt-2 text-sm text-gray-500">
            Revisa tus próximas reservas y administra tu historial desde aquí.
          </p>
        </div>

        {message && (
          <div className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="grid min-h-[320px] place-items-center rounded-2xl border border-gray-200 bg-white shadow-sm">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
          </div>
        ) : (
          <div className="space-y-4">
            {reservations.length ? (
              reservations.map((reservation) => (
                <div
                  key={reservation.id}
                  className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm font-medium uppercase tracking-[0.24em] text-emerald-600">
                        {reservation.space.name}
                      </p>
                      <h2 className="mt-2 text-2xl font-semibold text-gray-900">
                        {reservation.space.location}
                      </h2>
                    </div>
                    <span
                      className={`inline-flex rounded-full border px-3 py-1 text-sm font-semibold ring-1 ${statusStyles(
                        reservation.status,
                      )}`}
                    >
                      {reservation.status}
                    </span>
                  </div>

                  <div className="mt-5 grid gap-4 sm:grid-cols-3">
                    <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                      <p className="text-sm text-gray-500">Fecha</p>
                      <p className="mt-2 text-gray-900">{formattedDate(reservation.startTime)}</p>
                    </div>
                    <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                      <p className="text-sm text-gray-500">Horario</p>
                      <p className="mt-2 text-gray-900">
                        {formattedTime(reservation.startTime)} - {formattedTime(reservation.endTime)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <MessageSquare className="h-4 w-4" />
                      Reserva #{reservation.id}
                    </div>

                    <div className="flex flex-wrap gap-3">
                      {(reservation.status === "PENDING" || reservation.status === "CONFIRMED") && (
                        <button
                          type="button"
                          onClick={() => handleCancel(reservation.id)}
                          disabled={actionLoading === reservation.id}
                          className="inline-flex items-center justify-center rounded-2xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-60"
                        >
                          {actionLoading === reservation.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            "Cancelar"
                          )}
                        </button>
                      )}

                      {reservation.status !== "CANCELLED" && (
                        <button
                          type="button"
                          onClick={() => openReviewModal(reservation)}
                          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
                        >
                          <Star className="h-4 w-4" />
                          Dejar reseña
                        </button>
                      )}
                    </div>
                  </div>

                  {reservation.status !== "CANCELLED" && (
                    <div className="mt-5 rounded-2xl border border-gray-200 bg-gray-50 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-medium text-gray-900">Tu experiencia</p>
                          <p className="text-sm text-gray-500">Comparte un comentario y calificación del lugar.</p>
                        </div>
                        <span className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-500">
                          {reviewRatings[reservation.id] ?? 5} / 5
                        </span>
                      </div>

                      <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]">
                        <textarea
                          value={reviewComments[reservation.id] ?? ""}
                          onChange={(event) =>
                            setReviewComments((prev) => ({
                              ...prev,
                              [reservation.id]: event.target.value,
                            }))
                          }
                          rows={4}
                          className="min-h-[140px] w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                          placeholder="Describe cómo fue tu experiencia..."
                        />

                        <div className="space-y-3">
                          <div className="grid grid-cols-5 gap-2">
                            {[1, 2, 3, 4, 5].map((value) => (
                              <button
                                key={value}
                                type="button"
                                onClick={() =>
                                  setReviewRatings((prev) => ({
                                    ...prev,
                                    [reservation.id]: value,
                                  }))
                                }
                                className={`inline-flex h-10 items-center justify-center rounded-2xl border px-3 text-sm font-semibold transition ${
                                  (reviewRatings[reservation.id] ?? 5) >= value
                                    ? "border-emerald-600 bg-emerald-50 text-emerald-700"
                                    : "border-gray-200 bg-white text-gray-400 hover:border-emerald-300"
                                }`}
                              >
                                {value}
                              </button>
                            ))}
                          </div>

                          <button
                            type="button"
                            onClick={() => handleSubmitInlineReview(reservation.id, reservation.spaceId)}
                            disabled={reviewSubmittingId === reservation.id}
                            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60"
                          >
                            {reviewSubmittingId === reservation.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              "Enviar comentario"
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-gray-200 bg-white px-6 py-10 text-center shadow-sm">
                <p className="text-sm text-gray-500">No tienes reservas registradas.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {modalReservation ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6">
          <div className="w-full max-w-xl rounded-3xl bg-white p-6 shadow-2xl ring-1 ring-black/5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Dejar reseña</h2>
                <p className="mt-1 text-sm text-gray-500">Reserva #{modalReservation.id} - {modalReservation.space.name}</p>
              </div>
              <button
                type="button"
                onClick={closeReviewModal}
                className="text-sm font-semibold text-gray-500 transition hover:text-gray-900"
              >
                Cerrar
              </button>
            </div>

            <form onSubmit={handleSubmitReview} className="mt-6 space-y-5">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Calificación</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setReviewRating(value)}
                      className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl border px-3 text-lg transition ${
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

              <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeReviewModal}
                  className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={actionLoading === modalReservation.id}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60"
                >
                  {actionLoading === modalReservation.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Enviar reseña"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
