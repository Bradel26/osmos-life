const ALLOWED_PAGE_SIZES = [10, 25, 50, 100];

export function buildSearchFilter(searchParams, columns) {
  const search = searchParams.get('search');
  if (!search || !columns.length) return null;
  const term = `%${search}%`;
  return {
    clause: `(${columns.map((c) => `${c} LIKE ?`).join(' OR ')})`,
    params: columns.map(() => term)
  };
}

export function buildEqualsFilter(searchParams, param, column) {
  const value = searchParams.get(param);
  if (!value) return null;
  return { clause: `${column} = ?`, params: [value] };
}

export function buildDateRangeFilter(searchParams, column) {
  const clauses = [];
  const params = [];
  const dateFrom = searchParams.get('dateFrom');
  if (dateFrom) {
    clauses.push(`${column} >= ?`);
    params.push(dateFrom);
  }
  const dateTo = searchParams.get('dateTo');
  if (dateTo) {
    clauses.push(`${column} <= ?`);
    params.push(`${dateTo} 23:59:59`);
  }
  return clauses.length ? { clause: clauses.join(' AND '), params } : null;
}

export function combineFilters(...parts) {
  const active = parts.filter(Boolean);
  return {
    whereSql: active.length ? `WHERE ${active.map((p) => p.clause).join(' AND ')}` : '',
    params: active.flatMap((p) => p.params)
  };
}

export function buildOrder(searchParams, sortableColumns, defaultColumn) {
  const sortBy = searchParams.get('sortBy');
  const sortDir = (searchParams.get('sortDir') || 'desc').toLowerCase() === 'asc' ? 'ASC' : 'DESC';
  const column = sortableColumns.has(sortBy) ? sortBy : defaultColumn;
  return `ORDER BY ${column} ${sortDir}`;
}

export function buildPagination(searchParams) {
  const page = Math.max(1, parseInt(searchParams.get('page'), 10) || 1);
  const requestedSize = parseInt(searchParams.get('pageSize'), 10);
  const pageSize = ALLOWED_PAGE_SIZES.includes(requestedSize) ? requestedSize : 25;
  return { page, pageSize, limit: pageSize, offset: (page - 1) * pageSize };
}
