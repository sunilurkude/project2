export enum UserRole {
  Manager = 'manager',
  Admin = 'admin',
  Teacher = 'teacher',
}

export interface Admin {
  userId: string;
  passwordHash: string; // SHA-256 hashed password
  name: string;
  email: string;
  mobile: string;
}

export interface Teacher {
  adminId: string;
  shalarthId: string;
  name: string;
  mobile: string;
  passwordHash: string; // SHA-256 hashed (fallback login)
  pin_hashed?: string; // 4-digit PIN hashed (SHA-256)
  adharHash?: string; // Hashed Aadhaar number for verification
  isRegistered?: boolean;
  id: string; // Unique identifier for React keys etc.
  dob?: string;
  // Optional profile details for Teacher Home Page
  bankDetails?: string; 
  emailId?: string; 
  schoolDetails?: string; 
  gpfNo?: string;
  panNo?: string;
  pranNo?: string;
  adharNo?: string; // The "masked" version or legacy
  bankIfscCode?: string;
  branchName?: string;
  payMatrix?: string;
  schoolDdoCode?: string;
  designation?: string;
}

export interface LoggedInUser {
  role: UserRole;
  username: string; // For Manager/Admin this is userId, for Teacher this is shalarthId
}

export interface TabItem {
  label: string;
  value: UserRole | AdminPage | TeacherPage | ManagerPage; // Updated to include ManagerPage
  icon?: React.ReactNode;
}

// Represents a master uploaded Excel file record
export interface Paybill {
  id: string;
  adminId: string;
  month: string;
  year: string;
  remarks: string;
  fileName: string;
  uploadedAt: string;
  // Store original headers from this specific Excel file
  // This is a bit redundant if we store headers with each MonthlyTeacherSalaryData,
  // but could be useful for a quick check of the master file's structure.
  // For now, let's assume headers are part of MonthlyTeacherSalaryData.
}

export interface AdminNotification {
  id: string;
  adminId: string;
  date: string;
  text: string;
  remarks: string;
  fileName?: string;
  fileData?: string;
  uploadedAt: string;
}

export interface InfoRequest {
  id: string;
  adminId: string;
  subject: string;
  columnHeaders: string[];
  createdAt: string;
}

export interface TeacherInfoResponseData {
  [key: string]: string; // Stores data as {columnHeader: value}
}

export interface TeacherInfoResponse {
  id: string; // Unique ID for the response itself
  requestId: string; // Links to InfoRequest.id
  teacherShalarthId: string;
  responseData: TeacherInfoResponseData;
  submittedAt: string;
  lastUpdatedAt?: string;
}

// Stores parsed salary data for a single teacher for a single month
export interface MonthlyTeacherSalaryData {
  id: string; // Unique ID for this record, e.g., `${year}-${month}-${teacherShalarthId}`
  adminId: string;
  month: string;
  year: string;
  teacherShalarthId: string;
  rawHeaders: string[]; // The header row from the specific Excel file this data came from
  rawDataRow: (string | number | null)[]; // The raw data row for this teacher from that Excel
  // salaryDetails: Record<string, string | number | null>; // Parsed key-value pairs from Excel, header:value
}

export type SalaryDetailRow = Record<string, string | number | null>;


export interface Challan {
  id: string;
  adminId: string;
  month: string;
  fy: string;
  tanNumber: string;
  tanName: string;
  fileName: string;
  fileData: string;
  uploadedAt: string;
}

export enum AdminPage {
  Paybill = 'paybill',
  Notifications = 'notifications',
  GetData = 'getData', 
  CreateUsers = 'createUsers',
  TDSFiling = 'tdsFiling',
  ViewPayslip = 'viewPayslip',
  Download = 'download', // Added new page for Admin
}

export enum TeacherPage {
  Home = 'home',
  PayslipDownload = 'payslipDownload',
  Notifications = 'notifications', 
  UploadInfo = 'uploadInfo', 
  IncomeTax = 'incomeTax',
  TaxCalculator = 'taxCalculator',
  MySubmissions = 'mySubmissions',
}

export enum ManagerPage {
  Administrators = 'administrators',
  Notifications = 'notifications',
  GetData = 'getData',
  Download = 'download',
  TDSChallans = 'tdsChallans',
}

// For mapping payslip fields to Excel columns
export type PayslipFieldCategory = 'headerInfo' | 'emolument' | 'govtRecovery' | 'nonGovtRecovery' | 'summaryField';

export interface PayslipFieldMapping {
  payslipLabel: string; // Label as it appears on the target payslip format
  excelHeaderCandidates: string[]; // Potential headers in the Excel file
  category: PayslipFieldCategory;
  isCurrency?: boolean; // Should the value be formatted as currency?
  isTotal?: boolean; // Is this a calculated total field? (e.g. Total Emoluments)
  valueKey?: keyof Teacher; // To directly map to a Teacher object field (e.g. name, shalarthId)
}

// For Admin Download Page
export enum AdminReportType {
  GPFDeduction = 'GPF Deduction List',
  NPSDeduction = 'NPS Deduction List',
  CreditSociety = 'Credit Society List',
  BankList = 'Bank List',
  IncomeTax = 'Income Tax List',
  OfflinePaybill = 'Offline Paybill',
}

export interface ReportColumn {
  key: string; // Corresponds to a unique identifier for the data, often derived from excelHeaderCandidates
  label: string; // Display label for the table header and Excel header
  isNumeric?: boolean; // Hint for formatting
  isMonetary?: boolean; // Specifically for monetary values that need specific formatting
  dataPath?: string; // For nested data, if any
}

export type GeneratedReportDataRow = Record<string, string | number | null>;

export interface GeneratedReport {
  columns: ReportColumn[];
  data: GeneratedReportDataRow[];
  grandTotalRow?: GeneratedReportDataRow | null;
  subtotalGroups?: {
    groupKey: string; // e.g., DDO Code
    groupName: string; // e.g., School Name for display in subtotal
    data: GeneratedReportDataRow[];
    subtotalRow: GeneratedReportDataRow;
  }[];
  reportType: AdminReportType;
  month: string;
  year: string;
}