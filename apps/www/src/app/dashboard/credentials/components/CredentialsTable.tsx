'use client';

import { usePolygonID, useVeramo } from '~/lib/hooks';
import type { Credential as VeramoCredential } from '~/lib/storage/datastore';

import { W3CCredential } from '@0xpolygonid/js-sdk';
import type { ColumnDef } from '@tanstack/react-table';
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { useLiveQuery } from 'dexie-react-hooks';
import { create } from 'zustand';

import { Button } from '~/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '~/components/ui/dialog';
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

interface Store {
  isOpen: boolean;
  data: VeramoCredential | W3CCredential | null;
  setOpen(value: boolean, data: VeramoCredential | W3CCredential | null): void;
}

const useCredentialsStore = create<Store>((set) => ({
  isOpen: false,
  data: null,
  setOpen: (value, data) => set({ isOpen: value, data }),
}));

const truncate = (value: string, length: number) => {
  return value.length > length ? value.substring(0, length) + '...' : value;
};

export type Data = {
  id: string;
  type: string[];
  issuer: string;
  issuanceDate: string;
  data: VeramoCredential | W3CCredential;
};

export const columns: ColumnDef<Data>[] = [
  {
    accessorKey: 'id',
    header: 'Credential ID',
    cell: ({ row }) => {
      const credential = row.original;
      return truncate(credential.id, 24);
    },
  },
  {
    accessorKey: 'type',
    header: 'Type',
    cell: ({ row }) => {
      const credential = row.original;
      return credential.type.join(', ');
    },
  },
  {
    accessorKey: 'issuer',
    header: 'Issuer',
    cell: ({ row }) => {
      const credential = row.original;
      return truncate(credential.issuer, 24);
    },
  },
  {
    accessorKey: 'issuanceDate',
    header: 'Issuance Date',
    cell: ({ row }) => {
      const credential = row.original;
      return new Date(credential.issuanceDate).toLocaleDateString();
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const credential = row.original;
      const { setOpen } = useCredentialsStore();

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
              onClick={() => {
                navigator.clipboard.writeText(credential.id);
              }}
            >
              Copy Credential ID
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                navigator.clipboard.writeText(credential.issuer);
              }}
            >
              Copy Issuer ID
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                setOpen(true, credential.data);
              }}
            >
              Show Credential
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

export default function CredentialsTable() {
  const { getAllCredentials } = useVeramo();
  const { getAllCredentials: getAllPolygonCredentials } = usePolygonID();
  const { isOpen, data: cred, setOpen } = useCredentialsStore();

  const data = useLiveQuery(async () => {
    const vc = await getAllCredentials();
    const polygonVCs = await getAllPolygonCredentials();
    const res: Data[] = [];
    for (const c of vc) {
      res.push({
        id: c.id ?? c.hash,
        type: (typeof c.type === 'string' ? [c.type] : c.type) ?? [],
        issuer: typeof c.issuer === 'string' ? c.issuer : c.issuer.id,
        issuanceDate: c.issuanceDate,
        data: c,
      });
    }

    for (const c of polygonVCs) {
      res.push({
        id: c.id,
        type: c.type,
        issuer: c.issuer,
        issuanceDate: c.issuanceDate ?? '',
        data: c,
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
      <Dialog
        open={isOpen}
        onOpenChange={(open) => {
          if (!open) {
            setOpen(false, null);
          } else {
            setOpen(true, cred);
          }
        }}
      >
        <DialogContent className='h-[40rem] w-full max-w-3xl overflow-scroll'>
          <DialogHeader>
            <DialogTitle>Credential</DialogTitle>
          </DialogHeader>
          <pre className='break-all'>{JSON.stringify(cred, null, 2)}</pre>
        </DialogContent>
      </Dialog>
    </div>
  );
}
