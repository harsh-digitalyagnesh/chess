'use client';

import React from 'react';
import Image from 'next/image';

export const Navbar: React.FC = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-800/40 bg-[#262522] backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Logo and Brand */}
        <div className="flex items-center gap-2.5">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-[#1a1917] border border-zinc-800/60 shadow-lg select-none overflow-hidden">
            <Image
              src="/favicon.png"
              alt="Chess Logo"
              width={32}
              height={32}
              className="object-contain drop-shadow-[0_0_6px_rgba(212,175,55,0.35)]"
              priority
            />
          </div>
          <span className="text-xl font-black tracking-widest text-zinc-100 uppercase select-none font-sans">
            chess
          </span>
        </div>

      </div>
    </header>
  );
};
export default Navbar;
