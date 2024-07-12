import { useToggle, upperFirst } from '@mantine/hooks';
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
  Checkbox,
  Anchor,
  Stack,
  Center,
} from '@mantine/core';
import { AcmLoginButton } from './AcmLoginButton';
import LogoBadge from '../Navbar/Logo';

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
      password: (val) => (val.length <= 6 ? 'Password should include at least 6 characters' : null),
    },
  });

  return (
    <Paper radius="md" p="xl" withBorder {...props}>
        <Center>
            <img
            src="https://acm-brand-images.s3.amazonaws.com/banner-blue.png"
            alt="ACM Logo"
            style={{ height: "5em", marginBottom: "1em" }}
            />
        </Center>
        
      <Text size="lg" fw={500}>
        Welcome to ACM@UIUC Resume Book
      </Text>

      <Divider label="Student Login" labelPosition="center" my="md" size={"lg"} />

      <Group grow mb="md" mt="md">
        <AcmLoginButton radius="xl">ACM Login {"(Paid Members Only)"}</AcmLoginButton>
      </Group>

      <Divider label="Recruiter Login" labelPosition="center" my="md" size={"lg"} />

      <form onSubmit={form.onSubmit(() => {})}>
        <Stack>
          <TextInput
            required
            label="Email"
            placeholder="user@example.com"
            value={form.values.email}
            onChange={(event) => form.setFieldValue('email', event.currentTarget.value)}
            error={form.errors.email && 'Invalid email'}
            radius="md"
          />

          <PasswordInput
            required
            label="Password"
            placeholder="Your password"
            value={form.values.password}
            onChange={(event) => form.setFieldValue('password', event.currentTarget.value)}
            error={form.errors.password && 'Password should include at least 6 characters'}
            radius="md"
          />
        </Stack>

        <Group justify="space-between" mt="xl">
          <Button type="submit" radius="xl" style={{width: "100%"}}>
            Log In
          </Button>
        </Group>
      </form>
    </Paper>
  );
}