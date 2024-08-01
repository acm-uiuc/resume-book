import { Alert, Button, Group, Loader, Select, Text, TextInput } from '@mantine/core';
import { IconAlertTriangle, IconSparkles } from '@tabler/icons-react';
import { useForm } from '@mantine/form';

interface GenerateProfileModalProps {
  loading?: boolean;
  onModalSubmit: CallableFunction;
}

export const GenerateProfileModal: React.FC<GenerateProfileModalProps> = ({
  loading,
  onModalSubmit,
}) => {
  const validRoles = ['Internship', 'Full-Time', 'Research Assistant'];
  const form = useForm({
    initialValues: {
      roleType: '',
      roleKeywords: '',
    },

    validate: {
      roleType: (value) => (validRoles.includes(value) ? null : 'Invalid role type'),
      roleKeywords: (value) =>
        value.length > 0 && value.split(',') ? null : 'You must provide at least one job function',
    },
  });
  const handleFormSubmit = (values: Record<string, any>) => {
    if (loading) {
      return;
    }
    values = { ...values, roleKeywords: values.roleKeywords.trim().split(',') };
    onModalSubmit(values);
  };
  return (
    <>
      <Alert color="yellow" title="Notice" icon={<IconAlertTriangle />}>
        <b>This feature is in beta.</b>
        <br />
        <br />
        By using this feature, you agree to send content from your resume to OpenAI for processing
        and response generation using a large-language model (LLM). This data is subject to
        OpenAI&apos;s privacy and security policies.
        <br />
        <br />
        <b>LLMs can make mistakes. Check important information before saving.</b>
      </Alert>
      <Text style={{ marginBottom: '1em', marginTop: '1em' }} size="sm">
        We&apos;ll just need some additional information from you to generate a profile.
      </Text>
      <form onSubmit={form.onSubmit((values) => handleFormSubmit(values))}>
        <Select
          label="Desired Job Type"
          key={form.key('roleType')}
          data={validRoles}
          defaultValue={validRoles[0]}
          withAsterisk
          allowDeselect={false}
          {...form.getInputProps('roleType')}
        />
        <TextInput
          label="Desired Job Functions"
          description="Comma-seperated list of keywords (max 300 characters)."
          withAsterisk
          key={form.key('roleKeywords')}
          {...form.getInputProps('roleKeywords')}
        />
        <Group justify="flex-end" mt="md">
          <Button
            disabled={!form.isValid()}
            type="submit"
            color="purple"
            leftSection={loading ? <Loader color="white" size={16} /> : <IconSparkles size={16} />}
          >
            {loading ? 'Generating...' : 'Generate'}
          </Button>
        </Group>
      </form>
    </>
  );
};
