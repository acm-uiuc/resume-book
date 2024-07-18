import React, { useState } from 'react';
import { Alert, Anchor, Badge, Button, Checkbox, Table, Text, Title } from '@mantine/core';
import { IconQuestionMark } from '@tabler/icons-react';
import { DegreeLevel } from '../ProfileViewer/options';
import { useNavigate } from 'react-router-dom';

export interface ProfileSearchDegreeEntry {
  level: DegreeLevel;
  yearEnded: number;
  major: string[];
}
export interface ProfileSearchResult {
  username: string;
  name: string;
  email: string;
  resumePdfUrl: string;
  degrees: ProfileSearchDegreeEntry[];
}

export interface ProfileSearchResultsProp {
  data: ProfileSearchResult[] | null;
}

export const ProfileSearchResults: React.FC<ProfileSearchResultsProp> = ({ data }) => {
  const [selectedRows, setSelectedRows] = useState<string[]>([]);

  if (data === null) {
    return null;
  }
  if (data.length === 0) {
    return (
      <Alert
        variant="light"
        color="yellow"
        title="No Profiles Found"
        style={{ marginTop: '1em' }}
        icon={<IconQuestionMark />}
      >
        Perhaps modify your search and try again?
      </Alert>
    );
  }
  const allIds = data.map((element: ProfileSearchResult) => element.username);
  const handleSelectAll = () => {
    if (selectedRows.length === allIds.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(allIds);
    }
  };

  const handleRowSelect = (id: string) => {
    setSelectedRows((prevSelectedRows) =>
      prevSelectedRows.includes(id)
        ? prevSelectedRows.filter((rowId) => rowId !== id)
        : [...prevSelectedRows, id]
    );
    console.log(selectedRows);
  };
  const navigate = useNavigate();
  const rows = data.map((element) => (
    <Table.Tr
      key={element.username}
      bg={selectedRows.includes(element.username) ? 'var(--mantine-color-blue-light)' : undefined}
    >
      <Table.Td>
        <Checkbox
          aria-label="Select row"
          key={`${element.username}-checkbox`}
          checked={selectedRows.includes(element.username)}
          onChange={() => handleRowSelect(element.username)}
        />
      </Table.Td>
      <Table.Td>{element.name}</Table.Td>
      <Table.Td>
        <Anchor href={`mailto:${element.email}`}>{element.email}</Anchor>
      </Table.Td>
      <Table.Td>
        {element.degrees.sort().map((degree) => (
          <Text key={`${element.username}-degreelisting-${degree.level}-${degree.yearEnded}`}>
            <b>{degree.level} in {degree.major?.join(', ')}</b> - {degree.yearEnded}
          </Text>
        ))}
      </Table.Td>
      <Table.Td>
        <Button
          variant="light"
          color="green"
          onClick={() => {
            navigate(`/studentprofile/${element.username}`);
          }}
        >
          View Profile
        </Button>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <>
      <Title order={2}>
        {data.length} {data.length === 1 ? 'Profile' : 'Profiles'} Found
      </Title>
      <Table>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>
              {' '}
              <Checkbox
                aria-label="Select all rows"
                checked={selectedRows.length === allIds.length && selectedRows.length !== 0}
                onChange={handleSelectAll}
              />
            </Table.Th>
            <Table.Th>Name</Table.Th>
            <Table.Th>Email</Table.Th>
            <Table.Th>Degree(s)</Table.Th>
            <Table.Th>Actions</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>{rows}</Table.Tbody>
      </Table>
    </>
  );
};
