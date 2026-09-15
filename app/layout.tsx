import './globals.css';
import type { Metadata } from 'next';
import { Noto_Sans_JP } from 'next/font/google';
import { Toaster } from '@/components/ui/toaster';

const noto = Noto_Sans_JP({
  subsets: ['latin'],
  weight: ['400', '500', '700', '800'],
  variable: '--font-noto',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Memora — 自分と他人を記録する日記',
  description: '出会った人、その日の出来事を記録し、次に会った時に思い出せる。人別タイムラインとカレンダーで、あなたの記憶を編む。',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className={`${noto.variable} font-sans antialiased`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
