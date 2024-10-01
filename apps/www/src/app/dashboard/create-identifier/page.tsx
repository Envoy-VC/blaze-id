import dynamic from 'next/dynamic';

import React from 'react';

import { Header } from '../components';

const CreateForm = dynamic(() => import('./components/CreateForm'), {
  ssr: false,
});

const CreateIdentifier = () => {
  return (
    <div className='p-4'>
      {/* <Header title='Create Identifier' /> */}
      <CreateForm />
    </div>
  );
};

export default CreateIdentifier;
