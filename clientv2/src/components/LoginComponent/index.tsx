import { Text, Paper, Group, PaperProps, Divider, Center, Alert, Anchor } from '@mantine/core';
import { AcmLoginButton } from './AcmLoginButton';
import { PartnerLoginButton } from './PartnerLoginButton';
import brandImgUrl from '@/banner-blue.png';
import { IconLock } from '@tabler/icons-react';

export function LoginComponent(props: PaperProps) {
  return (
    <Paper radius="md" p="xl" withBorder {...props}>
      <Center>
        <img src={brandImgUrl} alt="ACM Logo" style={{ height: '5em', marginBottom: '1em' }} />
      </Center>
      <Center>
        <Text size="lg" fw={500}>
          Welcome to ACM@UIUC Resume Book
        </Text>
      </Center>

      <Divider label="Student Login" labelPosition="center" my="md" size="lg" />

      <Group grow mb="md" mt="md">
        <AcmLoginButton radius="xl">Sign in with Illinois NetID</AcmLoginButton>
      </Group>
      <Alert title="Paid ACM@UIUC Members Only" icon={<IconLock />} color="#0053B3">
        <Text>
          Not a paid member?{' '}
          <Anchor href="https://www.acm.illinois.edu/membership?utm_source=resumebook">
            Sign up today!
          </Anchor>
        </Text>
      </Alert>
      <Divider label="Recruiter Login" labelPosition="center" my="md" size="lg" />
      <Group grow mb="md" mt="md">
        <PartnerLoginButton radius="xl">ACM@UIUC Partner Login</PartnerLoginButton>
      </Group>
    </Paper>
  );
}
