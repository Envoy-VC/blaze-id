import dynamic from 'next/dynamic';
import Link from 'next/link';

import React from 'react';

import { Button } from '~/components/ui/button';

import { Header } from '../components';

const CredentialsTable = dynamic(() => import('./components/CredentialsTable'));

const Dashboard = () => {
  return (
    <div className='p-4'>
      <div className='flex flex-col justify-between md:flex-row'>
        <Header
          title='Verifiable Credentials'
          description={
            <>
              Verifiable Credentials (VCs) are tamper-proof digital records
              issued by trusted organizations. They contain information about
              you, like degrees or licenses, without revealing sensitive
              details. Here, you can manage your VCs, controlling what data you
              share and with whom.
            </>
          }
        />{' '}
        <Button asChild>
          <Link href='/dashboard/examples'>Create Credential</Link>
        </Button>
      </div>
      <div className='py-8'>
        <CredentialsTable />
      </div>
    </div>
  );
};

export default Dashboard;
