
import React from 'react';

interface IconProps {
  className?: string;
  [key: string]: any;
}

const BaseIcon: React.FC<IconProps & { children: React.ReactNode }> = ({ className = "w-6 h-6", children, ...props }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    fill="none" 
    viewBox="0 0 24 24" 
    strokeWidth={1.5} 
    stroke="currentColor" 
    className={className} 
    {...props}
  >
    {children}
  </svg>
);

export const UserIcon: React.FC<IconProps> = (props) => (
  <BaseIcon {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
  </BaseIcon>
);

export const CogIcon: React.FC<IconProps> = (props) => (
  <BaseIcon {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12a7.5 7.5 0 0015 0m-15 0a7.5 7.5 0 1115 0m-15 0H3m16.5 0H21m-1.5 0H12m-6.375 0H4.5m.75 4.5l.75.75M4.5 12l-.75.75M12 12l-.75-.75m.75.75l.75-.75m7.5 4.5l-.75.75M19.5 12l.75.75M12 12l.75.75m-.75-.75l-.75.75" />
  </BaseIcon>
);

export const BuildingOfficeIcon: React.FC<IconProps> = (props) => (
  <BaseIcon {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18m-9-14.25h6M9 12h6m-6 5.25h6" />
  </BaseIcon>
);

export const SearchCircleIcon: React.FC<IconProps> = (props) => (
  <BaseIcon {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
  </BaseIcon>
);

export const TrashIcon: React.FC<IconProps> = (props) => (
  <BaseIcon {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79" />
  </BaseIcon>
);

export const EyeIcon: React.FC<IconProps> = (props) => (
  <BaseIcon {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </BaseIcon>
);

export const EyeSlashIcon: React.FC<IconProps> = (props) => (
  <BaseIcon {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
  </BaseIcon>
);

export const LogoutIcon: React.FC<IconProps> = (props) => (
  <BaseIcon {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
  </BaseIcon>
);

export const DocumentTextIcon: React.FC<IconProps> = (props) => (
  <BaseIcon {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
  </BaseIcon>
);

export const BellIcon: React.FC<IconProps> = (props) => (
  <BaseIcon {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
  </BaseIcon>
);

export const UploadCloudIcon: React.FC<IconProps> = (props) => (
  <BaseIcon {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.338-2.32 5.75 5.75 0 011.344 9.346M3.75 14.25a4.5 4.5 0 008.497-3.23" />
  </BaseIcon>
);

export const UserGroupIcon: React.FC<IconProps> = (props) => (
  <BaseIcon {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-3.741-5.458M12 15.75a3 3 0 01-3-3A3 3 0 0112 9.75v1.5a2.25 2.25 0 00-2.25-2.25H7.5a2.25 2.25 0 00-2.25 2.25v2.25M12 15.75A2.25 2.25 0 0114.25 18v2.25a2.25 2.25 0 01-2.25 2.25M12 15.75a2.25 2.25 0 00-2.25 2.25M15 13.5a3 3 0 11-6 0 3 3 0 016 0z" />
  </BaseIcon>
);

export const ShieldCheckIcon: React.FC<IconProps> = (props) => (
  <BaseIcon {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751A11.959 11.959 0 0115 2.714" />
  </BaseIcon>
);

export const ArrowDownTrayIcon: React.FC<IconProps> = (props) => (
  <BaseIcon {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
  </BaseIcon>
);

export const DocumentDownloadIcon: React.FC<IconProps> = (props) => (
  <BaseIcon {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m.154 9.185l3.608 3.517a.75.75 0 001.078 0l3.608-3.517M12 4.5v12.75" />
  </BaseIcon>
);

export const FileArrowUpIcon: React.FC<IconProps> = (props) => (
  <BaseIcon {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5m-1.5 0V9.75m0 0l-1.5 1.5m1.5-1.5l1.5 1.5M19.5 14.25v2.625a3.375 3.375 0 003.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25M9 19.5h6" />
  </BaseIcon>
);

export const UserPlusIcon: React.FC<IconProps> = (props) => (
  <BaseIcon {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
  </BaseIcon>
);

export const PlusCircleIcon: React.FC<IconProps> = (props) => (
  <BaseIcon {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
  </BaseIcon>
);

export const MinusCircleIcon: React.FC<IconProps> = (props) => (
  <BaseIcon {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
  </BaseIcon>
);

export const CurrencyDollarIcon: React.FC<IconProps> = (props) => (
  <BaseIcon {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 11.219 12.768 11 12 11c-.768 0-1.536.219-2.121.727l-.879.659" />
  </BaseIcon>
);

export const InboxInIcon: React.FC<IconProps> = (props) => (
  <BaseIcon {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a2.25 2.25 0 00-2.25 2.25v1.5a2.25 2.25 0 002.25 2.25h9.75m-9.75 0" />
  </BaseIcon>
);

export const PencilIcon: React.FC<IconProps> = (props) => (
  <BaseIcon {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
  </BaseIcon>
);

export const CheckCircleIcon: React.FC<IconProps> = (props) => (
  <BaseIcon {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </BaseIcon>
);

export const PrinterIcon: React.FC<IconProps> = (props) => (
  <BaseIcon {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18" />
  </BaseIcon>
);

export const CloudUploadIconTeacher: React.FC<IconProps> = (props) => (
  <BaseIcon {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
  </BaseIcon>
);

export const UserCircleIcon: React.FC<IconProps> = (props) => (
  <BaseIcon {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
  </BaseIcon>
);

export const DevicePhoneMobileIcon: React.FC<IconProps> = (props) => (
  <BaseIcon {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
  </BaseIcon>
);

export const BanknotesIcon: React.FC<IconProps> = (props) => (
  <BaseIcon {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5M3.75 21.75V15m16.5 6.75V15" />
  </BaseIcon>
);

export const EnvelopeIcon: React.FC<IconProps> = (props) => (
  <BaseIcon {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
  </BaseIcon>
);

export const AcademicCapIcon: React.FC<IconProps> = (props) => (
  <BaseIcon {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.174L12 14.39l7.74-4.216M12 4.5l8.25 4.5-8.25 4.5-8.25-4.5L12 4.5zm0 9.75a2.25 2.25 0 002.25 2.25H12a2.25 2.25 0 00-2.25-2.25V14.25h4.5v.75z" />
  </BaseIcon>
);

export const IdentificationIcon: React.FC<IconProps> = (props) => (
  <BaseIcon {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zm6-10.125a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0zm1.294 6.336a6.721 6.721 0 01-3.17.789 6.721 6.721 0 01-3.168-.789 3.376 3.376 0 016.338 0z" />
  </BaseIcon>
);

export const BuildingLibraryIcon: React.FC<IconProps> = (props) => (
  <BaseIcon {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21V10.5M8.25 21v-1.5a3.75 3.75 0 117.5 0V21m-7.5-10.5h7.5M3.375 21h17.25M12 3L3 10.5h18L12 3z" />
  </BaseIcon>
);

export const MapPinIcon: React.FC<IconProps> = (props) => (
  <BaseIcon {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
  </BaseIcon>
);

export const HashtagIcon: React.FC<IconProps> = (props) => (
  <BaseIcon {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 8.25h15m-16.5 7.5h15m-1.875-12l-1.5 16.5m-4.5-16.5l-1.5 16.5" />
  </BaseIcon>
);

export const CreditCardIcon: React.FC<IconProps> = (props) => (
  <BaseIcon {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
  </BaseIcon>
);

export const SparklesIcon: React.FC<IconProps> = (props) => (
  <BaseIcon {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
  </BaseIcon>
);
