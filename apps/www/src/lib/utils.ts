import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const truncate = (
  value: string,
  length: number,
  fromMiddle: boolean
) => {
  return value.length < length
    ? value
    : fromMiddle
      ? value.slice(0, length / 2) + '...' + value.slice(-length / 2)
      : value.slice(0, length) + '...';
};
