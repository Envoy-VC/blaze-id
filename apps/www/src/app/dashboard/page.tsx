import dynamic from 'next/dynamic';
import Link from 'next/link';

import React from 'react';

import { Button } from '~/components/ui/button';

import { Header } from './components';

const DIDTable = dynamic(() => import('./components/DIDTable'), {
  ssr: false,
});

const Dashboard = () => {
  return (
    <div className='p-3'>
      <div className='flex flex-col justify-between md:flex-row'>
        <Header
          title='Identifiers'
          description={
            <>
              DIDs, or Decentralized Identifiers, are your digital keys to a
              self-sovereign identity. Unlike usernames, DIDs put you in
              control. Here, you'll manage various DID types, including public
              key DIDs
              <b>(did:key)</b>, web DIDs <b>(did:web)</b>, Ethereum DIDs{' '}
              <b>(did:ethr)</b> and Polygon ID DIDs <b>(did:polygonid)</b>.
            </>
          }
        />{' '}
        <Button asChild>
          <Link href='/dashboard/create-identifier'>Create Identifier</Link>
        </Button>
      </div>
      <div className='py-8'>
        <DIDTable />
      </div>
    </div>
  );
};

export default Dashboard;
