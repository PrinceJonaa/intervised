import React from 'react';
import { motion } from 'framer-motion';

export const SkeletonPulse = ({ className }: { className?: string }) => (
  <motion.div 
    className={`bg-white/5 rounded-lg ${className}`}
    animate={{ opacity: [0.3, 0.6, 0.3] }}
    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
  />
);

export const ServiceSkeleton = () => (
  <div className="p-5 sm:p-6 rounded-2xl border border-white/5 bg-white/5 h-full flex flex-col">
    <div className="flex justify-between items-start mb-4">
      <SkeletonPulse className="h-6 w-32 bg-white/10" />
      <SkeletonPulse className="h-6 w-16 rounded-full bg-white/10" />
    </div>
    <div className="space-y-3 mb-6 flex-1">
      <SkeletonPulse className="h-4 w-full" />
      <SkeletonPulse className="h-4 w-5/6" />
      <SkeletonPulse className="h-4 w-2/3" />
    </div>
    <SkeletonPulse className="h-3 w-20 opacity-50" />
  </div>
);

export const BlogSkeleton = () => (
  <div className="bg-white/5 border border-white/5 rounded-2xl overflow-hidden h-full flex flex-col">
    <SkeletonPulse className="aspect-video w-full bg-white/10" />
    <div className="p-6 space-y-4 flex-1 flex flex-col">
      <div className="flex gap-3">
        <SkeletonPulse className="h-3 w-16" />
        <SkeletonPulse className="h-3 w-24" />
      </div>
      <SkeletonPulse className="h-8 w-3/4 bg-white/10" />
      <div className="space-y-2 flex-1">
        <SkeletonPulse className="h-4 w-full" />
        <SkeletonPulse className="h-4 w-full" />
        <SkeletonPulse className="h-4 w-2/3" />
      </div>
      <div className="pt-4 mt-4 flex justify-between items-center border-t border-white/5">
        <div className="flex items-center gap-2">
           <SkeletonPulse className="w-8 h-8 rounded-full bg-white/10" />
           <SkeletonPulse className="h-3 w-24" />
        </div>
        <SkeletonPulse className="w-4 h-4 rounded-full" />
      </div>
    </div>
  </div>
);

export const TeamSkeleton = () => (
  <div className="space-y-6">
    <SkeletonPulse className="w-full aspect-[4/5] rounded-3xl bg-white/10" />
    <div className="space-y-3 px-2">
      <SkeletonPulse className="h-8 w-48 bg-white/10" />
      <SkeletonPulse className="h-4 w-32" />
      <div className="pt-2 space-y-2">
         <SkeletonPulse className="h-4 w-full" />
         <SkeletonPulse className="h-4 w-full" />
         <SkeletonPulse className="h-4 w-5/6" />
      </div>
    </div>
  </div>
);