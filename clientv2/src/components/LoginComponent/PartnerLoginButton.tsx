import { Button, ButtonProps } from '@mantine/core';
import { useAuth } from '../AuthContext';
import { useKindeAuth } from '@kinde-oss/kinde-auth-react';

export function PartnerLoginButton(
  props: ButtonProps & React.ComponentPropsWithoutRef<'button'>,
) {
  const { login } = useKindeAuth();
  return (
    <Button
      disabled={false}
      leftSection={null}
      variant="filled"
      color='blue'
      {...props}
      onClick={() => {
        login();
      }}
    />
  );
}
