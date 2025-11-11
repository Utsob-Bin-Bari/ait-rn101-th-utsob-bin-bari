import { Task } from './tasksSQLiteService';

export interface PaginationResult<T> {
  data: T[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
  hasMore: boolean;
  pageSize: number;
}

export const paginationService = {
  paginate: <T>(
    items: T[],
    page: number = 1,
    pageSize: number = 20
  ): PaginationResult<T> => {
    const totalItems = items.length;
    const totalPages = Math.ceil(totalItems / pageSize);
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    
    const data = items.slice(startIndex, endIndex);
    const hasMore = endIndex < totalItems;

    return {
      data,
      currentPage: page,
      totalPages,
      totalItems,
      hasMore,
      pageSize
    };
  },

  loadMore: <T>(
    currentItems: T[],
    allItems: T[],
    pageSize: number = 20
  ): T[] => {
    const nextIndex = currentItems.length;
    const nextBatch = allItems.slice(nextIndex, nextIndex + pageSize);
    return [...currentItems, ...nextBatch];
  },

  hasMore: <T>(
    currentItems: T[],
    allItems: T[]
  ): boolean => {
    return currentItems.length < allItems.length;
  },

  getPageForItem: <T>(
    items: T[],
    itemIndex: number,
    pageSize: number = 20
  ): number => {
    return Math.floor(itemIndex / pageSize) + 1;
  },

  getTotalPages: <T>(
    items: T[],
    pageSize: number = 20
  ): number => {
    return Math.ceil(items.length / pageSize);
  },

  getPageItems: <T>(
    items: T[],
    page: number,
    pageSize: number = 20
  ): T[] => {
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return items.slice(startIndex, endIndex);
  }
};

