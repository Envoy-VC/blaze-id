'use client';

import { useRouter } from 'next/navigation';

import React from 'react';

import { useLitAuth } from '~/lib/hooks';

import { Input } from '../ui/input';

import { Fingerprint, ShieldPlus } from 'lucide-react';

const Create = () => {
  const router = useRouter();
  const { authWithPasskey, mintPKP } = useLitAuth();
  const [username, setUsername] = React.useState<string>('');
  return (
    <div className='flex w-full flex-col items-center justify-center gap-8 py-6'>
      <div className='flex flex-col items-center justify-center gap-2 sm:flex-row'>
        <Input
          placeholder='Username'
          className='w-[300px] rounded-full'
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoCorrect='false'
        />
        <button
          className='flex w-fit flex-row items-center gap-2 rounded-full bg-[#F05C4F] px-4 py-2 font-medium'
          onClick={async () => {
            await mintPKP(username);
          }}
        >
          <ShieldPlus size={20} /> Create PKP
        </button>
      </div>
      <div className='flex w-full max-w-sm flex-row items-center gap-2 text-neutral-300'>
        <div className='w-full border border-neutral-400'></div>
        OR
        <div className='w-full border border-neutral-400'></div>
      </div>
      <button
        className='flex w-fit flex-row items-center gap-2 rounded-full border border-neutral-300 px-4 py-2 font-medium text-neutral-200'
        onClick={async () => {
          await authWithPasskey();
          router.push('/dashboard');
        }}
      >
        <Fingerprint size={20} /> Authenticate
      </button>
    </div>
  );
};

export default Create;
