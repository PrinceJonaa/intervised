import React from 'react';

export const SectionHeader = ({ title, subtitle }: { title: string; subtitle: string }) => (
   <div className="mb-6">
      <h3 className="text-2xl font-display font-bold text-white mb-2">{title}</h3>
      <p className="text-gray-400 text-sm">{subtitle}</p>
   </div>
);