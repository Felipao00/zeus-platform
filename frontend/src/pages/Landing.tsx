import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield, FileText, Image, FolderOpen, StickyNote,
  Link2, Lock, Search, Database, ArrowRight,
  CheckCircle, Menu, X, Zap, Star,
  Upload, ShieldCheck, Server, Cpu, HardDrive
} from 'lucide-react';

const Landing: React.FC = () => {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
      if (heroRef.current) {
        const scrollY = window.scrollY;
        heroRef.current.style.transform = `translateY(${scrollY * 0.3}px)`;
        heroRef.current.style.opacity = `${1 - scrollY / 700}`;
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setMobileMenu(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white overflow-x-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-gray-800/10 via-transparent to-gray-800/5 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-gray-800/5 via-transparent to-gray-800/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '10s', animationDelay: '2s' }} />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gray-700/5 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '12s', animationDelay: '4s' }} />
      </div>

      {/* Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? 'bg-gray-950/90 backdrop-blur-2xl border-b border-gray-800/50 shadow-2xl shadow-black/50' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="relative">
              <div className="absolute inset-0 bg-white rounded-xl blur-md opacity-50 group-hover:opacity-75 transition-opacity" />
              <div className="relative w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-xl group-hover:scale-105 transition-transform">
                <Shield className="w-6 h-6 text-gray-950" />
              </div>
            </div>
            <span className="text-xl font-bold tracking-tight group-hover:tracking-wider transition-all">ZEUS</span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            {[
              { id: 'features', label: 'Recursos' },
              { id: 'security', label: 'Segurança' },
              { id: 'tech', label: 'Tecnologia' },
              { id: 'pricing', label: 'Planos' },
            ].map((link) => (
              <button
                key={link.id}
                onClick={() => scrollTo(link.id)}
                className="text-sm text-gray-400 hover:text-white transition-all hover:-translate-y-0.5"
              >
                {link.label}
              </button>
            ))}
            <button onClick={() => navigate('/login')} className="text-sm text-gray-400 hover:text-white transition-all">
              Entrar
            </button>
            <button onClick={() => navigate('/register')} className="bg-white text-gray-950 px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-200 transition-all hover:scale-105 hover:shadow-xl hover:shadow-white/20">
              Criar Conta Grátis
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button onClick={() => setMobileMenu(!mobileMenu)} className="md:hidden text-white p-2 relative z-50">
            <div className={`transition-all duration-300 ${mobileMenu ? 'rotate-90 opacity-0' : 'rotate-0 opacity-100'}`}>
              {!mobileMenu && <Menu size={24} />}
            </div>
            <div className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${mobileMenu ? 'rotate-0 opacity-100' : '-rotate-90 opacity-0'}`}>
              {mobileMenu && <X size={24} />}
            </div>
          </button>
        </div>

        {/* Mobile Menu */}
        <div className={`
          md:hidden fixed inset-x-0 top-16 bottom-0 bg-gray-950/98 backdrop-blur-2xl
          transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]
          ${mobileMenu ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none'}
        `}>
          <div className="px-6 py-8 space-y-1">
            {[
              { id: 'features', label: 'Recursos' },
              { id: 'security', label: 'Segurança' },
              { id: 'tech', label: 'Tecnologia' },
              { id: 'pricing', label: 'Planos' },
            ].map((link, index) => (
              <button
                key={link.id}
                onClick={() => scrollTo(link.id)}
                className="w-full text-left px-4 py-4 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800/50 transition-all duration-200 text-lg font-medium"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {link.label}
              </button>
            ))}
            
            <div className="h-px bg-gray-800/50 my-4" />
            
            <button
              onClick={() => { navigate('/login'); setMobileMenu(false); }}
              className="w-full text-left px-4 py-4 rounded-xl text-gray-300 hover:text-white hover:bg-gray-800/50 transition-all duration-200 text-lg font-medium"
            >
              Entrar
            </button>
            
            <button
              onClick={() => { navigate('/register'); setMobileMenu(false); }}
              className="w-full mt-4 bg-white text-gray-950 px-6 py-4 rounded-xl text-lg font-semibold hover:bg-gray-200 transition-all duration-200 shadow-xl"
            >
              Criar Conta Grátis
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-6 pt-20 overflow-hidden">
        <div ref={heroRef} className="max-w-7xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-gray-900/80 backdrop-blur-sm border border-gray-800 rounded-full px-5 py-2.5 mb-8 animate-fadeIn">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm text-gray-400">Sistema online e funcionando</span>
          </div>

          <h1 className="text-6xl md:text-8xl font-bold mb-8 tracking-tight leading-none">
            <span className="text-white">Seu cofre</span>
            <br />
            <span className="bg-gradient-to-r from-gray-200 via-gray-400 to-gray-600 bg-clip-text text-transparent">
              digital privado
            </span>
          </h1>

          <p className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto mb-12 leading-relaxed">
            Centralize todos os seus arquivos, fotos, projetos e informações confidenciais 
            em um único lugar seguro. Criptografia de ponta a ponta.
          </p>

          <div className="flex items-center justify-center gap-4 flex-wrap mb-16">
            <button onClick={() => navigate('/register')} className="group bg-white text-gray-950 px-8 py-4 rounded-xl font-semibold hover:bg-gray-200 transition-all hover:scale-105 shadow-2xl shadow-white/10 flex items-center gap-2">
              Começar Gratuitamente
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button onClick={() => scrollTo('features')} className="bg-gray-900 text-white px-8 py-4 rounded-xl font-medium border border-gray-800 hover:border-gray-700 transition-all hover:bg-gray-800/50 flex items-center gap-2">
              Ver Recursos
              <ArrowRight size={18} />
            </button>
          </div>

          <div className="flex items-center justify-center gap-8 text-sm text-gray-600 flex-wrap">
            <span className="flex items-center gap-1.5"><CheckCircle size={14} className="text-gray-500" /> Criptografia AES-256</span>
            <span className="flex items-center gap-1.5"><CheckCircle size={14} className="text-gray-500" /> 100% Privado</span>
            <span className="flex items-center gap-1.5"><CheckCircle size={14} className="text-gray-500" /> Backup Seguro</span>
            <span className="flex items-center gap-1.5"><CheckCircle size={14} className="text-gray-500" /> Grátis Para Sempre</span>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 px-6 border-y border-gray-800/30 bg-gradient-to-r from-gray-900/50 via-gray-950 to-gray-900/50 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { icon: Lock, value: 'AES-256', label: 'Criptografia' },
              { icon: HardDrive, value: '10 GB', label: 'Armazenamento' },
              { icon: Search, value: 'Global', label: 'Busca' },
              { icon: Upload, value: 'Ilimitado', label: 'Uploads' },
            ].map((stat, index) => (
              <div key={index} className="text-center group">
                <stat.icon className="w-8 h-8 text-gray-600 mx-auto mb-4 group-hover:text-gray-400 transition-colors duration-500" />
                <div className="text-2xl font-bold text-white mb-1 group-hover:scale-110 transition-transform duration-300">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
              Recursos <span className="text-gray-400">poderosos</span>
            </h2>
            <p className="text-gray-500 text-xl max-w-2xl mx-auto">
              Ferramentas completas para organizar sua vida digital
            </p>
          </div>

          {/* Destaques */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-3xl p-8 hover:border-gray-700 transition-all duration-500 hover:shadow-2xl hover:shadow-black/50 group">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gray-800 rounded-2xl flex items-center justify-center group-hover:bg-gray-700 transition-all group-hover:scale-110 duration-300">
                  <Database className="w-8 h-8 text-gray-400 group-hover:text-white transition-colors" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white">Banco de Dados SQLite</h3>
                  <p className="text-gray-500 text-sm">Alta performance e confiabilidade</p>
                </div>
              </div>
              <p className="text-gray-400 leading-relaxed mb-6">
                Utilizamos SQLite com índices otimizados para garantir respostas rápidas. 
                Preparado para migração para PostgreSQL quando necessário.
              </p>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Server size={16} />
                <span>+15 tabelas relacionadas</span>
              </div>
            </div>

            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-3xl p-8 hover:border-gray-700 transition-all duration-500 hover:shadow-2xl hover:shadow-black/50 group">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gray-800 rounded-2xl flex items-center justify-center group-hover:bg-gray-700 transition-all group-hover:scale-110 duration-300">
                  <ShieldCheck className="w-8 h-8 text-gray-400 group-hover:text-white transition-colors" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white">Segurança Total</h3>
                  <p className="text-gray-500 text-sm">Criptografia em múltiplas camadas</p>
                </div>
              </div>
              <p className="text-gray-400 leading-relaxed mb-6">
                Senhas com bcrypt (12 rounds), JWT para autenticação e AES-256 
                para o cofre seguro. Seus dados estão realmente protegidos.
              </p>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Lock size={16} />
                <span>Criptografia ponta a ponta</span>
              </div>
            </div>
          </div>

          {/* Grid de Features */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: FileText, title: 'Arquivos', desc: 'Sistema de pastas inteligente com upload múltiplo e visualização integrada', items: ['Upload arrastar/soltar', 'Pastas ilimitadas', 'Pré-visualização'] },
              { icon: Image, title: 'Fotos', desc: 'Galeria privada com lightbox, favoritos e seleção em massa para excluir', items: ['Grade e lista', 'Lightbox ampliado', 'Seleção múltipla'] },
              { icon: FolderOpen, title: 'Projetos', desc: 'Acompanhe progresso com status, prazos e anexos vinculados', items: ['Barra de progresso', 'Status configurável', 'Arquivos anexados'] },
              { icon: StickyNote, title: 'Notas', desc: 'Crie notas com subitens, cores personalizadas e organização visual', items: ['Subitens ilimitados', 'Cores temáticas', 'Favoritos/fixação'] },
              { icon: Link2, title: 'Links', desc: 'Salve URLs com ícones automáticos e categorias para acesso rápido', items: ['Favicons automáticos', 'Contador de acesso', 'Cópia rápida'] },
              { icon: Lock, title: 'Cofre', desc: 'Armazene credenciais com criptografia AES-256 e senha secundária', items: ['Criptografia AES-256', 'Senha secundária', 'Descriptografia segura'] },
            ].map((feature, index) => (
              <div
                key={index}
                className="group bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6 hover:border-gray-700 transition-all duration-500 hover:shadow-xl hover:shadow-black/30 hover:-translate-y-1"
              >
                <div className="w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center mb-4 group-hover:bg-gray-700 transition-all group-hover:scale-110 duration-300">
                  <feature.icon className="w-6 h-6 text-gray-400 group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-white font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-gray-500 text-sm mb-4 leading-relaxed">{feature.desc}</p>
                <ul className="space-y-1.5">
                  {feature.items.map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-xs text-gray-600">
                      <div className="w-1 h-1 bg-gray-700 rounded-full" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security */}
      <section id="security" className="py-24 px-6 bg-gradient-to-b from-gray-900/30 via-gray-950 to-gray-900/30 border-y border-gray-800/30">
        <div className="max-w-4xl mx-auto text-center">
          <div className="relative inline-block mb-6">
            <div className="absolute inset-0 bg-gray-700/20 rounded-full blur-2xl" />
            <ShieldCheck className="relative w-20 h-20 text-gray-400" />
          </div>
          <h2 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
            Segurança <span className="text-gray-400">de verdade</span>
          </h2>
          <p className="text-gray-500 text-xl mb-16 max-w-2xl mx-auto leading-relaxed">
            Seus dados são criptografados com os mesmos padrões usados por instituições financeiras
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Registro', desc: 'Senha com hash bcrypt de 12 rounds. Impossível de reverter.' },
              { step: '02', title: 'Armazenamento', desc: 'Dados sensíveis criptografados com AES-256 no cofre seguro.' },
              { step: '03', title: 'Acesso', desc: 'Autenticação JWT com tokens de sessão verificados a cada requisição.' },
            ].map((item, index) => (
              <div key={index} className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-8 hover:border-gray-700 transition-all duration-500 group">
                <div className="text-5xl font-bold text-gray-800 group-hover:text-gray-700 transition-colors mb-4">{item.step}</div>
                <h3 className="text-white font-semibold text-lg mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section id="tech" className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
            Stack <span className="text-gray-400">moderna</span>
          </h2>
          <p className="text-gray-500 text-xl mb-16">
            Construído com as melhores tecnologias do mercado
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { name: 'React', sub: 'Frontend', icon: Cpu },
              { name: 'TypeScript', sub: 'Linguagem', icon: FileText },
              { name: 'Node.js', sub: 'Backend', icon: Server },
              { name: 'SQLite', sub: 'Banco de Dados', icon: Database },
            ].map((tech, index) => (
              <div key={index} className="group bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6 hover:border-gray-700 transition-all duration-500 hover:scale-105">
                <tech.icon className="w-10 h-10 text-gray-600 mx-auto mb-3 group-hover:text-gray-400 transition-colors" />
                <div className="text-white font-semibold">{tech.name}</div>
                <div className="text-gray-600 text-sm">{tech.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-6 bg-gradient-to-b from-gray-900/30 to-transparent">
        <div className="max-w-lg mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-6xl font-bold mb-4 tracking-tight">
              <span className="text-gray-400">Gratuito</span> para sempre
            </h2>
            <p className="text-gray-500 text-xl">Sem custos, sem pegadinhas</p>
          </div>

          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-3xl p-10 hover:border-gray-700 transition-all duration-500 hover:shadow-2xl hover:shadow-black/50">
            <div className="text-center mb-8">
              <div className="text-6xl font-bold text-white mb-2">Grátis</div>
              <div className="text-gray-500 text-lg">Sem custo • Para sempre</div>
            </div>

            <ul className="space-y-4 mb-10">
              {[
                '10 GB de armazenamento',
                'Arquivos e fotos ilimitados',
                'Projetos com anexos',
                'Notas com subitens',
                'Cofre criptografado AES-256',
                'Backup e restauração',
                'Busca global integrada',
                'Interface responsiva',
              ].map((feature, i) => (
                <li key={i} className="flex items-center gap-3 text-gray-400">
                  <CheckCircle size={16} className="text-gray-600 flex-shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>

            <button onClick={() => navigate('/register')} className="w-full bg-white text-gray-950 py-5 rounded-xl font-semibold hover:bg-gray-200 transition-all hover:scale-105 shadow-xl shadow-white/10 flex items-center justify-center gap-2 text-lg">
              Criar Conta Gratuita
              <ArrowRight size={20} />
            </button>
            <p className="text-gray-600 text-sm text-center mt-4">Sem cartão de crédito</p>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-24 px-6 relative">
        <div className="absolute inset-0 bg-gradient-to-t from-gray-800/10 via-transparent to-transparent" />
        <div className="max-w-3xl mx-auto text-center relative">
          <Star className="w-16 h-16 text-gray-600 mx-auto mb-8" />
          <h2 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
            Pronto para <span className="text-gray-400">organizar</span> tudo?
          </h2>
          <p className="text-gray-500 text-xl mb-10 max-w-xl mx-auto">
            Junte-se a milhares de usuários que já organizam sua vida digital com o ZEUS
          </p>
          <button onClick={() => navigate('/register')} className="bg-white text-gray-950 px-12 py-5 rounded-xl font-semibold hover:bg-gray-200 transition-all hover:scale-105 shadow-2xl shadow-white/10 flex items-center gap-2 mx-auto text-lg">
            Começar Agora
            <ArrowRight size={20} />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-gray-800/50">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <Shield className="w-6 h-6 text-gray-600" />
              <span className="text-gray-600 font-medium">ZEUS</span>
            </div>
            <div className="flex items-center gap-8 text-sm text-gray-600">
              <span className="hover:text-gray-400 cursor-pointer transition-colors">Privacidade</span>
              <span className="hover:text-gray-400 cursor-pointer transition-colors">Termos</span>
              <span className="hover:text-gray-400 cursor-pointer transition-colors">Contato</span>
            </div>
            <span className="text-gray-700 text-sm">© 2026 ZEUS. Todos os direitos reservados.</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;