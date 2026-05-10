import React, { useState } from "react";
import {
  Fingerprint,
  User,
  Lock,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Phone,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { isValidPin } from "../utils/authUtils";

interface RegistrationFormProps {
  onVerifyShalarth: (
    shalarthId: string,
  ) => Promise<{ found: boolean; registered: boolean }>;
  onVerifyMobile: (shalarthId: string, mobile: string) => Promise<boolean>;
  onVerifyAadhaar: (shalarthId: string, aadhaar: string) => Promise<boolean>;
  onRegister: (shalarthId: string, pin: string) => Promise<void>;
  onBackToLogin: () => void;
}

const RegistrationForm: React.FC<RegistrationFormProps> = ({
  onVerifyShalarth,
  onVerifyMobile,
  onVerifyAadhaar,
  onRegister,
  onBackToLogin,
}) => {
  const [step, setStep] = useState(1);
  const [shalarthId, setShalarthId] = useState("");
  const [mobile, setMobile] = useState("");
  const [aadhaar, setAadhaar] = useState("");
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const handleNextStep = async () => {
    setError(null);
    setLoading(true);
    try {
      if (step === 1) {
        if (!shalarthId) throw new Error("Please enter Shalarth ID");
        const { found, registered } = await onVerifyShalarth(shalarthId);
        if (!found)
          throw new Error("User not available. Please contact admin.");
        if (registered)
          throw new Error(
            "User already registered. Please login or reset PIN.",
          );
        setStep(2);
      } else if (step === 2) {
        if (!mobile)
          throw new Error("Please enter your Registered Mobile Number");
        if (!/^\d{10}$/.test(mobile))
          throw new Error("Mobile number must be exactly 10 digits.");
        const verified = await onVerifyMobile(shalarthId, mobile);
        if (verified) setStep(3);
        else
          throw new Error(
            "Mobile verification failed. Number does not match our records.",
          );
      } else if (step === 3) {
        if (!aadhaar) throw new Error("Please enter Aadhaar number");
        const verified = await onVerifyAadhaar(shalarthId, aadhaar);
        if (verified) setStep(4);
        else
          throw new Error(
            "Identity verification failed. Aadhaar does not match.",
          );
      } else if (step === 4) {
        if (!isValidPin(pin)) throw new Error("PIN must be exactly 4 digits");
        if (pin !== confirmPin) throw new Error("PINs do not match");
        await onRegister(shalarthId, pin);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { id: 1, label: "ID" },
    { id: 2, label: "Mobile" },
    { id: 3, label: "Aadhaar" },
    { id: 4, label: "Secure" },
  ];

  return (
    <div className="w-full max-w-md mx-auto bg-slate-800 p-8 rounded-2xl border border-slate-700 shadow-2xl">
      <div className="mb-8 text-center text-slate-100">
        <h2 className="text-2xl font-bold mb-2">Teacher Registration</h2>
        <p className="text-slate-400 text-sm">
          Verify your identity one by one
        </p>
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
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-500 shadow-xl ${
                step >= s.id
                  ? "bg-sky-600 text-white shadow-sky-500/20"
                  : "bg-slate-700 text-slate-400"
              }`}
            >
              {s.id}
            </div>
            <span
              className={`text-[10px] uppercase tracking-wider font-bold transition-colors ${step >= s.id ? "text-sky-500" : "text-slate-500"}`}
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
                Shalarth ID
              </label>
              <div className="relative text-slate-100">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type="text"
                  value={shalarthId}
                  onChange={(e) => setShalarthId(e.target.value)}
                  placeholder="Enter your Shalarth ID"
                  className="w-full pl-11 pr-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder:text-slate-600 focus:ring-2 focus:ring-sky-500 outline-none transition-all"
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 text-slate-100">
              <label className="block text-sm font-medium text-slate-300">
                Verify Mobile Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type="tel"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))}
                  maxLength={10}
                  placeholder="10-digit Mobile Number"
                  className="w-full pl-11 pr-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder:text-slate-600 focus:ring-2 focus:ring-sky-500 outline-none transition-all"
                />
              </div>
              <p className="text-xs text-slate-500 italic">
                Verify using the number registered in your latest paybill
                record.
              </p>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4 text-slate-100">
              <label className="block text-sm font-medium text-slate-300">
                Verify Aadhaar
              </label>
              <div className="relative">
                <Fingerprint className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type="password"
                  value={aadhaar}
                  onChange={(e) => setAadhaar(e.target.value)}
                  placeholder="Enter 12-digit Aadhaar"
                  className="w-full pl-11 pr-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder:text-slate-600 focus:ring-2 focus:ring-sky-500 outline-none transition-all"
                />
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4 text-slate-100">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-300">
                  Set 4-Digit PIN
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input
                    type="password"
                    maxLength={4}
                    value={pin}
                    onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
                    placeholder="Enter 4-digit PIN"
                    className="w-full pl-11 pr-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder:text-slate-600 focus:ring-2 focus:ring-sky-500 outline-none transition-all font-mono tracking-widest"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-300">
                  Confirm PIN
                </label>
                <div className="relative">
                  <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input
                    type="password"
                    maxLength={4}
                    value={confirmPin}
                    onChange={(e) =>
                      setConfirmPin(e.target.value.replace(/\D/g, ""))
                    }
                    placeholder="Confirm 4-digit PIN"
                    className="w-full pl-11 pr-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder:text-slate-600 focus:ring-2 focus:ring-sky-500 outline-none transition-all font-mono tracking-widest"
                  />
                </div>
              </div>

              {/* Terms and Conditions UI */}
              <div className="mt-6">
                <div className="text-xs text-slate-400 mb-2">
                  Terms and Conditions
                </div>
                <div
                  className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-xs text-slate-400 space-y-2"
                  style={{ maxHeight: "150px", overflowY: "auto" }}
                >
                  <p>
                    <strong>Terms and Conditions</strong>
                  </p>
                  <ul className="list-disc pl-4 space-y-1">
                    <li>
                      Non-Affiliation Disclaimer: This application is a
                      privately developed platform. It is not an official
                      government entity, nor is it affiliated with, authorized
                      by, or endorsed by any government department or state
                      authority.
                    </li>
                    <li>
                      Assumption of Risk: Users acknowledge that they access
                      this service of their own volition and "as-is." Use of the
                      platform is at the user's sole risk and professional
                      responsibility.
                    </li>
                    <li>
                      Limitation of Liability: The developer assumes no
                      liability for any errors, inaccuracies, or omissions in
                      the generated payslips or data. All calculations should be
                      independently verified by the user.
                    </li>
                    <li>
                      Maintenance & Service Fees: The platform reserves the
                      right to implement service fees or maintenance charges at
                      its discretion to ensure the continued operation and
                      hosting of the web infrastructure.
                    </li>
                    <li>
                      User Indemnity: By registering, the user agrees to
                      indemnify and hold the developer harmless from any claims
                      or legal disputes resulting from the misuse of this
                      application or its data.
                    </li>
                    <li>
                      Data Integrity: Users are responsible for the
                      confidentiality of their login credentials and the
                      integrity of the data they upload to the system.
                    </li>
                    <li>
                      Right to Modify: The developer reserves the right to
                      modify these terms or terminate services at any time
                      without prior notice.
                    </li>
                  </ul>
                </div>
                <label className="flex items-center gap-2 mt-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-sky-600 focus:ring-sky-500 focus:ring-offset-slate-800"
                  />
                  <span className="text-sm text-slate-300 select-none">
                    I agree to the Terms and Conditions.
                  </span>
                </label>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="mt-8 space-y-3">
        <button
          onClick={handleNextStep}
          disabled={loading || (step === 4 && !termsAccepted)}
          className="w-full py-4 bg-sky-600 hover:bg-sky-500 disabled:bg-slate-700 disabled:text-slate-400 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-sky-500/20"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              {step === 4 ? "Complete Registration" : "Continue"}
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>

        <button
          onClick={onBackToLogin}
          className="w-full py-2 text-slate-500 hover:text-white text-sm font-medium transition-colors"
        >
          Cancel and back to login
        </button>
      </div>
    </div>
  );
};

export default RegistrationForm;
