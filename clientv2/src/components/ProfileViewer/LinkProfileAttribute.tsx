import { Anchor, Group, TextInput, ThemeIcon } from '@mantine/core';
import { ReactNode } from 'react';

interface LinkProfileAttributeProps {
  editable: boolean;
  icon: ReactNode;
  url?: string;
  name: string;
  handleInputChange: CallableFunction;
}
export const LinkProfileAttribute: React.FC<LinkProfileAttributeProps> = ({
  editable,
  icon,
  url,
  name,
  handleInputChange,
}) => {
  return (
    <Group>
      {editable ? (
        <TextInput label={name} value={url} onChange={(e) => handleInputChange(e.target.value)} />
      ) : (
        <>
          {url === '' || !url ? null : (
            <>
              <ThemeIcon color="blue" size={20} radius="xl">
                {icon}
              </ThemeIcon>
              <Anchor href={url} target="_blank" size="sm">
                {name}
              </Anchor>
            </>
          )}
        </>
      )}
    </Group>
  );
};
