import React, { useState } from 'react';
import { 
  LogoutIcon, 
  BanknotesIcon,
  DocumentTextIcon,
  BellIcon, 
  DocumentDownloadIcon, 
  ArrowDownTrayIcon, 
  CurrencyDollarIcon, 
  InboxInIcon,
  UserIcon
} from './icons/FeatureIcons';
import { 
  Teacher, 
  MonthlyTeacherSalaryData, 
  PayslipFieldMapping, 
  AdminNotification, 
  InfoRequest, 
  TeacherInfoResponse,
  TeacherPage,
  TabItem
} from '../types';
import Tabs from './Tabs';
import TeacherHomePage from './teacher/TeacherHomePage';
import TeacherPayslipPage from './teacher/TeacherPayslipPage';
import TeacherNotificationPage from './teacher/TeacherNotificationPage';
import TeacherUploadPage from './teacher/TeacherUploadPage';
import TeacherIncomeTaxPage from './teacher/TeacherIncomeTaxPage';
import TeacherMySubmissionsPage from './teacher/TeacherMySubmissionsPage';

interface TeacherDashboardProps {
  teacher: Teacher;
  onLogout: () => void;
  monthlySalaryDataList: MonthlyTeacherSalaryData[];
  payslipMappings: PayslipFieldMapping[];
  adminNotifications: AdminNotification[];
  infoRequests: InfoRequest[];
  teacherInfoResponses: TeacherInfoResponse[];
  onAddOrUpdateInfoResponse: (response: TeacherInfoResponse) => void;
  adminContactMobile: string;
  latestSalaryDataForCurrentTeacher: MonthlyTeacherSalaryData | null;
}

const TeacherDashboard: React.FC<TeacherDashboardProps> = (props) => {
  const { 
    teacher, 
    onLogout, 
    monthlySalaryDataList, 
    payslipMappings, 
    adminNotifications, 
    infoRequests, 
    teacherInfoResponses, 
    onAddOrUpdateInfoResponse,
    adminContactMobile,
    latestSalaryDataForCurrentTeacher
  } = props;

  const [activePage, setActivePage] = useState<TeacherPage>(TeacherPage.Home);

  const TEACHER_TABS: TabItem[] = [
    { label: 'Home', value: TeacherPage.Home, icon: <UserIcon className="w-5 h-5 mr-2" /> },
    { label: 'Payslip', value: TeacherPage.PayslipDownload, icon: <DocumentDownloadIcon className="w-5 h-5 mr-2" /> },
    { label: 'Notifications', value: TeacherPage.Notifications, icon: <BellIcon className="w-5 h-5 mr-2" /> },
    { label: 'Download', value: TeacherPage.UploadInfo, icon: <ArrowDownTrayIcon className="w-5 h-5 mr-2" /> },
    { label: 'Yearly Statement', value: TeacherPage.IncomeTax, icon: <DocumentTextIcon className="w-5 h-5 mr-2" /> },
    { label: 'Tax Calculator', value: TeacherPage.TaxCalculator, icon: <BanknotesIcon className="w-5 h-5 mr-2" /> },
    { label: 'My Submissions', value: TeacherPage.MySubmissions, icon: <InboxInIcon className="w-5 h-5 mr-2" /> },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-semibold text-slate-100">Teacher Dashboard</h2>
          <p className="text-slate-300 uppercase">
            Welcome, <span className="font-semibold text-sky-400">
              {(() => {
                const norm = (s: string) => s.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
                let dynamicName = teacher.name;
                if (latestSalaryDataForCurrentTeacher && latestSalaryDataForCurrentTeacher.rawDataRow) {
                  const headers = latestSalaryDataForCurrentTeacher.rawHeaders || [];
                  const row = latestSalaryDataForCurrentTeacher.rawDataRow;
                  const employeeNameMapping = payslipMappings.find(m => 
                    m.payslipLabel === 'EMPLOYEE NAME' || m.payslipLabel.toUpperCase() === 'EMPLOYEE NAME'
                  );
                  if (employeeNameMapping) {
                    let idx = -1;
                    for (const candidate of employeeNameMapping.excelHeaderCandidates) {
                      const candidateNorm = norm(candidate);
                      idx = headers.findIndex(h => norm(String(h)) === candidateNorm);
                      if (idx !== -1) break;
                    }
                    if (idx !== -1 && row[idx]) {
                      dynamicName = String(row[idx]).trim();
                    }
                  }
                }
                return dynamicName;
              })()}
            </span>
          </p>
        </div>
        <button
          onClick={onLogout}
          className="flex items-center justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-red-500 transition-colors"
        >
          <LogoutIcon className="w-5 h-5 mr-2" />
          Logout
        </button>
      </div>

      <Tabs tabs={TEACHER_TABS} activeTab={activePage} onTabChange={(tab) => setActivePage(tab as TeacherPage)} />

      <div className="mt-6 bg-slate-700 p-4 sm:p-6 rounded-lg shadow-md min-h-[400px]">
        {activePage === TeacherPage.Home && (
          <TeacherHomePage 
            teacher={teacher} 
            latestSalaryData={latestSalaryDataForCurrentTeacher}
            payslipMappings={payslipMappings}
          />
        )}
        {activePage === TeacherPage.PayslipDownload && (
          <TeacherPayslipPage 
            teacher={teacher}
            monthlySalaryDataList={monthlySalaryDataList}
            payslipMappings={payslipMappings}
            adminContactMobile={adminContactMobile}
          />
        )}
        {activePage === TeacherPage.Notifications && (
          <TeacherNotificationPage notifications={adminNotifications} />
        )}
        {activePage === TeacherPage.UploadInfo && (
          <TeacherUploadPage 
            infoRequests={infoRequests}
            existingResponses={teacherInfoResponses}
            onAddOrUpdateResponse={onAddOrUpdateInfoResponse}
            teacherShalarthId={teacher.shalarthId}
          />
        )}
        {activePage === TeacherPage.TaxCalculator && (
          <div className="flex items-center justify-center h-full min-h-[300px] text-slate-300 text-3xl font-bold tracking-widest uppercase">
            UPCOMING
          </div>
        )}
        {activePage === TeacherPage.IncomeTax && (
          <TeacherIncomeTaxPage 
             teacher={teacher}
             monthlySalaryDataList={monthlySalaryDataList}
             adminContactMobile={adminContactMobile}
          />
        )}
        {activePage === TeacherPage.MySubmissions && (
          <TeacherMySubmissionsPage 
             teacherResponses={teacherInfoResponses}
             infoRequests={infoRequests}
          />
        )}
      </div>
    </div>
  );
};

export default TeacherDashboard;

