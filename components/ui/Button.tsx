import { ButtonHTMLAttributes } from 'react';

import '@/styles/button.css';

type ButtonProps = {
  variant: 'primary' | 'clashofclans';
} & ButtonHTMLAttributes<HTMLButtonElement>;

export default function Button({ variant, className, ...props }: ButtonProps) {
  return <button className={`btn-${variant} ${className ?? ''}`} {...props} />;
}
