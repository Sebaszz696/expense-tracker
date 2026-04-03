const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: { ...getHeaders(), ...options?.headers },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Error en la solicitud');
  return data;
}

export const api = {
  // Expenses
  getExpenses: (month?: number, year?: number, category_id?: number) => {
    const params = new URLSearchParams();
    if (month) params.set('month', String(month));
    if (year) params.set('year', String(year));
    if (category_id) params.set('category_id', String(category_id));
    return request<any[]>(`/api/expenses?${params}`);
  },
  getSummary: (month?: number, year?: number) => {
    const params = new URLSearchParams();
    if (month) params.set('month', String(month));
    if (year) params.set('year', String(year));
    return request<any>(`/api/expenses/summary?${params}`);
  },
  createExpense: (data: any) =>
    request<any>('/api/expenses', { method: 'POST', body: JSON.stringify(data) }),
  updateExpense: (id: number, data: any) =>
    request<any>(`/api/expenses/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteExpense: (id: number) =>
    request<any>(`/api/expenses/${id}`, { method: 'DELETE' }),

  // Categories
  getCategories: () => request<any[]>('/api/categories'),
  createCategory: (data: any) =>
    request<any>('/api/categories', { method: 'POST', body: JSON.stringify(data) }),
  updateCategory: (id: number, data: any) =>
    request<any>(`/api/categories/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteCategory: (id: number) =>
    request<any>(`/api/categories/${id}`, { method: 'DELETE' }),

  // Income
  getIncome: (month?: number, year?: number) => {
    const params = new URLSearchParams();
    if (month) params.set('month', String(month));
    if (year) params.set('year', String(year));
    return request<any[]>(`/api/income?${params}`);
  },
  createIncome: (data: any) =>
    request<any>('/api/income', { method: 'POST', body: JSON.stringify(data) }),
  deleteIncome: (id: number) =>
    request<any>(`/api/income/${id}`, { method: 'DELETE' }),
};
