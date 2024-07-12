import { Badge, Title } from '@mantine/core';
import { useAuth } from '@/components/AuthContext';
import { HeaderNavbar } from '@/components/Navbar';

export function StudentHomePage() {
  const { userData } = useAuth();
  const [lastName, firstName] = userData?.name?.split(',') as string[];
  return (
    <>
      <HeaderNavbar userData={userData} />
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Title>
          Hello {firstName} {lastName}!
        </Title>
        <Badge color="blue" style={{ marginLeft: 10 }}>
          Student
        </Badge>
      </div>
    </>
  );
}
