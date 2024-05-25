import Link from 'next/link';

import React from 'react';

import { Button } from '~/components/ui/button';

const NotFound = () => {
  return (
    <div className='flex h-screen w-full flex-col items-center justify-center gap-4'>
      <img
        src='https://img.freepik.com/free-vector/404-error-with-people-holding-numbers-concept-illustration_114360-7903.jpg'
        alt=''
        className='w-full max-w-xl'
      />
      <Button>
        <Link href='/'>Go back home</Link>
      </Button>
    </div>
  );
};

export default NotFound;
