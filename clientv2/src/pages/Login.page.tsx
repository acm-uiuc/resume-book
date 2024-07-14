import { Center } from '@mantine/core';
import { LoginComponent } from '@/components/LoginComponent';
import { HeaderNavbar } from '@/components/Navbar';

export function LoginPage() {
  return (
    <div style={{ display: 'flex', flexFlow: 'column', height: '100vh' }}>
      <HeaderNavbar />
      <Center style={{ flexGrow: 1 }}>
        <LoginComponent />
      </Center>
    </div>
  );
}
