import React, { useState } from 'react';
import {
  Alert,
  Anchor,
  Button,
  Checkbox,
  Container,
  Modal,
  Table,
  Text,
  Title,
  Pagination,
} from '@mantine/core';
import { IconQuestionMark } from '@tabler/icons-react';
import { DegreeLevel } from '../ProfileViewer/options';
import { ViewStudentProfile } from '@/pages/recruiter/ViewStudentProfile.page';
import { notifications } from '@mantine/notifications';

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
  const [modalOpened, setModalOpened] = useState(false);
  const [selectedUsername, setSelectedUsername] = useState<string | null>(null);
  const [activePage, setActivePage] = useState(1);
  const itemsPerPage = 10;

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
  const openProfileModal = (username: string) => {
    setSelectedUsername(username);
    setModalOpened(true);
  };
  const notImplError = () => {
    notifications.show({
      color: 'red',
      title: 'Not Implemented Yet',
      message: 'This feature still in the works. Check back later.',
    });
  };
  const handleRowSelect = (id: string) => {
    setSelectedRows((prevSelectedRows) =>
      prevSelectedRows.includes(id)
        ? prevSelectedRows.filter((rowId) => rowId !== id)
        : [...prevSelectedRows, id]
    );
  };

  const paginatedData = data.slice((activePage - 1) * itemsPerPage, activePage * itemsPerPage);
  const rows = paginatedData.map((element) => (
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
            <b>
              {degree.level} in {degree.major?.join(', ')}
            </b>{' '}
            - {degree.yearEnded}
          </Text>
        ))}
      </Table.Td>
      <Table.Td>
        <Button variant="light" color="green" onClick={() => openProfileModal(element.username)}>
          View Profile
        </Button>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <>
      <div>
        <Container>
          <div style={{ display: 'flex', alignContent: 'start' }}>
            <Title order={2}>
              {data.length} {data.length === 1 ? 'Profile' : 'Profiles'} Found
            </Title>
            {selectedRows.length > 0 ? (
              <Button
                style={{ marginLeft: '2vw' }}
                onClick={() => {
                  notImplError();
                }}
              >
                Download Selected Profiles
              </Button>
            ) : null}
          </div>
        </Container>
      </div>
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
      <Pagination
        total={Math.ceil(data.length / itemsPerPage)}
        value={activePage}
        onChange={setActivePage}
        style={{ margin: '1em', marginLeft: '0', justifyContent: 'center' }}
      />
      <Modal
        opened={modalOpened}
        onClose={() => setModalOpened(false)}
        title="View Profile"
        size="auto"
        transitionProps={{ transition: 'fade', duration: 200 }}
      >
        {selectedUsername && <ViewStudentProfile username={selectedUsername} />}
      </Modal>
    </>
  );
};
