import { Button, ButtonProps } from '@mantine/core';

export function AcmLoginButton(props: ButtonProps & React.ComponentPropsWithoutRef<'button'>) {
  return <Button leftSection={null} variant="default" {...props} />;
}