export interface RestResponse<T> {
  success: boolean;
  status: number;
  message: string;
  body: T;
  timestamp: string;
}

export interface PageResponse<T> {
  data: T[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  isFirst: boolean;
  isLast: boolean;
}
