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
        relative inline-block px-6 py-3 
        bg-deep-blue text-white 
        border-2 border-light-gold rounded-lg 
        text-lg font-semibold 
        transition-all duration-250 ease-in-out 
        hover:bg-deep-blue-hover hover:scale-110 
        focus:bg-deep-blue-hover focus:scale-110 focus:outline-none
        shadow-light-gold /* This sets --tw-shadow-color for the glow */
        cta-button-glow
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
