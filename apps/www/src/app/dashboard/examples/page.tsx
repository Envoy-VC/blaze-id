import Link from 'next/link';

import React from 'react';

const Examples = () => {
  return (
    <div className='flex flex-row gap-6 p-4'>
      <Link
        href='/dashboard/examples/kyc'
        className='flex w-full max-w-xs flex-col gap-3 rounded-2xl bg-[#53ae86] p-5 text-white'
      >
        <img
          src='https://img.freepik.com/premium-vector/premium-download-illustration-fingerprint-scanning_362714-3884.jpg'
          alt='KYC Credential'
          className='rounded-xl'
        />
        <div className='flex flex-col'>
          <div className='text-lg font-semibold'>KYC Age Credential</div>
          <div className='text-sm font-medium text-neutral-200'>
            Zero Knowledge Credential (Polygon ID)
          </div>
        </div>
      </Link>
      <Link
        href='/dashboard/examples/covid'
        className='flex w-full max-w-xs flex-col gap-3 rounded-2xl bg-[#3a9d9a] p-5 text-white'
      >
        <img
          src='https://img.freepik.com/free-vector/organic-flat-coronavirus-vaccination-record-card-template_23-2148958534.jpg'
          alt='Covid Vaccine Credential'
          className='rounded-xl'
        />
        <div className='flex flex-col'>
          <div className='text-lg font-semibold'>COVID-19 Credential</div>
          <div className='text-sm font-medium text-neutral-200'>
            General Purpose Credential (did:web, did:key)
          </div>
        </div>
      </Link>
    </div>
  );
};

export default Examples;
