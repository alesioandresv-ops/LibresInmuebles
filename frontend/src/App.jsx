import { Link, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import { PublicOnly, RequireAuth, RequireOwner, RequireStaff } from "./components/Protected.jsx";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import ResetPassword from "./pages/ResetPassword.jsx";
import PropertyDetail from "./pages/PropertyDetail.jsx";
import Publish from "./pages/Publish.jsx";
import MyProperties from "./pages/MyProperties.jsx";
import EditProperty from "./pages/EditProperty.jsx";
import Messages from "./pages/Messages.jsx";
import Moderation from "./pages/Moderation.jsx";
import Legal from "./pages/Legal.jsx";
import NotFound from "./pages/NotFound.jsx";

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/legal" element={<Legal />} />
          <Route path="/properties/:id" element={<PropertyDetail />} />
          <Route
            path="/mensajes"
            element={
              <RequireAuth>
                <Messages />
              </RequireAuth>
            }
          />
          <Route
            path="/publicar"
            element={
              <RequireAuth>
                <RequireOwner>
                  <Publish />
                </RequireOwner>
              </RequireAuth>
            }
          />
          <Route
            path="/mis-publicaciones"
            element={
              <RequireAuth>
                <RequireOwner>
                  <MyProperties />
                </RequireOwner>
              </RequireAuth>
            }
          />
          <Route
            path="/mis-publicaciones/:id/editar"
            element={
              <RequireAuth>
                <RequireOwner>
                  <EditProperty />
                </RequireOwner>
              </RequireAuth>
            }
          />
          <Route
            path="/moderacion"
            element={
              <RequireAuth>
                <RequireStaff>
                  <Moderation />
                </RequireStaff>
              </RequireAuth>
            }
          />
          <Route
            path="/login"
            element={
              <PublicOnly>
                <Login />
              </PublicOnly>
            }
          />
          <Route
            path="/registro"
            element={
              <PublicOnly>
                <Register />
              </PublicOnly>
            }
          />
          <Route
            path="/recuperar-clave"
            element={
              <PublicOnly>
                <ForgotPassword />
              </PublicOnly>
            }
          />
          <Route
            path="/restablecer-clave"
            element={
              <PublicOnly>
                <ResetPassword />
              </PublicOnly>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <footer className="bg-white border-t py-6 text-center text-sm text-gray-500">
        <Link to="/legal" className="text-brand-600 hover:underline">
          Modelos de contratos
        </Link>{" "}
        · LibreInmuebles — conectamos dueños directos con interesados en Paso de los Libres, Corrientes.
      </footer>
    </div>
  );
}