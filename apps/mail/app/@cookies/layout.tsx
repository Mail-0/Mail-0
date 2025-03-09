import { ReactNode } from 'react';

interface CookiesLayoutProps {
  children: ReactNode;
  cookies: ReactNode;
}

export default function CookiesLayout({ children, cookies }: CookiesLayoutProps) {
  return (
    <>
      {children}
      {cookies}
    </>
  );
}
