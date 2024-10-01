import React from 'react';

import Navbar from '../Navbar';

const Hero = () => {
  return (
    <div className='min-h-screen w-full bg-black text-white'>
      <Navbar />
      <h1 className='text-glow mt-12 px-2 pt-24 text-center text-4xl font-semibold sm:text-6xl lg:text-8xl'>
        Forget Passwords. <br />
        ZKP VCs are the future.
      </h1>
      <p className='mx-auto my-6 max-w-3xl px-2 text-center text-sm text-gray-300 sm:text-lg'>
        Blaze ID is a self-sovereign identity (SSI) wallet built for
        privacy.Integrate Polygon ID, DID, and various verifiable credentials
        with secure MPC (multi-party computation) wallets that eliminate private
        key exposure.
      </p>
    </div>
  );
};

export default Hero;
