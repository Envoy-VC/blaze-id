'use client';

import React from 'react';

import { authenticatePKP, mintPKP } from '~/lib/lit/client';
import { createPolygonIDDID } from '~/lib/polygon-id';

import { Navbar } from '~/components';
import { api } from '~/trpc/react';

import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';

const Home = () => {
  const [did, setDID] = React.useState<string>('');

  const createDID = api.did.create.useMutation();
  const deleteDID = api.did.delete.useMutation();
  const getChallenge = api.webauthn.randomChallenge.useMutation();
  const verifyAuth = api.webauthn.verify.useMutation();

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
            const res = await mintPKP('Vedant');
            console.log(res);
          }}
        >
          Mint PKP
        </Button>
        <Button
          onClick={async () => {
            const res = await authenticatePKP();
            console.log(res);
          }}
        >
          Authenticate PKP
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
      </div>
    </div>
  );
};

export default Home;
