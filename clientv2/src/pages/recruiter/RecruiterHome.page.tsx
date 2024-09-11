import { useState } from 'react';
import { Title, Container, em } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useMediaQuery } from '@mantine/hooks';
import { useAuth } from '@/components/AuthContext';
import { HeaderNavbar } from '@/components/Navbar';
import DegreeFilter, { Filters } from '@/components/SearchProfiles';
import { useApi } from '@/util/api';
import FullScreenLoader from '@/components/AuthContext/LoadingScreen';
import { ProfileSearchResults } from '@/components/SearchProfiles/Results';

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
    if (response.status !== 200) {
      setLoading(false);
      return showErrorNotification();
    }
    const sortedData = response.data.sort(function (
      a: Record<string, string>,
      b: Record<string, string>
    ) {
      const keyA = a.name.toLowerCase(),
        keyB = b.name.toLowerCase();
      if (keyA < keyB) return -1;
      if (keyA > keyB) return 1;
      return 0;
    });
    setApiResponse(sortedData);
    setLoading(false);
    return undefined;
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
