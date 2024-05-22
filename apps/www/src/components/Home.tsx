import React from 'react';

import { useLitAuth, usePolygonID, useVeramo } from '~/lib/hooks';

import Navbar from './Navbar';
import { Button } from './ui/button';

const HomeComponent = () => {
  const { authWithPasskey } = useLitAuth();
  const { createDID, createCredential } = useVeramo();
  const { createDID: createPolygonIDDID } = usePolygonID();

  return (
    <div>
      <Navbar />
      <div className='flex w-fit flex-col gap-2'>
        start by mint pkp
        <Button
          onClick={async () => {
            // const res = await mintPKP('Vedant');
            // console.log(res);
          }}
        >
          Mint PKP
        </Button>
        <Button
          onClick={async () => {
            const res = await createDID({
              provider: 'did:key',
            });
            console.log(res);
          }}
        >
          Generate DID
        </Button>
        <Button
          onClick={async () => {
            const res = await createCredential({
              credential: {
                issuer: {
                  id: 'did:key:z6Mkvi4DjUA2MTReKLYXMqaumUYVfXWuwbC8uXjNEZkhqh3H',
                },
                credentialSubject: {
                  id: 'did:key:z6Mkvi4DjUA2MTReKLYXMqaumUYVfXWuwbC8uXjNEZkhqh3H',
                  you: 'Rock',
                },
              },
              proofFormat: 'jwt',
            });
            console.log(res);
          }}
        >
          Create Credential
        </Button>
        <Button
          onClick={async () => {
            // const res = await mintPKP('Vedant');
            // console.log(res);
          }}
        >
          Mint PKP
        </Button>
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

export default HomeComponent;
