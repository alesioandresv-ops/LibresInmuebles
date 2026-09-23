import { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { getUnreadCount } from "../api/comms.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function Navbar() {
  const { user, isAuthenticated, isOwner, isStaff, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);

  const navItem = "px-3 py-2 rounded-md text-sm font-medium hover:bg-brand-50";
  const navItemActive = "px-3 py-2 rounded-md text-sm font-medium bg-brand-100 text-brand-900";

  function handleLogout() {
    logout();
    setOpen(false);
    navigate("/");
  }

  useEffect(() => {
    if (!isAuthenticated) {
      setUnread(0);
      return;
    }
    let active = true;
    async function refresh() {
      try {
        const res = await getUnreadCount();
        if (active) setUnread(res.count);
      } catch {
        // sin cambios si falla
      }
    }
    refresh();
    const interval = setInterval(refresh, 30000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [isAuthenticated, isOwner]);

  return (
    <header className="bg-white shadow-sm sticky top-0 z-20">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-brand-600 text-white grid place-items-center font-bold">L</span>
          <span className="font-bold text-lg text-brand-900">LibreInmuebles</span>
        </Link>

        <nav className="hidden md:flex items-center gap-2">
          <NavLink to="/" end className={({ isActive }) => (isActive ? navItemActive : navItem)}>
            Inmuebles
          </NavLink>
          <NavLink to="/legal" className={({ isActive }) => (isActive ? navItemActive : navItem)}>
            Contratos
          </NavLink>
          {isOwner && (
            <NavLink to="/publicar" className={({ isActive }) => (isActive ? navItemActive : navItem)}>
              Publicar
            </NavLink>
          )}
          {isOwner && (
            <NavLink to="/mis-publicaciones" className={({ isActive }) => (isActive ? navItemActive : navItem)}>
              Mis publicaciones
            </NavLink>
          )}
          {isStaff && (
            <NavLink to="/moderacion" className={({ isActive }) => (isActive ? navItemActive : navItem)}>
              Moderar
            </NavLink>
          )}
          {isAuthenticated && (
            <NavLink to="/mensajes" className={({ isActive }) => (isActive ? navItemActive : navItem)}>
              Mensajes
              {isOwner && unread > 0 && (
                <span className="ml-1.5 inline-flex items-center justify-center min-w-5 h-5 px-1 rounded-full bg-brand-600 text-white text-xs">
                  {unread}
                </span>
              )}
            </NavLink>
          )}
          {isAuthenticated ? (
            <>
              <span className="text-sm text-gray-600 px-2">
                {user.first_name} {user.last_name}
              </span>
              <button onClick={handleLogout} className={navItem}>
                Salir
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={({ isActive }) => (isActive ? navItemActive : navItem)}>
                Ingresar
              </NavLink>
              <NavLink
                to="/registro"
                className="px-3 py-2 rounded-md text-sm font-medium text-white bg-brand-600 hover:bg-brand-700"
              >
                Registrate
              </NavLink>
            </>
          )}
        </nav>

        <button
          className="md:hidden p-2"
          onClick={() => setOpen((o) => !o)}
          aria-label="Menú"
        >
          <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {open && (
        <nav className="md:hidden px-4 pb-4 flex flex-col gap-1">
          <NavLink to="/" end onClick={() => setOpen(false)} className={navItem}>
            Inmuebles
          </NavLink>
          <NavLink to="/legal" onClick={() => setOpen(false)} className={navItem}>
            Contratos
          </NavLink>
          {isOwner && (
            <NavLink to="/publicar" onClick={() => setOpen(false)} className={navItem}>
              Publicar
            </NavLink>
          )}
          {isOwner && (
            <NavLink to="/mis-publicaciones" onClick={() => setOpen(false)} className={navItem}>
              Mis publicaciones
            </NavLink>
          )}
          {isStaff && (
            <NavLink to="/moderacion" onClick={() => setOpen(false)} className={navItem}>
              Moderar
            </NavLink>
          )}
          {isAuthenticated && (
            <NavLink to="/mensajes" onClick={() => setOpen(false)} className={navItem}>
              Mensajes
              {isOwner && unread > 0 && ` (${unread})`}
            </NavLink>
          )}
          {isAuthenticated ? (
            <button onClick={handleLogout} className={`${navItem} text-left`}>
              Salir ({user.first_name})
            </button>
          ) : (
            <>
              <NavLink to="/login" onClick={() => setOpen(false)} className={navItem}>
                Ingresar
              </NavLink>
              <NavLink to="/registro" onClick={() => setOpen(false)} className={navItem}>
                Registrate
              </NavLink>
            </>
          )}
        </nav>
      )}
    </header>
  );
}