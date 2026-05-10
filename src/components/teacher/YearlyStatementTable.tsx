import React from "react";
import {
  ProcessedStatementData,
  StatementDataRow,
} from "./TeacherIncomeTaxPage";

interface YearlyStatementTableProps {
  activeColumns: ProcessedStatementData["activeColumns"];
  monthlyRows: StatementDataRow[];
  totalsRow: Record<string, string | number>;
}

const YearlyStatementTable: React.FC<YearlyStatementTableProps> = ({
  activeColumns,
  monthlyRows,
  totalsRow,
}) => {
  return (
    <div className="overflow-x-auto w-full">
      <table className="min-w-full text-[8px] sm:text-[9px] border-collapse text-center">
        <thead className="bg-slate-200 text-slate-800">
          <tr>
            <th className="px-1 py-1.5 align-middle border border-slate-400">Month</th>
            {activeColumns.map((col) => (
              <th key={col.excelHeader} className="px-1 py-1.5 align-middle border border-slate-400 font-semibold text-center">
                {col.statementLabel}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white text-slate-800">
          {monthlyRows.map((row) => (
            <tr key={row.values.monthDisplay as string}>
              <td className="px-1 py-1.5 align-middle border border-slate-400 whitespace-nowrap text-center">
                {row.values.monthDisplay}
              </td>
              {activeColumns.map((col) => (
                <td
                  key={col.excelHeader}
                  className="px-1 py-1.5 align-middle border border-slate-400 text-center"
                >
                  {row.values[col.excelHeader]}
                </td>
              ))}
            </tr>
          ))}
          <tr className="bg-slate-100 font-bold">
            <td className="px-1 py-1.5 align-middle border border-slate-400 text-center">Total</td>
            {activeColumns.map((col) => (
              <td
                key={col.excelHeader}
                className="px-1 py-1.5 align-middle border border-slate-400 text-center"
              >
                {totalsRow[col.excelHeader]}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
};
export default YearlyStatementTable;
