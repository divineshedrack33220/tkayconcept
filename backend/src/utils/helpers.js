const generateOrderNumber = () => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `TK-${timestamp}-${random}`;
};

const calculatePagination = (page, limit) => {
  const currentPage = Math.max(1, parseInt(page) || 1);
  const itemsPerPage = Math.min(100, Math.max(1, parseInt(limit) || 12));
  const skip = (currentPage - 1) * itemsPerPage;
  return { currentPage, itemsPerPage, skip };
};

module.exports = { generateOrderNumber, calculatePagination };
