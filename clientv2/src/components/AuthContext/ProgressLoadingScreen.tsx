import React from 'react';
import { LoadingOverlay, Progress, useMantineColorScheme } from '@mantine/core';

interface ProgressFullScreenLoaderProps {
  totalItems: number;
  currentItems: number;
  title?: string;
}

const ProgressFullScreenLoader: React.FC<ProgressFullScreenLoaderProps> = ({totalItems, currentItems, title}) => {
  const { colorScheme } = useMantineColorScheme();
  return (
    <LoadingOverlay visible loaderProps={{ color: colorScheme === 'dark' ? 'white' : 'black', children: <>
      <h1>{title || 'Downloading...'}</h1>
      <Progress size="lg" radius="lg" value={(currentItems/totalItems) * 100} animated/>
    </> }} />
  );
};

export default ProgressFullScreenLoader;
