import React, { useState } from "react";
import {
  User,
  Lock,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  RefreshCw,
  Phone,
  Mail,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface AdminPasswordResetFormProps {
  onVerifyUsername: (username: string) => Promise<{ found: boolean }>;
  onVerifyMobile: (username: string, mobile: string) => Promise<boolean>;
  onVerifyEmail: (username: string, email: string) => Promise<boolean>;
  onResetPassword: (username: string, newPassword: string) => Promise<void>;
  onBackToLogin: () => void;
}

const AdminPasswordResetForm: React.FC<AdminPasswordResetFormProps> = ({
  onVerifyUsername,
  onVerifyMobile,
  onVerifyEmail,
  onResetPassword,
  onBackToLogin,
}) => {
  const [step, setStep] = useState(1);
  const [username, setUsername] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleNextStep = async () => {
    setError(null);
    setLoading(true);
    try {
      if (step === 1) {
        if (!username) throw new Error("Please enter Username");
        const { found } = await onVerifyUsername(username);
        if (found) setStep(2);
        else throw new Error("Username not found in records.");
      } else if (step === 2) {
        if (!mobile) throw new Error("Please enter mobile number");
        if (!/^\d{10}$/.test(mobile))
          throw new Error("Mobile number must be exactly 10 digits.");
        const verified = await onVerifyMobile(username, mobile);
        if (verified) setStep(3);
        else throw new Error("Mobile verification failed.");
      } else if (step === 3) {
        if (!email) throw new Error("Please enter Email");
        const verified = await onVerifyEmail(username, email);
        if (verified) setStep(4);
        else throw new Error("Email verification failed.");
      } else if (step === 4) {
        if (!newPassword)
          throw new Error("Password cannot be empty");
        if (newPassword !== confirmPassword) throw new Error("Passwords do not match");
        await onResetPassword(username, newPassword);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { id: 1, label: "User" },
    { id: 2, label: "Mobile" },
    { id: 3, label: "Email" },
    { id: 4, label: "Reset" },
  ];

  return (
    <div className="w-full max-w-md mx-auto bg-slate-800 p-8 rounded-2xl border border-slate-700 shadow-2xl">
      <div className="mb-8 text-center text-slate-100">
        <RefreshCw className="w-12 h-12 text-sky-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Reset Admin Password</h2>
        <p className="text-slate-400 text-sm">Verify your details one by one</p>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3 text-red-400 text-sm"
        >
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p>{error}</p>
        </motion.div>
      )}

      <div className="flex justify-between mb-10 relative">
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-700 -translate-y-1/2 z-0" />
        {steps.map((s) => (
          <div key={s.id} className="flex flex-col items-center gap-2 z-10">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold transition-all duration-500 ${
                step >= s.id
                  ? "bg-sky-600 text-white shadow-lg shadow-sky-500/20"
                  : "bg-slate-700 text-slate-400"
              }`}
            >
              {s.id}
            </div>
            <span
              className={`text-[8px] uppercase tracking-tighter font-bold ${step >= s.id ? "text-sky-500" : "text-slate-500"}`}
            >
              {s.label}
            </span>
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="space-y-6"
        >
          {step === 1 && (
            <div className="space-y-4">
              <label className="block text-sm font-medium text-slate-300">
                Username
              </label>
              <div className="relative text-slate-100">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your Username"
                  className="w-full pl-11 pr-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder:text-slate-600 focus:ring-2 focus:ring-sky-500 outline-none transition-all"
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 text-slate-100">
              <label className="block text-sm font-medium text-slate-300">
                Verify Mobile
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type="tel"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))}
                  maxLength={10}
                  placeholder="10-digit Mobile"
                  className="w-full pl-11 pr-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder:text-slate-600 focus:ring-2 focus:ring-sky-500 outline-none transition-all"
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4 text-slate-100">
              <label className="block text-sm font-medium text-slate-300">
                Verify Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter Email"
                  className="w-full pl-11 pr-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder:text-slate-600 focus:ring-2 focus:ring-sky-500 outline-none transition-all"
                />
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4 text-slate-100">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-300">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Set new Password"
                    className="w-full pl-11 pr-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder:text-slate-600 focus:ring-2 focus:ring-sky-500 outline-none transition-all font-mono tracking-widest"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-300">
                  Confirm New Password
                </label>
                <div className="relative">
                  <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new Password"
                    className="w-full pl-11 pr-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder:text-slate-600 focus:ring-2 focus:ring-sky-500 outline-none transition-all font-mono tracking-widest"
                  />
                </div>
              </div>

            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="mt-8 space-y-3">
        <button
          onClick={handleNextStep}
          disabled={loading}
          className="w-full py-4 bg-sky-600 hover:bg-sky-500 disabled:bg-slate-700 disabled:text-slate-400 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-sky-500/20"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              {step === 4 ? "Reset Password" : "Continue"}
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>

        <button
          onClick={onBackToLogin}
          className="w-full py-2 text-slate-500 hover:text-white text-sm font-medium transition-colors"
        >
          Back to Login
        </button>
      </div>
    </div>
  );
};

export default AdminPasswordResetForm;
