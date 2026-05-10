import React, { useState } from 'react';
import { Admin } from '../types';
import { PlusCircleIcon } from './icons/FeatureIcons';

interface CreateAdminFormProps {
  onCreateAdmin: (newAdmin: Admin) => Promise<void> | void;
}

const CreateAdminForm: React.FC<CreateAdminFormProps> = ({ onCreateAdmin }) => {
  const [userId, setUserId] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!userId || !name || !email || !mobile || !password) {
      setError('All fields are required.');
      return;
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    // Validate mobile number format
    const mobileRegex = /^\d{10}$/;
    if (!mobileRegex.test(mobile)) {
      setError('Mobile number must be exactly 10 digits.');
      return;
    }

    try {
      await onCreateAdmin({
        userId,
        name,
        email,
        mobile,
        passwordHash: password,
      });

      setSuccess(`Admin ${name} created successfully.`);
      setUserId('');
      setName('');
      setEmail('');
      setMobile('');
      setPassword('');
    } catch (err: any) {
      setError(err.message || 'Failed to create admin');
    }
  };

  return (
    <div className="bg-slate-600 p-4 rounded-md">
      <h3 className="text-lg font-medium text-slate-100 mb-4">Create New Administrator</h3>
      {error && <div className="text-red-400 text-sm mb-2">{error}</div>}
      {success && <div className="text-green-400 text-sm mb-2">{success}</div>}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input className="px-3 py-2 bg-slate-500 rounded text-white" placeholder="User ID" value={userId} onChange={e=>setUserId(e.target.value)} />
        <input className="px-3 py-2 bg-slate-500 rounded text-white" placeholder="Name" value={name} onChange={e=>setName(e.target.value)} />
        <input className="px-3 py-2 bg-slate-500 rounded text-white" placeholder="Email" type="email" value={email} onChange={e=>setEmail(e.target.value)} />
        <input className="px-3 py-2 bg-slate-500 rounded text-white" placeholder="Mobile" value={mobile} onChange={e=>setMobile(e.target.value)} maxLength={10} onInput={(e) => e.currentTarget.value = e.currentTarget.value.replace(/\D/g, '')} />
        <input className="px-3 py-2 bg-slate-500 rounded text-white" placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
        <button className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded flex items-center justify-center">
            <PlusCircleIcon className="w-5 h-5 mr-2" /> Create Admin
        </button>
      </form>
    </div>
  );
};
export default CreateAdminForm;
