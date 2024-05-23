'use client';

import React from 'react';

import { useVeramo } from '~/lib/hooks';

import { useLiveQuery } from 'dexie-react-hooks';

const Dashboard = () => {
  const { getAllDIDs } = useVeramo();

  const data = useLiveQuery(async () => {
    const dids = await getAllDIDs();
    return dids;
  });

  return (
    <div className='h-[400vh]'>
      <h1 className='text-2xl font-bold'>Dashboard</h1>
      <div>
        {data?.map((did) => (
          <div key={did.did}>
            <p>{did.did}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
