'use client';

import { ReactNode, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ChevronUp, ChevronDown, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/utils/cn';
import { AppButton } from './AppButton';
import { AppInput } from './AppInput';

interface Column<T> {
  key: keyof T | string;
  header: string;
  sortable?: boolean;
  render?: (item: T) => ReactNode;
  className?: string;
}

interface AppTableProps<T extends { id: string }> {
  columns: Column<T>[];
  data: T[];
  searchable?: boolean;
  searchPlaceholder?: string;
  pagination?: boolean;
  pageSize?: number;
  emptyState?: {
    title: string;
    description?: string;
    icon?: ReactNode;
  };
  onRowClick?: (item: T) => void;
  className?: string;
}

export function AppTable<T extends { id: string }>({
  columns,
  data,
  searchable = false,
  searchPlaceholder = 'Pesquisar...',
  pagination = false,
  pageSize = 10,
  emptyState,
  onRowClick,
  className,
}: AppTableProps<T>) {
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);

  const filteredData = useMemo(() => {
    if (!search) return data;
    return data.filter((item) =>
      columns.some((col) => {
        const value = item[col.key as keyof T];
        return String(value).toLowerCase().includes(search.toLowerCase());
      })
    );
  }, [data, search, columns]);

  const sortedData = useMemo(() => {
    if (!sortKey) return filteredData;
    return [...filteredData].sort((a, b) => {
      const aVal = a[sortKey as keyof T];
      const bVal = b[sortKey as keyof T];
      if (aVal === bVal) return 0;
      const comparison = aVal! < bVal! ? -1 : 1;
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [filteredData, sortKey, sortOrder]);

  const paginatedData = useMemo(() => {
    if (!pagination) return sortedData;
    const start = (page - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, pagination, page, pageSize]);

  const totalPages = Math.ceil(sortedData.length / pageSize);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  const renderCell = (item: T, column: Column<T>) => {
    if (column.render) {
      return column.render(item);
    }
    const value = item[column.key as keyof T];
    return <span className="text-sm text-text-primary">{String(value ?? '-')}</span>;
  };

  return (
    <div className={cn('space-y-4', className)}>
      {searchable && (
        <div className="max-w-xs">
          <AppInput
            placeholder={searchPlaceholder}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            leftIcon={<Search className="w-4 h-4" />}
          />
        </div>
      )}

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                {columns.map((column) => (
                  <th
                    key={String(column.key)}
                    className={cn(
                      'px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider',
                      column.sortable && 'cursor-pointer select-none hover:text-primary',
                      column.className
                    )}
                    onClick={() => column.sortable && handleSort(String(column.key))}
                  >
                    <div className="flex items-center gap-1">
                      {column.header}
                      {column.sortable && sortKey === String(column.key) && (
                        sortOrder === 'asc' ? (
                          <ChevronUp className="w-4 h-4 text-primary" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-primary" />
                        )
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-4 py-8 text-center">
                    {emptyState ? (
                      <div className="flex flex-col items-center gap-2">
                        {emptyState.icon}
                        <p className="text-sm text-muted">{emptyState.title}</p>
                      </div>
                    ) : (
                      <p className="text-sm text-muted">Nenhum registro encontrado</p>
                    )}
                  </td>
                </tr>
              ) : (
                paginatedData.map((item, index) => (
                  <motion.tr
                    key={item.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.03 }}
                    className={cn(
                      'border-b border-border/50 last:border-0',
                      'hover:bg-primary/5 transition-colors duration-150',
                      onRowClick && 'cursor-pointer'
                    )}
                    onClick={() => onRowClick?.(item)}
                  >
                    {columns.map((column) => (
                      <td
                        key={String(column.key)}
                        className={cn('px-4 py-3', column.className)}
                      >
                        {renderCell(item, column)}
                      </td>
                    ))}
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {pagination && totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted">
            Mostrando {(page - 1) * pageSize + 1} a{' '}
            {Math.min(page * pageSize, sortedData.length)} de {sortedData.length}
          </p>
          <div className="flex items-center gap-2">
            <AppButton
              variant="ghost"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <ChevronLeft className="w-4 h-4" />
            </AppButton>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum = i + 1;
              if (totalPages > 5) {
                if (page > 3) {
                  pageNum = page - 2 + i;
                  if (pageNum > totalPages) pageNum = totalPages - 4 + i;
                }
              }
              return (
                <AppButton
                  key={pageNum}
                  variant={page === pageNum ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => setPage(pageNum)}
                  className="!w-8 !px-0"
                >
                  {pageNum}
                </AppButton>
              );
            })}
            <AppButton
              variant="ghost"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              <ChevronRight className="w-4 h-4" />
            </AppButton>
          </div>
        </div>
      )}
    </div>
  );
}
