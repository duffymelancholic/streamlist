import { redirect } from 'next/navigation';

// The root route "/" is listed in our middleware matcher.
// Logged-in users get sent to /browse, logged-out users to /login.
// This component acts as a fallback in case middleware doesn't fire.
export default function Home() {
  redirect('/login');
}
