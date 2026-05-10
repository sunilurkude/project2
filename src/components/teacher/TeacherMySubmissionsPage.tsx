import React from 'react';
import { InfoRequest, TeacherInfoResponse } from '../../types';

interface TeacherMySubmissionsPageProps {
  teacherResponses: TeacherInfoResponse[];
  infoRequests: InfoRequest[];
}

const TeacherMySubmissionsPage: React.FC<TeacherMySubmissionsPageProps> = () => {
  return <div className="text-slate-300">My Submissions Page (Placeholder)</div>;
};
export default TeacherMySubmissionsPage;
