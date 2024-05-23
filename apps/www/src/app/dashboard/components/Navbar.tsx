import React from 'react';

import { getSession } from '~/lib/iron-session';

import { Button } from '~/components/ui/button';

import SelectDID from './SelectDID';

const formattedAddress = (address: string) => {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

const Navbar = async () => {
  const session = await getSession();
  return (
    <div className='flex h-[10dvh] flex-row items-center justify-between border-b px-4 py-2 sm:h-[7dvh]'>
      <SelectDID />
      <AccountButton username={session.username} />
    </div>
  );
};

const AccountButton = ({ username }: { username: string }) => {
  return (
    <Button className='h-12 rounded-xl' variant='outline'>
      <div className='flex flex-row items-center gap-3'>
        <img
          src={`https://api.dicebear.com/8.x/shapes/svg?seed=${username}`}
          alt=''
          className='h-9 w-9 rounded-full'
        />
        <div className='flex flex-col items-start'>
          <div className='font-semibold'>{formattedAddress(username)}</div>
        </div>
      </div>
    </Button>
  );
};

export default Navbar;
