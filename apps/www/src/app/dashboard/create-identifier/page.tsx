import React from 'react';

import { Header } from '../components';
import { CreateForm } from './components';

const CreateIdentifier = () => {
  return (
    <div className='p-4'>
      <Header title='Create Identifier' />
      <CreateForm />
    </div>
  );
};

export default CreateIdentifier;
