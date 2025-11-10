import React, { type ReactNode } from 'react';
import Link from 'next/link';

interface PrimaryButtonProps {
  href: string;
  children: ReactNode;
  className?: string;
  target?: string;
  rel?: string;
}

const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  href,
  children,
  className = '',
  target,
  rel,
}) => {
  return (
    <Link
      href={href}
      target={target}
      rel={rel}
      className={`
        relative inline-block px-5 sm:px-6 py-3 
        bg-deep-blue text-white 
        border-2 border-light-gold rounded-lg 
        text-base sm:text-lg font-semibold 
        transition-all duration-250 ease-in-out 
        hover:bg-deep-blue-hover hover:scale-105 sm:hover:scale-110 
        focus:bg-deep-blue-hover focus:scale-105 sm:focus:scale-110 focus:outline-none
        shadow-light-gold /* This sets --tw-shadow-color for the glow */
        cta-button-glow
        min-h-[44px]
        ${className}
      `}
    >
      <span className="relative z-10 filter drop-shadow-[0_0_1px_currentColor]">
        {children}
      </span>
    </Link>
  );
};

export default PrimaryButton;
