import React from 'react';

import { Header } from '../../components';
import KYCForm from '../components/KYCForm';

const KYCCredentialPage = () => {
  return (
    <div className='p-4'>
      <Header title='KYC Age Credential' />
      <KYCForm />
    </div>
  );
};

export default KYCCredentialPage;
