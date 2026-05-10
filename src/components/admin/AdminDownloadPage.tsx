
import React, { useState, useMemo } from 'react';
import { Teacher, MonthlyTeacherSalaryData, PayslipFieldMapping, AdminReportType, ReportColumn, GeneratedReportDataRow, GeneratedReport, Admin } from '../../types';
import { ArrowDownTrayIcon as DownloadIcon, PrinterIcon as PrintIcon, SearchCircleIcon as GenerateIcon } from '../icons/FeatureIcons';

import * as XLSX from 'xlsx';

interface AdminDownloadPageProps {
  teachers: Teacher[];
  monthlySalaryDataList: MonthlyTeacherSalaryData[];
  payslipFieldMappings: PayslipFieldMapping[];
  admins?: Admin[];
  showAdminFilter?: boolean;
}

// Fixed range for available years as per user request
const availableYears = Array.from({ length: 11 }, (_, i) => (2020 + i).toString()); // 2020 to 2030

const reportTypeOptions = Object.values(AdminReportType).map(value => ({ label: value, value }));

const AdminDownloadPage: React.FC<AdminDownloadPageProps> = ({ teachers, monthlySalaryDataList, payslipFieldMappings, admins = [], showAdminFilter = false }) => {
  const [selectedMonth, setSelectedMonth] = useState<string>(() => months[new Date().getMonth()]);
  const [selectedYear, setSelectedYear] = useState<string>(() => {
    const currentYrStr = new Date().getFullYear().toString();
    return availableYears.includes(currentYrStr) ? currentYrStr : availableYears[0];
  });
  const [selectedReportType, setSelectedReportType] = useState<AdminReportType>(AdminReportType.GPFDeduction);
  const [selectedAdminId, setSelectedAdminId] = useState<string>('all');
  
  const [generatedReport, setGeneratedReport] = useState<GeneratedReport | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const teacherMap = useMemo(() => new Map(teachers.map(t => [t.shalarthId, t])), [teachers]);

  const parseNumericValue = (value: any): number => {
    if (value === null || value === undefined || String(value).trim() === '') return 0;
    const num = parseFloat(String(value).replace(/[^0-9.,-]+/g, '').replace(',', '.')); 
    return isNaN(num) ? 0 : num;
  };

  const formatNumberForDisplay = (value: any): string => {
      const num = parseNumericValue(value);
      if (num === 0 && (value === null || value === undefined || String(value).trim() === '' || String(value).trim() === '0')) {
        return "0";
      }
      if (Number.isInteger(num)) {
          return String(num);
      }
      const fixed = num.toFixed(2);
      if (fixed.slice(-3) === '.00') {
          return fixed.slice(0, -3);
      }
      if (fixed.slice(-1) === '0' && fixed.includes('.')) {
           return fixed.slice(0, -1);
      }
      return fixed;
  };

  const getExcelColumnValue = (
    salaryData: MonthlyTeacherSalaryData,
    excelHeaderKey: string 
  ): string | number | null => {
    const mapping = payslipFieldMappings.find(m => m.payslipLabel.trim().toUpperCase() === excelHeaderKey.trim().toUpperCase());
    if (!mapping) return null;

    const candidate = mapping.excelHeaderCandidates[0];
    if (!candidate) return null;
    
    const normalizeHeader = (header: string | null | undefined): string => 
      (header || '').toLowerCase().replace(/[\s._\-\/()]/g, '');

    const normalizedCandidate = normalizeHeader(candidate);
    const headerIndex = salaryData.rawHeaders.findIndex(h => normalizeHeader(h) === normalizedCandidate);

    if (headerIndex !== -1 && salaryData.rawDataRow[headerIndex] !== undefined && salaryData.rawDataRow[headerIndex] !== null && String(salaryData.rawDataRow[headerIndex]).trim() !== '') {
      return salaryData.rawDataRow[headerIndex];
    }
    return null; 
  };


  const getReportConfig = (reportType: AdminReportType): { columns: ReportColumn[], amountColumnKey: string, title: string } => {
    switch (reportType) {
      case AdminReportType.GPFDeduction:
        return {
          title: "GPF Deduction List",
          amountColumnKey: "GPF",
          columns: [
            { key: "srNo", label: "Sr. No." },
            { key: "EMPLOYEE NAME", label: "Name of Teachers" },
            { key: "NAME OF SCHOOL", label: "School Name" },
            { key: "SHALARTH ID", label: "Shalarth ID" },
            { key: "GPF NO", label: "NPS/GPF/Account Number" },
            { key: "GPF", label: "Amount", isNumeric: true, isMonetary: true },
          ]
        };
      case AdminReportType.NPSDeduction:
        return {
          title: "NPS Deduction List",
          amountColumnKey: "NPS TOTAL", 
          columns: [
            { key: "srNo", label: "Sr.No" },
            { key: "NAME OF SCHOOL", label: "School Name" },
            { key: "PRAN NO", label: "PRAN Number" },
            { key: "SHALARTH ID", label: "Shalarth ID" },
            { key: "NPS EMPR CONTRI", label: "NPS EMPR CONTRI", isNumeric: true, isMonetary: true },
            { key: "NPS EMP CONTRI", label: "NPS EMP CONTRI", isNumeric: true, isMonetary: true },
            { key: "NPS EMPR CONTRI ARR", label: "NPS EMPR CONTRI ARR", isNumeric: true, isMonetary: true },
            { key: "NPS EMP CONTRI ARR", label: "NPS EMP CONTRI ARR", isNumeric: true, isMonetary: true },
            { key: "NPS TOTAL", label: "NPS TOTAL", isNumeric: true, isMonetary: true },
          ]
        };
      case AdminReportType.CreditSociety:
        return {
          title: "Credit Society Deduction List",
          amountColumnKey: "NGR(SOCIETY LOAN)",
          columns: [
            { key: "srNo", label: "Sr.NO" },
            { key: "NAME OF SCHOOL", label: "School Name" },
            { key: "EMPLOYEE NAME", label: "Name of Teachers" },
            { key: "SHALARTH ID", label: "Shalarth ID" },
            { key: "SOCIETY_ACCOUNT_NO", label: "Society Account Number" }, 
            { key: "NGR(SOCIETY LOAN)", label: "Amount", isNumeric: true, isMonetary: true },
          ]
        };
      case AdminReportType.BankList:
        return {
          title: "Bank List",
          amountColumnKey: "EMPLOYEE NET SALARY", 
          columns: [
            { key: "srNo", label: "Sr.No" },
            { key: "NAME OF SCHOOL", label: "School Name" },
            { key: "EMPLOYEE NAME", label: "Name of Teachers" },
            { key: "BANK NAME", label: "BANK NAME" },
            { key: "BANK IFSC CODE", label: "BANK IFSC CODE" },
            { key: "BRANCH NAME", label: "BRANCH NAME" },
            { key: "BANK ACCOUNT NUMBER", label: "BANK ACCOUNT NUMBER" },
            { key: "EMPLOYEE NET SALARY", label: "EMPLOYEE NET SALARY", isNumeric: true, isMonetary: true },
          ]
        };
      case AdminReportType.IncomeTax:
        return {
          title: "Income Tax Deduction List",
          amountColumnKey: "INCOME TAX",
          columns: [
            { key: "srNo", label: "Sr.No" },
            { key: "NAME OF SCHOOL", label: "School Name" },
            { key: "EMPLOYEE NAME", label: "Name of Teachers" },
            { key: "SHALARTH ID", label: "Shalarth ID" },
            { key: "PAN NO", label: "PAN NO" },
            { key: "TOTAL PAY", label: "GROSS SALARY", isNumeric: true, isMonetary: true },
            { key: "INCOME TAX", label: "INCOME TAX", isNumeric: true, isMonetary: true },
          ]
        };
      case AdminReportType.OfflinePaybill:
        return {
          title: "Offline Paybill",
          amountColumnKey: "EMPLOYEE NET SALARY", 
          columns: [ 
            { key: "srNo", label: "Sr.No" },
            { key: "SCHOOL SHALARTH DDO CODE", label: "SCHOOL SHALARTH DDO CODE" },
            { key: "SCHOOL UDISE CODE", label: "SCHOOL UDISE CODE" },
            { key: "NAME OF SCHOOL", label: "School Name" }, 
            { key: "EMPLOYEE NAME", label: "Name of Teachers" },
            { key: "SHALARTH ID", label: "Shalarth ID" },
            ...[
              "BASIC PAY", "D.A", "HRA", "T.A", "T.A ARREAR", "TRIBAL ALLOWANCE", "WASHING ALLOWANCE",
              "DA ARREARS", "BASIC ARREARS", "CLA", "NPS EMPR ALLOW", "TOTAL PAY", "F A", "GPF",
              "GPF ADV", "PT", "GIS(ZP)", "GIS SCOUT", "DCPS REGULAR", "DCPS DELAYED",
              "DCPS PAY ARREARS RECOVERY", "REVENUE STAMP", "DCPS DA ARREARS RECOVERY",
              "GROUP ACCIDENTAL POLICY", "NAA", "NPS EMPR CONTRI", "NPS EMP CONTRI",
              "NPS EMPR CONTRI ARR", "NPS EMP CONTRI ARR", "INCOME TAX", "CO-OP BANK",
              "NGR(LIC)", "NGR(SOCIETY LOAN)", "NGR(MISC)", "NGR(OTHER RECOVERY)", "NGR(RD)",
              "NGR(OTHER DEDUCTION)", "Total Deduction", "EMPLOYEE NET SALARY"
            ].map(label => ({ key: label, label: label, isNumeric: true, isMonetary: true }))
          ]
        };
      default:
        return { title: "Report", columns: [], amountColumnKey: "" };
    }
  };

  const handleGenerateReport = () => {
    setIsLoading(true);
    setError(null);
    setGeneratedReport(null);

    const reportConfig = getReportConfig(selectedReportType);
    
    const filteredSalaryData = monthlySalaryDataList.filter(data => {
      const matchMonthYear = data.month === selectedMonth && data.year === selectedYear;
      const matchAdmin = showAdminFilter && selectedAdminId !== 'all' ? data.adminId === selectedAdminId : true;
      return matchMonthYear && matchAdmin;
    });

    if (filteredSalaryData.length === 0) {
      setError(`No salary data found for ${selectedMonth} ${selectedYear}.`);
      setIsLoading(false);
      return;
    }

    let processedDataRows: GeneratedReportDataRow[] = [];
    let srNo = 1;

    for (const salaryEntry of filteredSalaryData) {
      // No 'if (!teacher) continue;' - process all salary entries.
      // Teacher object from teacherMap is only for fallback if Excel data is missing.
      const teacherDetails = teacherMap.get(salaryEntry.teacherShalarthId);

      const amountValueRaw = getExcelColumnValue(salaryEntry, reportConfig.amountColumnKey);
      const amountValueNumeric = parseNumericValue(amountValueRaw);

      if (reportConfig.amountColumnKey && amountValueNumeric === 0 && selectedReportType !== AdminReportType.BankList) {
          if ([AdminReportType.GPFDeduction, AdminReportType.NPSDeduction, AdminReportType.IncomeTax, AdminReportType.CreditSociety].includes(selectedReportType)){
            continue; // Skip row if primary amount is zero for these reports
          }
      }

      const row: GeneratedReportDataRow = { srNo: srNo.toString() };
      reportConfig.columns.forEach(col => {
        if (col.key === "srNo") return;

        let value: string | number | null = null;
        if (col.key === "SOCIETY_ACCOUNT_NO") { 
            value = ""; // Placeholder for this specific key
        } else if (col.key === "Total Deduction" && selectedReportType === AdminReportType.OfflinePaybill) {
            const colsToSum = [
              "GPF", "GPF ADV", "PT", "GIS(ZP)", "GIS SCOUT", "DCPS REGULAR", "DCPS DELAYED",
              "DCPS PAY ARREARS RECOVERY", "REVENUE STAMP", "DCPS DA ARREARS RECOVERY",
              "GROUP ACCIDENTAL POLICY", "NAA", "NPS EMPR CONTRI", "NPS EMP CONTRI",
              "NPS EMPR CONTRI ARR", "NPS EMP CONTRI ARR", "INCOME TAX", "CO-OP BANK",
              "NGR(LIC)", "NGR(SOCIETY LOAN)"
            ];
            let sum = 0;
            colsToSum.forEach(c => {
               sum += parseNumericValue(getExcelColumnValue(salaryEntry, c));
            });
            value = sum;
        } else {
            value = getExcelColumnValue(salaryEntry, col.key);
        }
        
        // Fallback to teacherDetails if value from Excel is null AND teacherDetails exist
        if (value === null && teacherDetails) {
            if ((col.key === "EMPLOYEE NAME" || col.key === "Name of Teachers") && teacherDetails.name) value = teacherDetails.name;
            else if (col.key === "SHALARTH ID" && teacherDetails.shalarthId) value = teacherDetails.shalarthId;
            else if (col.key === "PAN NO" && teacherDetails.panNo) value = teacherDetails.panNo;
            else if (col.key === "GPF NO" && teacherDetails.gpfNo) value = teacherDetails.gpfNo;
            else if (col.key === "PRAN NO" && teacherDetails.pranNo) value = teacherDetails.pranNo;
            // Add other fallbacks if necessary (e.g. BANK NAME, BANK ACCOUNT NUMBER from teacher profile)
        }
        
        row[col.key] = col.isNumeric ? parseNumericValue(value) : (value ?? "");
      });
      processedDataRows.push(row);
      srNo++;
    }
    
    if (processedDataRows.length === 0) {
        setError(`No relevant teacher data found for ${reportConfig.title} for ${selectedMonth} ${selectedYear} after filtering.`);
        setIsLoading(false);
        return;
    }

    const columnSums: Record<string, number> = {};
    reportConfig.columns.forEach(col => {
      if (col.isNumeric) {
        columnSums[col.key] = processedDataRows.reduce((sum, row) => sum + (parseNumericValue(row[col.key])), 0);
      }
    });

    const activeColumns = reportConfig.columns.filter(col => {
      if (col.key === "srNo" || !col.isNumeric) return true; 
      return columnSums[col.key] !== 0;
    });
    
    if (activeColumns.length <= 1 && activeColumns[0]?.key === "srNo") { 
        setError(`All data columns have zero totals for ${reportConfig.title}. No report to display.`);
        setIsLoading(false);
        return;
    }

    const grandTotalRow: GeneratedReportDataRow = { srNo: "Grand Total" };
    activeColumns.forEach(col => {
      if (col.key !== "srNo" && col.isNumeric) {
        grandTotalRow[col.key] = columnSums[col.key];
      } else if (col.key !== "srNo") {
        grandTotalRow[col.key] = "";
      }
    });

    let finalReport: GeneratedReport = {
      columns: activeColumns,
      data: processedDataRows,
      grandTotalRow,
      reportType: selectedReportType,
      month: selectedMonth,
      year: selectedYear,
    };

    if (selectedReportType === AdminReportType.OfflinePaybill) {
      const groupedByDDO: Record<string, { schoolName: string, rows: GeneratedReportDataRow[] }> = {};
      processedDataRows.forEach(row => {
        const ddoCode = String(row["SCHOOL SHALARTH DDO CODE"] || "UNKNOWN_DDO");
        if (!groupedByDDO[ddoCode]) {
          groupedByDDO[ddoCode] = { schoolName: String(row["NAME OF SCHOOL"] || "Unknown School"), rows: [] };
        }
        groupedByDDO[ddoCode].rows.push(row);
      });

      finalReport.subtotalGroups = Object.entries(groupedByDDO).map(([ddoCode, group]) => {
        const subtotalRow: GeneratedReportDataRow = { srNo: "", "NAME OF SCHOOL": `School Total (${group.schoolName})` };
        activeColumns.forEach(col => {
          if (col.key !== "srNo" && col.key !== "NAME OF SCHOOL" && col.isNumeric) {
            subtotalRow[col.key] = group.rows.reduce((sum, r) => sum + parseNumericValue(r[col.key]), 0);
          } else if (col.key !== "srNo" && col.key !== "NAME OF SCHOOL") {
            subtotalRow[col.key] = "";
          }
        });
        return { groupKey: ddoCode, groupName: group.schoolName, data: group.rows, subtotalRow };
      });
      finalReport.data = []; 
    }

    setGeneratedReport(finalReport);
    setIsLoading(false);
  };

  const handleDownloadExcel = () => {
    if (!generatedReport) return;
    
    const { columns, data, grandTotalRow, subtotalGroups, reportType } = generatedReport;
    const reportConfig = getReportConfig(reportType);
    const sheetName = `${reportConfig.title.substring(0,20)}_${selectedMonth.substring(0,3)}${selectedYear}`;
    
    const ws_data: any[][] = [];
    
    ws_data.push(columns.map(col => col.label));

    const formatForExcel = (value: any, column: ReportColumn) => {
        if (value === null || value === undefined) return "";
        if (column.isMonetary || (column.isNumeric && typeof value === 'number')) {
            const num = parseNumericValue(value);
            return num; // Excel handles numbers
        }
        return String(value);
    };

    if (reportType === AdminReportType.OfflinePaybill && subtotalGroups) {
        subtotalGroups.forEach(group => {
            group.data.forEach(rowData => {
                ws_data.push(columns.map(col => formatForExcel(rowData[col.key], col)));
            });
            const subtotalDisplayRow = columns.map(col => {
                let val: any = "";
                if (col.key === "srNo" && group.subtotalRow.srNo) val = group.subtotalRow.srNo;
                else if (col.key === "NAME OF SCHOOL" && group.subtotalRow["NAME OF SCHOOL"]) val = group.subtotalRow["NAME OF SCHOOL"];
                else val = formatForExcel(group.subtotalRow[col.key], col);

                return { v: val, t: typeof val === 'number' ? 'n' : 's', s: { font: { bold: true } } };
            });
            ws_data.push(subtotalDisplayRow);
        });
    } else {
        data.forEach(rowData => {
            ws_data.push(columns.map(col => formatForExcel(rowData[col.key], col)));
        });
    }

    if (grandTotalRow) {
        ws_data.push(columns.map(col => {
             if (col.key === "srNo" && grandTotalRow.srNo) return grandTotalRow.srNo; 
             return formatForExcel(grandTotalRow[col.key], col)
        }));
    }

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(ws_data);
    
    const colWidths = columns.map(col => ({ wch: Math.max(col.label.length, 15) })); 
    ws['!cols'] = colWidths;

    XLSX.utils.book_append_sheet(wb, ws, sheetName);
    XLSX.writeFile(wb, `${sheetName}.xlsx`);
  };

  const handlePrintStatement = () => {
    if (!generatedReport) return;

    const { columns, data, grandTotalRow, subtotalGroups, reportType, month, year: reportYear } = generatedReport;
    const reportConfig = getReportConfig(reportType);

    let tableHtml = `<table border="1" style="border-collapse: collapse; width: 100%; font-size: 10pt;"><thead><tr>`;
    columns.forEach(col => {
      // For print, use text-align: center !important as per global print styles
      tableHtml += `<th style="padding: 4px;">${col.label}</th>`;
    });
    tableHtml += `</tr></thead><tbody>`;

    const renderRowToHtml = (rowData: GeneratedReportDataRow, isTotalRow = false, isSubtotal = false) => {
        let rowHtml = `<tr class="${isSubtotal ? 'subtotal-row' : (isTotalRow ? 'grandtotal-row' : '')}">`;
        columns.forEach(col => {
            const value = rowData[col.key];
             // For print, use text-align: center !important as per global print styles
            rowHtml += `<td style="padding: 4px; white-space: nowrap;">${col.isNumeric ? formatNumberForDisplay(value) : (value ?? '')}</td>`;
        });
        rowHtml += `</tr>`;
        return rowHtml;
    };
    
    if (reportType === AdminReportType.OfflinePaybill && subtotalGroups) {
        subtotalGroups.forEach(group => {
            tableHtml += `<tbody class="school-group-wrapper">`; 
            group.data.forEach(rowData => tableHtml += renderRowToHtml(rowData));
            tableHtml += renderRowToHtml(group.subtotalRow, false, true); 
            tableHtml += `</tbody>`;
        });
    } else {
        data.forEach(rowData => tableHtml += renderRowToHtml(rowData));
    }
    
    if (grandTotalRow) {
        tableHtml += renderRowToHtml(grandTotalRow, true); 
    }
    tableHtml += `</tbody></table>`;

    // Determine orientation class for print styles
    const orientationClass = reportType === AdminReportType.OfflinePaybill 
      ? 'print-report-legal-landscape' 
      : 'print-report-A4-landscape'; // All reports are landscape now
    
    const printWindow = window.open('', '_blank', 'width=1000,height=800');
    if (!printWindow) {
        alert('Failed to open print window. Please check your browser pop-up blocker.');
        return;
    }
    
    // index.html already contains the print styles under @media print.
    // We just need to ensure the body of the print window has the correct class.
    printWindow.document.write(`
      <html>
        <head>
          <title>${reportConfig.title} - ${month} ${reportYear}</title>
           <link rel="stylesheet" href="/index.html">  <!-- Ensures print styles from index.html are loaded -->
        </head>
        <body class="${orientationClass}">
          <div class="print-report-content"> <!-- This class is targeted by specific print styles in index.html -->
            <h2>${reportConfig.title} - ${month} ${reportYear}</h2>
            ${tableHtml}
          </div>
          <script>
            window.onload = function() {
              setTimeout(function() { // Delay to ensure styles apply
                window.print();
                // setTimeout(function(){ window.close(); }, 200); // Optional auto-close
              }, 200); 
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };


  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-slate-100">Download Reports</h3>

      <div className="p-4 bg-slate-600 rounded-md space-y-4">
        <div className={`grid grid-cols-1 md:grid-cols-2 ${showAdminFilter ? 'lg:grid-cols-5' : 'lg:grid-cols-4'} gap-4 items-end`}>
          {showAdminFilter && (
            <div>
              <label htmlFor="adminFilter" className="block text-sm font-medium text-slate-300">Admin Name</label>
              <select id="adminFilter" value={selectedAdminId} onChange={e => setSelectedAdminId(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-slate-500 border border-slate-400 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm text-slate-100">
                <option value="all">All Admins</option>
                {admins.map(a => <option key={a.userId} value={a.userId}>{a.name}</option>)}
              </select>
            </div>
          )}
          <div>
            <label htmlFor="reportMonth" className="block text-sm font-medium text-slate-300">Month</label>
            <select id="reportMonth" value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-slate-500 border border-slate-400 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm text-slate-100">
              {months.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="reportYear" className="block text-sm font-medium text-slate-300">Year</label>
            <select id="reportYear" value={selectedYear} onChange={e => setSelectedYear(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-slate-500 border border-slate-400 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm text-slate-100">
              {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <div className="lg:col-span-1">
            <label htmlFor="reportType" className="block text-sm font-medium text-slate-300">Report Type</label>
            <select id="reportType" value={selectedReportType} onChange={e => setSelectedReportType(e.target.value as AdminReportType)}
              className="mt-1 block w-full px-3 py-2 bg-slate-500 border border-slate-400 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm text-slate-100">
              {reportTypeOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
          </div>
          <button 
            onClick={handleGenerateReport} 
            disabled={isLoading}
            className="w-full lg:w-auto flex items-center justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-slate-600 focus:ring-sky-500 transition-colors disabled:opacity-50">
            <GenerateIcon className="w-5 h-5 mr-2"/> {isLoading ? 'Generating...' : 'Generate Report'}
          </button>
        </div>
      </div>

      {error && <div className="p-3 bg-red-700 border border-red-900 text-red-100 rounded-md text-sm my-2">{error}</div>}
      
      {generatedReport && (
        <div className="mt-6 bg-slate-600 p-4 rounded-md">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-lg font-semibold text-slate-100">
                {getReportConfig(generatedReport.reportType).title} for {generatedReport.month} {generatedReport.year}
            </h4>
            <div className="flex space-x-3">
              <button 
                onClick={handleDownloadExcel}
                className="flex items-center py-2 px-3 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-slate-600 focus:ring-emerald-500 transition-colors">
                <DownloadIcon className="w-5 h-5 mr-2"/> Download Excel
              </button>
              <button 
                onClick={handlePrintStatement}
                className="flex items-center py-2 px-3 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-slate-600 focus:ring-blue-500 transition-colors">
                <PrintIcon className="w-5 h-5 mr-2"/> Print Statement
              </button>
            </div>
          </div>

          <div className="overflow-x-auto max-h-[60vh]">
            <table className="min-w-full divide-y divide-slate-500">
              <thead className="bg-slate-500 sticky top-0 z-10">
                <tr>
                  {generatedReport.columns.map(col => (
                    <th key={col.key} scope="col" 
                        className={`py-3 px-3 text-left text-xs font-semibold text-slate-100 whitespace-nowrap ${col.isNumeric ? 'text-right' : 'text-center'}`}> {/* Centering non-numeric headers too */}
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700 bg-slate-600">
                {generatedReport.reportType === AdminReportType.OfflinePaybill && generatedReport.subtotalGroups ? (
                  generatedReport.subtotalGroups.flatMap(group => [
                    ...group.data.map((row, rowIndex) => (
                      <tr key={`${group.groupKey}-${rowIndex}`}>
                        {generatedReport.columns.map(col => (
                          <td key={`${col.key}-${rowIndex}`} className={`py-2 px-3 text-xs text-slate-200 whitespace-nowrap ${col.isNumeric ? 'text-right font-mono' : 'text-center'}`}> {/* Centering non-numeric data */}
                            {col.isNumeric ? formatNumberForDisplay(row[col.key]) : String(row[col.key] ?? '')}
                          </td>
                        ))}
                      </tr>
                    )),
                    // Subtotal row
                    <tr key={`${group.groupKey}-subtotal`} className="bg-slate-500 font-semibold subtotal-row">
                       {generatedReport.columns.map(col => (
                          <td key={`${col.key}-subtotal`} className={`py-2 px-3 text-xs text-slate-100 whitespace-nowrap ${col.isNumeric ? 'text-right font-mono' : 'text-center'}`}> {/* Centering non-numeric data */}
                             {col.key === "srNo" ? group.subtotalRow.srNo : (col.isNumeric ? formatNumberForDisplay(group.subtotalRow[col.key]) : String(group.subtotalRow[col.key] ?? ''))}
                          </td>
                        ))}
                    </tr>
                  ])
                ) : (
                  generatedReport.data.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      {generatedReport.columns.map(col => (
                        <td key={`${col.key}-${rowIndex}`} className={`py-2 px-3 text-xs text-slate-200 whitespace-nowrap ${col.isNumeric ? 'text-right font-mono' : 'text-center'}`}> {/* Centering non-numeric data */}
                          {col.isNumeric ? formatNumberForDisplay(row[col.key]) : String(row[col.key] ?? '')}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
                {/* Grand Total Row */}
                {generatedReport.grandTotalRow && (
                  <tr className="bg-slate-500 font-bold sticky bottom-0 z-10 grandtotal-row">
                     {generatedReport.columns.map(col => (
                        <td key={`${col.key}-grandtotal`} className={`py-3 px-3 text-sm text-sky-300 whitespace-nowrap ${col.isNumeric ? 'text-right font-mono' : 'text-center'}`}> {/* Centering non-numeric data */}
                           {col.key === "srNo" ? generatedReport.grandTotalRow?.srNo : (col.isNumeric ? formatNumberForDisplay(generatedReport.grandTotalRow?.[col.key]) : String(generatedReport.grandTotalRow?.[col.key] ?? ''))}
                        </td>
                      ))}
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

const months = [
  'January', 'February', 'March', 'April', 'May', 'June', 
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default AdminDownloadPage;