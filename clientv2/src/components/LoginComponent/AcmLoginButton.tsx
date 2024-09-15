import { Button, ButtonProps, Image } from '@mantine/core';
import { useMsal } from '@azure/msal-react';
import { InteractionStatus } from '@azure/msal-browser';
import { useAuth } from '../AuthContext';
import blockI from '@/blockI.png';

export function AcmLoginButton(props: ButtonProps & React.ComponentPropsWithoutRef<'button'>) {
  const { loginMsal } = useAuth();
  const { inProgress } = useMsal();
  return (
    <Button
      disabled={inProgress === InteractionStatus.Login}
      leftSection={
        <Image
          src={blockI}
          style={{ height: '1.5em', width: 'auto', paddingRight: '0.8em' }}
        ></Image>
      }
      color="#FF5F05"
      variant="filled"
      {...props}
      onClick={() => {
        loginMsal();
      }}
    />
  );
}
