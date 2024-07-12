import React, { useState } from 'react';
import { Container, Text, Title, Group, Stack, Badge, Anchor, List, ThemeIcon, Grid, Box, Button } from '@mantine/core';
import { IconBrandLinkedin, IconMail, IconSchool, IconBriefcase, IconUser, IconCertificate, IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import { Document, Page, pdfjs } from 'react-pdf';
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

export interface DegreeListing {
  level: "BS" | "Masters (Thesis)" | "Masters (Non-Thesis)";
  yearStarted: number;
  yearEnded?: number;
  institution: string;
  major: string[];
  minor: string[];
  gpa: number;
}

export interface StudentProfileDetails {
  username: string;
  name: string;
  email: string;
  linkedin: string;
  degrees: DegreeListing[];
  bio: string;
  skills: string[];
  work_auth_required: boolean;
  sponsorship_required: boolean;
  resumePdfUrl: string;
}


interface StudentProfilePageProps {
    studentProfile: StudentProfileDetails
}

const StudentProfilePage: React.FC<StudentProfilePageProps> = ({studentProfile: mockStudentProfile}) => {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }): void {
    setNumPages(numPages);
  }
  return (
    <Container fluid style={{marginTop: "2vh"}}>
      <Grid gutter="sm">
        <Grid.Col span={4}>
          <Container>
            <Stack>
              <Group>
                <Stack>
                  <Title order={3}>{mockStudentProfile.name}</Title>
                  <Group>
                    <ThemeIcon color="blue" size={20} radius="xl">
                      <IconMail size={12} />
                    </ThemeIcon>
                    <Text size="sm">{mockStudentProfile.email}</Text>
                  </Group>
                  <Group>
                    <ThemeIcon color="blue" size={20} radius="xl">
                      <IconBrandLinkedin size={12} />
                    </ThemeIcon>
                    <Anchor href={mockStudentProfile.linkedin} target="_blank" size="sm">LinkedIn</Anchor>
                  </Group>
                </Stack>
              </Group>

              <Box>
                <Title order={5} mb="xs">
                  <Group>
                    <IconUser size={18} />
                    <Text>Bio</Text>
                  </Group>
                </Title>
                <Text size="sm">{mockStudentProfile.bio}</Text>
              </Box>

              <Box>
                <Title order={5} mb="xs">
                  <Group>
                    <IconSchool size={18} />
                    <Text>Education</Text>
                  </Group>
                </Title>
                <Stack>
                  {mockStudentProfile.degrees.map((degree, index) => (
                    <Box key={index} size="sm">
                      <Text>{degree.level} in {degree.major.join(", ")}</Text>
                      <Text size="xs">{degree.institution}</Text>
                      <Group>
                        <Text size="xs" color="dimmed">
                          {degree.yearStarted} - {degree.yearEnded || "Present"}
                        </Text>
                        <Badge size="sm" color="blue">GPA: {degree.gpa.toFixed(1)}</Badge>
                      </Group>
                    </Box>
                  ))}
                </Stack>
              </Box>

              <Box>
                <Title order={5} mb="xs">
                  <Group>
                    <IconBriefcase size={18} />
                    <Text>Skills</Text>
                  </Group>
                </Title>
                <Group>
                  {mockStudentProfile.skills.map((skill, index) => (
                    <Badge key={index} size="sm">{skill}</Badge>
                  ))}
                </Group>
              </Box>

              <Box>
                <Title order={5} mb="xs">
                  <Group>
                    <IconCertificate size={18} />
                    <Text>Work Authorization</Text>
                  </Group>
                </Title>
                <List spacing="xs" size="sm">
                  <List.Item>
                    Work Authorization Required: {mockStudentProfile.work_auth_required ? "Yes" : "No"}
                  </List.Item>
                  <List.Item>
                    Sponsorship Required: {mockStudentProfile.sponsorship_required ? "Yes" : "No"}
                  </List.Item>
                </List>
              </Box>
            </Stack>
          </Container>
        </Grid.Col>

        <Grid.Col span={8}>
          <Box style={{ height: '100vh', minHeight: '600px', display: 'flex', flexDirection: 'column' }}>
            <Document
              file={mockStudentProfile.resumePdfUrl}
              onLoadSuccess={onDocumentLoadSuccess}
              options={{
                cMapUrl: 'https://unpkg.com/pdfjs-dist@3.4.120/cmaps/',
                cMapPacked: true,
              }}
            >
              <Box 
                style={{ 
                  border: '2px solid #FF5F05', 
                  borderRadius: '4px',
                  padding: '8px',
                  display: 'inline-block'
                }}
              >
                <Page 
                  pageNumber={pageNumber} 
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                />
              </Box>
            </Document>
            <Group mt="md">
              <Button 
                onClick={() => setPageNumber(page => Math.max(page - 1, 1))}
                disabled={pageNumber <= 1}
              >
                Previous
              </Button>
              <Text>
                Page {pageNumber} of {numPages}
              </Text>
              <Button 
                onClick={() => setPageNumber(page => Math.min(page + 1, numPages))}
                disabled={pageNumber >= numPages}
              >
                Next
              </Button>
            </Group>
          </Box>
        </Grid.Col>
      </Grid>
      </Container>
  );
};

export default StudentProfilePage;
