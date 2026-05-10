import React, { useMemo } from 'react';
import { Admin, Teacher, Paybill, MonthlyTeacherSalaryData, AdminNotification, InfoRequest, AuditLog } from '../../types';
import { UserGroupIcon, ChartBarIcon, AcademicCapIcon, CurrencyDollarIcon, DocumentTextIcon, BellIcon, IdentificationIcon, BuildingOfficeIcon } from '../icons/FeatureIcons';

interface ManagerReportsPageProps {
  admins: Admin[];
  teachers: Teacher[];
  paybills: Paybill[];
  monthlySalaryDataList: MonthlyTeacherSalaryData[];
  adminNotifications: AdminNotification[];
  infoRequests: InfoRequest[];
  auditLogs: AuditLog[];
}

const ManagerReportsPage: React.FC<ManagerReportsPageProps> = ({
  admins,
  teachers,
  paybills,
  monthlySalaryDataList,
  adminNotifications,
  infoRequests,
  auditLogs
}) => {
  // Stat calculations
  const totalAdmins = admins.length;
  const totalTeachers = teachers.length;
  const totalPaybills = paybills.length;
  const totalSalaryRecords = monthlySalaryDataList.length;
  const registeredTeachers = teachers.filter(t => t.isRegistered).length;
  const pendingTeachers = totalTeachers - registeredTeachers;
  const totalNotifications = adminNotifications.length;
  
  // Calculate unique month-year combinations
  const uniqueMonthsWithData = useMemo(() => {
    const combos = new Set<string>();
    monthlySalaryDataList.forEach(data => {
      combos.add(`${data.year}-${data.month}`);
    });
    return combos.size;
  }, [monthlySalaryDataList]);

  // Section 2: Admin-wise Data
  const adminStats = useMemo(() => {
    return admins.map(admin => {
      const adminTeachers = teachers.filter(t => t.adminId === admin.userId);
      const registered = adminTeachers.filter(t => t.isRegistered).length;
      return {
        id: admin.userId,
        name: admin.name,
        totalTeachers: adminTeachers.length,
        registeredTeachers: registered,
        pendingTeachers: adminTeachers.length - registered,
        totalPaybills: paybills.filter(p => p.adminId === admin.userId).length,
        totalSalaryRecords: monthlySalaryDataList.filter(s => s.adminId === admin.userId).length,
        totalNotifications: adminNotifications.filter(n => n.adminId === admin.userId).length
      };
    });
  }, [admins, teachers, paybills, monthlySalaryDataList, adminNotifications]);

  // Calculate totals for Admin Stats row
  const adminStatsTotal = useMemo(() => {
    return adminStats.reduce((acc, curr) => ({
      totalTeachers: acc.totalTeachers + curr.totalTeachers,
      registeredTeachers: acc.registeredTeachers + curr.registeredTeachers,
      pendingTeachers: acc.pendingTeachers + curr.pendingTeachers,
      totalPaybills: acc.totalPaybills + curr.totalPaybills,
      totalSalaryRecords: acc.totalSalaryRecords + curr.totalSalaryRecords,
      totalNotifications: acc.totalNotifications + curr.totalNotifications
    }), {
      totalTeachers: 0,
      registeredTeachers: 0,
      pendingTeachers: 0,
      totalPaybills: 0,
      totalSalaryRecords: 0,
      totalNotifications: 0
    });
  }, [adminStats]);

  // Section 3: Monthly Matrix Data
  const monthMatrix = useMemo(() => {
    const years = new Set<string>();
    monthlySalaryDataList.forEach(data => years.add(data.year));
    paybills.forEach(p => years.add(p.year)); // Also check paybills in case there are no salary records yet
    
    // Default to at least current year if empty
    if (years.size === 0) {
      years.add(new Date().getFullYear().toString());
    }

    const sortedYears = Array.from(years).sort((a, b) => parseInt(a) - parseInt(b));
    const allMonths = [
      'January', 'February', 'March', 'April', 'May', 'June', 
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    return sortedYears.map(year => {
      const monthData = allMonths.map(month => {
        const hasSalaryData = monthlySalaryDataList.some(d => d.year === year && d.month === month);
        const hasPaybill = paybills.some(p => p.year === year && p.month === month);
        return {
          month,
          hasData: hasSalaryData || hasPaybill
        };
      });
      
      const totalMonthsWithData = monthData.filter(m => m.hasData).length;

      return {
        year,
        months: monthData,
        totalMonthsWithData
      };
    });
  }, [monthlySalaryDataList, paybills]);

  const allMonthsList = [
    'January', 'February', 'March', 'April', 'May', 'June', 
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Section 1: System Overview */}
      <div>
        <h2 className="text-xl font-light text-gray-800 mb-4 flex items-center">
          <ChartBarIcon className="w-6 h-6 text-indigo-500 mr-2" />
          System Overview
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex flex-col items-center text-center">
            <IdentificationIcon className="w-8 h-8 text-blue-500 mb-2" />
            <span className="text-gray-500 text-sm font-light tracking-wide">Total Admins</span>
            <span className="text-3xl font-light text-gray-800 mt-1">{totalAdmins}</span>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex flex-col items-center text-center">
            <UserGroupIcon className="w-8 h-8 text-indigo-500 mb-2" />
            <span className="text-gray-500 text-sm font-light tracking-wide">Total Teachers</span>
            <span className="text-3xl font-light text-gray-800 mt-1">{totalTeachers}</span>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex flex-col items-center text-center">
            <DocumentTextIcon className="w-8 h-8 text-purple-500 mb-2" />
            <span className="text-gray-500 text-sm font-light tracking-wide">Paybills Uploaded</span>
            <span className="text-3xl font-light text-gray-800 mt-1">{totalPaybills}</span>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex flex-col items-center text-center">
            <CurrencyDollarIcon className="w-8 h-8 text-emerald-500 mb-2" />
            <span className="text-gray-500 text-sm font-light tracking-wide">Salary Records</span>
            <span className="text-3xl font-light text-gray-800 mt-1">{totalSalaryRecords}</span>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex flex-col items-center text-center">
            <AcademicCapIcon className="w-8 h-8 text-green-500 mb-2" />
            <span className="text-gray-500 text-sm font-light tracking-wide">Registered Teachers</span>
            <span className="text-3xl font-light text-gray-800 mt-1">{registeredTeachers}</span>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex flex-col items-center text-center">
            <BuildingOfficeIcon className="w-8 h-8 text-amber-500 mb-2" />
            <span className="text-gray-500 text-sm font-light tracking-wide">Pending Registration</span>
            <span className="text-3xl font-light text-gray-800 mt-1">{pendingTeachers}</span>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex flex-col items-center text-center">
            <BellIcon className="w-8 h-8 text-rose-500 mb-2" />
            <span className="text-gray-500 text-sm font-light tracking-wide">Notifications</span>
            <span className="text-3xl font-light text-gray-800 mt-1">{totalNotifications}</span>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex flex-col items-center text-center">
            <ChartBarIcon className="w-8 h-8 text-cyan-500 mb-2" />
            <span className="text-gray-500 text-sm font-light tracking-wide">Months with Data</span>
            <span className="text-3xl font-light text-gray-800 mt-1">{uniqueMonthsWithData}</span>
          </div>
        </div>
      </div>

      {/* Section 2: Admin-wise Data */}
      <div>
        <h2 className="text-xl font-light text-gray-800 mb-4 flex items-center">
          <UserGroupIcon className="w-6 h-6 text-blue-500 mr-2" />
          Admin-wise Summary
        </h2>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 text-sm">
                  <th className="p-4 font-normal">Admin Name</th>
                  <th className="p-4 font-normal">User ID</th>
                  <th className="p-4 font-normal text-center"># Teachers</th>
                  <th className="p-4 font-normal text-center"># Registered</th>
                  <th className="p-4 font-normal text-center"># Pending</th>
                  <th className="p-4 font-normal text-center"># Paybills</th>
                  <th className="p-4 font-normal text-center"># Salary Records</th>
                  <th className="p-4 font-normal text-center"># Notifications</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {adminStats.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-gray-500 font-light">No admins found.</td>
                  </tr>
                ) : (
                  <>
                    {adminStats.map(admin => (
                      <tr key={admin.id} className="hover:bg-gray-50 transition-colors">
                        <td className="p-4 font-light text-gray-800">{admin.name}</td>
                        <td className="p-4 text-gray-500 text-sm font-mono font-light">{admin.id}</td>
                        <td className="p-4 text-center font-light text-gray-800">{admin.totalTeachers}</td>
                        <td className="p-4 text-center font-light text-gray-800">{admin.registeredTeachers}</td>
                        <td className="p-4 text-center font-light text-gray-800">{admin.pendingTeachers}</td>
                        <td className="p-4 text-center font-light text-gray-800">{admin.totalPaybills}</td>
                        <td className="p-4 text-center font-light text-gray-800">{admin.totalSalaryRecords}</td>
                        <td className="p-4 text-center font-light text-gray-800">{admin.totalNotifications}</td>
                      </tr>
                    ))}
                    {/* Totals Row */}
                    <tr className="bg-gray-50 border-t border-gray-200">
                      <td colSpan={2} className="p-4 text-right text-gray-600 font-normal">TOTAL:</td>
                      <td className="p-4 text-center text-gray-900 font-medium">{adminStatsTotal.totalTeachers}</td>
                      <td className="p-4 text-center text-gray-900 font-medium">{adminStatsTotal.registeredTeachers}</td>
                      <td className="p-4 text-center text-gray-900 font-medium">{adminStatsTotal.pendingTeachers}</td>
                      <td className="p-4 text-center text-gray-900 font-medium">{adminStatsTotal.totalPaybills}</td>
                      <td className="p-4 text-center text-gray-900 font-medium">{adminStatsTotal.totalSalaryRecords}</td>
                      <td className="p-4 text-center text-gray-900 font-medium">{adminStatsTotal.totalNotifications}</td>
                    </tr>
                  </>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Section 3: Monthly Matrix Data */}
      <div>
        <h2 className="text-xl font-light text-gray-800 mb-4 flex items-center">
          <DocumentTextIcon className="w-6 h-6 text-emerald-500 mr-2" />
          Monthly Data Coverage
        </h2>
        
        {teachers.length === 0 && paybills.length === 0 ? (
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center">
            <DocumentTextIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-light text-lg">No data available yet in the system.</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 text-sm">
                    <th className="p-4 font-normal w-24">Year</th>
                    {allMonthsList.map(month => (
                      <th key={month} className="p-4 font-normal text-center w-16">
                        {month.substring(0, 3)}
                      </th>
                    ))}
                    <th className="p-4 font-normal text-center bg-gray-50">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {monthMatrix.map(row => (
                    <tr key={row.year} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4 font-light text-gray-800">{row.year}</td>
                      {row.months.map(m => (
                        <td key={m.month} className="p-4 text-center">
                          {m.hasData ? (
                            <div className="w-3 h-3 rounded-full bg-emerald-400 mx-auto" title={`${m.month} ${row.year} - Data Available`}></div>
                          ) : (
                            <div className="w-2 h-2 rounded-full bg-gray-200 mx-auto" title={`${m.month} ${row.year} - No Data`}></div>
                          )}
                        </td>
                      ))}
                      <td className="p-4 text-center font-light text-gray-600 bg-gray-50">
                        {row.totalMonthsWithData} <span className="text-gray-400 text-sm">/ 12</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Section 4: Activity Logs */}
      <div>
        <h2 className="text-xl font-light text-gray-800 mb-4 flex items-center">
          <DocumentTextIcon className="w-6 h-6 text-orange-500 mr-2" />
          System Activity Logs
        </h2>
        {auditLogs && auditLogs.length > 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto max-h-[500px]">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead className="sticky top-0 bg-gray-50 border-b border-gray-200 z-10">
                  <tr className="text-gray-600 text-sm">
                    <th className="p-4 font-normal w-48">Date/Time</th>
                    <th className="p-4 font-normal w-32">Action</th>
                    <th className="p-4 font-normal w-32">User Role</th>
                    <th className="p-4 font-normal w-48">User Name / ID</th>
                    <th className="p-4 font-normal">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4 font-light text-gray-800 text-sm">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                      <td className="p-4 font-medium text-gray-700 text-sm">
                        {log.action}
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium capitalize
                          ${log.userRole === 'admin' ? 'bg-blue-100 text-blue-800' :
                            log.userRole === 'manager' ? 'bg-purple-100 text-purple-800' :
                              'bg-emerald-100 text-emerald-800'}`}>
                          {log.userRole}
                        </span>
                      </td>
                      <td className="p-4 font-light text-gray-800 text-sm">
                        <div className="font-medium text-gray-900">{log.userName}</div>
                        <div className="text-xs text-gray-500 font-mono">{log.userId}</div>
                      </td>
                      <td className="p-4 font-light text-gray-600 text-sm break-words">
                        {log.details}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center">
            <DocumentTextIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-light text-lg">No audit logs available.</p>
            <p className="text-sm text-gray-400 mt-2">Make sure to run the SQL migration to create the audit_logs table.</p>
          </div>
        )}
      </div>

    </div>
  );
};

export default ManagerReportsPage;
