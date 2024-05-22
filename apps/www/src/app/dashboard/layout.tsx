import React, { type PropsWithChildren } from 'react';

import { SessionWrapper, Sidebar } from './components';

const Layout = ({ children }: PropsWithChildren) => {
  return (
    <SessionWrapper>
      <div className='flex flex-row'>
        <Sidebar />
        {children}
      </div>
    </SessionWrapper>
  );
};

export default Layout;
