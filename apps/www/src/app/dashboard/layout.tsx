import React, { type PropsWithChildren } from 'react';

import { Navbar, SessionWrapper, Sidebar } from './components';

const Layout = ({ children }: PropsWithChildren) => {
  return (
    <SessionWrapper>
      <div className='flex flex-row'>
        <Sidebar />
        <div className='flex w-full flex-col bg-[#F9FAFB]'>
          <Navbar />
          {children}
        </div>
      </div>
    </SessionWrapper>
  );
};

export default Layout;
