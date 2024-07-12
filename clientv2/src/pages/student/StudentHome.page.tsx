import { useAuth } from '@/components/AuthContext';
import { HeaderNavbar } from '@/components/Navbar';
import { useApi } from '@/util/api';
import { useEffect, useState } from 'react';
import FullScreenLoader from '@/components/AuthContext/LoadingScreen';
import StudentProfilePage, { StudentProfileDetails } from '@/components/ProfileViewer';



const mockStudentProfile: StudentProfileDetails = {
  username: "jsmith@illinois.edu",
  name: "Jane Smith",
  email: "jsmith@university.edu",
  linkedin: "https://www.linkedin.com/in/janesmith",
  degrees: [
    {
      level: "BS",
      yearStarted: 2016,
      yearEnded: 2020,
      institution: "University of Technology",
      major: ["Computer Science"],
      minor: ["Mathematics"],
      gpa: 3.8
    },
    {
      level: "Masters (Thesis)",
      yearStarted: 2021,
      institution: "Tech Institute",
      major: ["Artificial Intelligence"],
      minor: [],
      gpa: 3.9
    }
  ],
  bio: "Passionate computer science graduate with a focus on AI and machine learning. Currently pursuing a Master's degree while working on cutting-edge research projects.",
  skills: ["Python", "TensorFlow", "Machine Learning", "Data Analysis", "Java", "C++"],
  work_auth_required: false,
  sponsorship_required: true,
  resumePdfUrl: "https://files.devksingh.com/Dev_Singh_resume.pdf"
};

export function StudentHomePage() {
  const { userData, getToken } = useAuth();
  const [loading, setLoading] = useState(true);
  const [enrolled, setEnrolled] = useState(false);
  const [lastName, firstName] = userData?.name?.split(',') as string[];
  const api = useApi();
  useEffect(() => {
    async function fetch() {
      setLoading(true);
      try {
        const response = await api.get("/student/profile");
        setEnrolled(response.status === 200);
        setLoading(false);
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
      {!enrolled ?  <StudentProfilePage studentProfile={mockStudentProfile}/> : <StudentProfilePage />}
      </div>
    </>
  );
}
