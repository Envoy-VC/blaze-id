import dynamic from 'next/dynamic';

import React from 'react';

import { Header } from '../../components';

const KYCForm = dynamic(() => import('../components/KYCForm'), { ssr: false });

const KYCCredentialPage = () => {
  return (
    <div className='p-4'>
      <Header title='KYC Age Credential' />
      <KYCForm />
    </div>
  );
};

export default KYCCredentialPage;
