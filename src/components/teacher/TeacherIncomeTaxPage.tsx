
import React, { useState } from 'react';
import { DocumentDownloadIcon, SearchCircleIcon, PrinterIcon as PrintStatementIcon } from '../icons/FeatureIcons';
import { MonthlyTeacherSalaryData, Teacher } from '../../types';
import YearlyStatementTable from './YearlyStatementTable'; 
// @ts-ignore
import html2pdf from "html2pdf.js";



const financialYears = Array.from({ length: 6 }, (_, i) => {
  const startYear = 2024 + i;
  const endYear = startYear + 1;
  return `${startYear}-${endYear.toString().slice(-2)}`; 
});


const MONTH_ORDER_FINANCIAL_YEAR = [
  'March', 'April', 'May', 'June', 'July', 'August', 
  'September', 'October', 'November', 'December', 'January', 'February'
];

const CALCULATED_SUM_TOTAL_DEDUCTIONS_KEY = "CALCULATED_SUM_TOTAL_DEDUCTIONS";

// Configuration for the yearly statement columns based on user's request
// Added displayInStatement flag (implicitly true unless set to false)
const STATEMENT_COLUMN_CONFIG = [
  { statementLabel: "BASIC PAY", excelHeader: "BASIC PAY" },
  { statementLabel: "D.A", excelHeader: "D.A" },
  { statementLabel: "HRA", excelHeader: "HRA" },
  { statementLabel: "T.A", excelHeader: "T.A" },
  { statementLabel: "T.A ARREAR", excelHeader: "T.A ARREAR" },
  { statementLabel: "TRIBAL ALLOWANCE", excelHeader: "TRIBAL ALLOWANCE" },
  { statementLabel: "WASHING ALLOWANCE", excelHeader: "WASHING ALLOWANCE" },
  { statementLabel: "DA ARREARS", excelHeader: "DA ARREARS" },
  { statementLabel: "BASIC ARREARS", excelHeader: "BASIC ARREARS" },
  { statementLabel: "CLA", excelHeader: "CLA" },
  { statementLabel: "NPS EMPR ALLOW", excelHeader: "NPS EMPR ALLOW" },
  { statementLabel: "TOTAL PAY", excelHeader: "TOTAL PAY" },
  { statementLabel: "F A", excelHeader: "F A" }, // AL
  { statementLabel: "GPF", excelHeader: "GPF" },
  { statementLabel: "GPF ADV", excelHeader: "GPF ADV" },
  { statementLabel: "PT", excelHeader: "PT" },
  { statementLabel: "GIS(ZP)", excelHeader: "GIS(ZP)" },
  { statementLabel: "GIS SCOUT", excelHeader: "GIS SCOUT" },
  { statementLabel: "DCPS REGULAR", excelHeader: "DCPS REGULAR" },
  { statementLabel: "DCPS DELAYED", excelHeader: "DCPS DELAYED" },
  { statementLabel: "DCPS PAY ARREARS RECOVERY", excelHeader: "DCPS PAY ARREARS RECOVERY" },
  { statementLabel: "REVENUE STAMP", excelHeader: "REVENUE STAMP" },
  { statementLabel: "DCPS DA ARREARS RECOVERY", excelHeader: "DCPS DA ARREARS RECOVERY" },
  { statementLabel: "GROUP ACCIDENTAL POLICY", excelHeader: "GROUP ACCIDENTAL POLICY" },
  { statementLabel: "NAA", excelHeader: "NAA" },
  { statementLabel: "NPS EMPR CONTRI", excelHeader: "NPS EMPR CONTRI" },
  { statementLabel: "NPS EMP CONTRI", excelHeader: "NPS EMP CONTRI" },
  { statementLabel: "NPS EMPR CONTRI ARR", excelHeader: "NPS EMPR CONTRI ARR" },
  { statementLabel: "NPS EMP CONTRI ARR", excelHeader: "NPS EMP CONTRI ARR" },
  { statementLabel: "INCOME TAX", excelHeader: "INCOME TAX" },
  { statementLabel: "CO-OP BANK", excelHeader: "CO-OP BANK" },
  { statementLabel: "NGR(LIC)", excelHeader: "NGR(LIC)" },
  { statementLabel: "NGR(SOCIETY LOAN)", excelHeader: "NGR(SOCIETY LOAN)" },
  { statementLabel: "NGR(MISC)", excelHeader: "NGR(MISC)" },
  { statementLabel: "NGR(OTHER RECOVERY)", excelHeader: "NGR(OTHER RECOVERY)" },
  { statementLabel: "NGR(RD)", excelHeader: "NGR(RD)" },
  // These are part of the new sum for "Total Deduction" BUT NOT DISPLAYED
  { statementLabel: "TOTAL GOVT DEDUCTIONS", excelHeader: "TOTAL GOVT DEDUCTIONS", displayInStatement: false }, // AZ
  { statementLabel: "NPS TOTAL", excelHeader: "NPS TOTAL", displayInStatement: false }, // BF - HIDDEN
  { statementLabel: "NGR(TOTAL DEDUCTIONS)", excelHeader: "NGR(TOTAL DEDUCTIONS)", displayInStatement: false }, // BP (Original Excel col)
  // The new "Total Deduction" line
  { statementLabel: "Total Deduction", excelHeader: CALCULATED_SUM_TOTAL_DEDUCTIONS_KEY }, // Will be calculated
  { statementLabel: "EMPLOYEE NET SALARY", excelHeader: "EMPLOYEE NET SALARY" },
];

const getValueByExactHeader = (
  rawHeaders: string[] | undefined, 
  rawDataRow: (string | number | null)[] | undefined, 
  excelHeader: string,
): string | number | null => {
  if (!rawHeaders || !rawDataRow || !excelHeader) return null;
  const normalize = (header: string | null | undefined): string => 
    (header || '').toLowerCase().replace(/[\s._\-\/()]/g, '');
  const normalizedExcelHeader = normalize(excelHeader);
  const headerIndex = rawHeaders.findIndex(h => normalize(h) === normalizedExcelHeader);
  if (headerIndex !== -1 && rawDataRow[headerIndex] !== undefined && rawDataRow[headerIndex] !== null && String(rawDataRow[headerIndex]).trim() !== '') {
    return rawDataRow[headerIndex];
  }
  return null; 
};

const parseNumeric = (value: any): number => {
  if (value === null || value === undefined || String(value).trim() === '') return 0;
  const num = parseFloat(String(value).replace(/[^0-9.-]+/g, ''));
  return isNaN(num) ? 0 : num;
};

interface YearlyStatementPageProps {
  teacher: Teacher;
  monthlySalaryDataList: MonthlyTeacherSalaryData[];
  adminContactMobile: string; 
}

export interface StatementDataRow {
  month: string;
  year: string;
  values: Record<string, number | string>; 
}
export interface ProcessedStatementData {
  staticInfo: {
    taluka: string;
    schoolName: string;
    employeeName: string;
    financialYear: string;
  };
  activeColumns: { statementLabel: string; excelHeader: string }[];
  monthlyRows: StatementDataRow[];
  totalsRow: Record<string, number | string>;
}


export const TeacherIncomeTaxPage = ({ teacher, monthlySalaryDataList, adminContactMobile }: YearlyStatementPageProps): React.ReactElement => {
  const [selectedYear, setSelectedYear] = useState<string>(financialYears[0]);
  const [statementData, setStatementData] = useState<ProcessedStatementData | null>(null);
  const [showStatement, setShowStatement] = useState<boolean>(false);
  const [statementError, setStatementError] = useState<string | null>(null);
  
  const handleShowYearlyStatement = (): void => {
    setStatementError(null);
    setShowStatement(false);
    setStatementData(null);

    const [startYrStr, endYrStrFull] = selectedYear.split('-');
    const startYearNum = parseInt(startYrStr);
    const endYearNum = parseInt(`20${endYrStrFull}`);

    const financialYearMonthsData: {month: string, year: number, salaryRecord?: MonthlyTeacherSalaryData}[] = [];
    MONTH_ORDER_FINANCIAL_YEAR.forEach((monthName, index) => {
        const currentEntryYear = index < 10 ? startYearNum : endYearNum; 
        financialYearMonthsData.push({
            month: monthName,
            year: currentEntryYear,
            salaryRecord: monthlySalaryDataList.find(
                d => d.teacherShalarthId === teacher.shalarthId &&
                     d.month.toLowerCase() === monthName.toLowerCase() &&
                     parseInt(d.year) === currentEntryYear
            )
        });
    });
    
    const hasAnyDataForPeriod = financialYearMonthsData.some(m => m.salaryRecord);
    if (!hasAnyDataForPeriod) {
        setStatementError(`No salary data found for the financial year ${selectedYear} for ${teacher.name}. Please contact Admin at ${adminContactMobile}.`);
        return;
    }
    
    let taluka = 'N/A';
    let schoolName = 'N/A';
    let employeeName = teacher.name;
    const firstAvailableRecord = financialYearMonthsData.find(m => m.salaryRecord)?.salaryRecord;
    if (firstAvailableRecord) {
        taluka = String(getValueByExactHeader(firstAvailableRecord.rawHeaders, firstAvailableRecord.rawDataRow, "BLOCK / TALUKA") || 'N/A');
        schoolName = String(getValueByExactHeader(firstAvailableRecord.rawHeaders, firstAvailableRecord.rawDataRow, "NAME OF SCHOOL") || 'N/A');
        const empNameRecord = getValueByExactHeader(firstAvailableRecord.rawHeaders, firstAvailableRecord.rawDataRow, "EMPLOYEE NAME") || getValueByExactHeader(firstAvailableRecord.rawHeaders, firstAvailableRecord.rawDataRow, "EMP NAME");
        if (empNameRecord) {
             employeeName = String(empNameRecord);
        }
    }

    const columnTotals: Record<string, number> = {};
    STATEMENT_COLUMN_CONFIG.forEach(col => columnTotals[col.excelHeader] = 0);
    columnTotals[CALCULATED_SUM_TOTAL_DEDUCTIONS_KEY] = 0;


    const monthlyRows: StatementDataRow[] = financialYearMonthsData.map(monthEntry => {
        const rowValues: Record<string, number | string> = { monthDisplay: `${monthEntry.month} ${monthEntry.year}`};
        
        STATEMENT_COLUMN_CONFIG.forEach(colConfig => {
          if (colConfig.excelHeader !== CALCULATED_SUM_TOTAL_DEDUCTIONS_KEY) { 
            let value = 0;
            if (monthEntry.salaryRecord) {
                value = parseNumeric(getValueByExactHeader(monthEntry.salaryRecord.rawHeaders, monthEntry.salaryRecord.rawDataRow, colConfig.excelHeader));
            }
            rowValues[colConfig.excelHeader] = value;
            columnTotals[colConfig.excelHeader] += value;
          }
        });

        let calculatedMonthlyTotalDeduction = 0;
        if (monthEntry.salaryRecord) {
            const fA_Value = parseNumeric(getValueByExactHeader(monthEntry.salaryRecord.rawHeaders, monthEntry.salaryRecord.rawDataRow, "F A"));
            const totalGovtDeductions_Value = parseNumeric(getValueByExactHeader(monthEntry.salaryRecord.rawHeaders, monthEntry.salaryRecord.rawDataRow, "TOTAL GOVT DEDUCTIONS"));
            const npsTotal_Value = parseNumeric(getValueByExactHeader(monthEntry.salaryRecord.rawHeaders, monthEntry.salaryRecord.rawDataRow, "NPS TOTAL"));
            const ngrTotalDeductions_Value = parseNumeric(getValueByExactHeader(monthEntry.salaryRecord.rawHeaders, monthEntry.salaryRecord.rawDataRow, "NGR(TOTAL DEDUCTIONS)"));
            calculatedMonthlyTotalDeduction = fA_Value + totalGovtDeductions_Value + npsTotal_Value + ngrTotalDeductions_Value;
        }
        rowValues[CALCULATED_SUM_TOTAL_DEDUCTIONS_KEY] = calculatedMonthlyTotalDeduction;
        columnTotals[CALCULATED_SUM_TOTAL_DEDUCTIONS_KEY] += calculatedMonthlyTotalDeduction;

        return { month: monthEntry.month, year: String(monthEntry.year), values: rowValues };
    });

    const activeColumns = STATEMENT_COLUMN_CONFIG.filter(
        colConfig => (colConfig.displayInStatement !== false) && (columnTotals[colConfig.excelHeader] !== 0)
    );

    if (activeColumns.length === 0) {
        setStatementError(`All potential data columns have zero totals for ${selectedYear}. No statement to display.`);
        return;
    }
    
    const totalsRowProcessed: Record<string, number | string> = { monthDisplay: 'Total' };
    activeColumns.forEach(col => {
        totalsRowProcessed[col.excelHeader] = columnTotals[col.excelHeader];
    });

    setStatementData({
        staticInfo: {
            taluka,
            schoolName,
            employeeName,
            financialYear: selectedYear,
        },
        activeColumns,
        monthlyRows: monthlyRows.map(row => ({ 
            ...row,
            values: {
                monthDisplay: row.values.monthDisplay, 
                ...Object.fromEntries(activeColumns.map(ac => [ac.excelHeader, row.values[ac.excelHeader]]))
            }
        })),
        totalsRow: totalsRowProcessed,
    });
    setShowStatement(true);
    return;
  };

  const handlePrintStatement = (): void => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
        const statementContentElement = document.getElementById('yearly-statement-content');
        let statementContentHTML = statementContentElement ? statementContentElement.innerHTML : null;
        const staticInfo = statementData?.staticInfo;

        if (statementContentHTML && staticInfo) {
            const escapeBackticks = (str: string) => str.replace(/`/g, '\\`');
            const safeFinancialYear = escapeBackticks(staticInfo.financialYear);
            const safeEmployeeName = escapeBackticks(staticInfo.employeeName);
            const safeShalarthId = escapeBackticks(teacher.shalarthId);
            const safeSchoolName = escapeBackticks(staticInfo.schoolName);
            const safeTaluka = escapeBackticks(staticInfo.taluka);
            
            statementContentHTML = escapeBackticks(statementContentHTML); 

            printWindow.document.open();
            printWindow.document.write(`
                <html>
                <head>
                    <title>Yearly Statement - ${safeFinancialYear} - ${safeEmployeeName}</title>
                    <style>
                        body { font-family: Arial, sans-serif; margin: 20px; font-size: 10pt; }
                        .statement-container { width: 100%; margin: 0 auto; }
                        .statement-header { text-align: center; margin-bottom: 15px; }
                        .statement-header h3 { margin: 0; font-size: 14pt; }
                        .statement-header p { margin: 2px 0; font-size: 10pt; }
                        .info-grid { display: grid; grid-template-columns: auto 1fr auto 1fr; gap: 3px 10px; margin-bottom: 15px; font-size: 9pt; }
                        .info-grid div { white-space: nowrap; }
                        .info-grid span:first-child { font-weight: bold; padding-right: 5px;}
                        table { width: 100%; border-collapse: collapse; font-size: 8pt; margin-top: 10px; }
                        th, td { border: 1px solid #888; padding: 3px; text-align: left; color: black !important; background-color: white !important; }
                        th { background-color: #e0e0e0 !important; font-weight: bold; }
                        td.amount, th.amount { text-align: right; }
                        .total-row td { font-weight: bold; background-color: #efefef !important; }
                        @media print {
                            body { margin: 10mm; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                            .no-print-in-popup { display: none !important; }
                            table { page-break-inside: auto; }
                            tr { page-break-inside: avoid; page-break-after: auto; }
                            thead { display: table-header-group; }
                            tfoot { display: table-footer-group; }
                            .statement-table-wrapper { overflow: visible !important; }
                        }
                    </style>
                </head>
                <body>
                    <div class="statement-container print-popup-content">
                        <div class="statement-header">
                            <h3>Yearly Payment Statement</h3>
                            <p>For Financial Year: ${safeFinancialYear}</p>
                        </div>
                        <div class="info-grid">
                            <div><span>Employee Name:</span> ${safeEmployeeName}</div>
                            <div><span>Shalarth ID:</span> ${safeShalarthId}</div>
                            <div><span>School Name:</span> ${safeSchoolName}</div>
                            </div>
                        ${statementContentHTML}
                        <p style="text-align:center; font-size:8pt; margin-top:20px;">*This is a system-generated statement.*</p>
                    </div>
                </body>
                </html>
            `);
            printWindow.document.close(); 

            const script = printWindow.document.createElement('script');
            script.type = 'text/javascript';
            script.textContent = 'window.onload = function() { window.print(); };';
            
            if (printWindow.document.body) {
                 printWindow.document.body.appendChild(script);
            } else {
                printWindow.document.addEventListener('DOMContentLoaded', () => {
                    if(printWindow.document.body) {
                         printWindow.document.body.appendChild(script);
                    } else {
                        console.error("Print window body not found even after DOMContentLoaded.");
                        alert("Failed to initialize print script.");
                    }
                });
            }
        } else {
            alert("Could not retrieve statement content for printing.");
            if (printWindow) printWindow.close();
        }
    } else {
        alert("Could not open print window. Please check your browser's pop-up settings.");
    }
    return;
  };

  const handleDownloadStatementPDF = (): void => {
    const statementElement = document.getElementById("yearly-statement-printable-area");
    if (!statementElement) {
      alert("Could not find statement content to download.");
      return;
    }
    const safeFinancialYear = statementData?.staticInfo?.financialYear || selectedYear;
    const safeTeacherName = teacher.name || "Teacher";
    const fileName = `YearlyStatement-${safeFinancialYear}-${safeTeacherName.replace(/\s+/g, "_")}.pdf`;

    const opt = {
      margin: [10, 10, 10, 10] as [number, number, number, number], // top, left, bottom, right
      filename: fileName,
      image: { type: "jpeg" as const, quality: 1 },
      html2canvas: { 
        scale: 2, 
        useCORS: true, 
        letterRendering: true, 
        windowWidth: 1200,
        onclone: (clonedDoc: any) => {
          const elements = clonedDoc.querySelectorAll(".overflow-x-auto");
          elements.forEach((el: any) => el.classList.remove("overflow-x-auto"));
          const noPrints = clonedDoc.querySelectorAll(".no-print");
          noPrints.forEach((el: any) => el.style.display = "none");
        }
      },
      jsPDF: { unit: "mm", format: "a4", orientation: "landscape" as const },
    };

    html2pdf().set(opt).from(statementElement).save();
  };

  return (
    <div className="space-y-6">
      <div className="no-print">
        <h3 className="text-xl font-semibold text-slate-100">Income Tax Information</h3>
        
        <div className="p-4 bg-slate-600 rounded-md space-y-6 mt-4">
          <div>
            <h4 className="text-lg font-medium text-sky-300 mb-2">Yearly Statement View</h4>
            <p className="text-sm text-slate-400 mb-3">Select a financial year to view your consolidated monthly statements (March to February).</p>
            <div className="flex flex-col sm:flex-row items-end gap-3">
              <div className="flex-grow">
                <label htmlFor="financialYear" className="block text-sm font-medium text-slate-300">Financial Year</label>
                <select 
                  id="financialYear" 
                  value={selectedYear} 
                  onChange={e => setSelectedYear(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 bg-slate-500 border border-slate-400 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm text-slate-100"
                >
                  {financialYears.map(fy => <option key={fy} value={fy}>{fy}</option>)}
                </select>
              </div>
              <button 
                onClick={handleShowYearlyStatement}
                className="w-full sm:w-auto flex items-center justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-slate-600 focus:ring-sky-500 transition-colors"
              >
                <SearchCircleIcon className="w-5 h-5 mr-2"/> Show Yearly Statement
              </button>
            </div>
          </div>

          <hr className="border-slate-500"/>

          <div>
             
          </div>
        </div>
      </div>
      
      {statementError && <div className="p-3 bg-red-700 border border-red-900 text-red-100 rounded-md text-sm my-2 no-print">{statementError}</div>}

      {showStatement && statementData && (
        <div id="yearly-statement-printable-area" className="yearly-statement-container bg-white text-black p-4 shadow-lg print-popup-content"> 
            <div className="text-center mb-4 no-print-in-popup statement-header"> 
                 <h3 className="text-xl font-bold text-gray-800">Yearly Payment Statement</h3>
                 <p className="text-sm text-gray-600">For Financial Year: {statementData.staticInfo.financialYear}</p>
            </div>
            <div className="info-grid no-print-in-popup"> 
                <div><span>Employee Name:</span> {statementData.staticInfo.employeeName}</div>
                <div><span>Shalarth ID:</span> {teacher.shalarthId}</div>
                <div><span>School Name:</span> {statementData.staticInfo.schoolName}</div>
                </div>
            <div id="yearly-statement-content"> 
              <YearlyStatementTable
                activeColumns={statementData.activeColumns}
                monthlyRows={statementData.monthlyRows}
                totalsRow={statementData.totalsRow}
              />
            </div>
            <div className="mt-6 flex justify-center gap-4 no-print border-t pt-4" data-html2canvas-ignore="true">
                 <button 
                    onClick={handlePrintStatement}
                    className="py-2 px-4 bg-slate-600 text-white rounded-md hover:bg-slate-700 transition-colors flex items-center justify-center"
                    aria-label="Print Statement"
                    >
                    <PrintStatementIcon className="w-5 h-5 mr-2"/> Print Statement
                </button>
                <button 
                  onClick={handleDownloadStatementPDF}
                  className="py-2 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors flex items-center justify-center"
                  aria-label="Download Statement PDF"
                >
                  <DocumentDownloadIcon className="w-5 h-5 mr-2.5" /> Download Statement PDF
                </button>
            </div>
             <p className="text-center text-xs italic mt-4 text-gray-500 no-print-in-popup">*This is a system-generated statement.*</p>
        </div>
      )}
      {!showStatement && !statementError && (
        <p className="text-slate-400 text-center py-4 no-print">Select a financial year and click "Show Yearly Statement" to view details.</p>
      )}

        <p className="text-xs text-slate-400 mt-4 text-center no-print">
            Disclaimer: Tax information provided here is for convenience. Always verify with official documents and consult a tax advisor.
        </p>
    </div>
  );
};

export default TeacherIncomeTaxPage;
