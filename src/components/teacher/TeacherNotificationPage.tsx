import React from 'react';
import { AdminNotification } from '../../types';
import { DocumentTextIcon } from '../icons/FeatureIcons';

interface TeacherNotificationPageProps {
  notifications: AdminNotification[];
}

const TeacherNotificationPage: React.FC<TeacherNotificationPageProps> = ({ notifications }) => {
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold text-slate-100">Notifications</h3>
      {notifications.length === 0 ? (
        <p className="text-slate-400">No new notifications.</p>
      ) : (
        NotificationsList(notifications)
      )}
    </div>
  );
};

const NotificationsList = (notifications: AdminNotification[]) => {
  return notifications.map(n => (
    <div key={n.id} className="p-4 bg-slate-600 rounded-md shadow-sm border border-slate-500">
      <p className="text-slate-200">{n.text}</p>
      <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
        <span>{n.date}</span>
        {n.fileName && n.fileData && (
          <a
            href={n.fileData}
            download={n.fileName}
            className="inline-flex items-center text-sky-400 hover:text-sky-300 bg-slate-700 px-2 py-1 rounded transition-colors"
          >
            <DocumentTextIcon className="w-4 h-4 mr-1" />
            {n.fileName}
          </a>
        )}
      </div>
    </div>
  ));
};

export default TeacherNotificationPage;
