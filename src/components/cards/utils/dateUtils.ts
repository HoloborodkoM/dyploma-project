export const isRecent = (date: string | Date | null | undefined, days: number = 7): boolean => {
  if (!date) return false;
  
  const now = new Date();
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const differenceInDays = (now.getTime() - dateObj.getTime()) / (1000 * 3600 * 24);
  
  return differenceInDays <= days;
};