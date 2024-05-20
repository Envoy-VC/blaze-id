'use client';

import React from 'react';

import { useLitAuth } from '~/lib/hooks';
import { createPolygonIDDID } from '~/lib/polygon-id';

import { Navbar } from '~/components';
import { api } from '~/trpc/react';

import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';

const Home = () => {
  const { authWithPasskey } = useLitAuth();
  const [did, setDID] = React.useState<string>('');

  const createDID = api.did.create.useMutation();
  const deleteDID = api.did.delete.useMutation();

  return (
    <div>
      <Navbar />
      <div className='flex w-fit flex-col gap-2'>
        <Button
          onClick={async () => {
            const res = await createDID.mutateAsync();
            console.log(res);
          }}
        >
          Generate DID
        </Button>
        <Button
          onClick={async () => {
            await deleteDID.mutateAsync({ did });
          }}
        >
          Delete DID
        </Button>
        <Button
          onClick={async () => {
            // const res = await mintPKP('Vedant');
            // console.log(res);
          }}
        >
          Mint PKP
        </Button>
        <Input
          placeholder='DID'
          value={did}
          onChange={(e) => setDID(e.target.value)}
        />
        <Button
          onClick={async () => {
            const res = await createPolygonIDDID();
            console.log(res);
          }}
        >
          Create Polygon DID
        </Button>
        <Button
          onClick={async () => {
            const res = await authWithPasskey();
            console.log(res);
          }}
        >
          Auth With Passkey
        </Button>
      </div>
    </div>
  );
};

export default Home;
