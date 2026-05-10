import React, { useState, useRef } from 'react';
import { AdminNotification } from '../../types';
import { TrashIcon, PlusCircleIcon, DocumentTextIcon } from '../icons/FeatureIcons';

interface NotificationPageProps {
  adminId: string;
  notifications: AdminNotification[];
  onAddNotification: (notification: AdminNotification) => void;
  onDeleteNotification: (id: string) => void;
}

const NotificationPage: React.FC<NotificationPageProps> = ({ adminId, notifications, onAddNotification, onDeleteNotification }) => {
  const [text, setText] = useState('');
  const [remarks, setRemarks] = useState('');
  const [fileName, setFileName] = useState('');
  const [fileData, setFileData] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
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
    if (!text) return;
    onAddNotification({
      id: Date.now().toString(),
      adminId,
      date: new Date().toISOString().split('T')[0],
      text,
      remarks,
      fileName,
      fileData,
      uploadedAt: new Date().toISOString()
    });
    setText('');
    setRemarks('');
    setFileName('');
    setFileData('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-slate-100">Notifications</h3>
      <form onSubmit={handleSubmit} className="bg-slate-600 p-4 rounded-md space-y-4">
        <div>
          <label className="block text-sm text-slate-300 mb-1">Notification Message</label>
          <input className="w-full px-3 py-2 bg-slate-500 rounded text-white" required placeholder="Notification message" value={text} onChange={e=>setText(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm text-slate-300 mb-1">Attachment (Optional)</label>
          <input 
            type="file" 
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".xls,.xlsx,.doc,.docx,.png,.jpg,.jpeg,.pdf,.ppt,.pptx"
            className="w-full text-sm text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-sky-600 file:text-white hover:file:bg-sky-700" 
          />
          <p className="text-xs text-slate-400 mt-1">Allowed: Excel, Word, Image, PDF, PPT</p>
        </div>
        <button className="flex items-center px-4 py-2 bg-sky-600 text-white rounded hover:bg-sky-700">
          <PlusCircleIcon className="w-5 h-5 mr-2" /> Add Notification
        </button>
      </form>
      <div className="space-y-2">
        {notifications.map(n => (
          <div key={n.id} className="bg-slate-600 p-3 rounded flex justify-between items-start">
             <div>
               <p className="text-slate-200">{n.text}</p>
               <span className="text-xs text-slate-400">{n.date}</span>
               {n.fileName && n.fileData && (
                 <a href={n.fileData} download={n.fileName} className="mt-2 inline-flex items-center text-sm text-sky-400 hover:text-sky-300 bg-slate-700 px-2 py-1 rounded">
                   <DocumentTextIcon className="w-4 h-4 mr-1" />
                   {n.fileName} (Download)
                 </a>
               )}
             </div>
             <button onClick={() => onDeleteNotification(n.id)} className="text-red-400 hover:text-red-300"><TrashIcon className="w-5 h-5" /></button>
          </div>
        ))}
      </div>
    </div>
  );
};
export default NotificationPage;
