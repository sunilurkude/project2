import React, { useState } from 'react';
import { MonthlyTeacherSalaryData, PayslipFieldMapping, Teacher } from '../../types';
import { SearchCircleIcon } from '../icons/FeatureIcons';
import { PayslipDisplay } from '../teacher/PayslipDisplay'; // Reusable component
import { getValueFromRow } from '../../utils/payslipUtils'; // Import utility

interface AdminViewPayslipPageProps {
  adminId: string;
  teachers: Teacher[];
  monthlySalaryDataList: MonthlyTeacherSalaryData[];
  payslipMappings: PayslipFieldMapping[];
  adminContactMobile: string;
}

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 11 }, (_, i) => 2020 + i);
const months = [
  'January', 'February', 'March', 'April', 'May', 'June', 
  'July', 'August', 'September', 'October', 'November', 'December'
];

const AdminViewPayslipPage: React.FC<AdminViewPayslipPageProps> = ({ 
  adminId,
  teachers,
  monthlySalaryDataList, 
  payslipMappings, 
  adminContactMobile 
}) => {
  const [targetShalarthIdInput, setTargetShalarthIdInput] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState<string>(months[new Date().getMonth()]);
  const [selectedYear, setSelectedYear] = useState<string>(currentYear.toString());
  
  const [
    generatedSalaryData, 
    setGeneratedSalaryData
  ] = useState<MonthlyTeacherSalaryData | null | undefined>(undefined); 
  const [
    targetTeacherForDisplay,
    setTargetTeacherForDisplay
  ] = useState<Teacher | null>(null);

  const [error, setError] = useState<string | null>(null);

  const handleGeneratePayslip = () => {
    setError(null);
    setGeneratedSalaryData(undefined); 
    setTargetTeacherForDisplay(null);

    const currentTargetShalarthId = targetShalarthIdInput.trim();
    if (!currentTargetShalarthId) {
      setError("Please enter a Shalarth ID.");
      return;
    }

    const foundSalaryData = monthlySalaryDataList.find(
      data => data.month === selectedMonth && 
              data.year === selectedYear && 
              data.teacherShalarthId === currentTargetShalarthId
    );

    if (foundSalaryData) {
      setGeneratedSalaryData(foundSalaryData);

      let teacherForPayslip = teachers.find(t => t.shalarthId === currentTargetShalarthId);

      if (!teacherForPayslip) {
        // Teacher not found in created users, create a minimal object
        const nameMapping = payslipMappings.find(m => m.payslipLabel === "EMPLOYEE NAME");
        let extractedName = "Teacher (Details from Paybill)"; // Default name
        if (nameMapping) {
            const nameValue = getValueFromRow(foundSalaryData.rawHeaders, foundSalaryData.rawDataRow, nameMapping.excelHeaderCandidates);
            if (nameValue) {
                extractedName = String(nameValue);
            }
        }
        teacherForPayslip = {
          id: currentTargetShalarthId + '_temp_' + Date.now(), // Unique key for React
          adminId,
          shalarthId: currentTargetShalarthId,
          name: extractedName,
          mobile: '', // Not available if user not created
          passwordHash: '', // Not relevant for display
          // Other Teacher fields will be undefined
        };
      }
      setTargetTeacherForDisplay(teacherForPayslip);

    } else {
      setGeneratedSalaryData(null);
      setTargetTeacherForDisplay(null);
      const teacherProfile = teachers.find(t => t.shalarthId === currentTargetShalarthId);
      const teacherNameInfo = teacherProfile ? `(${teacherProfile.name}) ` : '';
      setError(`Payslip data for ${selectedMonth} ${selectedYear} is not available for Shalarth ID ${currentTargetShalarthId} ${teacherNameInfo}. Please ensure paybill data is uploaded or contact Admin at ${adminContactMobile}.`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="no-print">
        <h3 className="text-xl font-semibold text-slate-100">View Teacher Payslip</h3>
        
        <div className="p-4 bg-slate-600 rounded-md space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            <div className="lg:col-span-1">
              <label htmlFor="adminShalarthId" className="block text-sm font-medium text-slate-300">Teacher Shalarth ID</label>
              <input 
                type="text"
                id="adminShalarthId"
                value={targetShalarthIdInput}
                onChange={e => setTargetShalarthIdInput(e.target.value)}
                placeholder="Enter Shalarth ID"
                className="mt-1 block w-full px-3 py-2 bg-slate-500 border border-slate-400 rounded-md shadow-sm placeholder-slate-300 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm text-slate-100"
              />
            </div>
            <div>
              <label htmlFor="payslipMonthAdmin" className="block text-sm font-medium text-slate-300">Month</label>
              <select id="payslipMonthAdmin" value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-slate-500 border border-slate-400 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm text-slate-100">
                {months.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="payslipYearAdmin" className="block text-sm font-medium text-slate-300">Year</label>
              <select id="payslipYearAdmin" value={selectedYear} onChange={e => setSelectedYear(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-slate-500 border border-slate-400 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm text-slate-100">
                {years.map(y => <option key={y} value={y.toString()}>{y}</option>)}
              </select>
            </div>
            <button onClick={handleGeneratePayslip}
              className="w-full lg:w-auto flex items-center justify-center py-2 px-6 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-600 focus:ring-sky-500 transition-colors">
               <SearchCircleIcon className="w-5 h-5 mr-2"/> Generate Payslip
            </button>
          </div>
        </div>
      </div>

      {error && <div className="p-3 bg-red-700 border border-red-900 text-red-100 rounded-md text-sm my-2 no-print">{error}</div>}

      {generatedSalaryData === undefined && !error && (
         <p className="text-slate-400 text-center py-4 no-print">Enter Shalarth ID, select month and year, then click "Generate Payslip".</p>
      )}

      {generatedSalaryData && targetTeacherForDisplay && (
        <PayslipDisplay 
          key={generatedSalaryData.id}
          teacher={targetTeacherForDisplay}
          salaryData={generatedSalaryData}
          mappings={payslipMappings}
          targetMonth={generatedSalaryData.month} 
          targetYear={generatedSalaryData.year}   
        />
      )}
    </div>
  );
};

export default AdminViewPayslipPage;
