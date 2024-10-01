import dynamic from 'next/dynamic';

import React, { type PropsWithChildren } from 'react';

const Sidebar = dynamic(() => import('./components/Sidebar'), { ssr: false });
const Navbar = dynamic(() => import('./components/Navbar'), { ssr: false });

const Layout = ({ children }: PropsWithChildren) => {
  return (
    <div className='flex flex-row'>
      <Sidebar />
      <div className='flex w-full flex-col bg-[#F9FAFB]'>
        <Navbar />
        {children}
      </div>
    </div>
  );
};

export default Layout;
