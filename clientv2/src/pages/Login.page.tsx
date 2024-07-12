import { LoginComponent } from "@/components/LoginComponent";
import { HeaderNavbar } from "@/components/Navbar";
import { Center, Container, Title } from "@mantine/core";

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
