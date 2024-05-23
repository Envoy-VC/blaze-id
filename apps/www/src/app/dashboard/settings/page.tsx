import React from 'react';

import { Header } from '../components';
import Reset from './components/Reset';

const Settings = () => {
  return (
    <div className='p-4'>
      <Header title='Settings' />
      <div className='py-8'>
        <Reset />
      </div>
    </div>
  );
};

export default Settings;
