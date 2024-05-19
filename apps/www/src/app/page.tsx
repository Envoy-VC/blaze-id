'use client';

import React from 'react';

import { Navbar } from '~/components';

import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';

const Home = () => {
  const [did, setDID] = React.useState<string>('');
  return (
    <div>
      <Navbar />
      <div className='flex w-fit flex-col gap-2'>
        <Button
          onClick={async () => {
            const res = await fetch('/api/did', {
              method: 'POST',
              body: JSON.stringify({
                method: 'create',
              }),
            });
            const data = await res.json();
            console.log(data);
          }}
        >
          Generate DID
        </Button>
        <Button
          onClick={async () => {
            const res = await fetch('/api/did', {
              method: 'POST',
              body: JSON.stringify({
                method: 'delete',
                did,
              }),
            });
            const data = await res.json();
            console.log(data);
          }}
        >
          Delete DID
        </Button>
        <Input
          placeholder='DID'
          value={did}
          onChange={(e) => setDID(e.target.value)}
        />
      </div>
    </div>
  );
};

export default Home;
