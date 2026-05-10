import React, { useState, useRef } from 'react';
import { Challan } from '../../types';
import { PlusCircleIcon, DocumentTextIcon, TrashIcon } from '../icons/FeatureIcons';

interface EasyTDSFilingPageProps {
  adminId: string;
  challans: Challan[];
  onAddChallan: (newChallan: Challan) => void;
  onDeleteChallan: (challanId: string) => void;
}

const months = [
  'January', 'February', 'March', 'April', 'May', 'June', 
  'July', 'August', 'September', 'October', 'November', 'December'
];

const currentYear = new Date().getFullYear();
const fyYears = Array.from({ length: 11 }, (_, i) => {
  const startYear = 2020 + i;
  return `${startYear}-${(startYear + 1).toString().slice(-2)}`;
});

const EasyTDSFilingPage: React.FC<EasyTDSFilingPageProps> = ({ adminId, challans, onAddChallan, onDeleteChallan }) => {
  const [month, setMonth] = useState<string>(months[new Date().getMonth()]);
  const [fy, setFy] = useState<string>(fyYears[new Date().getFullYear() - 2020] || fyYears[0]);
  const [tanNumber, setTanNumber] = useState('');
  const [tanName, setTanName] = useState('');
  const [fileName, setFileName] = useState('');
  const [fileData, setFileData] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const adminChallans = challans.filter(c => c.adminId === adminId);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFileData(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tanNumber || !tanName || !fileData) return;

    onAddChallan({
      id: Date.now().toString(),
      adminId,
      month,
      fy,
      tanNumber,
      tanName,
      fileName,
      fileData,
      uploadedAt: new Date().toISOString()
    });

    setTanNumber('');
    setTanName('');
    setFileName('');
    setFileData('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-slate-100">Easy TDS Filing (Data Collection)</h3>
      <form onSubmit={handleSubmit} className="bg-slate-600 p-4 rounded-md space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-slate-300 mb-1">Challan Month</label>
            <select value={month} onChange={e => setMonth(e.target.value)} className="w-full px-3 py-2 bg-slate-500 rounded text-white">
              {months.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-1">Financial Year (FY)</label>
            <select value={fy} onChange={e => setFy(e.target.value)} className="w-full px-3 py-2 bg-slate-500 rounded text-white">
              {fyYears.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-1">TAN Number</label>
            <input required type="text" className="w-full px-3 py-2 bg-slate-500 rounded text-white" value={tanNumber} onChange={e => setTanNumber(e.target.value)} placeholder="TAN Number" />
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-1">TAN Name</label>
            <input required type="text" className="w-full px-3 py-2 bg-slate-500 rounded text-white" value={tanName} onChange={e => setTanName(e.target.value)} placeholder="TAN Name" />
          </div>
        </div>
        <div>
          <label className="block text-sm text-slate-300 mb-1">Challan Upload</label>
          <input 
            required 
            type="file" 
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".pdf,.png,.jpg,.jpeg"
            className="w-full text-sm text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-sky-600 file:text-white hover:file:bg-sky-700" 
          />
          <p className="text-xs text-slate-400 mt-1">Allowed: PDF, Images</p>
        </div>
        <button className="flex items-center px-4 py-2 bg-sky-600 text-white rounded hover:bg-sky-700">
          <PlusCircleIcon className="w-5 h-5 mr-2" /> Upload Challan
        </button>
      </form>

      <div className="space-y-4">
        <h4 className="text-lg font-medium text-slate-200">My Uploaded Challans</h4>
        {adminChallans.length === 0 ? (
          <p className="text-slate-400">No challans uploaded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-slate-700 rounded-lg overflow-hidden shadow-lg border border-slate-600">
              <thead className="bg-slate-800">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Month / FY</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">TAN</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">File</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-600">
                {adminChallans.map(c => (
                  <tr key={c.id}>
                    <td className="px-4 py-3 text-sm text-slate-200">{c.month} - {c.fy}</td>
                    <td className="px-4 py-3 text-sm text-slate-200">
                      <div className="font-medium text-white">{c.tanNumber}</div>
                      <div className="text-xs text-slate-400">{c.tanName}</div>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <a href={c.fileData} download={c.fileName} className="inline-flex items-center text-sky-400 hover:text-sky-300">
                        <DocumentTextIcon className="w-4 h-4 mr-1" />
                        {c.fileName}
                      </a>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <button onClick={() => onDeleteChallan(c.id)} className="text-red-400 hover:text-red-300">
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default EasyTDSFilingPage;
