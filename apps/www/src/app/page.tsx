'use client';

import React from 'react';

import { createDID } from '~/lib/veramo';

import { Navbar } from '~/components';

import { Button } from '~/components/ui/button';

const Home = () => {
  return (
    <div>
      <Navbar />
      <Button
        onClick={async () => {
          const res = await fetch('/api/create-did', {
            method: 'POST',
            body: JSON.stringify({}),
          });
          const data = await res.json();
          console.log(data);
        }}
      >
        Generate DID
      </Button>
    </div>
  );
};

export default Home;
