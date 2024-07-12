import { useAuth } from "@/components/AuthContext";
import { HeaderNavbar } from "@/components/Navbar";
import { Badge, Title, Flex } from "@mantine/core";

export function StudentHomePage() {
  const { userData } = useAuth();
  let lastName, firstName;
  [lastName, firstName] = userData?.name?.split(",") as string[];
  return (
    <>
      <HeaderNavbar userData={userData}/>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Title>Hello {firstName} {lastName}!</Title>
        <Badge color="blue" style={{ marginLeft: 10 }}>Student</Badge>
      </div>
    </>
  );
}
