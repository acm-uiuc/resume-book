import { Title } from '@mantine/core';
import { useAuth } from '@/components/AuthContext';
import { HeaderNavbar } from '@/components/Navbar';

export function RecruiterHomePage() {
  const { userData } = useAuth();
  const [lastName, firstName] = userData?.name?.split(',') as string[];
  return (
    <>
      <HeaderNavbar userData={userData} />
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Title>
          Hello {firstName} {lastName}!
        </Title>
      </div>
    </>
  );
}
