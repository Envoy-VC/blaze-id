'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import React from 'react';

import Logo from 'public/logo.png';

import { Button } from '~/components/ui/button';

import {
  CreditCard,
  Presentation,
  ShieldCheck,
  UsersRound,
} from 'lucide-react';

const sidebarLinks = [
  {
    name: 'Identities',
    Icon: UsersRound,
    href: '/dashboard',
  },
  {
    name: 'Credentials',
    Icon: CreditCard,
    href: '/dashboard/credentials',
  },
  {
    name: 'Presentation',
    Icon: Presentation,
    href: '/dashboard/presentation',
  },
  {
    name: 'Proofs',
    Icon: ShieldCheck,
    href: '/dashboard/proofs',
  },
];

const Sidebar = () => {
  const pathName = usePathname();
  return (
    <div className='w-full max-w-xs'>
      <div className='sticky top-0 flex h-screen flex-col border px-2 py-4'>
        <div className='flex flex-row items-center justify-center gap-2'>
          <Image src={Logo} alt='logo' width={36} height={36} />
          <h1 className='text-2xl font-bold'>Blaze ID</h1>
        </div>
        <div className='mt-3 w-full border-t border-neutral-300 px-4' />
        <div className='flex w-full flex-col gap-4 px-4 py-6'>
          {sidebarLinks.map(({ name, Icon, href }) => {
            const isActive = pathName === href;
            return (
              <Button
                key={name}
                asChild
                variant={isActive ? 'default' : 'ghost'}
                className={`flex h-11 w-full items-center justify-start gap-2 rounded-2xl text-[14px] font-medium`}
              >
                <Link href={href}>
                  <Icon size={24} strokeWidth={2} />
                  {name}
                </Link>
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
