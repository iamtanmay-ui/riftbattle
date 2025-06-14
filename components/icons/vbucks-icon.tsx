import React from 'react';

interface VBucksIconProps {
  className?: string;
  size?: number;
}

export function VBucksIcon({ className = "", size = 16 }: VBucksIconProps) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      {/* Stylized V-Bucks logo */}
      <circle cx="12" cy="12" r="10" fill="#3b82f6" stroke="none" />
      <path 
        d="M7 9l5 8 5-8" 
        stroke="white" 
        strokeWidth="2.5" 
        fill="none" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />
      <path 
        d="M8 7l4 6 4-6" 
        stroke="white" 
        strokeWidth="2.5" 
        fill="none" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />
    </svg>
  );
}
