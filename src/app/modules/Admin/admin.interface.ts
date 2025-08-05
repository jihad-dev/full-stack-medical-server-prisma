

export interface IAdminFilterRequest {
  name?: string;
  email?: string;
  contactNumber?: string;
  role?: string;
  status?: string;
  searchTerm?: string;
}

export interface IAdminOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
