import { Button, ButtonProps } from '@mantine/core';
import { useAuth } from '../AuthContext';
import { useMsal } from '@azure/msal-react';
import { InteractionStatus } from '@azure/msal-browser';

export function AcmLoginButton(props: ButtonProps & React.ComponentPropsWithoutRef<'button'>) {
  const {loginMsal} = useAuth();
  const {inProgress} = useMsal();
  return <Button disabled={inProgress === InteractionStatus.Login} leftSection={null} variant="default" {...props} onClick={() => {loginMsal();}}/>;
}