import { MonthlyTeacherSalaryData } from '../types';

/**
 * Convert month name to number for sorting (0 = January, 11 = December, 12 = unknown)
 */
export const monthNameToNumber = (monthName: string): number => {
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];
  const index = months.findIndex(
    (m) => m.toLowerCase() === monthName.toLowerCase(),
  );
  return index !== -1 ? index : 12;
};

/**
 * Sort salary data by year (desc) then month (desc) — newest first.
 */
export const sortSalaryDataByDateDesc = (
  data: MonthlyTeacherSalaryData[],
): MonthlyTeacherSalaryData[] => {
  return [...data].sort((a, b) => {
    const yearDiff = parseInt(b.year) - parseInt(a.year);
    if (yearDiff !== 0) return yearDiff;
    return monthNameToNumber(b.month) - monthNameToNumber(a.month);
  });
};
