export const getCurrentTimeWithZeroSeconds = (date: Date = new Date()): Date => {
  const d = new Date(date);
  d.setSeconds(0);
  d.setMilliseconds(0);
  return d;
};

export const formatDate = (d: Date): string => {
  const month = d.getMonth() + 1;
  return `${d.getFullYear()}-${addLeadingZero(month)}-${addLeadingZero(d.getDate())}`;
};

export const convertToMinutes = (hourMinutes: string): number => {
  const splitHours = hourMinutes.split(":");
  return Number(splitHours[0]) * 60 + Number(splitHours[1]);
};

export const getHourMinutes = (d: Date): string => {
  return `${addLeadingZero(d.getHours())}:${addLeadingZero(d.getMinutes())}:00.000Z`;
};

const addLeadingZero = (val: number): string => {
  return val <= 9 ? `0${val}` : val.toString();
};
