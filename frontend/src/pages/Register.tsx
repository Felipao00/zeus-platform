import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Eye, EyeOff, ArrowRight, Sparkles, User, Mail, Lock, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const Register: React.FC = () => {
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    username: '', email: '', password: '', confirmPassword: '', fullName: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }
    if (formData.password.length < 8) {
      setError('A senha deve ter no mínimo 8 caracteres');
      return;
    }

    setLoading(true);
    try {
      await register(formData.username, formData.email, formData.password, formData.fullName);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao criar conta');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRegister = () => {
    toast('Registro com Google estará disponível em breve!', {
      style: { background: '#1a1a1e', color: '#fff', border: '1px solid #27272d' },
      duration: 4000,
    });
  };

  const passwordStrength = formData.password.length === 0 ? 0 :
    formData.password.length < 6 ? 1 :
    formData.password.length < 8 ? 2 :
    /[A-Z]/.test(formData.password) && /[0-9]/.test(formData.password) ? 4 : 3;

  const strengthLabels = ['', 'Fraca', 'Média', 'Boa', 'Forte'];
  const strengthColors = ['', 'bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500'];
  const strengthWidths = ['w-0', 'w-1/4', 'w-2/4', 'w-3/4', 'w-full'];

  return (
    <div className="min-h-screen bg-gray-950 flex relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 -right-40 w-96 h-96 bg-gradient-to-bl from-gray-800/20 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 -left-40 w-96 h-96 bg-gradient-to-tr from-gray-800/10 to-transparent rounded-full blur-3xl" />
      </div>

      <div className="w-full flex items-center justify-center p-6 relative z-10">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex w-16 h-16 bg-white rounded-2xl items-center justify-center mb-4 shadow-lg shadow-white/10 hover:scale-105 transition-transform">
              <Shield className="w-8 h-8 text-gray-950" />
            </div>
            <h1 className="text-3xl font-bold text-white">ZEUS</h1>
            <p className="text-gray-500 text-sm mt-1">Criar nova conta</p>
          </div>

          <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-800 rounded-3xl p-8 shadow-2xl shadow-black/50">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">Comece gratuitamente</h2>
              <p className="text-gray-500">Crie sua central digital privada em segundos</p>
            </div>

            {/* Steps Indicator */}
            <div className="flex items-center gap-2 mb-8">
              <div className={`flex-1 h-1 rounded-full transition-all duration-500 ${step >= 1 ? 'bg-white' : 'bg-gray-800'}`} />
              <div className={`flex-1 h-1 rounded-full transition-all duration-500 ${step >= 2 ? 'bg-white' : 'bg-gray-800'}`} />
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl">
                <p className="text-red-400 text-sm flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-red-400 rounded-full" />
                  {error}
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Nome</label>
                  <div className="relative group">
                    <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-gray-300 transition-colors" />
                    <input
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="w-full bg-gray-800/50 border border-gray-700/50 rounded-2xl pl-11 pr-4 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:border-gray-500 transition-all duration-300"
                      placeholder="Seu nome"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Usuário</label>
                  <div className="relative group">
                    <Sparkles size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-gray-300 transition-colors" />
                    <input
                      type="text"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      className="w-full bg-gray-800/50 border border-gray-700/50 rounded-2xl pl-11 pr-4 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:border-gray-500 transition-all duration-300"
                      placeholder="usuario"
                      required
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Email</label>
                <div className="relative group">
                  <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-gray-300 transition-colors" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-gray-800/50 border border-gray-700/50 rounded-2xl pl-11 pr-4 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:border-gray-500 transition-all duration-300"
                    placeholder="seu@email.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Senha</label>
                <div className="relative group">
                  <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-gray-300 transition-colors" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full bg-gray-800/50 border border-gray-700/50 rounded-2xl pl-11 pr-12 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:border-gray-500 transition-all duration-300"
                    placeholder="Mínimo 8 caracteres"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {formData.password && (
                  <div className="mt-3 space-y-2">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4].map((level) => (
                        <div
                          key={level}
                          className={`flex-1 h-1 rounded-full transition-all duration-300 ${
                            passwordStrength >= level ? strengthColors[passwordStrength] : 'bg-gray-800'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-gray-500">
                      Força da senha: <span className={passwordStrength >= 3 ? 'text-green-400' : 'text-gray-400'}>{strengthLabels[passwordStrength]}</span>
                    </p>
                  </div>
                )}
              </div>

              <div>
                <div className="relative group">
                  <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="w-full bg-gray-800/50 border border-gray-700/50 rounded-2xl pl-11 pr-4 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:border-gray-500 transition-all duration-300"
                    placeholder="Confirmar senha"
                    required
                  />
                  {formData.confirmPassword && formData.password === formData.confirmPassword && (
                    <CheckCircle size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-green-400" />
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-white text-gray-950 font-semibold py-4 rounded-2xl hover:bg-gray-200 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transform hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-white/5 mt-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-gray-400 border-t-gray-200 rounded-full animate-spin" />
                    <span>Criando conta...</span>
                  </>
                ) : (
                  <>
                    <span>Criar Conta Gratuita</span>
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
              onClick={handleGoogleRegister}
              className="w-full bg-gray-800/50 border border-gray-700/50 text-white font-medium py-3.5 rounded-2xl hover:bg-gray-800 hover:border-gray-600 transition-all duration-300 flex items-center justify-center gap-3 transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Registrar com Google
            </button>

            <div className="mt-6 text-center">
              <p className="text-gray-500 text-sm">
                Já tem uma conta?{' '}
                <Link to="/login" className="text-white font-medium hover:text-gray-300 transition-colors underline underline-offset-4">
                  Fazer login
                </Link>
              </p>
            </div>
          </div>

          <p className="text-center text-gray-700 text-xs mt-6">
            Ao criar uma conta, você concorda com nossos Termos de Uso e Política de Privacidade
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;