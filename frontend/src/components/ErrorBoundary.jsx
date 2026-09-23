import { Component } from "react";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen bg-gray-50 grid place-items-center p-6">
          <div className="text-center max-w-md">
            <h1 className="text-2xl font-bold text-gray-900">Algo salió mal</h1>
            <p className="mt-2 text-gray-600">
              Ocurrió un error inesperado en la aplicación. Recargá la página o intentá de nuevo.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 rounded-md bg-brand-600 hover:bg-brand-700 text-white font-medium"
            >
              Recargar
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}