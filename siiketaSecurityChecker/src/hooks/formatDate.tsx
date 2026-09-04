export const formatDate = (date: any) => {
  let dt = new Date(date);
  let d = dt.getDate();
  let m = dt.getMonth() + 1;
  let y = dt.getFullYear();
  return `${y}-${m < 10 ? "0" + m : m}-${d < 10 ? "0" + d : d}`;
};
