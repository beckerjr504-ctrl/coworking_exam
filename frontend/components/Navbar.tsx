"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Building2, Heart, Bell, CalendarCheck, LogOut } from "lucide-react";

export default function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  if (!user) return null;

  const links = [
    { href: "/explorar", label: "Explorar", icon: Building2 },
    { href: "/reservas", label: "Mis reservas", icon: CalendarCheck },
    { href: "/favoritos", label: "Favoritos", icon: Heart },
    { href: "/notificaciones", label: "Notificaciones", icon: Bell },
  ];

  return (
    <nav className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white px-6 py-3">
      <div className="flex items-center gap-8">
        <Link href="/explorar" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600">
            <Building2 className="h-4 w-4 text-white" />
          </div>
          <span className="font-semibold text-gray-900">Nido Coworking</span>
        </Link>

        <div className="hidden gap-1 sm:flex">
          {links.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${
                pathname === href
                  ? "bg-emerald-50 text-emerald-700"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span className="hidden text-sm text-gray-600 sm:block">{user.name}</span>
        <button
          onClick={logout}
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
        >
          <LogOut className="h-4 w-4" />
          Salir
        </button>
      </div>
    </nav>
  );
}