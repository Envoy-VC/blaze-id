import Image from 'next/image';
import Link from 'next/link';

import React from 'react';

import Logo from 'public/logo.png';

import { ArrowRight } from 'lucide-react';

const navLinks = [
  {
    title: 'Home',
    href: '/',
  },
  {
    title: 'Dashboard',
    href: '/dashboard',
  },
  {
    title: 'Credentials',
    href: '/dashboard/credentials',
  },
  {
    title: 'Identity',
    href: '/dashboard/identity',
  },
];

const Navbar = () => {
  return (
    <div className='mx-auto flex h-[10dvh] max-w-screen-xl flex-row items-center justify-between px-4 py-2 sm:h-[8dvh]'>
      <div className='flex items-center gap-2'>
        <Image src={Logo} alt='Logo' className='w-8' />
        <h1 className='text-2xl font-bold text-white'>Blaze</h1>
      </div>
      <div className='hidden gap-4 md:flex'>
        {navLinks.map((link) => (
          <Link
            key={link.title}
            href={link.href}
            className='text-lg font-semibold text-white hover:text-gray-300'
          >
            {link.title}
          </Link>
        ))}
      </div>
      <div className='flex items-center'>
        <div className='rainbow-gradient rounded-full p-[2px]'>
          <button className='flex h-full items-center gap-2 rounded-full bg-black px-2 py-1 text-sm text-white sm:px-4 sm:py-2 sm:text-base'>
            Get Started <ArrowRight size={20} strokeWidth={3} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
