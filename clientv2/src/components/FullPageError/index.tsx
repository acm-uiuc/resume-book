import React, { MouseEventHandler } from 'react';
import { Container, Paper, Title, Text, Button } from '@mantine/core';

interface FullPageErrorProps {
    errorCode?: number;
    errorMessage?: string;
    onRetry?: MouseEventHandler<HTMLButtonElement>;
}

const FullPageError: React.FC<FullPageErrorProps> = ({ errorCode, errorMessage, onRetry }) => {

  return (
    <Container>
      <Paper shadow="md" radius="md">
        <Title>{errorCode || 'An error occurred'}</Title>
        <Text color="dimmed">
          {errorMessage || 'Something went wrong. Please try again later.'}
        </Text>
        {onRetry && (
          <Button variant="outline" onClick={onRetry}>
            Retry
          </Button>
        )}
      </Paper>
    </Container>
  );
};

export default FullPageError;
