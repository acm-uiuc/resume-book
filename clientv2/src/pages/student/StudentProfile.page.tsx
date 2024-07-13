import { useEffect, useState } from 'react';
import { Button, Container, Grid } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useAuth } from '@/components/AuthContext';
import { HeaderNavbar } from '@/components/Navbar';
import { useApi } from '@/util/api';
import FullScreenLoader from '@/components/AuthContext/LoadingScreen';
import StudentProfilePage, { StudentProfileDetails } from '@/components/ProfileViewer';
import FullPageError from '@/components/FullPageError';

export function StudentHomePage() {
  const { userData } = useAuth();
  const [loading, setLoading] = useState(true);
  const [enrolled, setEnrolled] = useState(false);
  const [editToggle, setEditToggle] = useState(false);
  const [unrecoverableError, setUnrecoverableError] = useState(false);
  const [studentData, setStudentData] = useState<StudentProfileDetails>();
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
        setStudentData(response.data as StudentProfileDetails);
      } catch (err: any) {
        if (err.response && err.response.status === 404) {
          setEnrolled(false);
          setLoading(false);
        } else {
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

  function isValidLinkedInProfile(url: string) {
    const linkedinProfilePattern = /^http(s)?:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9-]+\/?$/;
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

  async function saveData() {
    if (!studentData) {
      return showErrorSaveNotification();
    }
    if (!isValidLinkedInProfile(studentData?.linkedin)) {
      return showErrorSaveNotification('LinkedIn field is not a valid LinkedIn URL.');
    }
    try {
      setLoading(true);
      const response = await api.post('/student/profile', studentData);
      if (response.status && response.status == 201) {
        notifications.show({
          title: 'Profile saved!',
          message: '',
        });
        setEditToggle(false);
      } else {
        showErrorSaveNotification();
      }
    } catch (err: any) {
      showErrorSaveNotification();
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
          <Button onClick={toggleEdit} style={{ marginTop: '1em' }}>
            {editToggle ? 'Save' : 'Edit'}
          </Button>
        </Container>
        {enrolled && studentData ? (
          <StudentProfilePage
            editable={editToggle}
            studentProfile={studentData}
            setStudentProfile={setStudentData}
          />
        ) : (
          'User does not have a profile. Need to enroll.'
        )}
      </div>
    </>
  );
}
