import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary]', error, info);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="card max-w-md w-full p-8 text-center">
          <div className="mx-auto mb-5 w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center">
            <svg className="w-7 h-7 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-slate-800 mb-2">Algo inesperado aconteceu</h1>
          <p className="text-sm text-slate-500 mb-6 leading-relaxed">
            Tivemos um erro ao renderizar essa parte do app. Você pode tentar de novo — seus dados continuam salvos.
          </p>
          <button onClick={this.handleReset} className="btn-primary">
            Tentar novamente
          </button>
          <button
            onClick={() => window.location.reload()}
            className="btn-back mt-3"
          >
            Recarregar a página
          </button>
        </div>
      </div>
    );
  }
}
