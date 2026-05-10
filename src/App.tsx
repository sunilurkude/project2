import React, { useState } from "react";
import {
  UserRole,
  TabItem,
} from "./types";
import {
  APP_TITLE,
  ADMIN_CONTACT_MOBILE,
  DEFAULT_PAYSLIP_MAPPINGS,
} from "./constants";
import Tabs from "./components/Tabs";
import LoginForm from "./components/LoginForm";
import ManagerDashboard from "./components/ManagerDashboard";
import { ErrorBoundary } from "./components/ErrorBoundary";
import AdminDashboard from "./components/AdminDashboard";
import TeacherDashboard from "./components/TeacherDashboard";
import ErrorModal from "./components/ErrorModal";
import {
  UserIcon,
  CogIcon,
  BuildingOfficeIcon,
} from "./components/icons/FeatureIcons";
import RegistrationForm from "./components/RegistrationForm";
import PinResetForm from "./components/PinResetForm";
import AdminPasswordResetForm from "./components/AdminPasswordResetForm";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle } from "lucide-react";
import { useAuth } from "./contexts/AuthContext";
import { useData } from "./contexts/DataContext";

const TABS: TabItem[] = [
  {
    label: "Teacher Login",
    value: UserRole.Teacher,
    icon: <UserIcon className="w-5 h-5 mr-2" />,
  },
  {
    label: "Admin Login",
    value: UserRole.Admin,
    icon: <CogIcon className="w-5 h-5 mr-2" />,
  },
];

const App: React.FC = () => {
  const auth = useAuth();
  const data = useData();

  const {
    loggedInUser,
    activeLoginTab,
    isRegistering,
    isResettingPin,
    successMessage,
    error,
    isErrorModalOpen,
    admins,
    handleLogin,
    handleLogout,
    setActiveLoginTab,
    setIsRegistering,
    setIsResettingPin,
    clearErrorFromChild,
    closeErrorModal,
    handleVerifyAdminUsername,
    handleVerifyAdminMobile,
    handleVerifyAdminEmail,
    handleResetAdminPassword,
    handleCreateAdmin,
    handleDeleteAdmin,
  } = auth;

  const currentTeacherDetails =
    loggedInUser?.role === UserRole.Teacher
      ? data.teachers.find((t) => t.shalarthId === loggedInUser.username)
      : null;

  const determinedAdminContactMobile =
    admins.length > 0 && admins[0].mobile
      ? admins[0].mobile
      : ADMIN_CONTACT_MOBILE;

  return (
    <ErrorBoundary name="App">
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-700 text-slate-100 flex flex-col items-center justify-center p-4 selection:bg-sky-500 selection:text-white">
      <header className="mb-8 text-center no-print">
        <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-500 to-red-500 tracking-tighter">
          {APP_TITLE}
        </h1>
      </header>

      <main
        className={`w-full max-w-4xl bg-slate-800 shadow-2xl rounded-lg p-6 md:p-10 ${!loggedInUser ? "no-print" : ""}`}
      >
        {!loggedInUser ? (
          <>
            <AnimatePresence>
              {successMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center gap-3 text-green-400"
                >
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <p className="font-medium">{successMessage}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {isRegistering ? (
              <RegistrationForm
                onVerifyShalarth={data.onVerifyShalarth}
                onVerifyMobile={data.onVerifyMobile}
                onVerifyAadhaar={data.onVerifyAadhaar}
                onRegister={data.onRegister}
                onBackToLogin={() => setIsRegistering(false)}
              />
            ) : isResettingPin ? (
              activeLoginTab === UserRole.Admin ? (
                <AdminPasswordResetForm
                  onVerifyUsername={handleVerifyAdminUsername}
                  onVerifyMobile={handleVerifyAdminMobile}
                  onVerifyEmail={handleVerifyAdminEmail}
                  onResetPassword={handleResetAdminPassword}
                  onBackToLogin={() => setIsResettingPin(false)}
                />
              ) : (
                <PinResetForm
                  onVerifyShalarth={data.onVerifyShalarth}
                  onVerifyMobile={data.onVerifyMobile}
                  onVerifyPan={data.onVerifyPan}
                  onVerifyAadhaar={data.onVerifyAadhaar}
                  onResetPin={data.onRegister}
                  onBackToLogin={() => setIsResettingPin(false)}
                />
              )
            ) : (
              <>
                <Tabs
                  tabs={TABS}
                  activeTab={activeLoginTab}
                  onTabChange={setActiveLoginTab}
                />
                <div className="mt-6">
                  <LoginForm
                    key={activeLoginTab}
                    role={activeLoginTab}
                    onLogin={handleLogin}
                    error={null}
                    clearError={clearErrorFromChild}
                    onRegisterClick={() => setIsRegistering(true)}
                    onResetPinClick={() => setIsResettingPin(true)}
                  />
                </div>
              </>
            )}
          </>
        ) : (
          <>
            {loggedInUser.role === UserRole.Manager && (
              <ManagerDashboard
                onLogout={handleLogout}
                admins={admins}
                onCreateAdmin={handleCreateAdmin}
                onDeleteAdmin={handleDeleteAdmin}
                username={loggedInUser.username}
                adminNotifications={data.adminNotifications}
                onAddAdminNotification={data.handleAddAdminNotification}
                onDeleteAdminNotification={data.handleDeleteAdminNotification}
                infoRequests={data.infoRequests}
                onAddInfoRequest={data.handleAddInfoRequest}
                onDeleteInfoRequest={data.handleDeleteInfoRequest}
                teachers={data.teachers}
                monthlySalaryDataList={data.monthlySalaryDataList}
                payslipMappings={DEFAULT_PAYSLIP_MAPPINGS}
                challans={data.challans}
              />
            )}
            {loggedInUser.role === UserRole.Admin && (
              <AdminDashboard
                username={loggedInUser.username}
                onLogout={handleLogout}
                teachers={data.teachers.filter(
                  (t) => t.adminId === loggedInUser.username,
                )}
                onCreateTeachers={data.handleCreateTeachers}
                onDeleteTeacher={data.handleDeleteTeacher}
                paybills={data.paybills.filter(
                  (p) => p.adminId === loggedInUser.username,
                )}
                onProcessPaybillUpload={data.handleProcessPaybillUpload}
                onDeletePaybill={data.handleDeletePaybill}
                adminNotifications={data.adminNotifications.filter(
                  (n) => n.adminId === loggedInUser.username,
                )}
                onAddAdminNotification={data.handleAddAdminNotification}
                onDeleteAdminNotification={data.handleDeleteAdminNotification}
                infoRequests={data.infoRequests.filter(
                  (r) => r.adminId === loggedInUser.username,
                )}
                onAddInfoRequest={data.handleAddInfoRequest}
                onDeleteInfoRequest={data.handleDeleteInfoRequest}
                monthlySalaryDataList={data.monthlySalaryDataList.filter(
                  (d) => d.adminId === loggedInUser.username,
                )}
                payslipMappings={DEFAULT_PAYSLIP_MAPPINGS}
                adminContactMobile={determinedAdminContactMobile}
                challans={data.challans.filter(
                  (c) => c.adminId === loggedInUser.username,
                )}
                onAddChallan={data.handleAddChallan}
                onDeleteChallan={data.handleDeleteChallan}
              />
            )}
            {loggedInUser.role === UserRole.Teacher &&
              !currentTeacherDetails && (
                <div className="flex flex-col items-center justify-center h-64">
                  <div className="w-12 h-12 border-4 border-sky-400 border-t-transparent rounded-full animate-spin"></div>
                  <p className="mt-4 text-slate-300">Loading your profile...</p>
                </div>
              )}
            {loggedInUser.role === UserRole.Teacher &&
              currentTeacherDetails && (
                <ErrorBoundary name="TeacherDashboard">
                <TeacherDashboard
                  teacher={currentTeacherDetails}
                  onLogout={handleLogout}
                  monthlySalaryDataList={data.monthlySalaryDataList.filter(
                    (d) =>
                      d.teacherShalarthId === currentTeacherDetails.shalarthId,
                  )}
                  payslipMappings={DEFAULT_PAYSLIP_MAPPINGS}
                  adminNotifications={data.adminNotifications.filter(
                    (n) =>
                      n.adminId === currentTeacherDetails.adminId ||
                      n.adminId === "sunilurkude",
                  )}
                  infoRequests={data.infoRequests.filter(
                    (req) =>
                      req.adminId === currentTeacherDetails.adminId ||
                      req.adminId === "sunilurkude",
                  )}
                  teacherInfoResponses={data.teacherInfoResponses.filter(
                    (r) =>
                      r.teacherShalarthId === currentTeacherDetails.shalarthId,
                  )}
                  onAddOrUpdateInfoResponse={
                    data.handleAddOrUpdateTeacherInfoResponse
                  }
                  adminContactMobile={determinedAdminContactMobile}
                  latestSalaryDataForCurrentTeacher={
                    data.latestSalaryDataForCurrentTeacher
                  }
                />
                </ErrorBoundary>
              )}
          </>
        )}
      </main>
      {isErrorModalOpen && error && (
        <ErrorModal message={error} onClose={closeErrorModal} />
      )}
      <footer className="mt-8 text-center text-sm text-slate-400 no-print">
        <p>
          &copy; {new Date().getFullYear()} {APP_TITLE}. All rights reserved.
        </p>
      </footer>
    </div>
    </ErrorBoundary>
  );
};

export default App;
