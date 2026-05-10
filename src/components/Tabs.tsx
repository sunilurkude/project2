
import React from 'react';
import { UserRole, AdminPage, TeacherPage, ManagerPage, TabItem } from '../types';

interface TabsProps {
  tabs: TabItem[];
  activeTab: UserRole | AdminPage | TeacherPage | ManagerPage;
  onTabChange: (tab: any) => void;
}

const Tabs: React.FC<TabsProps> = ({ tabs, activeTab, onTabChange }) => {
  return (
    <div className="mb-6 border-b border-slate-600">
      <nav className="-mb-px flex space-x-4 overflow-x-auto pb-px" aria-label="Tabs">
        {tabs.map((tab) => (
          <button
            key={tab.value.toString()}
            onClick={() => onTabChange(tab.value)}
            className={`
              group inline-flex items-center py-3 px-1 border-b-2 font-medium text-sm whitespace-nowrap
              transition-colors duration-150 ease-in-out
              ${
                activeTab === tab.value
                  ? 'border-sky-500 text-sky-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-500'
              }
            `}
            aria-current={activeTab === tab.value ? 'page' : undefined}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default Tabs;
