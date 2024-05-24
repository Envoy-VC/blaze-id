import React from 'react';

import { Header } from '../../components';
import CovidForm from '../components/CovidForm';

const CovidCredentialPage = () => {
  return (
    <div className='p-4'>
      <Header title='COVID-19 Vaccine Certification' />
      <CovidForm />
    </div>
  );
};

export default CovidCredentialPage;
