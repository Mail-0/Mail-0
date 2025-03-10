import Link from 'next/link';
import { cn } from '@/lib/utils';
import Marquee from "./_components/marquee"
import Image from 'next/image';
import blackIcon from '@/public/black-icon.svg';
import whiteIcon from '@/public/white-icon.svg';

export function NotFound() {
  return (
    <div className="relative flex w-full items-center justify-center px-4 md:px-0 overflow-hidden ">
      <div className="absolute w-full h-full">
        <Marquee
          direction="diagonal"
          speed={0.5}
          squareSize={40}
          borderColor="#333"
          hoverFillColor="#222"
        />
      </div>

      <div className="absolute top-0 left-4">
        <Link
          href="/"
          className={cn("tracking-tighter uppercase font-pixel text-6xl font-bold")}
        >
          {"<<<"} Home
        </Link>
      </div>
      <div className="flex flex-col items-center justify-center text-center z-10 tracking-tightest">
        <div className="flex font-bold items-center justify-center gap-2 relative select-none">
          <div className="text-[35vw]">
            4
          </div>
          <div className="flex items-center gap-2 size-fill pointer-events-none">
            <Image
              src={blackIcon}
              alt="0.email Logo"
              sizes="100vw"
              className="dark:hidden h-auto w-[25vw]"
              priority
            />
            <Image
              src={whiteIcon}
              alt="0.email Logo"
              sizes="100vw"
              className="hidden dark:block h-auto w-[25vw]"
              priority
            />
          </div>
          <div className="text-[35vw]">
            4
          </div>
        </div>
      </div>
      {/* <div className="absolute">
        <a>Home</a>
      </div> */}
    </div>

  );
}