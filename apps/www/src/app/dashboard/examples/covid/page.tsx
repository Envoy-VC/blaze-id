import dynamic from 'next/dynamic';

import React from 'react';

import { Header } from '../../components';

const CovidForm = dynamic(() => import('../components/CovidForm'), {
  ssr: false,
});

const CovidCredentialPage = () => {
  return (
    <div className='p-4'>
      <Header title='COVID-19 Vaccine Certification' />
      <CovidForm />
    </div>
  );
};

export default CovidCredentialPage;
