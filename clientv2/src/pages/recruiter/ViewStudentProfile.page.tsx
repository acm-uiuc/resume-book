import { useEffect, useState } from 'react';
import { useAuth } from '@/components/AuthContext';
import { useApi } from '@/util/api';
import FullScreenLoader from '@/components/AuthContext/LoadingScreen';
import StudentProfilePage, { StudentProfileDetails } from '@/components/ProfileViewer';
import FullPageError from '@/components/FullPageError';

export interface ViewStudentProfileTypes {
  username: string;
}

export const ViewStudentProfile: React.FC<ViewStudentProfileTypes> = ({ username }) => {
  const { userData } = useAuth();
  const [loading, setLoading] = useState(true);
  const [enrolled, setEnrolled] = useState(false);
  const [unrecoverableError, setUnrecoverableError] = useState(false);
  const [studentData, setStudentData] = useState<StudentProfileDetails>();
  const api = useApi();
  useEffect(() => {
    async function fetch() {
      setLoading(true);
      try {
        const response = await api.get(`/recruiter/view_profile/${username}`);
        setEnrolled(response.status === 200);
        setLoading(false);
        for (let i = 0; i < response.data.degrees.length; i++) {
          response.data.degrees[i].gpa = parseFloat(response.data.degrees[i].gpa);
        }
        if (response.data.defaultResponse) {
          setUnrecoverableError(true);
        }
        setStudentData(response.data as StudentProfileDetails);
      } catch (err: any) {
        if (err.response && err.response.status === 404) {
          setUnrecoverableError(true);
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
  if (unrecoverableError) {
    return <FullPageError />;
  }
  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {enrolled && studentData ? (
          <StudentProfilePage
            editable={false}
            studentProfile={studentData}
            setStudentProfile={setStudentData}
            file={null}
            enrolling={false}
            setFile={() => {}}
            showFilePicker={false}
          />
        ) : (
          'We encountered an error. Please try again later.'
        )}
      </div>
    </>
  );
};
