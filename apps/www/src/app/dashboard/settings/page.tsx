import React from 'react';

import { Header } from '../components';
import Backup from './components/Backup';
import Reset from './components/Reset';

const Settings = () => {
  return (
    <div className='p-4'>
      <Header title='Settings' />
      <div className='py-8'>
        <Reset />
        <Backup />
      </div>
    </div>
  );
};

export default Settings;
