import { useAuth } from '@/components/AuthContext';
import { HeaderNavbar } from '@/components/Navbar';
import { useApi } from '@/util/api';
import { useEffect, useState } from 'react';
import FullScreenLoader from '@/components/AuthContext/LoadingScreen';
import StudentProfilePage, { StudentProfileDetails } from '@/components/ProfileViewer';

export function StudentHomePage() {
  const { userData } = useAuth();
  const [loading, setLoading] = useState(true);
  const [enrolled, setEnrolled] = useState(false);
  const [studentData, setStudentData] = useState<StudentProfileDetails>();
  const api = useApi();
  useEffect(() => {
    async function fetch() {
      setLoading(true);
      try {
        const response = await api.get("/student/profile");
        setEnrolled(response.status === 200);
        setLoading(false);
        for (let i = 0; i < response.data['degrees'].length; i++) {
          response.data['degrees'][i].gpa = parseFloat(response.data['degrees'][i].gpa);
        }
        setStudentData(response.data as StudentProfileDetails);
      } catch (err: any) {
        if (err.response.status === 404) {
          setEnrolled(false);
          setLoading(false);
        } else {
          setLoading(true);
        }
      }
    }
    if (userData) {
      fetch();
    }
  }, [userData])
  if (loading) {
    return <FullScreenLoader />
  }
  return (
    <>
      <HeaderNavbar userData={userData} />
      <div style={{ display: 'flex', alignItems: 'center' }}>
      {enrolled && studentData ?  <StudentProfilePage studentProfile={studentData}/> : "User does not have a profile. Need to enroll."}
      </div>
    </>
  );
}
