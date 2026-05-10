import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
import {
  UserRole,
  Teacher,
  Paybill,
  AdminNotification,
  InfoRequest,
  TeacherInfoResponse,
  MonthlyTeacherSalaryData,
  Challan,
  LoggedInUser,
  AuditLog,
} from "../types";
import { DEFAULT_PAYSLIP_MAPPINGS } from "../constants";
import { hashData } from "../utils/authUtils";
import { sortSalaryDataByDateDesc } from "../utils/sortUtils";
import { supabase } from "../supabaseClient";

// Helper for paginated fetch
const fetchAllRows = async (tableName: string, filters: { column: string; value: string }[] = []) => {
  let allData: any[] = [];
  let from = 0;
  const limit = 1000;
  let hasMore = true;

  while (hasMore) {
    let query = supabase.from(tableName).select("*");
    filters.forEach((f) => { query = query.eq(f.column, f.value); });
    query = query.order('id', { ascending: true });
    const { data, error } = await query.range(from, from + limit - 1);
    if (error) { console.error(`Pagination fetch error for ${tableName}:`, error); break; }
    if (data && data.length > 0) {
      allData = allData.concat(data);
      from += limit;
      if (data.length < limit) hasMore = false;
    } else {
      hasMore = false;
    }
  }
  return { data: allData };
};

interface DataContextValue {
  teachers: Teacher[];
  paybills: Paybill[];
  monthlySalaryDataList: MonthlyTeacherSalaryData[];
  latestSalaryDataForCurrentTeacher: MonthlyTeacherSalaryData | null;
  adminNotifications: AdminNotification[];
  infoRequests: InfoRequest[];
  teacherInfoResponses: TeacherInfoResponse[];
  challans: Challan[];
  auditLogs: AuditLog[];

  // CRUD operations
  handleAddAuditLog: (action: string, details: string) => Promise<void>;
  handleCreateTeachers: (newTeachers: Teacher[]) => Promise<void>;
  handleDeleteTeacher: (shalarthId: string) => Promise<void>;
  handleProcessPaybillUpload: (
    paybillMeta: Omit<Paybill, "id" | "uploadedAt">,
    parsedExcelData: { headers: string[]; rows: { shalarthId: string; dataRow: (string | number | null)[] }[] },
  ) => Promise<void>;
  handleDeletePaybill: (paybillId: string) => Promise<void>;
  handleAddAdminNotification: (newNotification: AdminNotification) => Promise<void>;
  handleDeleteAdminNotification: (notificationId: string) => Promise<void>;
  handleAddInfoRequest: (newRequest: InfoRequest) => Promise<void>;
  handleDeleteInfoRequest: (requestId: string) => Promise<void>;
  handleAddOrUpdateTeacherInfoResponse: (response: TeacherInfoResponse) => Promise<void>;
  handleAddChallan: (newChallan: Challan) => Promise<void>;
  handleDeleteChallan: (id: string) => Promise<void>;

  // Verification helpers (used by registration)
  getLatestSalaryRecord: (shalarthId: string) => Promise<MonthlyTeacherSalaryData | null>;
  onVerifyShalarth: (shalarthId: string) => Promise<{ found: boolean; registered: boolean }>;
  onVerifyMobile: (shalarthId: string, mobile: string) => Promise<boolean>;
  onVerifyAadhaar: (shalarthId: string, aadhaar: string) => Promise<boolean>;
  onVerifyPan: (shalarthId: string, pan: string) => Promise<boolean>;
  onVerifyFullDetails: (details: { shalarthId: string; pan: string; mobile: string; email: string }) => Promise<boolean>;

  // Registration
  onRegister: (shalarthId: string, pin: string) => Promise<void>;
}

const DataContext = createContext<DataContextValue | null>(null);

export const useData = (): DataContextValue => {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within DataProvider");
  return ctx;
};

interface DataProviderProps {
  children: ReactNode;
  loggedInUser: LoggedInUser | null;
  onError: (msg: string) => void;
  onSuccess: (msg: string | null) => void;
}

export const DataProvider = ({ children, loggedInUser, onError, onSuccess }: DataProviderProps) => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [paybills, setPaybills] = useState<Paybill[]>([]);
  const [monthlySalaryDataList, setMonthlySalaryDataList] = useState<MonthlyTeacherSalaryData[]>([]);
  const [latestSalaryDataForCurrentTeacher, setLatestSalaryDataForCurrentTeacher] = useState<MonthlyTeacherSalaryData | null>(null);
  const [adminNotifications, setAdminNotifications] = useState<AdminNotification[]>([]);
  const [infoRequests, setInfoRequests] = useState<InfoRequest[]>([]);
  const [teacherInfoResponses, setTeacherInfoResponses] = useState<TeacherInfoResponse[]>([]);
  const [challans, setChallans] = useState<Challan[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  // Load data when user logs in/out
  useEffect(() => {
    const loadInitialData = async () => {
      if (!loggedInUser) {
        setTeachers([]);
        setPaybills([]);
        setMonthlySalaryDataList([]);
        setAdminNotifications([]);
        setInfoRequests([]);
        setTeacherInfoResponses([]);
        setAuditLogs([]);
        return;
      }

      try {
        const filters: Record<string, { column: string; value: string }[]> = {
          teachers: [],
          paybills: [],
          salaryData: [],
          notifications: [],
          infoRequests: [],
          infoResponses: [],
          challans: [],
          auditLogs: [],
        };

        if (loggedInUser.role === UserRole.Admin) {
          const adminId = loggedInUser.username;
          filters.teachers.push({ column: "admin_id", value: adminId });
          filters.paybills.push({ column: "admin_id", value: adminId });
          filters.salaryData.push({ column: "admin_id", value: adminId });
          filters.notifications.push({ column: "admin_id", value: adminId });
          filters.infoRequests.push({ column: "admin_id", value: adminId });
          filters.challans.push({ column: "admin_id", value: adminId });
          filters.auditLogs.push({ column: "admin_id", value: adminId });
        } else if (loggedInUser.role === UserRole.Teacher) {
          const sid = loggedInUser.username;
          filters.teachers.push({ column: "shalarth_id", value: sid });
          filters.salaryData.push({ column: "teacher_shalarth_id", value: sid });
          filters.infoResponses.push({ column: "teacher_shalarth_id", value: sid });

          const { data: currentTeacher } = await supabase
            .from("teachers").select("admin_id").eq("shalarth_id", sid).single();
          if (currentTeacher?.admin_id) {
            filters.notifications.push({ column: "admin_id", value: currentTeacher.admin_id });
            filters.infoRequests.push({ column: "admin_id", value: currentTeacher.admin_id });
          }
        }

        const [dbTeachers, dbPaybills, dbSalaryData, dbNotifications, dbInfoRequests, dbInfoResponses, dbChallans, dbAuditLogs] =
          await Promise.all([
            fetchAllRows("teachers", filters.teachers),
            fetchAllRows("paybills", filters.paybills),
            fetchAllRows("salary_data", filters.salaryData),
            fetchAllRows("notifications", filters.notifications),
            fetchAllRows("info_requests", filters.infoRequests),
            fetchAllRows("info_responses", filters.infoResponses),
            fetchAllRows("challans", filters.challans),
            fetchAllRows("audit_logs", filters.auditLogs),
          ]);

        if (dbTeachers.data) setTeachers(dbTeachers.data.map((t: any) => ({
          id: t.id, adminId: t.admin_id, shalarthId: t.shalarth_id, name: t.name,
          schoolDetails: t.school_name || "", dob: t.dob || "", mobile: t.mobile || "",
          emailId: t.email || "", isRegistered: t.is_registered, pin_hashed: t.pin_hashed || "",
          passwordHash: t.password_hash || "",
        })));
        if (dbPaybills.data) setPaybills(dbPaybills.data.map((p: any) => ({
          id: p.id, adminId: p.admin_id, month: p.month, year: p.year,
          remarks: p.remarks || "", fileName: p.file_name || "", uploadedAt: p.uploaded_at,
        })));
        if (dbSalaryData.data) setMonthlySalaryDataList(dbSalaryData.data.map((d: any) => ({
          id: d.id, adminId: d.admin_id, month: d.month, year: d.year,
          teacherShalarthId: d.teacher_shalarth_id, rawHeaders: d.raw_headers, rawDataRow: d.raw_data_row,
        })));
        if (dbNotifications.data) setAdminNotifications(dbNotifications.data.map((n: any) => ({
          id: n.id, adminId: n.admin_id, date: n.date, text: n.text, remarks: n.remarks || "",
          fileName: n.file_name, fileData: n.file_data, uploadedAt: n.uploaded_at,
        })));
        if (dbInfoRequests.data) setInfoRequests(dbInfoRequests.data.map((ir: any) => ({
          id: ir.id, adminId: ir.admin_id, subject: ir.subject, columnHeaders: ir.column_headers,
          createdAt: ir.created_at,
        })));
        if (dbInfoResponses.data) setTeacherInfoResponses(dbInfoResponses.data.map((ir: any) => ({
          id: ir.id, requestId: ir.request_id, teacherShalarthId: ir.teacher_shalarth_id,
          responseData: ir.data, submittedAt: ir.submitted_at,
        })));
        if (dbChallans.data) setChallans(dbChallans.data.map((c: any) => ({
          id: c.id, adminId: c.admin_id, month: c.month, fy: c.fy, tanNumber: c.tan_number,
          tanName: c.tan_name, fileName: c.file_name, fileData: c.file_data, uploadedAt: c.uploaded_at,
        })));
        if (dbAuditLogs.data) setAuditLogs(dbAuditLogs.data.map((a: any) => ({
          id: a.id, action: a.action, details: a.details, userId: a.user_id,
          userName: a.user_name, userRole: a.user_role, adminId: a.admin_id, createdAt: a.created_at,
        })).sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      } catch (err) {
        console.error("Error loading data from Supabase:", err);
        onError("Failed to load data from Supabase.");
      }
    };
    loadInitialData();
  }, [loggedInUser]);

  // Latest salary for current teacher
  useEffect(() => {
    if (loggedInUser?.role === UserRole.Teacher && monthlySalaryDataList.length > 0) {
      const teacherData = sortSalaryDataByDateDesc(
        monthlySalaryDataList.filter((d) => d.teacherShalarthId === loggedInUser.username)
      );
      setLatestSalaryDataForCurrentTeacher(teacherData.length > 0 ? teacherData[0] : null);
    } else {
      setLatestSalaryDataForCurrentTeacher(null);
    }
  }, [loggedInUser, monthlySalaryDataList]);

  // ---- CRUD Handlers ----

  const handleAddAuditLog = useCallback(async (action: string, details: string) => {
    if (!loggedInUser) return;
    try {
      const newLog = {
        id: crypto.randomUUID(),
        action,
        details,
        user_id: loggedInUser.username,
        user_name: loggedInUser.username,
        user_role: loggedInUser.role,
        admin_id: loggedInUser.role === UserRole.Admin ? loggedInUser.username : null,
      };
      const { error } = await supabase.from('audit_logs').insert([newLog]);
      if (error) throw error;
      if (loggedInUser.role !== UserRole.Teacher) {
        setAuditLogs(prev => [{ ...newLog, adminId: newLog.admin_id, userId: newLog.user_id, userName: newLog.user_name, userRole: newLog.user_role, createdAt: new Date().toISOString() }, ...prev]);
      }
    } catch (err) {
      console.error("Failed to add audit log", err);
    }
  }, [loggedInUser]);

  const handleAddChallan = useCallback(async (newChallan: Challan) => {
    try {
      const { error } = await supabase.from('challans').insert([{
        id: newChallan.id, admin_id: newChallan.adminId, month: newChallan.month,
        fy: newChallan.fy, tan_number: newChallan.tanNumber, tan_name: newChallan.tanName,
        file_name: newChallan.fileName, file_data: newChallan.fileData, uploaded_at: newChallan.uploadedAt,
      }]);
      if (error) throw error;
      setChallans((prev) => [newChallan, ...prev]);
      handleAddAuditLog('ADD_CHALLAN', `Added TDS Challan for ${newChallan.fy} - ${newChallan.month}`);
    } catch (err) { console.error("Failed to add challan", err); }
  }, [handleAddAuditLog]);

  const handleDeleteChallan = useCallback(async (id: string) => {
    try {
      const { error } = await supabase.from('challans').delete().eq('id', id);
      if (error) throw error;
      setChallans((prev) => prev.filter((c) => c.id !== id));
      handleAddAuditLog('DELETE_CHALLAN', `Deleted TDS Challan ID: ${id}`);
    } catch (err) { console.error("Failed to delete challan", err); }
  }, [handleAddAuditLog]);

  const getLatestSalaryRecord = useCallback(async (shalarthId: string): Promise<MonthlyTeacherSalaryData | null> => {
    if (loggedInUser && monthlySalaryDataList.length > 0) {
      const teacherData = sortSalaryDataByDateDesc(
        monthlySalaryDataList.filter((d) => d.teacherShalarthId === shalarthId)
      );
      if (teacherData.length > 0) return teacherData[0];
    }
    const { data: dbSalaryData } = await supabase.from("salary_data").select("*").eq("teacher_shalarth_id", shalarthId);
    if (dbSalaryData && dbSalaryData.length > 0) {
      const mappedData: MonthlyTeacherSalaryData[] = dbSalaryData.map((d: any) => ({
        id: d.id, adminId: d.admin_id, month: d.month, year: d.year,
        teacherShalarthId: d.teacher_shalarth_id, rawHeaders: d.raw_headers, rawDataRow: d.raw_data_row,
      }));
      const sorted = sortSalaryDataByDateDesc(mappedData);
      return sorted[0];
    }
    return null;
  }, [loggedInUser, monthlySalaryDataList]);

  const onVerifyShalarth = async (shalarthId: string): Promise<{ found: boolean; registered: boolean }> => {
    const latest = await getLatestSalaryRecord(shalarthId);
    if (!latest) return { found: false, registered: false };
    let isReg = false;
    const { data: teacherRec } = await supabase.from("teachers").select("is_registered").eq("shalarth_id", shalarthId).single();
    if (teacherRec) {
      isReg = teacherRec.is_registered;
    } else {
      isReg = teachers.some((t) => t.shalarthId === shalarthId && t.isRegistered);
    }
    return { found: true, registered: isReg };
  };

  const onVerifyMobile = async (shalarthId: string, mobile: string): Promise<boolean> => {
    const latest = await getLatestSalaryRecord(shalarthId);
    if (!latest) return false;
    const mobileMapping = DEFAULT_PAYSLIP_MAPPINGS.find((m) => m.payslipLabel === "MOB NO");
    let idx = -1;
    if (mobileMapping) {
      const norm = (h: string) => String(h).toLowerCase().replace(/[\s._\-\/()]/g, "");
      idx = latest.rawHeaders.findIndex((h) => norm(h) === norm(mobileMapping.payslipLabel));
    }
    if (idx !== -1 && idx < latest.rawDataRow.length) {
      const storedMobile = String(latest.rawDataRow[idx]).replace(/\D/g, "").slice(-10);
      const inputMobile = mobile.replace(/\D/g, "").slice(-10);
      if (storedMobile.length >= 10 && storedMobile === inputMobile) return true;
    }
    const backupIdx = latest.rawHeaders.findIndex((h) => {
      const head = String(h).toUpperCase();
      return head.includes("MOB") || head.includes("PHONE") || head.includes("CONTACT");
    });
    if (backupIdx !== -1) {
      const storedMobile = String(latest.rawDataRow[backupIdx]).replace(/\D/g, "").slice(-10);
      const inputMobile = mobile.replace(/\D/g, "").slice(-10);
      return storedMobile.length >= 10 && storedMobile === inputMobile;
    }
    return false;
  };

  const onVerifyAadhaar = async (shalarthId: string, aadhaar: string): Promise<boolean> => {
    const latest = await getLatestSalaryRecord(shalarthId);
    if (!latest) return false;
    const aadhaarMapping = DEFAULT_PAYSLIP_MAPPINGS.find((m) => m.payslipLabel === "ADHAR NO");
    if (!aadhaarMapping) return false;
    const norm = (h: string) => String(h).toLowerCase().replace(/[\s._\-\/()]/g, "");
    const idx = latest.rawHeaders.findIndex((h) => norm(h) === norm(aadhaarMapping.payslipLabel));
    if (idx !== -1) {
      const storedAadhaar = String(latest.rawDataRow[idx]).trim().replace(/\D/g, "");
      const inputAadhaar = aadhaar.trim().replace(/\D/g, "");
      return !!storedAadhaar && storedAadhaar === inputAadhaar;
    }
    return false;
  };

  const onVerifyFullDetails = async (details: { shalarthId: string; pan: string; mobile: string; email: string }): Promise<boolean> => {
    const latest = await getLatestSalaryRecord(details.shalarthId);
    if (!latest) return false;
    const normalize = (val: string) => val.trim().toUpperCase().replace(/[\s-]/g, "");
    const findIdx = (keywords: string[]) => latest.rawHeaders.findIndex((h) =>
      keywords.some((k) => String(h).toUpperCase().includes(k)));
    const panIdx = findIdx(["PAN"]);
    const mobileIdx = findIdx(["MOBILE", "PHONE", "CONTACT"]);
    const emailIdx = findIdx(["EMAIL", "E-MAIL"]);
    if (panIdx !== -1 && normalize(String(latest.rawDataRow[panIdx])) !== normalize(details.pan)) return false;
    if (mobileIdx !== -1) {
      const storedMobile = String(latest.rawDataRow[mobileIdx]).replace(/\D/g, "").slice(-10);
      if (storedMobile !== details.mobile.replace(/\D/g, "").slice(-10)) return false;
    }
    if (emailIdx !== -1) {
      const storedEmail = String(latest.rawDataRow[emailIdx]).trim().toLowerCase();
      if (storedEmail !== details.email.trim().toLowerCase()) return false;
    }
    return true;
  };

  const onVerifyPan = async (shalarthId: string, pan: string): Promise<boolean> => {
    const latest = await getLatestSalaryRecord(shalarthId);
    if (!latest) return false;
    const normalize = (val: string) => val.trim().toUpperCase().replace(/[\s-]/g, "");
    const panIdx = latest.rawHeaders.findIndex((h) => String(h).toUpperCase().includes("PAN"));
    if (panIdx !== -1) return normalize(String(latest.rawDataRow[panIdx])) === normalize(pan);
    return false;
  };

  const onRegister = async (shalarthId: string, pin: string) => {
    const { data: dbTeacher } = await supabase.from("teachers").select("*").eq("shalarth_id", shalarthId).single();
    let existing: Teacher | null = null;
    if (dbTeacher) {
      existing = {
        id: dbTeacher.id, adminId: dbTeacher.admin_id, shalarthId: dbTeacher.shalarth_id,
        name: dbTeacher.name, schoolDetails: dbTeacher.school_name, dob: dbTeacher.dob,
        mobile: dbTeacher.mobile, emailId: dbTeacher.email, isRegistered: dbTeacher.is_registered,
        pin_hashed: dbTeacher.pin_hashed, passwordHash: dbTeacher.password_hash,
      };
    } else {
      existing = teachers.find((t) => t.shalarthId === shalarthId) || null;
    }

    let updatedTeacher: Teacher;
    if (existing) {
      updatedTeacher = { ...existing, pin_hashed: hashData(pin), isRegistered: true };
    } else {
      const relevantRecord = await getLatestSalaryRecord(shalarthId);
      updatedTeacher = {
        id: "t-" + Date.now(), adminId: relevantRecord ? relevantRecord.adminId : "default_admin",
        shalarthId, name: "Teacher " + shalarthId, mobile: "0123456789", passwordHash: "",
        pin_hashed: hashData(pin), isRegistered: true,
      };
      if (relevantRecord) {
        const findValue = (keywords: string[]) => {
          const idx = relevantRecord.rawHeaders.findIndex((h) =>
            keywords.some((k) => String(h).toUpperCase().includes(k)));
          return idx !== -1 ? String(relevantRecord.rawDataRow[idx]) : null;
        };
        updatedTeacher.name = findValue(["NAME"]) || updatedTeacher.name;
        updatedTeacher.mobile = findValue(["MOBILE", "PHONE"]) || updatedTeacher.mobile;
        updatedTeacher.emailId = findValue(["EMAIL", "E-MAIL"]) || updatedTeacher.emailId;
        updatedTeacher.panNo = findValue(["PAN"]) || updatedTeacher.panNo;
        updatedTeacher.adharNo = findValue(["ADHAR"]) || updatedTeacher.adharNo;
      }
    }

    try {
      const { data: checkTeacher } = await supabase.from("teachers").select("id").eq("shalarth_id", shalarthId).single();
      const exists = !!checkTeacher || teachers.some((t) => t.shalarthId === shalarthId);
      const sbTeacher = {
        id: updatedTeacher.id, admin_id: updatedTeacher.adminId, shalarth_id: updatedTeacher.shalarthId,
        name: updatedTeacher.name, school_name: updatedTeacher.schoolDetails, dob: updatedTeacher.dob || "",
        mobile: updatedTeacher.mobile, email: updatedTeacher.emailId,
        is_registered: updatedTeacher.isRegistered, pin_hashed: updatedTeacher.pin_hashed,
        password_hash: updatedTeacher.passwordHash,
      };
      let error;
      if (exists) {
        ({ error } = await supabase.from("teachers").update(sbTeacher).eq("shalarth_id", shalarthId));
      } else {
        ({ error } = await supabase.from("teachers").insert([sbTeacher]));
      }
      if (error) throw error;
      setTeachers((prev) => {
        const exists = prev.some((t) => t.shalarthId === shalarthId);
        return exists ? prev.map((t) => t.shalarthId === shalarthId ? updatedTeacher : t) : [...prev, updatedTeacher];
      });
      onSuccess("Successfully updated! Use your 4-digit PIN to login.");
    } catch (err: any) {
      console.error("Registration failed:", err);
      onError(`Registration failed: ${err?.message || "Unknown error"}.`);
    }
  };

  const handleCreateTeachers = useCallback(async (newTeachers: Teacher[]) => {
    const existingShalarthIds = new Set(teachers.map((t) => t.shalarthId));
    const uniqueNewTeachers = newTeachers.filter((nt) => !existingShalarthIds.has(nt.shalarthId)).map((t) => ({
      ...t,
      passwordHash: hashData(t.passwordHash),
      mobile: t.mobile || "",
      emailId: t.emailId || "",
      ...(import.meta.env.DEV ? {
        bankDetails: t.bankDetails || `Bank XYZ - Acc #XXX${t.mobile?.slice(-4) || "0000"}`,
        schoolDetails: t.schoolDetails || `ZP School ${t.name?.split(" ")[0] || "Default"}`,
        gpfNo: t.gpfNo || `GPF/${t.shalarthId?.slice(0, 3) || "000"}/123`,
        panNo: t.panNo || `ABCDE${t.mobile?.slice(0, 4) || "0000"}X`,
        pranNo: t.pranNo || `1100${t.mobile?.slice(-7) || "0000000"}`,
        adharNo: t.adharNo || `XXXX XXXX ${t.mobile?.slice(2, 6) || "0000"}`,
        bankIfscCode: t.bankIfscCode || `BKID000${t.mobile?.slice(-4) || "0000"}`,
        branchName: t.branchName || `${t.name?.split(" ")[0] || "Default"} Branch`,
        payMatrix: t.payMatrix || `Level ${parseInt(t.mobile?.slice(-1) || "1") + 5}`,
        schoolDdoCode: t.schoolDdoCode || `DDO${t.shalarthId?.slice(0, 5) || "00000"}`,
        designation: t.designation || "Assistant Teacher",
      } : {
        bankDetails: t.bankDetails || "", schoolDetails: t.schoolDetails || "", gpfNo: t.gpfNo || "",
        panNo: t.panNo || "", pranNo: t.pranNo || "", adharNo: t.adharNo || "",
        bankIfscCode: t.bankIfscCode || "", branchName: t.branchName || "", payMatrix: t.payMatrix || "",
        schoolDdoCode: t.schoolDdoCode || "", designation: t.designation || "",
      }),
    }));

    try {
      const inserts = uniqueNewTeachers.map((t) => ({
        id: t.id, admin_id: t.adminId, shalarth_id: t.shalarthId, name: t.name,
        school_name: t.schoolDetails, dob: t.dob || "", mobile: t.mobile, email: t.emailId,
        is_registered: t.isRegistered, pin_hashed: t.pin_hashed, password_hash: t.passwordHash,
      }));
      for (let i = 0; i < inserts.length; i += 100) {
        const { error } = await supabase.from("teachers").insert(inserts.slice(i, i + 100));
        if (error) throw error;
      }
      setTeachers((prev) => [...prev, ...uniqueNewTeachers]);
      handleAddAuditLog('ADD_TEACHERS', `Created ${uniqueNewTeachers.length} new teacher(s)`);
    } catch (err) {
      console.error("Error creating teachers:", err);
      onError("Failed to save teachers.");
    }
  }, [teachers, handleAddAuditLog]);

  const handleDeleteTeacher = useCallback(async (shalarthId: string) => {
    try {
      const { error } = await supabase.from("teachers").delete().eq("shalarth_id", shalarthId);
      if (error) throw error;
      setTeachers((prev) => prev.filter((t) => t.shalarthId !== shalarthId));
      handleAddAuditLog('DELETE_TEACHER', `Deleted teacher with Shalarth ID: ${shalarthId}`);
    } catch (err) {
      console.error("Error deleting teacher:", err);
      onError("Failed to delete teacher.");
    }
  }, [handleAddAuditLog]);

  const handleProcessPaybillUpload = useCallback(
    async (
      paybillMeta: Omit<Paybill, "id" | "uploadedAt">,
      parsedExcelData: { headers: string[]; rows: { shalarthId: string; dataRow: (string | number | null)[] }[] },
    ) => {
      if (paybills.some((p) => p.month === paybillMeta.month && p.year === paybillMeta.year)) {
        onError(`A paybill master record for ${paybillMeta.month} ${paybillMeta.year} already exists. Delete it first if you want to re-upload.`);
        return;
      }
      if (monthlySalaryDataList.some((d) => d.month === paybillMeta.month && d.year === paybillMeta.year)) {
        onError(`Salary data for ${paybillMeta.month} ${paybillMeta.year} has already been processed. Delete the existing paybill to re-upload and re-process.`);
        return;
      }

      const newPaybillMaster: Paybill = {
        ...paybillMeta,
        adminId: loggedInUser?.username || "",
        id: Date.now().toString() + Math.random().toString(36).substring(2),
        uploadedAt: new Date().toISOString(),
      };
      const newSalaryDataEntries: MonthlyTeacherSalaryData[] = parsedExcelData.rows.map((teacherRow) => ({
        id: `${paybillMeta.year}-${paybillMeta.month}-${teacherRow.shalarthId}`,
        adminId: loggedInUser?.username || "", month: paybillMeta.month, year: paybillMeta.year,
        teacherShalarthId: teacherRow.shalarthId, rawHeaders: parsedExcelData.headers, rawDataRow: teacherRow.dataRow,
      }));

      try {
        const { error: pbError } = await supabase.from("paybills").insert([{
          id: newPaybillMaster.id, admin_id: newPaybillMaster.adminId, month: newPaybillMaster.month,
          year: newPaybillMaster.year, remarks: newPaybillMaster.remarks, file_name: newPaybillMaster.fileName,
          uploaded_at: newPaybillMaster.uploadedAt,
        }]);
        if (pbError) throw pbError;

        const salaryInserts = newSalaryDataEntries.map((d) => ({
          id: d.id, admin_id: d.adminId, month: d.month, year: d.year,
          teacher_shalarth_id: d.teacherShalarthId, raw_headers: d.rawHeaders, raw_data_row: d.rawDataRow,
        }));
        for (let i = 0; i < salaryInserts.length; i += 25) {
          const { error: salaryError } = await supabase.from("salary_data").insert(salaryInserts.slice(i, i + 25));
          if (salaryError) throw salaryError;
        }

        setPaybills((prev) => [newPaybillMaster, ...prev].sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()));
        setMonthlySalaryDataList((prev) => [...prev, ...newSalaryDataEntries]);
        handleAddAuditLog('ADD_DATA', `Uploaded paybill data for ${paybillMeta.month} ${paybillMeta.year}`);
      } catch (err: any) {
        console.error("Upload process failed:", err);
        onError(`Failed to save paybill data: ${err?.message || "Unknown error"}`);
      }
    },
    [paybills, monthlySalaryDataList, loggedInUser, handleAddAuditLog],
  );

  const handleDeletePaybill = useCallback(async (paybillIdToDelete: string) => {
    const paybillToDelete = paybills.find((p) => p.id === paybillIdToDelete);
    if (!paybillToDelete) return;
    try {
      const { error: err1 } = await supabase.from("paybills").delete().eq("id", paybillIdToDelete);
      if (err1) throw err1;
      const { error: err2 } = await supabase.from("salary_data").delete().eq("month", paybillToDelete.month).eq("year", paybillToDelete.year);
      if (err2) throw err2;
      setPaybills((prev) => prev.filter((p) => p.id !== paybillIdToDelete));
      setMonthlySalaryDataList((prev) => prev.filter((d) => !(d.month === paybillToDelete.month && d.year === paybillToDelete.year)));
      handleAddAuditLog('DELETE_DATA', `Deleted paybill data for ${paybillToDelete.month} ${paybillToDelete.year}`);
    } catch (err) {
      console.error("Delete paybill failed:", err);
      onError("Failed to delete paybill.");
    }
  }, [paybills, handleAddAuditLog]);

  const handleAddAdminNotification = useCallback(async (newNotification: AdminNotification) => {
    try {
      const finalNotification = { ...newNotification, adminId: loggedInUser?.username || "" };
      const { error } = await supabase.from("notifications").insert([{
        id: finalNotification.id, admin_id: finalNotification.adminId, date: finalNotification.date,
        text: finalNotification.text, remarks: finalNotification.remarks, file_name: finalNotification.fileName,
        file_data: finalNotification.fileData, uploaded_at: finalNotification.uploadedAt,
      }]);
      if (error) throw error;
      setAdminNotifications((prev) => [finalNotification, ...prev].sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()));
      handleAddAuditLog('ADD_NOTIFICATION', `Added notification: "${finalNotification.text?.substring(0, 50)}..."`);
    } catch (err) {
      console.error("Add notification failed:", err);
      onError("Failed to save notification.");
    }
  }, [loggedInUser, handleAddAuditLog]);

  const handleDeleteAdminNotification = useCallback(async (notificationId: string) => {
    try {
      const { error } = await supabase.from("notifications").delete().eq("id", notificationId);
      if (error) throw error;
      setAdminNotifications((prev) => prev.filter((n) => n.id !== notificationId));
      handleAddAuditLog('DELETE_NOTIFICATION', `Deleted notification ID: ${notificationId}`);
    } catch (err) {
      console.error("Delete notification failed:", err);
      onError("Failed to delete notification.");
    }
  }, [handleAddAuditLog]);

  const handleAddInfoRequest = useCallback(async (newRequest: InfoRequest) => {
    try {
      const finalRequest = { ...newRequest, adminId: loggedInUser?.username || "" };
      const { error } = await supabase.from("info_requests").insert([{
        id: finalRequest.id, admin_id: finalRequest.adminId, subject: finalRequest.subject,
        column_headers: finalRequest.columnHeaders, created_at: finalRequest.createdAt,
      }]);
      if (error) throw error;
      setInfoRequests((prev) => [finalRequest, ...prev].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      handleAddAuditLog('ADD_INFO_REQUEST', `Created info request: "${finalRequest.subject?.substring(0, 50)}..."`);
    } catch (err) {
      console.error("Add info request failed:", err);
      onError("Failed to save data request.");
    }
  }, [loggedInUser, handleAddAuditLog]);

  const handleDeleteInfoRequest = useCallback(async (requestId: string) => {
    try {
      const { error: err1 } = await supabase.from("info_requests").delete().eq("id", requestId);
      if (err1) throw err1;
      const { error: err2 } = await supabase.from("info_responses").delete().eq("request_id", requestId);
      if (err2) throw err2;
      setInfoRequests((prev) => prev.filter((req) => req.id !== requestId));
      setTeacherInfoResponses((prev) => prev.filter((res) => res.requestId !== requestId));
      handleAddAuditLog('DELETE_INFO_REQUEST', `Deleted info request ID: ${requestId}`);
    } catch (err) {
      console.error("Delete info request failed:", err);
      onError("Failed to delete data request.");
    }
  }, [handleAddAuditLog]);

  const handleAddOrUpdateTeacherInfoResponse = useCallback(async (response: TeacherInfoResponse) => {
    try {
      const exists = teacherInfoResponses.find((r) => r.requestId === response.requestId && r.teacherShalarthId === response.teacherShalarthId);
      const sbResp = { id: response.id, request_id: response.requestId, teacher_shalarth_id: response.teacherShalarthId, data: response.responseData, submitted_at: response.submittedAt };
      if (exists) {
        const { error } = await supabase.from("info_responses").update({ data: response.responseData }).eq("id", exists.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("info_responses").insert([sbResp]);
        if (error) throw error;
      }
      setTeacherInfoResponses((prev) => {
        const idx = prev.findIndex((r) => r.requestId === response.requestId && r.teacherShalarthId === response.teacherShalarthId);
        if (idx > -1) {
          const updated = [...prev];
          updated[idx] = { ...response, lastUpdatedAt: new Date().toISOString() };
          return updated;
        }
        return [...prev, response];
      });
      handleAddAuditLog('SUBMIT_INFO_RESPONSE', `Submitted response for info request ID: ${response.requestId}`);
    } catch (err) {
      console.error("Save info response failed:", err);
      onError("Failed to submit response.");
    }
  }, [teacherInfoResponses, handleAddAuditLog]);

  const value: DataContextValue = {
    teachers, paybills, monthlySalaryDataList, latestSalaryDataForCurrentTeacher,
    adminNotifications, infoRequests, teacherInfoResponses, challans, auditLogs,
    handleAddAuditLog, handleCreateTeachers, handleDeleteTeacher, handleProcessPaybillUpload, handleDeletePaybill,
    handleAddAdminNotification, handleDeleteAdminNotification, handleAddInfoRequest,
    handleDeleteInfoRequest, handleAddOrUpdateTeacherInfoResponse, handleAddChallan, handleDeleteChallan,
    getLatestSalaryRecord, onVerifyShalarth, onVerifyMobile, onVerifyAadhaar, onVerifyPan,
    onVerifyFullDetails, onRegister,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};
