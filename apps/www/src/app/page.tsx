'use client';

import React from 'react';

import { register } from '~/lib/webauthn';

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
            await createDID.mutateAsync();
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
        <Input
          placeholder='DID'
          value={did}
          onChange={(e) => setDID(e.target.value)}
        />
        <Button
          onClick={async () => {
            const { challenge } = await getChallenge.mutateAsync();
            const res = await register({
              username: 'Vedant',
              challenge: challenge,
            });

            const data = await verifyAuth.mutateAsync({
              registration: res,
              expected: {
                challenge,
                origin: 'http://localhost:3000',
              },
            });

            console.log(data);
          }}
        >
          Register Authenticator
        </Button>
      </div>
    </div>
  );
};

export default Home;
