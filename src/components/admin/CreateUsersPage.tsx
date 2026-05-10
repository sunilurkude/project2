
import React, { useState, useRef } from 'react';
import { Teacher } from '../../types';
import { TrashIcon, DocumentDownloadIcon, FileArrowUpIcon, UserPlusIcon, EyeIcon, EyeSlashIcon } from '../icons/FeatureIcons';

interface CreateUsersPageProps {
  adminId: string;
  teachers: Teacher[];
  onCreateTeachers: (newTeachers: Teacher[]) => void;
  onDeleteTeacher: (teacherId: string) => void;
}

const CreateUsersPage: React.FC<CreateUsersPageProps> = ({ adminId, teachers, onCreateTeachers, onDeleteTeacher }) => {
  // State for CSV bulk upload
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvError, setCsvError] = useState<string | null>(null);
  const [csvSuccess, setCsvSuccess] = useState<string | null>(null);
  const csvFileInputRef = useRef<HTMLInputElement>(null);

  // State for individual user creation
  const [individualName, setIndividualName] = useState('');
  const [individualShalarthId, setIndividualShalarthId] = useState('');
  const [individualMobile, setIndividualMobile] = useState('');
  const [individualPassword, setIndividualPassword] = useState('');
  const [individualError, setIndividualError] = useState<string | null>(null);
  const [individualSuccess, setIndividualSuccess] = useState<string | null>(null);
  
  const [shownPasswords, setShownPasswords] = React.useState<Record<string, boolean>>({});

  const togglePasswordVisibility = (teacherId: string) => {
    setShownPasswords(prev => ({ ...prev, [teacherId]: !prev[teacherId] }));
  };

  // --- Individual User Creation Logic ---
  const handleCreateIndividualUser = (e: React.FormEvent) => {
    e.preventDefault();
    setIndividualError(null);
    setIndividualSuccess(null);

    if (!individualName || !individualShalarthId || !individualMobile || !individualPassword) {
      setIndividualError('All fields are required for individual creation.');
      return;
    }
    if (!/^\d{10}$/.test(individualMobile)) {
      setIndividualError('Invalid mobile number format. Must be 10 digits.');
      return;
    }
    if (!/^[a-zA-Z0-9]+$/.test(individualShalarthId)) {
        setIndividualError('Invalid Shalarth ID format. Must be alphanumeric.');
        return;
    }
     if (teachers.some(t => t.shalarthId === individualShalarthId)) {
        setIndividualError(`Teacher with Shalarth ID ${individualShalarthId} already exists.`);
        return;
    }


    const newTeacher: Teacher = {
      id: individualShalarthId + Date.now().toString() + Math.random().toString(36).substring(2),
      adminId,
      name: individualName,
      shalarthId: individualShalarthId,
      mobile: individualMobile,
      passwordHash: individualPassword, // Sent as plaintext, App.tsx will hash
    };

    try {
      onCreateTeachers([newTeacher]);
      setIndividualSuccess(`Teacher ${individualName} created successfully! Password will be mock-hashed.`);
      // Clear form
      setIndividualName('');
      setIndividualShalarthId('');
      setIndividualMobile('');
      setIndividualPassword('');
    } catch (err: any) {
      setIndividualError(err.message || 'Failed to create teacher.');
    }
  };


  // --- CSV Bulk Upload Logic ---
  const handleCsvFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      if (e.target.files[0].type === 'text/csv' || e.target.files[0].name.endsWith('.csv')) {
        setCsvFile(e.target.files[0]);
        setCsvError(null);
      } else {
        setCsvFile(null);
        setCsvError('Invalid file type. Please upload a CSV file.');
      }
    } else {
      setCsvFile(null);
    }
  };

  const parseCSV = (csvText: string): { newTeachers: Teacher[], parsingErrors: string[] } => {
    let cleanedCsvText = csvText;
    if (cleanedCsvText.charCodeAt(0) === 0xFEFF) { // BOM
      cleanedCsvText = cleanedCsvText.substring(1);
    }

    const lines = cleanedCsvText.split(/\r\n|\n/).filter(line => line.trim() !== '');
    const localParsingErrors: string[] = [];
    if (lines.length < 1) { 
        localParsingErrors.push('CSV file seems empty or contains only blank lines.');
        return { newTeachers: [], parsingErrors: localParsingErrors };
    }
    
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/[\s_-]/g, ''));
    
    const requiredHeaders = ['name', 'shalarthid', 'mobilenumber', 'password'];
    const headerMap: Record<string, number> = {};

    requiredHeaders.forEach(reqHeader => {
        const foundIndex = headers.findIndex(h => h.includes(reqHeader));
        if (foundIndex === -1) {
            localParsingErrors.push(`CSV header row is missing or misnamed for: "${reqHeader.replace('id',' ID').replace('number',' Number')}". Found headers: ${headers.join(', ')}`);
        } else {
            headerMap[reqHeader] = foundIndex;
        }
    });

    if (localParsingErrors.length > 0) { 
        return { newTeachers: [], parsingErrors: localParsingErrors };
    }
    
    const newTeachersList: Teacher[] = [];
    if (lines.length < 2 && localParsingErrors.length === 0) { 
        // Only header row, no data, not an error.
    }


    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',');
      
      const name = values[headerMap['name']]?.trim();
      const shalarthId = values[headerMap['shalarthid']]?.trim();
      const mobile = values[headerMap['mobilenumber']]?.trim();
      const password = values[headerMap['password']]?.trim(); // Plaintext password from CSV

      if (name && shalarthId && mobile && password) {
        if (!/^\d{10}$/.test(mobile)) {
          localParsingErrors.push(`Line ${i+1} (User: ${name}): Invalid mobile number format (${mobile}). Must be 10 digits.`);
          continue; 
        }
         if (!/^[a-zA-Z0-9]+$/.test(shalarthId)) {
          localParsingErrors.push(`Line ${i+1} (User: ${name}): Invalid Shalarth ID format (${shalarthId}). Must be alphanumeric.`);
          continue;
        }
        newTeachersList.push({
          id: shalarthId + Date.now().toString() + Math.random().toString(36).substring(2),
          adminId,
          name,
          shalarthId,
          mobile,
          passwordHash: password, // Stored as plaintext here, App.tsx will hash
        });
      } else {
          localParsingErrors.push(`Line ${i+1}: Missing one or more required fields from (Name, Shalarth ID, Mobile, Password). Ensure all columns are present and filled.`);
      }
    }
    return { newTeachers: newTeachersList, parsingErrors: localParsingErrors };
  };

  const handleProcessCsv = async (e: React.FormEvent) => {
    e.preventDefault();
    setCsvError(null);
    setCsvSuccess(null);

    if (!csvFile) {
      setCsvError('Please select a CSV file to upload.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const csvText = event.target?.result as string;
        const { newTeachers: parsedTeachers, parsingErrors } = parseCSV(csvText); 
        
        let message = "";
        if (parsingErrors.length > 0) {
            message += "CSV Parsing Issues:\n" + parsingErrors.join('\n') + "\n\n";
        }

        if (parsedTeachers.length > 0) {
            const uniqueNewTeachers = parsedTeachers.filter(pt => !teachers.some(et => et.shalarthId === pt.shalarthId));
            const skippedCount = parsedTeachers.length - uniqueNewTeachers.length;

            if (uniqueNewTeachers.length > 0) {
                onCreateTeachers(uniqueNewTeachers); // Pass to App.tsx which will handle hashing
                message += `${uniqueNewTeachers.length} new teacher(s) successfully created. Passwords will be mock-hashed.`;
            } else {
                 message += `No new teachers were created.`;
            }
            if (skippedCount > 0) {
                 message += ` ${skippedCount} teacher(s) were skipped as their Shalarth IDs already exist.`;
            }
            setCsvSuccess(message.trim());
            if(parsingErrors.length > 0 && uniqueNewTeachers.length > 0) setCsvError(null); // Show success if some created, even with other parsing errors
            else if (parsingErrors.length > 0) setCsvError(message.trim());

        } else if (parsingErrors.length > 0) { 
             setCsvError(message.trim());
        } else { 
            setCsvError('No valid teacher data found in CSV to create new users.');
        }
        
        setCsvFile(null);
        if (csvFileInputRef.current) csvFileInputRef.current.value = "";

      } catch (err: any) { 
        setCsvError(err.message || 'Failed to process CSV or create users.');
        setCsvSuccess(null);
      }
    };
    reader.onerror = () => {
      setCsvError('Failed to read the CSV file.');
      setCsvSuccess(null);
    };
    reader.readAsText(csvFile);
  };

  const handleDownloadSample = () => {
    // Use Tab character (\t) as delimiter to "remove comma" but keep columns in Excel
    const headers = "Name\tShalarth ID\tMobile Number\tPassword"; 
    const fileContent = `${headers}\n`; 
    
    // For tab-separated, text/plain or text/tab-separated-values is more accurate,
    // but text/csv with .xls extension often works for Excel's auto-detection.
    const blob = new Blob([fileContent], { type: 'text/csv;charset=utf-8;' }); 
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'teacher_users_sample.xls'); 
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="space-y-8">
      <h3 className="text-xl font-semibold text-slate-100">Create Teacher Users</h3>

      {/* Section 1: Individual User Creation */}
      <section className="p-4 sm:p-6 bg-slate-600 rounded-lg shadow-md">
        <h4 className="text-lg font-semibold text-sky-300 mb-4">Create Individual User</h4>
        {individualError && <div className="mb-4 p-3 bg-red-700 border border-red-900 text-red-100 rounded-md text-sm">{individualError}</div>}
        {individualSuccess && <div className="mb-4 p-3 bg-green-700 border border-green-900 text-green-100 rounded-md text-sm">{individualSuccess}</div>}
        <form onSubmit={handleCreateIndividualUser} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="individualName" className="block text-sm font-medium text-slate-300">Name</label>
              <input type="text" id="individualName" value={individualName} onChange={(e) => setIndividualName(e.target.value)} required 
              className="mt-1 block w-full px-3 py-2 bg-slate-500 border border-slate-400 rounded-md placeholder-slate-300 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm text-slate-100"/>
            </div>
            <div>
              <label htmlFor="individualShalarthId" className="block text-sm font-medium text-slate-300">Shalarth ID</label>
              <input type="text" id="individualShalarthId" value={individualShalarthId} onChange={(e) => setIndividualShalarthId(e.target.value)} required 
              className="mt-1 block w-full px-3 py-2 bg-slate-500 border border-slate-400 rounded-md placeholder-slate-300 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm text-slate-100"/>
            </div>
            <div>
              <label htmlFor="individualMobile" className="block text-sm font-medium text-slate-300">Mobile Number (10 digits)</label>
              <input type="tel" id="individualMobile" value={individualMobile} onChange={(e) => setIndividualMobile(e.target.value)} required pattern="\d{10}" maxLength={10} onInput={(e) => e.currentTarget.value = e.currentTarget.value.replace(/\D/g, '')}
              className="mt-1 block w-full px-3 py-2 bg-slate-500 border border-slate-400 rounded-md placeholder-slate-300 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm text-slate-100"/>
            </div>
            <div>
              <label htmlFor="individualPassword" className="block text-sm font-medium text-slate-300">Password</label>
              <input type="password" id="individualPassword" value={individualPassword} onChange={(e) => setIndividualPassword(e.target.value)} required 
              className="mt-1 block w-full px-3 py-2 bg-slate-500 border border-slate-400 rounded-md placeholder-slate-300 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm text-slate-100"/>
            </div>
          </div>
          <button type="submit"
            className="w-full md:w-auto flex items-center justify-center py-2 px-6 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-600 focus:ring-emerald-500 transition-colors">
            <UserPlusIcon className="w-5 h-5 mr-2"/> Create User
          </button>
        </form>
      </section>

      {/* Section 2: Bulk User Creation via CSV */}
      <section className="p-4 sm:p-6 bg-slate-600 rounded-lg shadow-md">
        <h4 className="text-lg font-semibold text-sky-300 mb-4">Bulk Create Users via CSV</h4>
        <p className="text-sm text-slate-300 mb-3">
          Upload a CSV file with headers: <code className="bg-slate-500 px-1 rounded mx-0.5">Name</code>,
          <code className="bg-slate-500 px-1 rounded mx-0.5">Shalarth ID</code>,
          <code className="bg-slate-500 px-1 rounded mx-0.5">Mobile Number</code>,
          <code className="bg-slate-500 px-1 rounded mx-0.5">Password</code>.
          (The uploaded CSV file should be comma-separated).
        </p>
        <button 
            onClick={handleDownloadSample}
            className="inline-flex items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-600 focus:ring-teal-500 transition-colors mb-2"
        >
            <DocumentDownloadIcon className="w-5 h-5 mr-2"/> Download Sample File (.xls)
        </button>
         <p className="text-xs text-slate-400 mb-4">
            (The sample file contains only the required headers, tab-separated, but named with .xls for Excel compatibility.)
        </p>
        
        {csvError && <div className="mb-4 p-3 bg-red-700 border border-red-900 text-red-100 rounded-md text-sm whitespace-pre-line">{csvError}</div>}
        {csvSuccess && <div className="mb-4 p-3 bg-green-700 border border-green-900 text-green-100 rounded-md text-sm whitespace-pre-line">{csvSuccess}</div>}

        <form onSubmit={handleProcessCsv} className="space-y-4">
          <div>
            <label htmlFor="csvFile" className="block text-sm font-medium text-slate-300">Upload CSV File (comma-separated)</label>
            <input type="file" id="csvFile" ref={csvFileInputRef} onChange={handleCsvFileChange} accept=".csv" required
              className="mt-1 block w-full text-sm text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-sky-600 file:text-white hover:file:bg-sky-700 cursor-pointer"/>
          </div>
          <button type="submit"
            className="w-full md:w-auto flex items-center justify-center py-2 px-6 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-600 focus:ring-sky-500 transition-colors">
            <FileArrowUpIcon className="w-5 h-5 mr-2"/> Process CSV & Create Users
          </button>
        </form>
      </section>

      {/* Section 3: Created Users Display */}
      <section className="p-1 sm:p-0">
        <h4 className="text-lg font-semibold text-slate-100 mt-6 mb-3">Current Teacher Users</h4>
        {teachers.length === 0 ? (
          <p className="text-slate-400 text-center py-4 bg-slate-600 rounded-md">No teacher users created yet.</p>
        ) : (
          <div className="overflow-x-auto bg-slate-600 p-1 rounded-md shadow">
            <table className="min-w-full divide-y divide-slate-500">
              <thead className="bg-slate-500">
                <tr>
                  <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-slate-100 sm:pl-6">Name</th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-100">Shalarth ID</th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-100">Mobile Number</th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-100">Password (Mock Hashed)</th>
                  <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6 text-right text-sm font-semibold text-slate-100">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {teachers.map((teacher) => (
                  <tr key={teacher.id}>
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-slate-200 sm:pl-6">{teacher.name}</td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-300">{teacher.shalarthId}</td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-300">{teacher.mobile}</td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-red-400 font-mono">
                       <div className="flex items-center space-x-1">
                        <span className="truncate max-w-[100px] sm:max-w-[120px]">
                          {shownPasswords[teacher.id] ? teacher.passwordHash : '••••••••••'}
                        </span>
                        <button
                          onClick={() => togglePasswordVisibility(teacher.id)}
                          className="text-sky-400 hover:text-sky-300 p-0.5 rounded"
                          title={shownPasswords[teacher.id] ? "Hide password" : "Show password (mock hashed)"}
                        >
                          {shownPasswords[teacher.id] ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                           <span className="sr-only">{shownPasswords[teacher.id] ? "Hide password" : "Show password (mock hashed)"}</span>
                        </button>
                      </div>
                    </td>
                    <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                      <button onClick={() => onDeleteTeacher(teacher.id)} className="text-red-400 hover:text-red-300 p-1 rounded hover:bg-red-700" title={`Delete teacher ${teacher.name}`}>
                        <TrashIcon className="w-5 h-5" /> <span className="sr-only">Delete {teacher.name}</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
             <p className="text-xs text-amber-400 p-2 text-center bg-slate-500/50 rounded-b-md">
                <strong>Security Note:</strong> Passwords are mock-hashed for demonstration and stored in Supabase. 
                This is not secure for real applications. Real hashing should occur server-side.
            </p>
          </div>
        )}
      </section>
    </div>
  );
};

export default CreateUsersPage;