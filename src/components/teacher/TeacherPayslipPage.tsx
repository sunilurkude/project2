import React, { useState } from 'react';
import { MonthlyTeacherSalaryData, PayslipFieldMapping, Teacher } from '../../types';
import { SearchCircleIcon } from '../icons/FeatureIcons';
import { PayslipDisplay } from './PayslipDisplay'; // Ensured correct relative path

interface TeacherPayslipPageProps {
  teacher: Teacher;
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

const TeacherPayslipPage: React.FC<TeacherPayslipPageProps> = ({ 
  teacher, 
  monthlySalaryDataList, 
  payslipMappings, 
  adminContactMobile 
}) => {
  const [selectedMonth, setSelectedMonth] = useState<string>(months[new Date().getMonth()]);
  const [selectedYear, setSelectedYear] = useState<string>(currentYear.toString());
  const [
    generatedSalaryData, 
    setGeneratedSalaryData
  ] = useState<MonthlyTeacherSalaryData | null | undefined>(undefined); // undefined: not searched, null: not found
  
  const [error, setError] = useState<string | null>(null);

  const handleGeneratePayslip = () => {
    setError(null);
    setGeneratedSalaryData(undefined); // Reset on new search

    const foundData = monthlySalaryDataList.find(
      data => data.month === selectedMonth && 
              data.year === selectedYear && 
              data.teacherShalarthId === teacher.shalarthId
    );

    if (foundData) {
      setGeneratedSalaryData(foundData);
    } else {
      setGeneratedSalaryData(null);
      setError(`Payslip data for ${selectedMonth} ${selectedYear} is not available for your Shalarth ID. Please contact Admin at ${adminContactMobile}.`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="no-print">
        <h3 className="text-xl font-semibold text-slate-100">View Payslip</h3>
        
        <div className="p-4 bg-slate-700 rounded-md space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div>
              <label htmlFor="payslipMonth" className="block text-sm font-medium text-slate-300">Month</label>
              <select id="payslipMonth" value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm text-slate-100">
                {months.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="payslipYear" className="block text-sm font-medium text-slate-300">Year</label>
              <select id="payslipYear" value={selectedYear} onChange={e => setSelectedYear(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm text-slate-100">
                {years.map(y => <option key={y} value={y.toString()}>{y}</option>)}
              </select>
            </div>
            <button onClick={handleGeneratePayslip}
              className="w-full md:w-auto flex items-center justify-center py-2 px-6 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-700 focus:ring-sky-500 transition-colors">
               <SearchCircleIcon className="w-5 h-5 mr-2"/> Generate Payslip
            </button>
          </div>
        </div>
      </div>

      {error && <div className="p-3 bg-red-700 border border-red-900 text-red-100 rounded-md text-sm my-2 no-print">{error}</div>}

      {generatedSalaryData === undefined && !error && (
         <p className="text-slate-400 text-center py-4 no-print">Select month and year, then click "Generate Payslip".</p>
      )}

      {generatedSalaryData && (
        <PayslipDisplay 
          key={generatedSalaryData.id}
          teacher={teacher}
          salaryData={generatedSalaryData}
          mappings={payslipMappings}
          targetMonth={generatedSalaryData.month} // Pass month from the generated data
          targetYear={generatedSalaryData.year}   // Pass year from the generated data
        />
      )}
    </div>
  );
};

export default TeacherPayslipPage;