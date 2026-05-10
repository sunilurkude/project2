
import React, { useState, useEffect } from 'react';
import { UserRole } from '../types';
import { User, Lock, ArrowRight, UserPlus, HelpCircle } from 'lucide-react';

interface LoginFormProps {
  role: UserRole;
  onLogin: (param1: string, param2: string, param3: string | UserRole, param4?: UserRole) => void;
  error: string | null; 
  clearError: () => void;
  onRegisterClick?: () => void;
  onResetPinClick?: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ role, onLogin, clearError, onRegisterClick, onResetPinClick }) => {
  const [identifier, setIdentifier] = useState(''); // Shalarth ID or Admin User ID
  const [secret, setSecret] = useState(''); // PIN or Password

  useEffect(() => {
    setIdentifier('');
    setSecret('');
    clearError();
  }, [role, clearError]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    if (role === UserRole.Teacher) {
      onLogin(identifier, secret, role); // identifier = Shalarth ID, secret = PIN
    } else {
      onLogin(identifier, secret, role); // identifier = User ID, secret = Password
    }
  };

  const roleName = role.charAt(0).toUpperCase() + role.slice(1);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5 flex items-center gap-2">
            <User className="w-4 h-4 text-sky-500" />
            {role === UserRole.Teacher ? 'Shalarth ID' : 'User ID'}
          </label>
          <div className="relative">
            <input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
              className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder:text-slate-600 focus:ring-2 focus:ring-sky-500 outline-none transition-all"
              placeholder={`Enter your ${role === UserRole.Teacher ? 'Shalarth ID' : 'User ID'}`}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5 flex items-center gap-2">
            <Lock className="w-4 h-4 text-sky-500" />
            {role === UserRole.Teacher ? '4-Digit PIN' : 'Password'}
          </label>
          <div className="relative">
            <input
              type={role === UserRole.Teacher ? 'password' : 'password'}
              maxLength={role === UserRole.Teacher ? 4 : undefined}
              value={secret}
              onChange={(e) => setSecret(role === UserRole.Teacher ? e.target.value.replace(/\D/g, '') : e.target.value)}
              required
              className={`w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder:text-slate-600 focus:ring-2 focus:ring-sky-500 outline-none transition-all ${role === UserRole.Teacher ? 'font-mono tracking-widest' : ''}`}
              placeholder={role === UserRole.Teacher ? 'Enter 4-digit PIN' : 'Enter Password'}
            />
          </div>
        </div>
      </div>

      <button
        type="submit"
        className="w-full py-4 bg-sky-600 hover:bg-sky-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-sky-500/20 group"
      >
        Sign In
        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
      </button>

      {role === UserRole.Teacher && (
        <div className="flex flex-col gap-4 mt-6">
          <div className="h-px bg-slate-700 w-full relative">
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-800 px-3 text-xs text-slate-500">OR</span>
          </div>
          
          <div className="flex justify-between items-center px-2">
            <button
              type="button"
              onClick={onRegisterClick}
              className="text-sky-400 hover:text-sky-300 text-sm font-semibold flex items-center gap-1.5 transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              Register Now
            </button>
            <button
              type="button"
              onClick={onResetPinClick}
              className="text-slate-400 hover:text-white text-sm font-medium flex items-center gap-1.5 transition-colors"
            >
              <HelpCircle className="w-4 h-4" />
              Forgot PIN?
            </button>
          </div>
        </div>
      )}

      {role === UserRole.Admin && (
        <div className="flex flex-col gap-4 mt-6">
          <div className="flex justify-center items-center px-2">
            <button
              type="button"
              onClick={onResetPinClick}
              className="text-slate-400 hover:text-white text-sm font-medium flex items-center gap-1.5 transition-colors"
            >
              <HelpCircle className="w-4 h-4" />
              Forgot Password?
            </button>
          </div>
          <p className="mt-2 text-xs text-center text-slate-400 leading-relaxed max-w-xs mx-auto">
            Contact <a href="mailto:sunilurkude.2010@gmail.com" className="text-sky-400 font-bold hover:underline">sunilurkude.2010@gmail.com</a> for administrative access.
          </p>
        </div>
      )}
    </form>
  );
};

export default LoginForm;
