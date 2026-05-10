
import React, { useState } from 'react';
import { LogoutIcon, DocumentTextIcon, BellIcon, UploadCloudIcon, UserGroupIcon, ShieldCheckIcon, SearchCircleIcon, ArrowDownTrayIcon } from './icons/FeatureIcons'; // Added ArrowDownTrayIcon
import { AdminPage, Teacher, Paybill, AdminNotification, InfoRequest, TabItem, MonthlyTeacherSalaryData, PayslipFieldMapping } from '../types'; 
import Tabs from './Tabs'; 
import PaybillPage from './admin/PaybillPage';
import NotificationPage from './admin/NotificationPage';
import GetDataPage from './admin/GetDataPage';
import CreateUsersPage from './admin/CreateUsersPage';
import EasyTDSFilingPage from './admin/EasyTDSFilingPage';
import AdminViewPayslipPage from './admin/AdminViewPayslipPage';
import AdminDownloadPage from './admin/AdminDownloadPage'; // Import new page component
import { DEFAULT_PAYSLIP_MAPPINGS } from '../constants'; // Corrected path
import { Challan } from '../types';

interface AdminDashboardProps {
  username: string;
  onLogout: () => void;
  teachers: Teacher[];
  onCreateTeachers: (newTeachers: Teacher[]) => void;
  onDeleteTeacher: (teacherId: string) => void;
  paybills: Paybill[]; 
  onProcessPaybillUpload: (
    paybillMeta: Omit<Paybill, 'id' | 'uploadedAt'>,
    parsedExcelData: { headers: string[]; rows: { shalarthId: string; dataRow: (string | number | null)[] }[] }
  ) => void; 
  onDeletePaybill: (paybillId: string) => void;
  adminNotifications: AdminNotification[];
  onAddAdminNotification: (newNotification: AdminNotification) => void;
  onDeleteAdminNotification: (notificationId: string) => void;
  infoRequests: InfoRequest[];
  onAddInfoRequest: (newRequest: InfoRequest) => void;
  onDeleteInfoRequest: (requestId: string) => void; 
  monthlySalaryDataList: MonthlyTeacherSalaryData[];
  payslipMappings: PayslipFieldMapping[];
  adminContactMobile: string;
  challans: Challan[];
  onAddChallan: (newChallan: Challan) => void;
  onDeleteChallan: (challanId: string) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = (props) => {
  const { username, onLogout, teachers, monthlySalaryDataList, payslipMappings, adminContactMobile } = props;
  const [activeAdminPage, setActiveAdminPage] = useState<AdminPage>(AdminPage.Paybill);

  const ADMIN_TABS: TabItem[] = [
    { label: 'Paybill', value: AdminPage.Paybill, icon: <DocumentTextIcon className="w-5 h-5 mr-2" /> },
    { label: 'View Payslip', value: AdminPage.ViewPayslip, icon: <SearchCircleIcon className="w-5 h-5 mr-2" /> },
    { label: 'Download', value: AdminPage.Download, icon: <ArrowDownTrayIcon className="w-5 h-5 mr-2" /> },
    { label: 'Notifications', value: AdminPage.Notifications, icon: <BellIcon className="w-5 h-5 mr-2" /> },
    { label: 'Get Data', value: AdminPage.GetData, icon: <UploadCloudIcon className="w-5 h-5 mr-2" /> },
    // { label: 'Create Users', value: AdminPage.CreateUsers, icon: <UserGroupIcon className="w-5 h-5 mr-2" /> },
    { label: 'Easy TDS Filing', value: AdminPage.TDSFiling, icon: <ShieldCheckIcon className="w-5 h-5 mr-2" /> },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-semibold text-slate-100">Admin Dashboard</h2>
          <p className="text-slate-300">Welcome, Admin <span className="font-semibold text-sky-400">{username}</span>!</p>
        </div>
        <button
          onClick={onLogout}
          className="flex items-center justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-red-500 transition-colors"
          aria-label="Logout"
        >
          <LogoutIcon className="w-5 h-5 mr-2" />
          Logout
        </button>
      </div>

      <Tabs tabs={ADMIN_TABS} activeTab={activeAdminPage} onTabChange={(tab) => setActiveAdminPage(tab as AdminPage)} />

      <div className="mt-6 bg-slate-700 p-4 sm:p-6 rounded-lg shadow-md min-h-[300px]">
        {activeAdminPage === AdminPage.Paybill && (
          <PaybillPage
            adminId={username}
            paybills={props.paybills} 
            onProcessPaybillUpload={props.onProcessPaybillUpload} 
            onDeletePaybill={props.onDeletePaybill}
          />
        )}
         {activeAdminPage === AdminPage.ViewPayslip && (
          <AdminViewPayslipPage
            adminId={username}
            teachers={teachers}
            monthlySalaryDataList={monthlySalaryDataList}
            payslipMappings={payslipMappings}
            adminContactMobile={adminContactMobile}
          />
        )}
        {activeAdminPage === AdminPage.Download && (
          <AdminDownloadPage
            teachers={teachers}
            monthlySalaryDataList={monthlySalaryDataList}
            payslipFieldMappings={DEFAULT_PAYSLIP_MAPPINGS} // Pass the global mappings
          />
        )}
        {activeAdminPage === AdminPage.Notifications && (
          <NotificationPage
            adminId={username}
            notifications={props.adminNotifications}
            onAddNotification={props.onAddAdminNotification}
            onDeleteNotification={props.onDeleteAdminNotification}
          />
        )}
        {activeAdminPage === AdminPage.GetData && ( 
          <GetDataPage 
            infoRequests={props.infoRequests}
            onAddInfoRequest={props.onAddInfoRequest}
            onDeleteInfoRequest={props.onDeleteInfoRequest} 
          />
        )}
        {activeAdminPage === AdminPage.CreateUsers && (
          <CreateUsersPage
            adminId={username}
            teachers={props.teachers}
            onCreateTeachers={props.onCreateTeachers}
            onDeleteTeacher={props.onDeleteTeacher}
          />
        )}
        {activeAdminPage === AdminPage.TDSFiling && (
          <EasyTDSFilingPage
            adminId={username}
            challans={props.challans}
            onAddChallan={props.onAddChallan}
            onDeleteChallan={props.onDeleteChallan}
          />
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
