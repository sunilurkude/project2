import React, { useState } from 'react';
import { Challan, Admin } from '../types';
import { DocumentTextIcon } from './icons/FeatureIcons';

interface TDSChallansViewProps {
  challans: Challan[];
  admins: Admin[];
}

const TDSChallansView: React.FC<TDSChallansViewProps> = ({ challans, admins }) => {
  const [selectedAdminId, setSelectedAdminId] = useState<string>('all');

  const filteredChallans = selectedAdminId === 'all' 
    ? challans 
    : challans.filter(c => c.adminId === selectedAdminId);

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-slate-100">TDS Challans Overview</h3>
      
      <div className="bg-slate-600 p-4 rounded-md">
        <label className="block text-sm font-medium text-slate-300 mb-1">Select Admin</label>
        <select value={selectedAdminId} onChange={e => setSelectedAdminId(e.target.value)} className="w-full md:w-1/3 px-3 py-2 bg-slate-500 rounded text-white">
          <option value="all">All Admins</option>
          {admins.map(a => (
            <option key={a.userId} value={a.userId}>{a.name}</option>
          ))}
        </select>
      </div>

      <div className="bg-slate-700 rounded-lg shadow-lg border border-slate-600 overflow-hidden">
        {filteredChallans.length === 0 ? (
          <div className="p-8 text-center text-slate-400">
            No challans found for the selected admin(s).
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-600">
              <thead className="bg-slate-800">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Admin</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Month & FY</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">TAN Details</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Challan File</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-600">
                {filteredChallans.map(c => {
                  const admin = admins.find(a => a.userId === c.adminId);
                  return (
                    <tr key={c.id}>
                      <td className="px-4 py-3 text-sm text-slate-200">{admin?.name || c.adminId}</td>
                      <td className="px-4 py-3 text-sm text-slate-200">
                        {c.month} | {c.fy}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-200">
                        <div className="font-semibold text-white">{c.tanNumber}</div>
                        <div className="text-xs text-slate-400">{c.tanName}</div>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <a href={c.fileData} download={c.fileName} className="inline-flex items-center text-sky-400 hover:text-sky-300 bg-slate-800 px-3 py-1.5 rounded transition-colors group">
                          <DocumentTextIcon className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                          View/Download
                        </a>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default TDSChallansView;
