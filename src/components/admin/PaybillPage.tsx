import React, { useState, useRef } from 'react';
import { Paybill } from '../../types'; // Paybill here is the master record type
import { TrashIcon, FileArrowUpIcon } from '../icons/FeatureIcons';

import * as XLSX from 'xlsx';

interface PaybillPageProps {
  adminId: string;
  paybills: Paybill[]; // List of master paybill records
  onProcessPaybillUpload: (
    paybillMeta: Omit<Paybill, 'id' | 'uploadedAt'>,
    parsedExcelData: { headers: string[]; rows: { shalarthId: string; dataRow: (string | number | null)[] }[] }
  ) => void;
  onDeletePaybill: (paybillId: string) => void;
}

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 11 }, (_, i) => 2020 + i);
const months = [
  'January', 'February', 'March', 'April', 'May', 'June', 
  'July', 'August', 'September', 'October', 'November', 'December'
];

const PaybillPage: React.FC<PaybillPageProps> = ({ adminId, paybills, onProcessPaybillUpload, onDeletePaybill }) => {
  const [month, setMonth] = useState<string>(months[new Date().getMonth()]);
  const [year, setYear] = useState<string>(currentYear.toString());
  const [remarks, setRemarks] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsProcessing(true);

    if (!month || !year || !remarks || !file) {
      setError('All fields including file are required.');
      setIsProcessing(false);
      return;
    }

    if (!file.name.endsWith('.xls') && !file.name.endsWith('.xlsx')) {
      setError('Invalid file type. Only .xls or .xlsx files are allowed.');
      setIsProcessing(false);
      return;
    }

    try {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = event.target?.result;
          const workbook = XLSX.read(data, { type: 'binary' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          
          // Headers are in Row 1 (Excel index 1, sheet_to_json range 0), Data starts from Row 2
          // header: 1 means treat the first row *of the specified range* as headers.
          // range: 0 means "start processing from sheet row index 0 (which is Excel's Row 1)".
          const jsonData: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1, raw: false, defval: null, range: 0 });
          
          if (jsonData.length < 1) {
            setError('Excel file does not seem to have a header row at Row 1, or is empty.');
            setIsProcessing(false);
            return;
          }

          const headers: string[] = jsonData[0].map(String); // Headers from Excel's Row 1
          
          // Check if SHALARTH ID header is at Column H (index 7)
          if (headers.length <= 7 || headers[7]?.trim().toUpperCase() !== 'SHALARTH ID') {
            setError('Invalid Excel format: Header "SHALARTH ID" not found in Column H of Row 1.');
            setIsProcessing(false);
            return;
          }

          if (jsonData.length < 2) {
            setError('Excel file has headers at Row 1, but no data rows starting from Row 2.');
            setIsProcessing(false);
            return;
          }
          const dataRows = jsonData.slice(1); // Data from Excel's Row 2 onwards

          const parsedRows: { shalarthId: string; dataRow: (string | number | null)[] }[] = [];
          for (let i = 0; i < dataRows.length; i++) {
            const row = dataRows[i];
            // Column H is index 7 (0-indexed) for Shalarth ID
            if (row.length < 8) { // Need at least up to column H
                console.warn(`Skipping Excel data row ${i + 2} due to insufficient columns:`, row);
                continue; 
            }
            const shalarthId = row[7] ? String(row[7]).trim() : null; 
            if (shalarthId) {
              parsedRows.push({ shalarthId, dataRow: row });
            } else {
                console.warn(`Skipping Excel data row ${i + 2} due to missing Shalarth ID in Column H:`, row);
            }
          }

          if (parsedRows.length === 0) {
            setError('No valid teacher data found in the Excel. Ensure Shalarth ID is in Column H of data rows (starting Row 2) and data is present.');
            setIsProcessing(false);
            return;
          }

          const paybillMeta = { adminId, month, year, remarks, fileName: file.name };
          onProcessPaybillUpload(paybillMeta, { headers, rows: parsedRows });
          
          setSuccess(`Paybill for ${month} ${year} (${file.name}) processed. ${parsedRows.length} teacher entries found.`);
          setRemarks('');
          setFile(null);
          if(fileInputRef.current) fileInputRef.current.value = "";
        } catch (parseError: any) {
          console.error("Error parsing Excel file:", parseError);
          setError(`Error parsing Excel file: ${parseError.message}. Ensure it's a valid .xlsx file with headers at Row 1, "SHALARTH ID" in Column H of Row 1, and data from Row 2.`);
        } finally {
          setIsProcessing(false);
        }
      };
      reader.onerror = () => {
        setError('Failed to read the file.');
        setIsProcessing(false);
      };
      reader.readAsBinaryString(file);

    } catch (err: any) { 
      setError(err.message || 'Failed to process paybill.');
      setIsProcessing(false);
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
    } else {
      setFile(null);
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-slate-100">Upload Monthly Paybill (abstract downloaded from shalarth as it is)</h3>
      
      {error && <div className="p-3 bg-red-700 border border-red-900 text-red-100 rounded-md text-sm my-2">{error}</div>}
      {success && <div className="p-3 bg-green-700 border border-green-900 text-green-100 rounded-md text-sm my-2">{success}</div>}

      <form onSubmit={handleSubmit} className="p-4 bg-slate-600 rounded-md space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="paybillMonth" className="block text-sm font-medium text-slate-300">Salary Month</label>
            <select id="paybillMonth" value={month} onChange={e => setMonth(e.target.value)} required disabled={isProcessing}
              className="mt-1 block w-full px-3 py-2 bg-slate-500 border border-slate-400 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm text-slate-100">
              {months.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="paybillYear" className="block text-sm font-medium text-slate-300">Salary Year</label>
            <select id="paybillYear" value={year} onChange={e => setYear(e.target.value)} required disabled={isProcessing}
              className="mt-1 block w-full px-3 py-2 bg-slate-500 border border-slate-400 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm text-slate-100">
              {years.map(y => <option key={y} value={y.toString()}>{y}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label htmlFor="paybillRemarks" className="block text-sm font-medium text-slate-300">Remarks</label> 
          <input type="text" id="paybillRemarks" value={remarks} onChange={e => setRemarks(e.target.value)} required disabled={isProcessing}
            className="mt-1 block w-full px-3 py-2 bg-slate-500 border border-slate-400 rounded-md shadow-sm placeholder-slate-300 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm text-slate-100"
            placeholder="e.g., Main Salary Bill, Arrears" />
        </div>
        <div>
          <label htmlFor="paybillFile" className="block text-sm font-medium text-slate-300">Upload Bill (.xls, .xlsx)</label>
          <input type="file" id="paybillFile" ref={fileInputRef} onChange={handleFileChange} accept=".xls,.xlsx" required disabled={isProcessing}
            className="mt-1 block w-full text-sm text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-sky-600 file:text-white hover:file:bg-sky-700 cursor-pointer disabled:opacity-50"/>
        </div>
        <button type="submit" disabled={isProcessing}
          className="w-full md:w-auto flex items-center justify-center py-2 px-6 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-600 focus:ring-sky-500 transition-colors disabled:bg-sky-800 disabled:cursor-not-allowed">
          <FileArrowUpIcon className="w-5 h-5 mr-2"/> {isProcessing ? 'Processing...' : 'Upload & Process Bill'}
        </button>
        <div className="text-xs text-slate-400 space-y-1">
            <p><strong>Important Excel Format:</strong></p>
            <ul className="list-disc list-inside pl-2">
                <li>Column headers must be in Row 1.</li>
                <li>Actual salary data must start from Row 2.</li>
                <li>The header "SHALARTH ID" must be in Column H of Row 1.</li>
                <li>Teacher's Shalarth ID values must be in Column H of data rows (Row 2+).</li>
            </ul>
        </div>
      </form>

      <h4 className="text-lg font-medium text-slate-100 mt-6 mb-3">Uploaded Paybill Files (Master Records)</h4>
      {paybills.length === 0 ? (
        <p className="text-slate-400 text-center py-4">No paybill master records found.</p>
      ) : (
        <div className="overflow-x-auto bg-slate-600 p-1 rounded-md shadow">
          <table className="min-w-full divide-y divide-slate-500">
            <thead className="bg-slate-500">
              <tr>
                <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-slate-100 sm:pl-6">Sr.No</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-100">Year</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-100">Month</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-100">File Name</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-100">Remarks</th> 
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-100">Uploaded At</th>
                <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {paybills.map((pb, index) => (
                <tr key={pb.id}>
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-slate-200 sm:pl-6">{index + 1}</td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-300">{pb.year}</td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-300">{pb.month}</td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-300 truncate max-w-xs" title={pb.fileName}>{pb.fileName}</td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-300">{pb.remarks}</td> 
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-300">{new Date(pb.uploadedAt).toLocaleString()}</td>
                  <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                    <button onClick={() => onDeletePaybill(pb.id)} className="text-red-400 hover:text-red-300 p-1 rounded hover:bg-red-700" title="Delete Paybill & Processed Data">
                      <TrashIcon className="w-5 h-5" /> <span className="sr-only">Delete</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default PaybillPage;
