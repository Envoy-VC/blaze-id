'use client';

import { usePolygonID, useVeramo } from '~/lib/hooks';

import type { ColumnDef } from '@tanstack/react-table';
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { useLiveQuery } from 'dexie-react-hooks';
import { toast } from 'sonner';

import { Button } from '~/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table';

import { MoreHorizontal } from 'lucide-react';

export type DID = {
  id: string;
  alias?: string;
  provider: string;
};

export const columns: ColumnDef<DID>[] = [
  {
    accessorKey: 'id',
    header: 'DID',
  },
  {
    accessorKey: 'alias',
    header: 'Alias',
  },
  {
    accessorKey: 'provider',
    header: 'Provider',
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const did = row.original;
      const { deleteDID } = useVeramo();

      const onDelete = async () => {
        if (
          did.provider === 'did:key' ||
          did.provider === 'did:web' ||
          did.provider === 'did:ethr:mainnet'
        ) {
          await deleteDID(did.id);
        } else {
          toast.error('Cannot delete PolygonID DIDs');
        }
      };

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='ghost' className='h-8 w-8 p-0'>
              <span className='sr-only'>Open menu</span>
              <MoreHorizontal className='h-4 w-4' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(did.id)}
            >
              Copy ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onDelete}>Delete DID</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

export default function DIDTable() {
  const { getAllDIDs } = useVeramo();
  const { getAllDIDs: getAllPolygonDIDs } = usePolygonID();

  const data = useLiveQuery(async () => {
    const dids = await getAllDIDs();
    const polygonDIDs = await getAllPolygonDIDs();
    const res: DID[] = [];
    for (const did of dids) {
      res.push({
        id: did.did,
        alias: did.alias,
        provider: did.provider,
      });
    }

    for (const did of polygonDIDs) {
      res.push({
        id: did.did,
        provider: 'did:polygonid',
      });
    }
    return res;
  });
  const table = useReactTable({
    data: data ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className='rounded-md border'>
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && 'selected'}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className='h-24 text-center'>
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
