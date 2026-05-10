
import React from 'react';
import { Admin } from '../types';
// Fix: Import EyeSlashIcon (to be added to FeatureIcons.tsx)
import { TrashIcon, EyeIcon as ShowPasswordIcon, EyeSlashIcon as HidePasswordIcon } from './icons/FeatureIcons'; 

interface AdminListProps {
  admins: Admin[];
  onDeleteAdmin: (adminUserId: string) => void;
}

const AdminList: React.FC<AdminListProps> = ({ admins, onDeleteAdmin }) => {
  const [shownPasswords, setShownPasswords] = React.useState<Record<string, boolean>>({});

  const togglePasswordVisibility = (userId: string) => {
    setShownPasswords(prev => ({ ...prev, [userId]: !prev[userId] }));
  };

  if (admins.length === 0) {
    return <p className="text-slate-400 text-center py-4">No administrators created yet.</p>;
  }

  return (
    <div className="mt-6 flow-root">
        <h4 className="text-lg font-medium text-slate-100 mb-3">Current Administrators</h4>
      <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
          <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg bg-slate-600">
            <table className="min-w-full divide-y divide-slate-500">
              <thead className="bg-slate-500">
                <tr>
                  <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-slate-100 sm:pl-6">User ID</th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-100">Name</th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-100">Email</th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-100">Mobile</th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-100">Password (Mock Hashed)</th>
                  <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6 text-right text-sm font-semibold text-slate-100">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700 bg-slate-600">
                {admins.map((admin) => (
                  <tr key={admin.userId}>
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-slate-200 sm:pl-6">{admin.userId}</td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-300">{admin.name}</td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-300">{admin.email}</td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-300">{admin.mobile}</td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-red-400 font-mono">
                      <div className="flex items-center space-x-2">
                        <span>
                          {shownPasswords[admin.userId] ? admin.passwordHash : '••••••••••'}
                        </span>
                        <button
                          onClick={() => togglePasswordVisibility(admin.userId)}
                          className="text-sky-400 hover:text-sky-300 p-0.5 rounded"
                          title={shownPasswords[admin.userId] ? "Hide password" : "Show password (mock hashed)"}
                        >
                          {shownPasswords[admin.userId] ? <HidePasswordIcon className="w-4 h-4" /> : <ShowPasswordIcon className="w-4 h-4" />}
                           <span className="sr-only">{shownPasswords[admin.userId] ? "Hide password" : "Show password (mock hashed)"}</span>
                        </button>
                      </div>
                    </td>
                    <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                      <button
                        onClick={() => onDeleteAdmin(admin.userId)}
                        className="text-red-400 hover:text-red-300 transition-colors p-1 rounded hover:bg-red-700"
                        title="Delete Admin"
                      >
                        <TrashIcon className="w-5 h-5" />
                        <span className="sr-only">Delete {admin.name}</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="text-xs text-amber-400 p-2 text-center">
                <strong>Security Note:</strong> Passwords are mock-hashed for demonstration and stored in Supabase. 
                This is not secure for real applications. Real hashing should occur server-side.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminList;