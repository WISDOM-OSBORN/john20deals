import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const WHATSAPP_NUMBER = '233554831090';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatCurrency = (amount: number) => {
  return `GH₵ ${amount.toLocaleString('en-GH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};
