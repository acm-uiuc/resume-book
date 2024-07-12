import { useForm } from '@mantine/form';
import {
  TextInput,
  PasswordInput,
  Text,
  Paper,
  Group,
  PaperProps,
  Button,
  Divider,
  Stack,
  Center,
} from '@mantine/core';
import { AcmLoginButton } from './AcmLoginButton';
import { PartnerLoginButton } from './PartnerLoginButton';

export function LoginComponent(props: PaperProps) {
  const form = useForm({
    initialValues: {
      email: '',
      name: '',
      password: '',
      terms: true,
    },

    validate: {
      email: (val) => (/^\S+@\S+$/.test(val) ? null : 'Invalid email'),
      password: (val) =>
        val.length <= 6
          ? 'Password should include at least 6 characters'
          : null,
    },
  });

  return (
    <Paper radius="md" p="xl" withBorder {...props}>
      <Center>
        <img
          src="https://acm-brand-images.s3.amazonaws.com/banner-blue.png"
          alt="ACM Logo"
          style={{ height: '5em', marginBottom: '1em' }}
        />
      </Center>

      <Text size="lg" fw={500}>
        Welcome to ACM@UIUC Resume Book
      </Text>

      <Divider
        label="Student Login"
        labelPosition="center"
        my="md"
        size="lg"
      />

      <Group grow mb="md" mt="md">
        <AcmLoginButton radius="xl">
          Sign in with Illinois NetID
        </AcmLoginButton>
      </Group>

      <Divider
        label="Recruiter Login"
        labelPosition="center"
        my="md"
        size="lg"
      />
      <Group grow mb="md" mt="md">
        <PartnerLoginButton radius="xl">
          ACM@UIUC Partner Login
        </PartnerLoginButton>
      </Group>
    </Paper>
  );
}
