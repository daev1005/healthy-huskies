const parseYYYYMMDDToLocalDate = (date) => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  if (!match) return null;

  const y = Number(match[1]);
  const m = Number(match[2]);
  const d = Number(match[3]);

  const dt = new Date(y, m - 1, d);
  dt.setHours(0, 0, 0, 0);

  if (dt.getFullYear() !== y || dt.getMonth() !== m - 1 || dt.getDate() !== d) return null;
  return dt;
};

const isFutureDay = (dateObj) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const d = new Date(dateObj);
  d.setHours(0, 0, 0, 0);

  return d > today;
};

module.exports = { parseYYYYMMDDToLocalDate, isFutureDay };