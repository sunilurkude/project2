import React, { useRef } from "react";
import {
  Teacher,
  MonthlyTeacherSalaryData,
  PayslipFieldMapping,
} from "../../types";
import { PrinterIcon, DocumentDownloadIcon } from "../icons/FeatureIcons";
import { getValueFromRow } from "../../utils/payslipUtils"; // Import from new utility file
import { useData } from "../../contexts/DataContext";
// @ts-ignore
import html2pdf from "html2pdf.js";

interface PayslipDisplayProps {
  teacher: Teacher;
  salaryData: MonthlyTeacherSalaryData;
  mappings: PayslipFieldMapping[];
  targetMonth: string;
  targetYear: string;
}

const parseNumericValue = (value: any): number => {
  if (value === null || value === undefined || String(value).trim() === "")
    return 0;
  const num = parseFloat(String(value).replace(/[^0-9.-]+/g, ""));
  return isNaN(num) ? 0 : num;
};

const formatAmount = (value: any): string => {
  const num = parseNumericValue(value);
  return num.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const numberToWords = (num: number): string => {
  if (num === 0) return "Zero";

  const integerPartAbs = Math.floor(Math.abs(num));
  if (integerPartAbs === 0) return "";

  const ones = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ];
  const tens = [
    "",
    "",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety",
  ];
  const thousands = ["", "Thousand", "Lakh", "Crore"];

  let words = "";
  let currentNum = integerPartAbs;
  let i = 0;

  while (currentNum > 0) {
    if (currentNum % 1000 !== 0) {
      words =
        convertLessThanOneThousand(currentNum % 1000) +
        (thousands[i] ? " " + thousands[i] : "") +
        (words ? " " + words : "");
    }
    currentNum = Math.floor(currentNum / 1000);
    i++;
  }

  return words.trim();

  function convertLessThanOneThousand(n: number): string {
    let currentWords = "";
    if (n >= 100) {
      currentWords += ones[Math.floor(n / 100)] + " Hundred";
      n %= 100;
      if (n > 0) currentWords += " ";
    }
    if (n >= 20) {
      currentWords += tens[Math.floor(n / 10)];
      n %= 10;
      if (n > 0) currentWords += " ";
    }
    if (n > 0) {
      currentWords += ones[n];
    }
    return currentWords.trim();
  }
};

export const PayslipDisplay: React.FC<PayslipDisplayProps> = ({
  teacher,
  salaryData,
  mappings,
  targetMonth,
  targetYear,
}) => {
  const payslipPrintAreaRef = useRef<HTMLDivElement>(null);
  const { handleAddAuditLog } = useData();

  const getMappedValue = (
    mapping: PayslipFieldMapping,
  ): string | number | null => {
    if (mapping.valueKey && teacher[mapping.valueKey]) {
      const val = teacher[mapping.valueKey];
      if (typeof val === "string" || typeof val === "number") return val;
    }
    return getValueFromRow(
      salaryData.rawHeaders,
      salaryData.rawDataRow,
      mapping.excelHeaderCandidates,
    );
  };

  const headerDataElements: { label: string; value: string }[] = [];
  const payslipHeaderFields = [
    "NAME OF SCHOOL",
    "SCHOOL SHALARTH DDO CODE",
    "EMPLOYEE NAME",
    "SHALARTH ID",
    "GPF NO",
    "PAN NO",
    "PRAN NO",
    "ADHAR NO",
    "EMAIL ID",
    "MOB NO",
    "BANK ACCOUNT NUMBER",
    "PAY MATRIX",
    "BANK IFSC CODE",
    "BRANCH NAME",
  ];

  payslipHeaderFields.forEach((fieldLabel) => {
    const mapping = mappings.find(
      (m) => m.payslipLabel === fieldLabel && m.category === "headerInfo",
    );
    let valueToDisplay = "N/A";
    if (mapping) {
      let value = null;
      // Prioritize salaryData for name/shalarthID, fallback to teacher object
      if (fieldLabel === "EMPLOYEE NAME") {
        value = getMappedValue(mapping) || teacher.name;
      } else if (fieldLabel === "SHALARTH ID") {
        value = getMappedValue(mapping) || teacher.shalarthId;
      } else {
        value = getMappedValue(mapping);
      }

      if (value !== null && String(value).trim() !== "") {
        valueToDisplay = String(value);
      }
    } else if (fieldLabel === "EMPLOYEE NAME" && teacher.name) {
      valueToDisplay = teacher.name;
    } else if (fieldLabel === "SHALARTH ID" && teacher.shalarthId) {
      valueToDisplay = teacher.shalarthId;
    }

    // School name is not part of the compact header items, but fetched for use elsewhere if needed
    if (fieldLabel !== "NAME OF SCHOOL") {
      headerDataElements.push({ label: fieldLabel, value: valueToDisplay });
    }
  });

  const emolumentsList: { label: string; value: number }[] = [];
  const govtRecoveriesList: { label: string; value: number }[] = [];
  const nonGovtRecoveriesList: { label: string; value: number }[] = [];

  mappings.forEach((m) => {
    if (
      m.category === "emolument" ||
      m.category === "govtRecovery" ||
      m.category === "nonGovtRecovery"
    ) {
      const rawValue = getMappedValue(m);
      const numericValue = parseNumericValue(rawValue);

      if (numericValue !== 0) {
        const item = { label: m.payslipLabel, value: numericValue };
        if (m.category === "emolument") emolumentsList.push(item);
        else if (m.category === "govtRecovery") govtRecoveriesList.push(item);
        else if (m.category === "nonGovtRecovery")
          nonGovtRecoveriesList.push(item);
      }
    }
  });

  const totalEmoluments = emolumentsList.reduce(
    (sum, item) => sum + item.value,
    0,
  );
  const totalGovtRecoveries = govtRecoveriesList.reduce(
    (sum, item) => sum + item.value,
    0,
  );
  const totalNonGovtRecoveries = nonGovtRecoveriesList.reduce(
    (sum, item) => sum + item.value,
    0,
  );
  const grandTotalDeductions = totalGovtRecoveries + totalNonGovtRecoveries;

  const netPayExcelMapping = mappings.find(
    (m) => m.payslipLabel === "EMPLOYEE NET SALARY",
  );
  let netPayFromExcel: string | number | null = null;
  if (netPayExcelMapping) {
    netPayFromExcel = getMappedValue(netPayExcelMapping);
  }
  const finalNetPay = parseNumericValue(netPayFromExcel);
  const netPayWords = numberToWords(finalNetPay);

  const handlePrintPayslip = async () => {
    const payslipElement = payslipPrintAreaRef.current;
    if (!payslipElement) {
      alert("Could not find payslip content to print.");
      return;
    }
    const safeTargetMonth = targetMonth;
    const safeTargetYear = targetYear;
    const safeTeacherName = teacher.name || "Teacher";
    const fileName = `Payslip-${safeTargetMonth}-${safeTargetYear}-${safeTeacherName.replace(/\s+/g, "_")}.pdf`;

    const opt = {
      margin: 10,
      filename: fileName,
      image: { type: "jpeg" as const, quality: 1 },
      html2canvas: { scale: 3, useCORS: true, letterRendering: true, windowWidth: 1024 },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" as const },
    };

    html2pdf()
      .set(opt)
      .from(payslipElement)
      .toPdf()
      .get("pdf")
      .then((pdf: any) => {
        pdf.autoPrint();
        const blobUrl = pdf.output("bloburl");
        const printWindow = window.open(blobUrl, "_blank");
        if (!printWindow) {
          alert("Please allow pop-ups to preview the print statement.");
        }
      });
  };

  const handleDownloadPDF = () => {
    const payslipElement = payslipPrintAreaRef.current;
    if (!payslipElement) {
      alert("Could not find payslip content to download.");
      return;
    }
    const safeTargetMonth = targetMonth;
    const safeTargetYear = targetYear;
    const safeTeacherName = teacher.name || "Teacher";
    const fileName = `Payslip-${safeTargetMonth}-${safeTargetYear}-${safeTeacherName.replace(/\s+/g, "_")}.pdf`;

    // We clone the element so we can modify styles just for the PDF if needed.
    // Or we simply use html2pdf directly on the ref current element with custom settings.

    const opt = {
      margin: 10, // mm
      filename: fileName,
      image: { type: "jpeg" as const, quality: 1 },
      html2canvas: { scale: 3, useCORS: true, letterRendering: true, windowWidth: 1024 },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" as const },
    };

    html2pdf().set(opt).from(payslipElement).save();
    handleAddAuditLog('DOWNLOAD_PAYSLIP', `Downloaded payslip for ${safeTargetMonth} ${safeTargetYear}`);
  };

  const maxRows = Math.max(
    emolumentsList.length,
    govtRecoveriesList.length,
    nonGovtRecoveriesList.length,
  );

  const designationMapping = mappings.find(
    (m) => m.payslipLabel === "DESIGNATION",
  );
  let designationValue = teacher.designation || "N/A";
  if (designationMapping) {
    const excelDesignation = getMappedValue(designationMapping);
    if (excelDesignation !== null && String(excelDesignation).trim() !== "") {
      designationValue = String(excelDesignation);
    }
  }

  const shalarthIdIndex = headerDataElements.findIndex(
    (item) => item.label === "SHALARTH ID",
  );
  const allHeaderItems = [
    ...headerDataElements.slice(0, shalarthIdIndex + 1),
    { label: "DESIGNATION", value: designationValue },
    ...headerDataElements.slice(shalarthIdIndex + 1),
  ];

  const headerRows = [];
  for (let i = 0; i < allHeaderItems.length; i += 2) {
    headerRows.push([allHeaderItems[i], allHeaderItems[i + 1]]);
  }

  return (
    // Main container for the component, includes the print button (which is hidden on print)
    <div className="w-full">
      <div
        ref={payslipPrintAreaRef}
        className="bg-white text-black p-1 sm:p-2 border border-black shadow-lg printable-payslip max-w-3xl mx-auto font-sans "
      >
        <div className="text-center mb-3 payslip-main-header">
          <h4 className="font-bold text-lg sm:text-xl uppercase tracking-wider">
            Salary Slip
          </h4>
          <div className="text-sm sm:text-base font-semibold text-black mt-1 uppercase">
            Payslip for {targetMonth}-{targetYear}
          </div>
        </div>

        {/* Employee Information Table */}
        <table className="w-full mt-3 text-[10px] sm:text-[11px] mb-4 text-black font-sans">
          <tbody>
            {headerRows.map((row, i) => (
              <tr key={i} className="">
                <td style={{width: '20%'}} className="px-1 py-1 align-top text-left font-semibold">
                  {row[0].label}:
                </td>
                <td style={{width: '30%'}} className="px-1 py-1 align-top text-left font-mono break-words">
                  {row[0].value}
                </td>
                <td style={{width: '20%'}} className="px-1 py-1 align-top text-left font-semibold">
                  {row[1] ? row[1].label + ":" : ""}
                </td>
                <td style={{width: '30%'}} className="px-1 py-1 align-top text-left font-mono break-words">
                  {row[1] ? row[1].value : ""}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Salary Details Table */}
        <table className="w-full mt-3 text-[10px] sm:text-[10px] border-collapse border border-black break-inside-avoid text-black text-center">
          <thead>
            <tr className="border-b border-black text-center">
              <th
                colSpan={2}
                className="px-1 py-1.5 align-middle text-center font-normal border-r border-black"
              >
                Emoluments
              </th>
              <th
                colSpan={3}
                className="px-1 py-1.5 align-middle text-center font-normal border-r border-black"
              >
                Govt. Recoveries
              </th>
              <th
                colSpan={3}
                className="px-1 py-1.5 align-middle text-center font-normal"
              >
                Non Govt. Recoveries
              </th>
            </tr>
            <tr className="border-b border-black text-center text-[10px] sm:text-[11px]">
              <th className="px-1 py-1.5 align-middle text-center font-normal border-r border-black w-[20%]">Particulars</th>
              <th className="px-1 py-1.5 align-middle text-center font-normal border-r border-black w-[15%]">Amount(Rs.)</th>
              <th className="px-1 py-1.5 align-middle text-center font-normal border-r border-black w-[18%]">Particulars</th>
              <th className="px-1 py-1.5 align-middle text-center font-normal border-r border-black w-[12%]">Amount(Rs.)</th>
              <th className="px-1 py-1.5 align-middle text-center font-normal border-r border-black w-[5%]">Inst. No.</th>
              <th className="px-1 py-1.5 align-middle text-center font-normal border-r border-black w-[15%]">Particulars</th>
              <th className="px-1 py-1.5 align-middle text-center font-normal border-r border-black w-[10%]">Amount(Rs.)</th>
              <th className="px-1 py-1.5 align-middle text-center font-normal w-[5%]">Inst. No.</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: maxRows }).map((_, idx) => (
              <tr key={idx} className="">
                <td className="px-1 py-1.5 border-r border-black break-words align-middle text-center">
                  {emolumentsList[idx]?.label || "\u00A0"}
                </td>
                <td className="px-1 py-1.5 border-r border-black font-mono text-center align-middle text-center whitespace-nowrap">
                  {emolumentsList[idx]
                    ? formatAmount(emolumentsList[idx].value)
                    : ""}
                </td>
                <td className="px-1 py-1.5 border-r border-black break-words align-middle text-center">
                  {govtRecoveriesList[idx]?.label || "\u00A0"}
                </td>
                <td className="px-1 py-1.5 border-r border-black font-mono text-center align-middle text-center whitespace-nowrap">
                  {govtRecoveriesList[idx]
                    ? formatAmount(govtRecoveriesList[idx].value)
                    : ""}
                </td>
                <td className="px-1 py-1.5 border-r border-black align-middle text-center">
                  {/* Inst No placeholders */}
                </td>
                <td className="px-1 py-1.5 border-r border-black break-words align-middle text-center">
                  {nonGovtRecoveriesList[idx]?.label || "\u00A0"}
                </td>
                <td className="px-1 py-1.5 border-r border-black font-mono text-center align-middle text-center whitespace-nowrap">
                  {nonGovtRecoveriesList[idx]
                    ? formatAmount(nonGovtRecoveriesList[idx].value)
                    : ""}
                </td>
                <td className="px-1 py-1.5 align-middle text-center">
                  {/* Inst No placeholders */}
                </td>
              </tr>
            ))}
            {/* Totals Row */}
            <tr className="border-t border-b border-black text-[9px] sm:text-[10px]">
              <td className="px-1 py-1.5 align-middle text-center border-r border-black font-semibold">
                Total Emolument
              </td>
              <td className="px-1 py-1.5 align-middle text-center border-r border-black font-mono text-center font-semibold">
                {formatAmount(totalEmoluments)}
              </td>
              <td className="px-1 py-1.5 align-middle text-center border-r border-black font-semibold">
                Total Govt. Recoveries
              </td>
              <td className="px-1 py-1.5 align-middle text-center border-r border-black font-mono text-center font-semibold">
                {formatAmount(totalGovtRecoveries)}
              </td>
              <td className="px-1 py-1.5 align-middle text-center border-r border-black">
              </td>
              <td className="px-1 py-1.5 align-middle text-center border-r border-black font-semibold">
                Total NG Recoveries
              </td>
              <td className="px-1 py-1.5 align-middle text-center border-r border-black font-mono text-center font-semibold">
                {formatAmount(totalNonGovtRecoveries)}
              </td>
              <td className="px-1 py-1.5 align-middle text-center">
              </td>
            </tr>
          </tbody>
        </table>

        {/* Net Pay & Footer - using table structure to match borders */}
        <table className="w-full text-[10px] sm:text-[10px] border-collapse border-b border-l border-r border-black break-inside-avoid text-black text-center">
          <tbody>
            <tr className="border-b border-black">
              <td className="px-1 py-2 pr-2 align-middle text-center">
                Net Pay:-{" "}
                <span className="ml-4 font-mono font-normal mr-2">
                  {formatAmount(finalNetPay)}
                </span>
                ( {netPayWords} Rupees Only )
              </td>
              <td className="px-1 py-2 pl-2 border-l border-black align-middle text-center w-1/3 uppercase text-center">
                {headerRows.length > 0 && headerRows[0][1]
                  ? headerRows[0][1].value
                  : ""}
              </td>
            </tr>
            <tr className="border-b border-black">
              <td colSpan={2} className="px-1 py-2 align-middle text-center">
                Voucher No: <span className="mr-8"> </span> Voucher Date:
              </td>
            </tr>
            <tr>
              <td
                colSpan={2}
                className="px-1 py-2 text-[10px] sm:text-[11px] align-middle text-center"
              >
                This is a system-generated payslip. Hence signature is not
                needed
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Print / Download buttons */}
      <div className="mt-4 flex justify-center gap-4 action-buttons no-print">
        <button
          onClick={handlePrintPayslip}
          className="py-2 px-6 bg-sky-600 text-white rounded-lg hover:bg-sky-500 transition-all font-medium text-sm flex items-center justify-center shadow-lg shadow-sky-600/20"
          aria-label="Print Payslip Statement"
        >
          <PrinterIcon className="w-5 h-5 mr-2" /> Print Statement
        </button>
        <button
          onClick={handleDownloadPDF}
          className="py-2 px-6 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-all font-medium text-sm flex items-center justify-center shadow-lg shadow-slate-700/20"
          aria-label="Download PDF"
        >
          <DocumentDownloadIcon className="w-5 h-5 mr-2" /> Download PDF
        </button>
      </div>
    </div>
  );
};
