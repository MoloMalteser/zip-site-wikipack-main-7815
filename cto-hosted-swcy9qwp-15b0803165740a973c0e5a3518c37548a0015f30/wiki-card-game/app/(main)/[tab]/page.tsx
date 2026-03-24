import { redirect } from 'next/navigation';

export default function TabPage({ params }: { params: { tab: string } }) {
  const validTabs = ['home', 'collection', 'battle'];
  
  if (!validTabs.includes(params.tab)) {
    redirect('/home');
  }
  
  // This page should not be reached as each tab has its own page.tsx
  redirect(`/${params.tab}`);
}
