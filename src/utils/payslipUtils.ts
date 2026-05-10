export const getValueFromRow = (
  rawHeaders: string[] | undefined, 
  rawDataRow: (string | number | null)[] | undefined, 
  excelHeaderCandidates: string[]
): string | number | null => {
  if (!rawHeaders || !rawDataRow || !excelHeaderCandidates || excelHeaderCandidates.length === 0) return null;
  const normalize = (header: string | null | undefined): string => 
    (header || '').trim().toLowerCase().replace(/[\s._\-\/()]/g, '');

  for (const candidate of excelHeaderCandidates) {
      const normalizedCandidate = normalize(candidate);
      const headerIndex = rawHeaders.findIndex(h => normalize(h) === normalizedCandidate);
      
      if (headerIndex !== -1 && rawDataRow[headerIndex] !== undefined && rawDataRow[headerIndex] !== null && String(rawDataRow[headerIndex]).trim() !== '') {
        return rawDataRow[headerIndex];
      }
  }
  return null; 
};
