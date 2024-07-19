import { useEffect, useState } from 'react';
import { Alert, Button, Container, Grid, Text, Group, Modal, Tooltip } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import {
  IconAlertTriangleFilled,
  IconDeviceFloppy,
  IconInfoCircle,
  IconSparkles,
} from '@tabler/icons-react';
import { useAuth } from '@/components/AuthContext';
import { HeaderNavbar } from '@/components/Navbar';
import { useApi } from '@/util/api';
import FullScreenLoader from '@/components/AuthContext/LoadingScreen';
import StudentProfilePage, { StudentProfileDetails } from '@/components/ProfileViewer';
import FullPageError from '@/components/FullPageError';
import { useDisclosure } from '@mantine/hooks';

const genAiEnabled = true;

export function StudentHomePage() {
  const { userData } = useAuth();
  const [loading, setLoading] = useState(true);
  const [enrolled, setEnrolled] = useState(false);
  const [editToggle, setEditToggle] = useState(false);
  const [unrecoverableError, setUnrecoverableError] = useState(false);
  const [studentData, setStudentData] = useState<StudentProfileDetails>();
  const [file, setFile] = useState<File | null>(null);
  const [newUser, setNewUser] = useState<boolean>(false);
  const [genProfileOpened, { open: genProfileOpen, close: genProfileClose }] = useDisclosure(false);
  const api = useApi();
  useEffect(() => {
    async function fetch() {
      setLoading(true);
      try {
        const response = await api.get('/student/profile');
        setEnrolled(response.status === 200);
        setLoading(false);
        for (let i = 0; i < response.data.degrees.length; i++) {
          response.data.degrees[i].gpa = parseFloat(response.data.degrees[i].gpa);
        }
        if (response.data.defaultResponse) {
          response.data.name = userData?.name;
          setNewUser(true);
        }
        setStudentData(response.data as StudentProfileDetails);
      } catch (err: any) {
        if (err.response && err.response.status === 404) {
          setEnrolled(false);
          setLoading(false);
        } else {
          console.error(err);
          setLoading(false);
          setUnrecoverableError(true);
        }
      }
    }
    if (userData) {
      fetch();
    }
  }, [userData]);
  if (loading) {
    return <FullScreenLoader />;
  }
  if (
    (studentData && !studentData?.name) ||
    (studentData?.name === '' && userData && userData.name)
  ) {
    studentData.name = userData!.name!;
    setStudentData(studentData);
  }
  function showErrorSaveNotification(message?: string) {
    notifications.show({
      color: 'red',
      title: 'Error saving profile',
      message: message || 'Please try again or contact support.',
    });
  }

  function isValidLinkedInProfile(url?: string) {
    const linkedinProfilePattern = /^http(s)?:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9-]+\/?$/;
    if (!url || url === '') {
      return true;
    }
    if (linkedinProfilePattern.test(url)) {
      if (url.startsWith('http:')) {
        url = url.replace('http:', 'https:');
        if (studentData) {
          studentData.linkedin = url;
          setStudentData(studentData);
        }
      }
      return true;
    }
    return false;
  }

  function isValidGithubProfile(url?: string) {
    const githubProfilePattern = /^http(s)?:\/\/(www\.)?github\.com\/[a-zA-Z0-9-]+\/?$/;
    if (!url || url === '') {
      return true;
    }
    if (githubProfilePattern.test(url)) {
      if (url.startsWith('http:')) {
        url = url.replace('http:', 'https:');
        if (studentData) {
          studentData.github = url;
          setStudentData(studentData);
        }
      }
      return true;
    }
    return false;
  }

  async function uploadFileToS3(presignedUrl: string) {
    if (!file) return;
    try {
      const response = await fetch(presignedUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Length': file.size.toString(),
        },
      });
      if (!response.ok) {
        throw new Error(`Failed to upload file: ${response.statusText}`);
      } else {
        return response;
      }
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  }

  async function saveData() {
    if (!studentData) {
      return showErrorSaveNotification();
    }
    if (!isValidLinkedInProfile(studentData?.linkedin)) {
      return showErrorSaveNotification('LinkedIn field is not a valid LinkedIn URL.');
    }
    if (!isValidGithubProfile(studentData?.github)) {
      return showErrorSaveNotification('GitHub field is not a valid GitHub Profile URL.');
    }
    try {
      if (file && file.size !== 0) {
        setLoading(true);
        const response = await api.post('/student/resume_upload_url', { file_size: file.size });
        if (response.status != 200) {
          setLoading(false);
          setFile(null);
          return showErrorSaveNotification('Could not upload resume.');
        }
        try {
          const presignedUrl = response.data.url;
          if (!presignedUrl) {
            throw new Error('No presigned URL!');
          }
          const s3Response = await uploadFileToS3(presignedUrl);
          if (s3Response?.status !== 200) {
            throw new Error('S3 failed to upload.');
          }
        } catch {
          setLoading(false);
          setFile(null);
          return showErrorSaveNotification('Could not upload resume.');
        }
      }
      if ('defaultResponse' in studentData) {
        delete studentData.defaultResponse;
        setStudentData(studentData);
      }
      setLoading(true);
      const response = await api.post('/student/profile', studentData);
      if (response.status && response.status == 201) {
        notifications.show({
          title: 'Profile saved!',
          message: '',
        });
        setEditToggle(false);
      } else if (response.status && response.status == 403) {
        showErrorSaveNotification('Failed to validate form.');
      } else {
        showErrorSaveNotification();
      }
    } catch (err: any) {
      showErrorSaveNotification();
    }
    if (file) {
      window.location.reload();
    }
    setLoading(false);
  }
  const toggleEdit = () => {
    if (editToggle) {
      saveData();
    } else {
      setEditToggle(true);
    }
  };
  if (unrecoverableError) {
    return <FullPageError />;
  }
  return (
    <>
      <HeaderNavbar userData={userData} />
      <Container></Container>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <Container>
          <Group style={{ marginTop: '1em' }}>
            <Button
              leftSection={<IconDeviceFloppy size={16} />}
              onClick={toggleEdit}
              color={editToggle ? 'green' : undefined}
            >
              {editToggle ? 'Save' : 'Edit'}
            </Button>
            {genAiEnabled && editToggle ? (
              <Tooltip label="Uses Generative AI to create a Resume Book profile from your resume.">
                <Button
                  color="purple"
                  leftSection={<IconSparkles size={16} />}
                  onClick={() => {
                    genProfileOpen();
                  }}
                >
                  Generate Profile
                </Button>
              </Tooltip>
            ) : null}
          </Group>
        </Container>
      </div>
      {newUser ? (
        <Container style={{ marginTop: '1em' }}>
          <Alert
            variant="light"
            color="green"
            title="Welcome to Resume Book"
            icon={<IconInfoCircle />}
          >
            We've provided you with a basic profile to get started. Fill out the details and save
            your profile to make it visible to recruiters.
          </Alert>
        </Container>
      ) : null}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {enrolled && studentData ? (
          <StudentProfilePage
            editable={editToggle}
            studentProfile={studentData}
            setStudentProfile={setStudentData}
            file={file}
            enrolling={newUser}
            setFile={setFile}
            showFilePicker={editToggle}
          />
        ) : (
          'We encountered an error. Please try again later.'
        )}
      </div>
      <Modal
        opened={genProfileOpened}
        onClose={genProfileClose}
        title="Generative AI Profile Creator"
      >
        <Alert color="yellow" title="Privacy Notice" icon={<IconAlertTriangleFilled />}>
          By using this feature, you agree to send your resume file to OpenAI for processing and
          response generation. Your resume data is subject to OpenAI's privacy and security
          policies.
        </Alert>
        <Text size="sm">
          This feature is not generally available. Stay tuned for more information!
        </Text>
      </Modal>
    </>
  );
}
