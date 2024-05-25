'use client';

import React from 'react';

import useBackup from '~/lib/hooks/useBackup';

import { truncate } from '~/lib/utils';

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '~/components/ui/alert-dialog';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';

import { Copy } from 'lucide-react';

const Backup = () => {
  const { createBackup, restoreBackup } = useBackup();
  const [openBackupModal, setOpenBackupModal] = React.useState<boolean>(false);
  const [openRestoreModal, setOpenRestoreModal] =
    React.useState<boolean>(false);

  const [hash, setHash] = React.useState<string>('');
  const [input, setInput] = React.useState<string>('');

  const onBackup = async () => {
    const cid = await createBackup();
    setHash(cid);
  };

  const onRestore = async () => {
    await restoreBackup(input);
  };

  return (
    <div className='flex flex-col'>
      <div className='flex w-full flex-row items-center justify-between gap-3 py-2'>
        <div>
          <div className='text-lg font-semibold'>Backup Wallet</div>
          <div className='text-sm text-gray-400'>
            Backup your wallet data to restore it later
          </div>
        </div>
        <AlertDialog>
          <AlertDialogTrigger>
            <Button>Backup Wallet</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will backup and encrypt your wallet data. You can restore
                it later using IPFS Hash
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className='flex flex-row items-center gap-2'>
              {hash && (
                <div className='flex flex-row gap-2'>
                  <div className='text-sm text-gray-400'>IPFS Hash:</div>
                  <div className='text-sm text-gray-400'>
                    {truncate(hash, 36, false)}
                  </div>
                </div>
              )}
              {hash && (
                <Button
                  variant='link'
                  className=''
                  onClick={() => {
                    navigator.clipboard.writeText(hash);
                  }}
                >
                  <Copy size={16} />
                </Button>
              )}
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <Button onClick={onBackup}>Backup Wallet</Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
      <div className='flex w-full flex-row items-center justify-between gap-3 py-2'>
        <div>
          <div className='text-lg font-semibold'>Restore Wallet</div>
          <div className='text-sm text-gray-400'>
            Restore your wallet data from IPFS Hash
          </div>
        </div>
        <AlertDialog>
          <AlertDialogTrigger>
            <Button>Restore Wallet</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will restore your wallet data from IPFS Hash and overwrite
                existing data.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className='flex flex-row items-center gap-2'>
              <Input
                placeholder='IPFS Hash'
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <Button onClick={onRestore}>Restore Wallet</Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default Backup;
