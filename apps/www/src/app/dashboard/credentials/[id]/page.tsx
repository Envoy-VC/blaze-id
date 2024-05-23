'use client';

import { useSearchParams } from 'next/navigation';

import React from 'react';

import CredentialDetails from '../components/CredentialDetails';

const CredentialPage = ({ params }: { params: { id: string } }) => {
  const id = params.id;
  const searchParams = useSearchParams();
  const type = searchParams.get('type') as 'polygonid' | 'veramo';
  return <CredentialDetails id={id} type={type} />;
};

export default CredentialPage;
