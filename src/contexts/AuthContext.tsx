import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
import { UserRole, Admin, LoggedInUser, TabItem } from "../types";
import { MANAGER_USER_ID } from "../constants";
import { hashData, verifyHash } from "../utils/authUtils";
import { supabase } from "../supabaseClient";

interface AuthContextValue {
  // State
  loggedInUser: LoggedInUser | null;
  activeLoginTab: UserRole;
  isRegistering: boolean;
  isResettingPin: boolean;
  error: string | null;
  isErrorModalOpen: boolean;
  successMessage: string | null;
  admins: Admin[];
  loginAttempts: Record<string, { count: number; lockedUntil: number }>;

  // Actions — auth
  handleLogin: (
    param1: string,
    param2: string,
    param3: string | UserRole,
    param4?: UserRole,
  ) => Promise<void>;
  handleLogout: () => void;

  // Actions — UI state
  setActiveLoginTab: (tab: UserRole) => void;
  setIsRegistering: (val: boolean) => void;
  setIsResettingPin: (val: boolean) => void;
  setSuccessMessage: (msg: string | null) => void;
  setError: (msg: string | null) => void;
  setIsErrorModalOpen: (val: boolean) => void;
  closeErrorModal: () => void;
  clearErrorFromChild: () => void;

  // Actions — admin management
  handleVerifyAdminUsername: (username: string) => Promise<{ found: boolean }>;
  handleVerifyAdminMobile: (username: string, mobile: string) => Promise<boolean>;
  handleVerifyAdminEmail: (username: string, email: string) => Promise<boolean>;
  handleResetAdminPassword: (username: string, newPass: string) => Promise<void>;
  handleCreateAdmin: (newAdmin: Admin) => Promise<void>;
  handleDeleteAdmin: (adminUserId: string) => Promise<void>;

  // Data shared for login
  setAdmins: React.Dispatch<React.SetStateAction<Admin[]>>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

const MAX_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 15;

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [activeLoginTab, setActiveLoginTab] = useState<UserRole>(UserRole.Teacher);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isResettingPin, setIsResettingPin] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loggedInUser, setLoggedInUser] = useState<LoggedInUser | null>(null);
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState<
    Record<string, { count: number; lockedUntil: number }>
  >({});

  // Load admins on mount (needed for login)
  useEffect(() => {
    const loadAdmins = async () => {
      try {
        const { data: dbAdmins } = await supabase.from("admins").select("*");
        if (dbAdmins && dbAdmins.length > 0) {
          setAdmins(
            dbAdmins.map((a) => ({
              userId: a.user_id,
              passwordHash: a.password_hash,
              name: a.name,
              email: a.email || "",
              mobile: a.mobile || "",
            })),
          );
        } else {
          const defaultAdmins: Admin[] = [
            {
              userId: "sunilurkude",
              passwordHash: hashData("manager123"),
              name: "Sunil Urkude",
              email: "sunilurkude.2010@gmail.com",
              mobile: "0123456789",
            },
            {
              userId: "admin",
              passwordHash: hashData("admin123"),
              name: "Sample Admin",
              email: "admin@example.com",
              mobile: "0123456789",
            },
          ];
          setAdmins(defaultAdmins);
          supabase
            .from("admins")
            .insert(
              defaultAdmins.map((a) => ({
                user_id: a.userId,
                password_hash: a.passwordHash,
                name: a.name,
                email: a.email,
                mobile: a.mobile,
              })),
            )
            .then(({ error }) => {
              if (error) console.error("Failed to auto-insert default admins:", error);
            });
        }
      } catch (err) {
        console.error("Error loading admins:", err);
      }
    };
    loadAdmins();
  }, []);

  const closeErrorModal = useCallback(() => {
    setIsErrorModalOpen(false);
    setError(null);
  }, []);

  const clearErrorFromChild = useCallback(() => {
    setError(null);
    setIsErrorModalOpen(false);
  }, []);

  const handleLogout = useCallback(() => {
    setLoggedInUser(null);
    setError(null);
    setIsErrorModalOpen(false);
    setActiveLoginTab(UserRole.Teacher);
    setIsRegistering(false);
    setSuccessMessage(null);
  }, []);

  const handleLogin = useCallback(
    async (param1: string, param2: string, param3: string | UserRole, param4?: UserRole) => {
      setError(null);
      setIsErrorModalOpen(false);

      let roleToLogin: UserRole;
      let usernameToLogin: string;
      let secretValue: string;

      if (param4 === UserRole.Teacher) {
        roleToLogin = UserRole.Teacher;
        usernameToLogin = param1;
        secretValue = param2;
      } else {
        roleToLogin = param3 as UserRole;
        usernameToLogin = param1;
        secretValue = param2;
      }

      const attemptKey = `${roleToLogin}-${usernameToLogin}`;
      const now = Date.now();
      const currentAttempt = loginAttempts[attemptKey];

      if (currentAttempt && currentAttempt.lockedUntil > now) {
        const waitMinutes = Math.ceil((currentAttempt.lockedUntil - now) / 60000);
        setError(`Too many failed attempts. Account locked. Try again in ${waitMinutes} minutes.`);
        setIsErrorModalOpen(true);
        return;
      }

      const genericErrorMessage =
        "Incorrect credentials. Please confirm your User ID/Shalarth ID and Password/PIN.";

      const recordFailure = () => {
        setLoginAttempts((prev) => {
          const count = (prev[attemptKey]?.count || 0) + 1;
          const lockedUntil = count >= MAX_ATTEMPTS
            ? Date.now() + LOCKOUT_MINUTES * 60 * 1000
            : 0;
          return { ...prev, [attemptKey]: { count, lockedUntil } };
        });
        setError(genericErrorMessage);
        setIsErrorModalOpen(true);
      };

      const recordSuccess = () => {
        setLoginAttempts((prev) => {
          const next = { ...prev };
          delete next[attemptKey];
          return next;
        });
      };

      if (roleToLogin === UserRole.Admin || roleToLogin === UserRole.Manager) {
        const adminUser = admins.find((admin) => {
          const idMatches = admin.userId === usernameToLogin;
          const passMatches = verifyHash(secretValue, admin.passwordHash);
          return idMatches && passMatches;
        });

        if (adminUser) {
          recordSuccess();
          if (usernameToLogin === "sunilurkude" || usernameToLogin === MANAGER_USER_ID) {
            setLoggedInUser({ role: UserRole.Manager, username: usernameToLogin });
          } else {
            setLoggedInUser({ role: UserRole.Admin, username: usernameToLogin });
          }
        } else {
          recordFailure();
        }
      } else if (roleToLogin === UserRole.Teacher) {
        try {
          const { data: dbTeacher, error } = await supabase
            .from("teachers")
            .select("*")
            .eq("shalarth_id", usernameToLogin)
            .single();

          if (dbTeacher && !error) {
            const teacherUser = {
              id: dbTeacher.id,
              adminId: dbTeacher.admin_id,
              shalarthId: dbTeacher.shalarth_id,
              name: dbTeacher.name,
              schoolDetails: dbTeacher.school_name,
              dob: dbTeacher.dob,
              mobile: dbTeacher.mobile,
              emailId: dbTeacher.email,
              isRegistered: dbTeacher.is_registered,
              pin_hashed: dbTeacher.pin_hashed,
              passwordHash: dbTeacher.password_hash,
            };

            if (teacherUser.isRegistered && teacherUser.pin_hashed) {
              if (verifyHash(secretValue, teacherUser.pin_hashed)) {
                recordSuccess();
                setLoggedInUser({ role: UserRole.Teacher, username: usernameToLogin });
                return;
              }
            } else if (verifyHash(secretValue, teacherUser.passwordHash)) {
              recordSuccess();
              setLoggedInUser({ role: UserRole.Teacher, username: usernameToLogin });
              return;
            }
          } else {
            const { data: salaryData } = await supabase
              .from("salary_data")
              .select("id")
              .eq("teacher_shalarth_id", usernameToLogin)
              .limit(1);

            if (!salaryData || salaryData.length === 0) {
              setError("Shalarth ID not found in the system. Please ensure the ID is correct and the Admin has uploaded your paybill data.");
              setIsErrorModalOpen(true);
              return;
            } else {
              setError("Shalarth ID found, but you are not registered yet. Please use the 'New Registration' link below to verify your details and set a PIN.");
              setIsErrorModalOpen(true);
              return;
            }
          }
          recordFailure();
        } catch (err) {
          console.error("Login error:", err);
          recordFailure();
        }
      }
    },
    [admins, loginAttempts],
  );

  const handleVerifyAdminUsername = async (username: string) => {
    const admin = admins.find((a) => a.userId === username);
    return { found: !!admin };
  };

  const handleVerifyAdminMobile = async (username: string, mobile: string) => {
    const admin = admins.find((a) => a.userId === username);
    return admin?.mobile === mobile;
  };

  const handleVerifyAdminEmail = async (username: string, email: string) => {
    const admin = admins.find((a) => a.userId === username);
    return admin?.email === email;
  };

  const handleResetAdminPassword = async (username: string, newPass: string) => {
    const hashed = hashData(newPass);
    try {
      const { error } = await supabase.from('admins').update({ password_hash: hashed }).eq('user_id', username);
      if (error) throw new Error("Failed to reset password. Database error.");
      setAdmins((prev) => prev.map((a) => (a.userId === username ? { ...a, passwordHash: hashed } : a)));
      setSuccessMessage("Admin password reset successfully. Please login.");
      setIsResettingPin(false);
    } catch (err: any) {
      console.error(err);
      throw new Error("Failed to reset password.");
    }
  };

  const handleCreateAdmin = useCallback(
    async (newAdmin: Admin) => {
      if (admins.some((admin) => admin.userId === newAdmin.userId)) {
        throw new Error(`Admin with User ID ${newAdmin.userId} already exists.`);
      }
      const adminWithHashedPassword = {
        ...newAdmin,
        passwordHash: hashData(newAdmin.passwordHash),
      };
      try {
        const { error } = await supabase.from("admins").insert([{
          user_id: adminWithHashedPassword.userId,
          password_hash: adminWithHashedPassword.passwordHash,
          name: adminWithHashedPassword.name,
          email: adminWithHashedPassword.email,
          mobile: adminWithHashedPassword.mobile,
        }]);
        if (error) throw new Error(error.message);
        setAdmins((prevAdmins) => [...prevAdmins, adminWithHashedPassword]);
      } catch (err: any) {
        console.error("Error creating admin:", err);
        throw new Error("Failed to create admin.");
      }
    },
    [admins],
  );

  const handleDeleteAdmin = useCallback(async (adminUserId: string) => {
    try {
      await supabase.from("admins").delete().eq("user_id", adminUserId);
      setAdmins((prevAdmins) => prevAdmins.filter((admin) => admin.userId !== adminUserId));
    } catch (err) {
      console.error("Error deleting admin:", err);
      setError("Failed to delete admin.");
      setIsErrorModalOpen(true);
    }
  }, []);

  const value: AuthContextValue = {
    loggedInUser,
    activeLoginTab,
    isRegistering,
    isResettingPin,
    error,
    isErrorModalOpen,
    successMessage,
    admins,
    loginAttempts,
    handleLogin,
    handleLogout,
    setActiveLoginTab,
    setIsRegistering,
    setIsResettingPin,
    setSuccessMessage,
    setError,
    setIsErrorModalOpen,
    closeErrorModal,
    clearErrorFromChild,
    handleVerifyAdminUsername,
    handleVerifyAdminMobile,
    handleVerifyAdminEmail,
    handleResetAdminPassword,
    handleCreateAdmin,
    handleDeleteAdmin,
    setAdmins,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
