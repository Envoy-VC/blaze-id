import React from 'react';

interface Props {
  title: React.ReactNode;
  description?: React.ReactNode;
}

const Header = ({ title, description }: Props) => {
  return (
    <div className='flex flex-col gap-2'>
      <div className='text-3xl font-medium'>{title}</div>
      <p className='max-w-3xl text-[14px] font-medium text-neutral-500'>
        {description}
      </p>
    </div>
  );
};

export default Header;
