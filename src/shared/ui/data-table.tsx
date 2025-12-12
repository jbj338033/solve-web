'use client'

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from '@tanstack/react-table'
import { Loader2 } from 'lucide-react'
import { cn } from '@/shared/lib'

interface DataTableProps<TData> {
  columns: ColumnDef<TData, any>[]
  data: TData[]
  isLoading?: boolean
  emptyMessage?: string
  onRowClick?: (row: TData) => void
  hasNext?: boolean
  isLoadingMore?: boolean
  onLoadMore?: () => void
}

export function DataTable<TData>({
  columns,
  data,
  isLoading,
  emptyMessage = '데이터가 없습니다',
  onRowClick,
  hasNext,
  isLoadingMore,
  onLoadMore,
}: DataTableProps<TData>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border py-16 text-center text-sm text-muted-foreground">
        {emptyMessage}
      </div>
    )
  }

  return (
    <div>
      <div className="overflow-hidden rounded-lg border border-border">
        <table className="w-full">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-b border-border bg-muted/50">
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className={cn(
                      'px-4 py-3 text-left text-sm font-medium text-muted-foreground',
                      header.column.columnDef.meta?.className
                    )}
                    style={{ width: header.column.columnDef.size }}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                onClick={() => onRowClick?.(row.original)}
                className={cn(
                  'border-b border-border last:border-0 hover:bg-muted/30',
                  onRowClick && 'cursor-pointer'
                )}
              >
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className={cn('px-4 py-3', cell.column.columnDef.meta?.className)}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {hasNext && onLoadMore && (
        <div className="mt-4 flex justify-center">
          <button
            onClick={onLoadMore}
            disabled={isLoadingMore}
            className="flex h-9 items-center gap-2 rounded-lg border border-border px-4 text-sm hover:bg-muted disabled:opacity-50"
          >
            {isLoadingMore && <Loader2 className="size-4 animate-spin" />}
            더 보기
          </button>
        </div>
      )}
    </div>
  )
}

declare module '@tanstack/react-table' {
  interface ColumnMeta<TData, TValue> {
    className?: string
  }
}
