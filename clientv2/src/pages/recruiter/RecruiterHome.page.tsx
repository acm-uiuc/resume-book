import { useState } from 'react';
import { Title, Container, em } from '@mantine/core';
import { useAuth } from '@/components/AuthContext';
import { HeaderNavbar } from '@/components/Navbar';
import DegreeFilter, { Filters } from '@/components/SearchProfiles';
import { useApi } from '@/util/api';
import { notifications } from '@mantine/notifications';
import FullScreenLoader from '@/components/AuthContext/LoadingScreen';
import { ProfileSearchResults } from '@/components/SearchProfiles/Results';
import { useMediaQuery } from '@mantine/hooks';

function showErrorNotification(title?: string) {
  notifications.show({
    title: title || 'Failed to Fetch Profiles',
    message: 'Please try again or contact the ACM@UIUC Corporate Team.',
    color: 'red',
  });
}
export function RecruiterHomePage() {
  const { userData } = useAuth();
  const [loading, setLoading] = useState<boolean>(false);
  const [apiResponse, setApiResponse] = useState<any | null>(null);
  const isMobile = useMediaQuery(`(max-width: ${em(900)})`);

  const api = useApi();

  const handleFilter = async (filters: Filters) => {
    let response;
    try {
      setLoading(true);
      response = await api.post('/recruiter/search', filters);
    } catch {
      setLoading(false);
      return showErrorNotification();
    }
    if (response.status != 200) {
      setLoading(false);
      return showErrorNotification();
    }
    setApiResponse(response.data);
    setLoading(false);
  };
  if (loading) {
    return <FullScreenLoader />;
  }
  return (
    <>
      <HeaderNavbar userData={userData} />
      <Container>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '20px',
          }}
        >
          <Title order={1}>Search Resume Book</Title>
        </div>
        <DegreeFilter onFilter={handleFilter} />
      </Container>
      <div
        style={{ marginLeft: isMobile ? '1vw' : '10vw', marginRight: isMobile ? '1vw' : '10vw' }}
      >
        <ProfileSearchResults data={apiResponse} />
      </div>
    </>
  );
}
