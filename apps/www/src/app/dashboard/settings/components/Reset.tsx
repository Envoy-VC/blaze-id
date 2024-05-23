'use client';

import { useRouter } from 'next/navigation';

import React from 'react';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '~/components/ui/alert-dialog';
import { Button } from '~/components/ui/button';

const Reset = () => {
  const router = useRouter();
  return (
    <div className='flex w-full flex-row items-center justify-between gap-3'>
      <div>
        <div className='text-lg font-semibold'>Reset Wallet</div>
        <div className='text-sm text-gray-400'>
          Reset your wallet and delete all data
        </div>
      </div>
      <AlertDialog>
        <AlertDialogTrigger>
          <Button>Reset Wallet</Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              wallet and all of its data including identities and credentials.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction>
              <Button
                onClick={() => {
                  indexedDB
                    .databases()
                    .then((dbs) => {
                      dbs.forEach((db) => {
                        indexedDB.deleteDatabase(db.name ?? '');
                      });
                    })
                    .then(() => {
                      router.refresh();
                    });
                }}
              >
                Reset Wallet
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Reset;
