'use client';

import React, { useState } from 'react';

import { useBlazeID, usePolygonID, useVeramo } from '~/lib/hooks';

import { W3CCredential } from '@0xpolygonid/js-sdk';
import type { VerifiableCredential } from '@veramo/core';
import { toast } from 'sonner';

import { Button } from '~/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '~/components/ui/dialog';
import { Input } from '~/components/ui/input';

const AddCredential = () => {
  const { importCredential: importPolygonIdCredential } = usePolygonID();
  const { importCredential } = useVeramo();
  const { activeDID } = useBlazeID();

  const [value, setValue] = useState<string>('');

  const onImport = async () => {
    const id = toast.loading('Importing credential...');

    try {
      if (value === '') {
        throw new Error('Please paste a valid credential JSON-LD');
      }
      const parsed = JSON.parse(value);
      const type =
        'credentialSchema' in parsed ? 'W3CCredential' : 'VerifiableCredential';
      if (type === 'W3CCredential') {
        if (activeDID?.startsWith('did:polygonid:')) {
          const credential = W3CCredential.fromJSON(parsed);
          await importPolygonIdCredential(credential, activeDID);
        } else {
          throw new Error('Please select a PolygonID DID');
        }
      } else {
        const credential = parsed as VerifiableCredential;
        await importCredential(credential);
      }
      toast.success('Credential imported successfully', { id });
    } catch (error) {
      console.error(error);
      toast.error((error as Error).message, { id });
    } finally {
      setValue('');
    }
  };

  return (
    <Dialog>
      <DialogTrigger>
        <Button>Add Credential</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Import Credential to your Wallet</DialogTitle>
          <DialogDescription>
            You can import a credential by pasting the credential JSON-LD here.
          </DialogDescription>
          <div className='flex w-full flex-col gap-3 p-3'>
            <Input
              type='textarea'
              placeholder='Paste your credential JSON-LD here...'
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />
            <Button onClick={onImport}>Import Credential</Button>
          </div>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default AddCredential;
