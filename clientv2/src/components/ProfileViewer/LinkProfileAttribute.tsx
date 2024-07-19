import { Anchor, Group, TextInput, ThemeIcon } from '@mantine/core';
import { ReactNode } from 'react';

interface LinkProfileAttributeProps {
  editable: boolean;
  icon: ReactNode;
  url?: string;
  name: string;
  handleInputChange: CallableFunction;
  overrideUrl?: string;
  editingName?: string;
}
export const LinkProfileAttribute: React.FC<LinkProfileAttributeProps> = ({
  editable,
  icon,
  url,
  name,
  handleInputChange,
  overrideUrl,
  editingName,
}) => {
  if ((!url || url === '') && !editable) {
    return null;
  }
  return (
    <Group>
      {editable ? (
        <TextInput
          label={editingName || name}
          value={overrideUrl || url}
          onChange={(e) => handleInputChange(e.target.value)}
          style={{ width: '100%' }}
          leftSection={icon}
        />
      ) : (
        <>
          <ThemeIcon color="blue" size={20} radius="xl">
            {icon}
          </ThemeIcon>
          <Anchor href={url} target="_blank" size="sm">
            {name}
          </Anchor>
        </>
      )}
    </Group>
  );
};
