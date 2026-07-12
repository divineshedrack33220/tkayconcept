const calculatePagination = (page, limit) => {
  const currentPage = Math.max(1, parseInt(page) || 1);
  const itemsPerPage = Math.min(100, Math.max(1, parseInt(limit) || 12));
  const skip = (currentPage - 1) * itemsPerPage;
  return { currentPage, itemsPerPage, skip };
};

module.exports = { calculatePagination };
