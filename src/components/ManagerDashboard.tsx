import React, { useState } from 'react';
import { LogoutIcon, UserGroupIcon, BellIcon, UploadCloudIcon, ArrowDownTrayIcon, DocumentTextIcon, ChartBarIcon, EyeIcon } from './icons/FeatureIcons';
import { ManagerPage, Admin, AdminNotification, InfoRequest, TabItem, Teacher, MonthlyTeacherSalaryData, PayslipFieldMapping, Challan, Paybill, AuditLog } from '../types';
import Tabs from './Tabs';
import AdminList from './AdminList';
import CreateAdminForm from './CreateAdminForm';
import NotificationPage from './admin/NotificationPage';
import GetDataPage from './admin/GetDataPage';
import AdminDownloadPage from './admin/AdminDownloadPage';
import TDSChallansView from './TDSChallansView';
import ManagerReportsPage from './manager/ManagerReportsPage';
import ActivityLogsPage from './manager/ActivityLogsPage';

interface ManagerDashboardProps {
  onLogout: () => void;
  admins: Admin[];
  onCreateAdmin: (newAdmin: Admin) => Promise<void> | void;
  onDeleteAdmin: (adminUserId: string) => void;
  username: string;
  adminNotifications: AdminNotification[];
  onAddAdminNotification: (newNotification: AdminNotification) => void;
  onDeleteAdminNotification: (notificationId: string) => void;
  infoRequests: InfoRequest[];
  onAddInfoRequest: (newRequest: InfoRequest) => void;
  onDeleteInfoRequest: (requestId: string) => void;
  teachers: Teacher[];
  monthlySalaryDataList: MonthlyTeacherSalaryData[];
  payslipMappings: PayslipFieldMapping[];
  challans: Challan[];
  paybills: Paybill[];
  auditLogs: AuditLog[];
}

const ManagerDashboard: React.FC<ManagerDashboardProps> = (props) => {
  const { 
    onLogout, admins, onCreateAdmin, onDeleteAdmin, username,
    adminNotifications, onAddAdminNotification, onDeleteAdminNotification,
    infoRequests, onAddInfoRequest, onDeleteInfoRequest,
    teachers, monthlySalaryDataList, payslipMappings, challans, paybills, auditLogs
  } = props;
  
  const [activePage, setActivePage] = useState<ManagerPage>(ManagerPage.Administrators);

  const MANAGER_TABS: TabItem[] = [
    { label: 'Administrators', value: ManagerPage.Administrators, icon: <UserGroupIcon className="w-5 h-5 mr-2" /> },
    { label: 'Notifications', value: ManagerPage.Notifications, icon: <BellIcon className="w-5 h-5 mr-2" /> },
    { label: 'Get Data', value: ManagerPage.GetData, icon: <UploadCloudIcon className="w-5 h-5 mr-2" /> },
    { label: 'Download Reports', value: ManagerPage.Download, icon: <ArrowDownTrayIcon className="w-5 h-5 mr-2" /> },
    { label: 'Summary Reports', value: ManagerPage.Reports, icon: <ChartBarIcon className="w-5 h-5 mr-2" /> },
    { label: 'TDS Challans', value: ManagerPage.TDSChallans, icon: <DocumentTextIcon className="w-5 h-5 mr-2" /> },
    { label: 'Activity Logs', value: ManagerPage.ActivityLogs, icon: <EyeIcon className="w-5 h-5 mr-2" /> },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-semibold text-slate-100">Manager Dashboard</h2>
          <p className="text-slate-300">Welcome, Manager <span className="font-semibold text-sky-400">{username}</span>!</p>
        </div>
        <button
          onClick={onLogout}
          className="flex items-center justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-red-500 transition-colors"
        >
          <LogoutIcon className="w-5 h-5 mr-2" />
          Logout
        </button>
      </div>

      <Tabs tabs={MANAGER_TABS} activeTab={activePage} onTabChange={(tab) => setActivePage(tab as ManagerPage)} />

      <div className="mt-6 bg-slate-700 p-4 sm:p-6 rounded-lg shadow-md min-h-[400px]">
        {activePage === ManagerPage.Administrators && (
          <div className="space-y-8">
            <CreateAdminForm onCreateAdmin={onCreateAdmin} />
            <AdminList admins={admins} onDeleteAdmin={onDeleteAdmin} />
          </div>
        )}
        {activePage === ManagerPage.Notifications && (
           <NotificationPage 
             adminId={username}
             notifications={adminNotifications}
             onAddNotification={onAddAdminNotification}
             onDeleteNotification={onDeleteAdminNotification}
           />
        )}
        {activePage === ManagerPage.GetData && (
          <GetDataPage 
            infoRequests={infoRequests}
            onAddInfoRequest={onAddInfoRequest}
            onDeleteInfoRequest={onDeleteInfoRequest}
          />
        )}
        {activePage === ManagerPage.Download && (
          <AdminDownloadPage
            teachers={teachers}
            monthlySalaryDataList={monthlySalaryDataList}
            payslipFieldMappings={payslipMappings}
            admins={admins}
            showAdminFilter={true}
          />
        )}
        {activePage === ManagerPage.Reports && (
          <ManagerReportsPage
            admins={admins}
            teachers={teachers}
            paybills={paybills}
            monthlySalaryDataList={monthlySalaryDataList}
            adminNotifications={adminNotifications}
            infoRequests={infoRequests}
            auditLogs={props.auditLogs}
          />
        )}
        {activePage === ManagerPage.TDSChallans && (
          <TDSChallansView
            challans={challans}
            admins={admins}
          />
        )}
        {activePage === ManagerPage.ActivityLogs && (
          <ActivityLogsPage
            auditLogs={auditLogs}
          />
        )}
      </div>
    </div>
  );
};

export default ManagerDashboard;

