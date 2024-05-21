'use client';

import dynamic from 'next/dynamic';

const DynamicHome = dynamic(() => import('../components/Home'), {
  ssr: false,
});

const Home = () => {
  return (
    <div>
      <DynamicHome />
    </div>
  );
};

export default Home;
