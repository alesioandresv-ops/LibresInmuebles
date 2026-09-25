import { useEffect, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { Home as HomeIcon, LogOut, Menu, X } from "lucide-react";
import { getUnreadCount } from "../api/comms.js";
import { useAuth } from "../context/AuthContext.jsx";

const SEARCH_TARGET = { pathname: "/", state: { scrollTo: "busqueda" } };

export default function Navbar() {
  const { user, isAuthenticated, isOwner, isStaff, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [unread, setUnread] = useState(0);

  const isHome = location.pathname === "/";
  const overHero = isHome && !scrolled && !open;

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 8);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

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

  function handleLogout() {
    logout();
    navigate("/");
  }

  const linkBase = overHero
    ? "px-2.5 py-2 rounded-md text-sm font-medium text-white/85 hover:text-white hover:bg-white/10"
    : "px-2.5 py-2 rounded-md text-sm font-medium text-slate-600 hover:text-brand-900 hover:bg-brand-50";
  const linkActive = overHero
    ? "px-2.5 py-2 rounded-md text-sm font-medium text-white hover:bg-white/15"
    : "px-2.5 py-2 rounded-md text-sm font-medium text-brand-700 hover:bg-brand-50";

  return (
    <header
      className={`sticky top-0 z-40 transition-colors duration-200 ${
        overHero ? "bg-gradient-to-b from-black/45 to-transparent" : "bg-white/95 shadow-sm backdrop-blur"
      }`}
    >
      <div className="app-container flex h-16 items-center justify-between gap-4 md:h-20">
        <Link to="/" className="flex items-center gap-2.5">
          <span
            className={`grid h-9 w-9 place-items-center rounded-lg transition ${
              overHero ? "bg-white/15 text-white" : "bg-brand-600 text-white"
            }`}
          >
            <HomeIcon size={20} strokeWidth={2.2} />
          </span>
          <span className="leading-none">
            <span className={`text-lg font-extrabold tracking-tight ${overHero ? "text-white" : "text-brand-900"}`}>
              Libre<span className={overHero ? "text-accent-400" : "text-brand-500"}>Inmuebles</span>
            </span>
            <span className={`mt-0.5 block text-[0.6rem] font-medium uppercase tracking-[0.2em] ${overHero ? "text-white/70" : "text-slate-400"}`}>
              Dueño Directo
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Principal">
          <NavLink to="/" end className={({ isActive }) => (isActive ? linkActive : linkBase)}>
            Inicio
          </NavLink>
          <NavLink to={SEARCH_TARGET} className={({ isActive }) => (isActive ? linkActive : linkBase)}>
            Buscar
          </NavLink>
          <NavLink to="/legal" className={({ isActive }) => (isActive ? linkActive : linkBase)}>
            Contratos
          </NavLink>
          <NavLink
            to="/publicar"
            className={
              overHero
                ? "ml-1 rounded-lg border border-white/30 bg-white/10 px-3.5 py-2 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20"
                : "ml-1 rounded-lg bg-brand-600 px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-brand-700"
            }
          >
            Publicar inmueble
          </NavLink>
        </nav>

        <div className="hidden items-center gap-1 lg:flex" aria-label="Cuenta">
          {isOwner && (
            <NavLink to="/mis-publicaciones" className={({ isActive }) => (isActive ? linkActive : linkBase)}>
              Mis publicaciones
            </NavLink>
          )}
          {isStaff && (
            <NavLink to="/moderacion" className={({ isActive }) => (isActive ? linkActive : linkBase)}>
              Moderar
            </NavLink>
          )}
          {isAuthenticated && (
            <NavLink to="/mensajes" className={({ isActive }) => (isActive ? linkActive : linkBase)}>
              Mensajes
              {unread > 0 && (
                <span className="ml-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-600 px-1 text-[0.65rem] font-bold text-white">
                  {unread}
                </span>
              )}
            </NavLink>
          )}
          {isAuthenticated ? (
            <>
              <span className={`max-w-28 truncate px-2 text-sm font-medium ${overHero ? "text-white/90" : "text-slate-700"}`}>
                {user.first_name}
              </span>
              <button
                onClick={handleLogout}
                title="Cerrar sesión"
                className={`grid h-9 w-9 place-items-center rounded-md transition ${
                  overHero ? "text-white/85 hover:bg-white/10 hover:text-white" : "text-slate-500 hover:bg-brand-50 hover:text-brand-900"
                }`}
              >
                <LogOut size={18} strokeWidth={2} />
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={({ isActive }) => (isActive ? linkActive : linkBase)}>
                Ingresar
              </NavLink>
              <NavLink
                to="/registro"
                className={
                  overHero
                    ? "rounded-lg bg-white/90 px-3.5 py-2 text-sm font-semibold text-brand-800 backdrop-blur transition hover:bg-white"
                    : "rounded-lg bg-brand-600 px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-brand-700"
                }
              >
                Registrarme
              </NavLink>
            </>
          )}
        </div>

        <button
          className={`grid h-10 w-10 place-items-center rounded-lg transition lg:hidden ${
            overHero ? "text-white hover:bg-white/10" : "text-brand-900 hover:bg-brand-50"
          }`}
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
        >
          {open ? <X size={24} strokeWidth={2} /> : <Menu size={24} strokeWidth={2} />}
        </button>
      </div>

      {open && (
        <nav
          className="app-container max-h-[calc(100vh-4rem)] overflow-y-auto border-t border-slate-100 bg-white pb-4 pt-2 lg:hidden"
          aria-label="Menú móvil"
        >
          <div className="flex flex-col text-slate-700">
            <NavLink to="/" end onClick={() => setOpen(false)} className="rounded-md px-3 py-2.5 text-sm font-medium hover:bg-brand-50">
              Inicio
            </NavLink>
            <NavLink to={SEARCH_TARGET} onClick={() => setOpen(false)} className="rounded-md px-3 py-2.5 text-sm font-medium hover:bg-brand-50">
              Buscar
            </NavLink>
            <NavLink to="/publicar" onClick={() => setOpen(false)} className="rounded-md px-3 py-2.5 text-sm font-medium hover:bg-brand-50">
              Publicar inmueble
            </NavLink>
            <NavLink to="/legal" onClick={() => setOpen(false)} className="rounded-md px-3 py-2.5 text-sm font-medium hover:bg-brand-50">
              Contratos
            </NavLink>
            {isOwner && (
              <NavLink to="/mis-publicaciones" onClick={() => setOpen(false)} className="rounded-md px-3 py-2.5 text-sm font-medium hover:bg-brand-50">
                Mis publicaciones
              </NavLink>
            )}
            {isStaff && (
              <NavLink to="/moderacion" onClick={() => setOpen(false)} className="rounded-md px-3 py-2.5 text-sm font-medium hover:bg-brand-50">
                Moderar
              </NavLink>
            )}
            {isAuthenticated && (
              <NavLink to="/mensajes" onClick={() => setOpen(false)} className="rounded-md px-3 py-2.5 text-sm font-medium hover:bg-brand-50">
                Mensajes
                {unread > 0 && <span className="ml-1.5 text-brand-700">({unread})</span>}
              </NavLink>
            )}
          </div>
          <div className="mt-2 border-t border-slate-100 pt-2">
            {isAuthenticated ? (
              <button onClick={handleLogout} className="w-full rounded-md px-3 py-2.5 text-left text-sm font-medium text-slate-600 hover:bg-brand-50">
                Cerrar sesión ({user.first_name})
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <NavLink
                  to="/login"
                  onClick={() => setOpen(false)}
                  className="rounded-lg border border-brand-600 px-3 py-2.5 text-center text-sm font-semibold text-brand-700 hover:bg-brand-50"
                >
                  Ingresar
                </NavLink>
                <NavLink
                  to="/registro"
                  onClick={() => setOpen(false)}
                  className="rounded-lg bg-brand-600 px-3 py-2.5 text-center text-sm font-semibold text-white hover:bg-brand-700"
                >
                  Registrarme
                </NavLink>
              </div>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}