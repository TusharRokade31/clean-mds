"use client"

import dynamic from 'next/dynamic';
import Header from './Header';
import Footer from './Footer';

// Import VoiceChatbot with no SSR
const VoiceChatbot = dynamic(() => import('@/component/Chatbot/VoiceChatbot'), {
  ssr: false,
});

export default function ClientLayout({ children }) {
  return (
    <>
      <Header />
      <VoiceChatbot />
      {children}
      <Footer />
    </>
  );
}