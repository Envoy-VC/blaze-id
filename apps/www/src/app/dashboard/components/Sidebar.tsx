'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import React from 'react';

import { circuitStorage, initProofService } from '~/lib/polygon-id';

import { CircuitId } from '@0xpolygonid/js-sdk';
import { useLiveQuery } from 'dexie-react-hooks';
import Logo from 'public/logo.png';
import { toast } from 'sonner';

import { Button } from '~/components/ui/button';

import { CircleCheck, TriangleAlert } from 'lucide-react';
import { BookOpenCheck, CreditCard, Settings, UsersRound } from 'lucide-react';

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
    name: 'Examples',
    Icon: BookOpenCheck,
    href: '/dashboard/examples',
  },
];

const Sidebar = () => {
  const pathName = usePathname();
  const [r, sR] = React.useState<boolean>(false);
  const circuitsLoaded = useLiveQuery(async () => {
    try {
      await circuitStorage.loadCircuitData(CircuitId.StateTransition);
      await circuitStorage.loadCircuitData(CircuitId.AtomicQuerySigV2);
      return true;
    } catch (error) {
      return false;
    }
  }, [r, sR]);
  return (
    <div className='w-full max-w-xs'>
      <div className='sticky top-0 flex h-screen flex-col justify-between border px-2 py-4'>
        <div className='flex flex-col'>
          <div className='flex flex-row items-center justify-center gap-2'>
            <Image src={Logo} alt='logo' width={36} height={36} />
            <h1 className='text-2xl font-bold'>Blaze ID</h1>
          </div>
          <div className='mt-3 w-full border-t border-neutral-300 px-4' />
          <div className='flex w-full flex-col gap-4 px-4 py-6'>
            {sidebarLinks.map(({ name, Icon, href }) => {
              const isActive = pathName.split('/')[2] === href.split('/')[2];
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
        <div className='m-4 flex flex-col gap-3'>
          <Button
            variant={'ghost'}
            className={`flex h-11 w-full items-center justify-start gap-2 rounded-2xl text-[14px] font-medium`}
            onClick={async () => {
              if (!circuitsLoaded) {
                await initProofService();
                sR((p) => !p);
                toast.success('Proof Service Initialized');
              } else {
                toast.info('Proof Service Already Initialized');
              }
            }}
          >
            {circuitsLoaded ? (
              <CircleCheck size={24} strokeWidth={2} />
            ) : (
              <TriangleAlert size={24} strokeWidth={2} />
            )}
            {circuitsLoaded
              ? 'Proof Service Initialized'
              : 'Initialize Proof Service'}
          </Button>
          <Button
            asChild
            variant={pathName === '/dashboard/settings' ? 'default' : 'ghost'}
            className={`flex h-11 w-full items-center justify-start gap-2 rounded-2xl text-[14px] font-medium`}
          >
            <Link href='/dashboard/settings'>
              <Settings size={24} strokeWidth={2} />
              Settings
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
