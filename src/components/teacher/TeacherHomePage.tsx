import React, { useMemo } from 'react';
import { Teacher, MonthlyTeacherSalaryData, PayslipFieldMapping } from '../../types';

interface TeacherHomePageProps {
  teacher: Teacher;
  latestSalaryData: MonthlyTeacherSalaryData | null;
  payslipMappings: PayslipFieldMapping[];
}

const TeacherHomePage: React.FC<TeacherHomePageProps> = ({ teacher, latestSalaryData, payslipMappings }) => {
  const norm = (s: string) => s.trim().toLowerCase().replace(/[^a-z0-9]/g, '');

  const extractedData = useMemo(() => {
    let data: Record<string, string> = {
      'NAME OF SCHOOL': '',
      'SCHOOL SHALARTH DDO CODE': '',
      'EMPLOYEE NAME': teacher.name || '',
      'SHALARTH ID': teacher.shalarthId || '',
      'DESIGNATION': '',
      'GPF NO': '',
      'PAN NO': '',
      'PRAN NO': '',
      'ADHAR NO': '',
      'EMAIL ID': '',
      'MOB NO': '',
      'BANK ACCOUNT NUMBER': '',
      'PAY MATRIX': '',
      'BANK IFSC CODE': '',
      'BRANCH NAME': '',
    };

    if (latestSalaryData && latestSalaryData.rawDataRow) {
      const headers = latestSalaryData.rawHeaders || [];
      const row = latestSalaryData.rawDataRow;

      const getValue = (label: string) => {
        const mapping = payslipMappings.find(m => m.payslipLabel === label || m.payslipLabel.toUpperCase() === label.toUpperCase());
        if (!mapping) return '';
        
        let idx = -1;
        for (const candidate of mapping.excelHeaderCandidates) {
            const candidateNorm = norm(candidate);
            idx = headers.findIndex(h => norm(String(h)) === candidateNorm);
            if (idx !== -1) break;
        }

        if (idx !== -1 && row[idx] !== undefined && row[idx] !== null) {
          return String(row[idx]).trim();
        }
        return '';
      };

      Object.keys(data).forEach(key => {
        const val = getValue(key);
        if (val) data[key] = val;
      });
    }

    return data;
  }, [teacher, latestSalaryData, payslipMappings]);

  return (
    <div className="space-y-6">
      <div className="text-center pb-4 border-b border-slate-600">
        <h2 className="text-2xl font-bold text-white">WELCOME {extractedData['EMPLOYEE NAME'].toUpperCase()}</h2>
      </div>
      
      <div className="bg-slate-800 rounded-lg p-6 shadow-md border border-slate-700">
        <h3 className="text-lg font-semibold text-sky-400 mb-4 border-b border-slate-600 pb-2">Employment Details</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
          <DetailRow label="SCHOOL" value={extractedData['NAME OF SCHOOL']} />
          <DetailRow label="SHALARTH DDO CODE" value={extractedData['SCHOOL SHALARTH DDO CODE']} />
          <DetailRow label="EMPLOYEE NAME" value={extractedData['EMPLOYEE NAME']} />
          <DetailRow label="SHALARTH ID" value={extractedData['SHALARTH ID']} />
          <DetailRow label="Designation" value={extractedData['DESIGNATION']} />
          <DetailRow label="GPF NO" value={extractedData['GPF NO']} />
          <DetailRow label="PAN NO" value={extractedData['PAN NO']} />
          <DetailRow label="PRAN NO" value={extractedData['PRAN NO']} />
          <DetailRow label="ADHAR NO" value={extractedData['ADHAR NO']} />
          <DetailRow label="EMAIL ID" value={extractedData['EMAIL ID']} />
          <DetailRow label="MOB NO" value={extractedData['MOB NO']} />
          <DetailRow label="BANK ACCOUNT NUMBER" value={extractedData['BANK ACCOUNT NUMBER']} />
          <DetailRow label="PAY MATRIX" value={extractedData['PAY MATRIX']} />
          <DetailRow label="BANK IFSC CODE" value={extractedData['BANK IFSC CODE']} />
          <DetailRow label="BRANCH NAME" value={extractedData['BRANCH NAME']} />
        </div>
        
        {!latestSalaryData && (
          <p className="text-amber-400 text-sm mt-6 italic">
            * Complete details will be available once your salary data is uploaded.
          </p>
        )}
      </div>
    </div>
  );
};

const DetailRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="flex flex-col sm:flex-row sm:items-center py-1">
    <span className="text-slate-400 font-medium sm:w-1/2">{label}:</span>
    <span className="text-slate-200 font-semibold sm:w-1/2 break-words">{value || 'N/A'}</span>
  </div>
);

export default TeacherHomePage;
