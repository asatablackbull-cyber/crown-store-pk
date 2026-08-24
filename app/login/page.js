import LoginForm from './LoginForm';

export default async function LoginPage({ searchParams }) {
  const { registered } = await searchParams;
  return <LoginForm justRegistered={registered === 'true'} />;
}
