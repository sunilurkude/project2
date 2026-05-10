import React from 'react';
import { InfoRequest } from '../../types';

interface GetDataPageProps {
  infoRequests: InfoRequest[];
  onAddInfoRequest: (r: InfoRequest) => void;
  onDeleteInfoRequest: (id: string) => void;
}

const GetDataPage: React.FC<GetDataPageProps> = () => {
  return <div className="text-slate-300">Get Data Page (Placeholder)</div>;
};
export default GetDataPage;
