import dynamic from 'next/dynamic';

import React from 'react';

const Sidebar = dynamic(() => import('./dashboard/components/Sidebar'), {
  ssr: false,
});

const NotFound = () => {
  return (
    <div className='flex flex-row'>
      <Sidebar />
      Not Found
    </div>
  );
};

export default NotFound;
