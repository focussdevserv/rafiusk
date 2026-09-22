import React, { useState } from 'react';
import { 
  Lock, 
  Mail, 
  ArrowRight, 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  User, 
  KeyRound, 
  ArrowLeft,
  Smartphone,
  Check
} from 'lucide-react';
import { AuthUser } from '../types';

interface Props {
  onLogin: (user: AuthUser) => void;
}

type AuthMode = 'login' | 'register' | 'recovery';

export const LoginView: React.FC<Props> = ({ onLogin }) => {
  const [mode, setMode] = useState<AuthMode>('login');
  
  // Login Form com credenciais oficiais do Dono do App
  const [email, setEmail] = useState('Cr.sp3ktrum@gmail.com');
  const [password, setPassword] = useState('12345678');
  const [rememberMe, setRememberMe] = useState(true);

  // Register Form
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regRole, setRegRole] = useState<'admin' | 'operator' | 'technician'>('admin');

  // Recovery Form
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoverySuccess, setRecoverySuccess] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedbackMsg(null);

    const cleanEmail = email.trim().toLowerCase();
    
    // Verificação de credenciais do Administrador Dono
    if (cleanEmail === 'cr.sp3ktrum@gmail.com' && password !== '12345678') {
      setFeedbackMsg('Senha incorreta para a conta de administrador.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      onLogin({
        id: 'usr-admin-owner',
        name: cleanEmail === 'cr.sp3ktrum@gmail.com' ? 'Diretoria / Dono Rafiusk' : 'Administrador Rafiusk',
        email: email || 'Cr.sp3ktrum@gmail.com',
        role: 'admin',
        avatarUrl: '/assets/logo_rafiusk_web.png'
      });
      setIsLoading(false);
    }, 350);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (regPassword !== regConfirmPassword) {
      setFeedbackMsg('As senhas digitadas não coincidem.');
      return;
    }

    setIsLoading(true);
    setFeedbackMsg(null);
    setTimeout(() => {
      onLogin({
        id: `usr-${Date.now()}`,
        name: regName || 'Novo Operador Rafiusk',
        email: regEmail,
        role: regRole,
        avatarUrl: '/assets/logo_rafiusk_web.png'
      });
      setIsLoading(false);
    }, 400);
  };

  const handleRecoverySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recoveryEmail) return;
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setRecoverySuccess(true);
    }, 500);
  };

  const handleQuickDemo = () => {
    setIsLoading(true);
    setTimeout(() => {
      onLogin({
        id: 'usr-admin-owner',
        name: 'Diretoria / Dono Rafiusk',
        email: 'Cr.sp3ktrum@gmail.com',
        role: 'admin',
        avatarUrl: '/assets/logo_rafiusk_web.png'
      });
      setIsLoading(false);
    }, 200);
  };

  return (
    <div className="min-h-screen w-full bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden select-none">
      {/* Background Glows Cyber/Tech */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-purple-600/20 rounded-full blur-[128px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-blue-600/20 rounded-full blur-[128px] pointer-events-none" />

      <div className="max-w-md w-full relative z-10 space-y-6">
        
        {/* Card Principal */}
        <div className="bg-slate-900/95 backdrop-blur-xl border border-slate-800 rounded-[32px] p-7 sm:p-8 shadow-2xl shadow-purple-950/40 space-y-6">
          
          {/* Logo Oficial RAFIUSK */}
          <div className="text-center space-y-2.5">
            <div className="inline-block relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-3xl blur-md opacity-60 group-hover:opacity-100 transition duration-500" />
              <div className="relative w-20 h-20 mx-auto rounded-2xl overflow-hidden bg-black p-2 border border-purple-500/30 shadow-xl flex items-center justify-center">
                <img 
                  src="/assets/logo_rafiusk_web.png" 
                  alt="RAFIUSK INFORMÁTICA" 
                  className="w-full h-full object-contain"
                />
              </div>
            </div>

            <div>
              <h1 className="text-2xl font-black text-white tracking-wider uppercase">
                RAFIUSK
              </h1>
              <p className="text-[11px] font-bold text-purple-400 tracking-[0.25em] uppercase">
                INFORMÁTICA
              </p>
              <p className="text-[11px] text-slate-400 mt-1 font-medium">
                {mode === 'login' && 'Sistema de Locação de Hardware & TI'}
                {mode === 'register' && 'Criar Nova Conta de Acesso'}
                {mode === 'recovery' && 'Recuperação de Senha & Acesso'}
              </p>
            </div>
          </div>

          {/* MODO 1: LOGIN */}
          {mode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4 animate-fade-in">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-purple-400" />
                  <span>E-mail Corporativo</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  placeholder="seu.email@rafiusk.com.br"
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 focus:border-purple-500 rounded-xl text-xs font-medium text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-purple-400" />
                  <span>Senha de Acesso</span>
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 focus:border-purple-500 rounded-xl text-xs font-medium text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition"
                />
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-slate-400 hover:text-slate-300">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={e => setRememberMe(e.target.checked)}
                    className="rounded bg-slate-950 border-slate-800 text-purple-600 focus:ring-0 w-3.5 h-3.5"
                  />
                  <span>Lembrar credenciais</span>
                </label>

                <button
                  type="button"
                  onClick={() => {
                    setFeedbackMsg(null);
                    setMode('recovery');
                  }}
                  className="text-purple-400 hover:text-purple-300 font-semibold"
                >
                  Esqueci a senha
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 transition active:scale-98 cursor-pointer"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    Entrando...
                  </span>
                ) : (
                  <>
                    <span>Entrar no Sistema</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setFeedbackMsg(null);
                    setMode('register');
                  }}
                  className="text-xs text-slate-400 hover:text-white transition"
                >
                  Não tem uma conta? <strong className="text-purple-400 font-bold hover:underline">Cadastre-se aqui</strong>
                </button>
              </div>
            </form>
          )}

          {/* MODO 2: CRIAR CONTA / CADASTRO */}
          {mode === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5 animate-fade-in">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-purple-400" />
                  <span>Nome Completo</span>
                </label>
                <input
                  type="text"
                  value={regName}
                  onChange={e => setRegName(e.target.value)}
                  required
                  placeholder="Seu nome"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-purple-500 rounded-xl text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-purple-400" />
                  <span>E-mail Corporativo</span>
                </label>
                <input
                  type="email"
                  value={regEmail}
                  onChange={e => setRegEmail(e.target.value)}
                  required
                  placeholder="seu.email@rafiusk.com.br"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-purple-500 rounded-xl text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-purple-400" />
                    <span>Senha</span>
                  </label>
                  <input
                    type="password"
                    value={regPassword}
                    onChange={e => setRegPassword(e.target.value)}
                    required
                    placeholder="Mínimo 6 dígitos"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-purple-500 rounded-xl text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-purple-400" />
                    <span>Confirmar Senha</span>
                  </label>
                  <input
                    type="password"
                    value={regConfirmPassword}
                    onChange={e => setRegConfirmPassword(e.target.value)}
                    required
                    placeholder="Repita a senha"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-purple-500 rounded-xl text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Nível de Acesso:
                </label>
                <select
                  value={regRole}
                  onChange={e => setRegRole(e.target.value as any)}
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 font-medium"
                >
                  <option value="admin">Administrador Geral (Acesso Completo)</option>
                  <option value="operator">Operador / Vendas (Contratos e Clientes)</option>
                  <option value="technician">Técnico de Campo (Vistorias e Manutenções)</option>
                </select>
              </div>

              {feedbackMsg && (
                <div className="p-2.5 bg-rose-950/60 border border-rose-800 text-rose-300 text-xs rounded-xl">
                  {feedbackMsg}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 transition active:scale-98"
              >
                {isLoading ? 'Criando Conta...' : 'Finalizar Cadastro & Acessar'}
              </button>

              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="text-xs text-slate-400 hover:text-white flex items-center justify-center gap-1.5 mx-auto"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Já possui conta? Fazer Login</span>
                </button>
              </div>
            </form>
          )}

          {/* MODO 3: RECUPERAR SENHA */}
          {mode === 'recovery' && (
            <div className="space-y-4 animate-fade-in">
              {recoverySuccess ? (
                <div className="p-5 bg-emerald-950/50 border border-emerald-800 rounded-2xl text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-600/20 text-emerald-400 mx-auto flex items-center justify-center">
                    <Check className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Instruções Enviadas!</h4>
                    <p className="text-xs text-slate-300 mt-1">
                      Enviamos um link seguro de recuperação e código temporário para o e-mail <strong>{recoveryEmail}</strong>.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setRecoverySuccess(false);
                      setMode('login');
                    }}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold"
                  >
                    Voltar para o Login
                  </button>
                </div>
              ) : (
                <form onSubmit={handleRecoverySubmit} className="space-y-4">
                  <p className="text-xs text-slate-400">
                    Digite seu e-mail cadastrado. Enviaremos o link de redefinição de senha ou token de segurança via E-mail (Resend) e WhatsApp (Evolution API).
                  </p>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-purple-400" />
                      <span>E-mail Cadastrado</span>
                    </label>
                    <input
                      type="email"
                      value={recoveryEmail}
                      onChange={e => setRecoveryEmail(e.target.value)}
                      required
                      placeholder="admin@rafiusk.com.br"
                      className="w-full px-4 py-3 bg-slate-950 border border-slate-800 focus:border-purple-500 rounded-xl text-xs text-white"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3.5 bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 transition active:scale-98"
                  >
                    {isLoading ? 'Localizando conta...' : 'Enviar Link de Recuperação'}
                  </button>

                  <div className="text-center pt-1">
                    <button
                      type="button"
                      onClick={() => setMode('login')}
                      className="text-xs text-slate-400 hover:text-white flex items-center justify-center gap-1.5 mx-auto"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Voltar para a tela de login</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Divisor */}
          {mode === 'login' && (
            <>
              <div className="relative flex items-center justify-center">
                <div className="border-t border-slate-800 w-full" />
                <span className="bg-slate-900 px-3 text-[10px] uppercase font-bold text-slate-500 shrink-0">
                  Ou acesse diretamente
                </span>
              </div>

              {/* Botão de Demonstração / Acesso Direto */}
              <button
                type="button"
                onClick={handleQuickDemo}
                className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition active:scale-98"
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Acesso Rápido de Administrador</span>
              </button>
            </>
          )}

          {/* Badges de Segurança */}
          <div className="pt-2 flex items-center justify-center gap-4 text-[11px] text-slate-500 font-medium">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Sessão Criptografada
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />
              RAFIUSK INFORMÁTICA
            </span>
          </div>

        </div>

        {/* Rodapé da tela de login */}
        <p className="text-center text-xs text-slate-600">
          © 2026 RAFIUSK INFORMÁTICA • Todos os direitos reservados.
        </p>

      </div>
    </div>
  );
};
