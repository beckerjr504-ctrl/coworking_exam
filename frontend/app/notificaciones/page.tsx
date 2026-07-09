"use client";

import { useEffect, useState } from "react";
import { Loader2, Bell } from "lucide-react";
import api from "@/lib/api";

interface NotificationItem {
  id: number;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export default function NotificacionesPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchNotifications() {
      try {
        const res = await api.get("/notifications/me");
        setNotifications(
          res.data.sort((a: NotificationItem, b: NotificationItem) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
          ),
        );
      } catch (err) {
        setError("No se pudieron cargar las notificaciones.");
      } finally {
        setLoading(false);
      }
    }

    fetchNotifications();
  }, []);

  const handleMarkRead = async (notification: NotificationItem) => {
    if (notification.read) return;
    setUpdatingId(notification.id);
    setError(null);

    try {
      await api.patch(`/notifications/${notification.id}/read`);
      setNotifications((prev) =>
        prev.map((item) =>
          item.id === notification.id ? { ...item, read: true } : item,
        ),
      );
    } catch (err: any) {
      setError(err?.response?.data?.message || "No se pudo marcar la notificación como leída.");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="flex flex-1 flex-col bg-gray-50 px-4 py-6 sm:px-6">
      <div className="mx-auto w-full max-w-5xl">
        <div className="mb-6 rounded-2xl border border-gray-200 bg-white px-6 py-6 shadow-sm">
          <h1 className="text-3xl font-semibold text-gray-900">Notificaciones</h1>
          <p className="mt-2 text-sm text-gray-500">
            Revisa tus avisos y marca como leídas las notificaciones nuevas.
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
        ) : notifications.length ? (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <button
                key={notification.id}
                type="button"
                onClick={() => handleMarkRead(notification)}
                className={`w-full rounded-3xl border p-5 text-left transition ${
                  notification.read
                    ? "border-gray-200 bg-white hover:bg-gray-50"
                    : "border-emerald-200 bg-emerald-50 hover:bg-emerald-100"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-600 text-white">
                      <Bell className="h-4 w-4" />
                    </span>
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">{notification.title}</h2>
                      <p className="mt-1 text-sm text-gray-500">{notification.message}</p>
                    </div>
                  </div>
                  {!notification.read ? (
                    <span className="inline-flex h-3 w-3 rounded-full bg-emerald-600" />
                  ) : null}
                </div>
                <p className="mt-4 text-sm text-gray-400">{new Date(notification.createdAt).toLocaleString("es-ES")}</p>
                {updatingId === notification.id ? (
                  <div className="mt-4 text-sm text-emerald-600">Marcando como leído...</div>
                ) : null}
              </button>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-gray-200 bg-white px-6 py-10 text-center shadow-sm">
            <p className="text-sm text-gray-500">No tienes notificaciones nuevas.</p>
          </div>
        )}
      </div>
    </div>
  );
}
