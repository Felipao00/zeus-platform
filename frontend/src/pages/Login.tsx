import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Eye, EyeOff, ArrowRight, Sparkles, Lock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const Login: React.FC = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    toast('Login com Google estará disponível em breve!', {
      style: { background: '#1a1a1e', color: '#fff', border: '1px solid #27272d' },
      duration: 4000,
    });
  };

  return (
    <div className="min-h-screen bg-gray-950 flex relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 -left-40 w-96 h-96 bg-gradient-to-br from-gray-800/20 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 -right-40 w-96 h-96 bg-gradient-to-tl from-gray-800/10 to-transparent rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-gray-800/5 via-transparent to-gray-800/5 rounded-full blur-3xl" />
      </div>

      {/* Left Side - Brand */}
      <div className="hidden lg:flex w-1/2 relative items-center justify-center p-12">
        <div className="max-w-md text-center relative z-10">
          <div className="inline-flex mb-8">
            <div className="relative">
              <div className="absolute inset-0 bg-white rounded-3xl blur-2xl opacity-40" />
              <div className="relative w-24 h-24 bg-white rounded-3xl flex items-center justify-center shadow-2xl">
                <Shield className="w-12 h-12 text-gray-950" />
              </div>
            </div>
          </div>

          <h1 className="text-6xl font-bold text-white mb-6 tracking-tight">ZEUS</h1>
          
          <div className="space-y-4 mb-8">
            <p className="text-2xl text-gray-300 font-light leading-relaxed">
              Seu cofre digital
              <br />
              <span className="text-gray-400">pessoal e privado</span>
            </p>
          </div>

          <div className="flex items-center justify-center gap-6 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gray-800/50 rounded-xl flex items-center justify-center">
                <Lock size={14} className="text-gray-400" />
              </div>
              <span>Criptografado</span>
            </div>
            <div className="w-px h-4 bg-gray-800" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gray-800/50 rounded-xl flex items-center justify-center">
                <Shield size={14} className="text-gray-400" />
              </div>
              <span>Seguro</span>
            </div>
            <div className="w-px h-4 bg-gray-800" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gray-800/50 rounded-xl flex items-center justify-center">
                <Sparkles size={14} className="text-gray-400" />
              </div>
              <span>Privado</span>
            </div>
          </div>

          <div className="mt-12 p-6 bg-gray-900/50 backdrop-blur-sm border border-gray-800/50 rounded-3xl">
            <p className="text-gray-500 text-sm leading-relaxed">
              "Centralize todos os seus arquivos, fotos, projetos e informações confidenciais em um único lugar seguro."
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 relative z-10">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex w-16 h-16 bg-white rounded-2xl items-center justify-center mb-4 shadow-lg">
              <Shield className="w-8 h-8 text-gray-950" />
            </div>
            <h1 className="text-3xl font-bold text-white">ZEUS</h1>
          </div>

          <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-800 rounded-3xl p-8 shadow-2xl shadow-black/50">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">Bem-vindo de volta</h2>
              <p className="text-gray-500">Entre na sua central digital privada</p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl">
                <p className="text-red-400 text-sm flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-red-400 rounded-full" />
                  {error}
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Email</label>
                <div className="relative group">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-gray-800/50 border border-gray-700/50 rounded-2xl px-4 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:border-gray-500 focus:bg-gray-800 transition-all duration-300 group-hover:border-gray-600"
                    placeholder="seu@email.com"
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Senha</label>
                <div className="relative group">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-gray-800/50 border border-gray-700/50 rounded-2xl px-4 py-3.5 pr-12 text-white placeholder-gray-500 focus:outline-none focus:border-gray-500 focus:bg-gray-800 transition-all duration-300 group-hover:border-gray-600"
                    placeholder="••••••••"
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setRememberMe(!rememberMe)}
                  className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-300 transition-colors"
                >
                  <div className={`w-5 h-5 rounded-lg border transition-all duration-200 flex items-center justify-center ${
                    rememberMe ? 'bg-white border-white' : 'border-gray-600'
                  }`}>
                    {rememberMe && (
                      <svg className="w-3 h-3 text-gray-950" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  Lembrar-me
                </button>
                <a href="#" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">
                  Esqueceu a senha?
                </a>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-white text-gray-950 font-semibold py-4 rounded-2xl hover:bg-gray-200 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transform hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-white/5"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-gray-400 border-t-gray-200 rounded-full animate-spin" />
                    <span>Autenticando...</span>
                  </>
                ) : (
                  <>
                    <span>Entrar</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>

            {/* Divisor */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-800/50" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-gray-900 text-gray-600">ou</span>
              </div>
            </div>

            {/* Google Button */}
            <button
              onClick={handleGoogleLogin}
              className="w-full bg-gray-800/50 border border-gray-700/50 text-white font-medium py-3.5 rounded-2xl hover:bg-gray-800 hover:border-gray-600 transition-all duration-300 flex items-center justify-center gap-3 transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Entrar com Google
            </button>

            <div className="mt-6 text-center">
              <p className="text-gray-500 text-sm">
                Não tem uma conta?{' '}
                <Link to="/register" className="text-white font-medium hover:text-gray-300 transition-colors underline underline-offset-4">
                  Criar conta gratuita
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;