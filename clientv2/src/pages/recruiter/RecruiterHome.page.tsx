import { Button, Title } from '@mantine/core';
import { useAuth } from '@/components/AuthContext';
import { HeaderNavbar } from '@/components/Navbar';

export function RecruiterHomePage() {
  const { userData, getToken } = useAuth();
  const [lastName, firstName] = userData?.name?.split(',') as string[];
  const doAuthStuff = async () => {
    if (!userData) {
      return;
    }
    console.log(await getToken());
  }
  return (
    <>
      <HeaderNavbar userData={userData} />
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Title>
          Hello {firstName} {lastName}!
        </Title>
        <Button onClick={doAuthStuff}>Do Auth Stuff</Button>
      </div>
    </>
  );
}
