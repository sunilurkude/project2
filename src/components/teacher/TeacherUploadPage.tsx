import React from 'react';
import { InfoRequest, TeacherInfoResponse } from '../../types';

interface TeacherUploadPageProps {
  infoRequests: InfoRequest[];
  existingResponses: TeacherInfoResponse[];
  onAddOrUpdateResponse: (r: TeacherInfoResponse) => void;
  teacherShalarthId: string;
}

const TeacherUploadPage: React.FC<TeacherUploadPageProps> = () => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center text-slate-300">
      <h2 className="text-3xl font-bold tracking-widest uppercase mb-4">Under Construction</h2>
      <p className="text-lg">Form 16 and other files are available shortly</p>
    </div>
  );
};
export default TeacherUploadPage;
