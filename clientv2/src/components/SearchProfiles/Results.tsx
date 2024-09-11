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
import { notifications } from '@mantine/notifications';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { DegreeLevel } from '../ProfileViewer/options';
import { ViewStudentProfile } from '@/pages/recruiter/ViewStudentProfile.page';
import { useApi } from '@/util/api';
import ProgressFullScreenLoader from '@/components/AuthContext/ProgressLoadingScreen';

const MAX_RESUMES_DOWNLAOD = 2000;

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
  const [totalDownloaded, setTotalDownloaded] = useState(-1);
  const itemsPerPage = 10;
  const api = useApi();

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
  const massDownloadErrorNotification = (numErrored?: number, partial: boolean = false) => {
    notifications.show({
      title: `Error downloading ${partial ? 'some' : ''} resumes`,
      color: numErrored ? 'yellow' : 'red',
      message: `There was an error downloading ${numErrored ? numErrored.toString() : 'the selected'} resumes.`,
    });
  };
  const massDownloadSuccessNotification = (numSuccess: number) => {
    notifications.show({
      title: 'Downloaded resumes',
      color: 'blue',
      message: `Successfully downloaded ${numSuccess} resumes.`,
    });
  };

  const downloadResumes = async () => {
    if (selectedRows.length > MAX_RESUMES_DOWNLAOD) {
      return notifications.show({
        title: 'Error downloading resumes',
        color: 'red',
        message: `You cannot download more than ${MAX_RESUMES_DOWNLAOD} in one request.`,
      });
    }
    setTotalDownloaded(0);
    let urls: string[];
    try {
      urls = (await api.post('/recruiter/mass_download', { usernames: selectedRows })).data;
    } catch (e) {
      setTotalDownloaded(-1);
      return massDownloadErrorNotification();
    }
    let numError = 0;
    let numSuccess = 0;
    const urlMapper: Record<string, string> = {};
    for (let i = 0; i < urls.length; i++) {
      urlMapper[urls[i]] = selectedRows[i];
    }
    const allPromises = urls.map((url) =>
      fetch(url)
        .then((response) => {
          // Increment the counter when the promise resolves
          setTotalDownloaded((prev) => prev + 1);
          return { url, status: 'fulfilled', value: response };
        })
        .catch((error) => {
          // Increment the counter when the promise rejects
          setTotalDownloaded((prev) => prev + 1);
          return { url, status: 'rejected', value: error };
        })
    );
    const realBlobs = [];
    for (const outerPromise of allPromises) {
      if (
        (await outerPromise).status === 'fulfilled' &&
        (await outerPromise).value.status === 200
      ) {
        numSuccess += 1;
        realBlobs.push({
          blob: (await outerPromise).value.blob(),
          filename: `${urlMapper[(await outerPromise).url].replace('@illinois.edu', '')}.pdf`,
        });
      } else {
        numError += 1;
      }
    }
    if (numError > 0) {
      massDownloadErrorNotification(numError, !(numSuccess === 0));
    }
    if (numSuccess === 0) {
      setTotalDownloaded(-1);
      return [numSuccess, numError];
    }
    const zip = new JSZip();
    const yourDate = new Date().toISOString().split('T')[0];
    const folderName = `ACM_UIUC_Resumes-${yourDate}`;
    for (const { blob, filename } of realBlobs) {
      zip.file(`${folderName}/${filename}`, blob);
    }
    const zipContent = await zip.generateAsync({ type: 'blob' });
    setTotalDownloaded(-1);
    saveAs(zipContent, `${folderName}.zip`);
    massDownloadSuccessNotification(numSuccess);
    return [numSuccess, numError];
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
        <Button variant="light" color="green" onClick={() => openProfileModal(element.username)}>
          View Profile
        </Button>
      </Table.Td>
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
    </Table.Tr>
  ));
  if (totalDownloaded > -1) {
    return (
      <ProgressFullScreenLoader totalItems={selectedRows.length} currentItems={totalDownloaded} />
    );
  }
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
                  downloadResumes();
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
            <Table.Th>Actions</Table.Th>
            <Table.Th>Email</Table.Th>
            <Table.Th>Degree(s)</Table.Th>
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
