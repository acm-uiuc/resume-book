import { Center } from '@mantine/core';
import { LoginComponent } from '@/components/LoginComponent';
import { HeaderNavbar } from '@/components/Navbar';

export function LoginPage() {
  return (
    <>
      <HeaderNavbar />
      <Center style={{ height: '100vh' }}>
        <LoginComponent />
      </Center>
    </>
  );
}
