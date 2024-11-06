export const serializeToCSV = (data) => {
    const headers = Object.keys(data[0]);
    const rows = data.map(row => headers.map(header => row[header]).join(','));
    return [headers.join(','), ...rows].join('\n');
  };