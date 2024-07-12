import React, { useState, useMemo, useCallback, memo } from 'react';
import { Container, Text, Title, Group, Stack, Badge, Anchor, List, ThemeIcon, Grid, Box, Button, TextInput, Textarea, Switch, Checkbox } from '@mantine/core';
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
  studentProfile: StudentProfileDetails;
  editable: boolean;
  setStudentProfile: CallableFunction;
}

const PdfViewer: React.FC<{ url: string }> = memo(({ url }) => {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);

  const onDocumentLoadSuccess = useCallback(({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  }, []);

  return (
    <Box style={{ height: '100vh', minHeight: '600px', display: 'flex', flexDirection: 'column' }}>
      <Document
        file={url}
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
            display: 'inline-block',
          }}
        >
          <Page pageNumber={pageNumber} renderTextLayer={false} renderAnnotationLayer={false} />
        </Box>
      </Document>
      <Group mt="md">
        <Button onClick={() => setPageNumber((page) => Math.max(page - 1, 1))} disabled={pageNumber <= 1}>
          Previous
        </Button>
        <Text>Page {pageNumber} of {numPages}</Text>
        <Button onClick={() => setPageNumber((page) => Math.min(page + 1, numPages))} disabled={pageNumber >= numPages}>
          Next
        </Button>
      </Group>
    </Box>
  );
});

const StudentProfilePage: React.FC<StudentProfilePageProps> = ({ studentProfile, editable, setStudentProfile }) => {
  const handleInputChange = (field: keyof StudentProfileDetails, value: any) => {
    setStudentProfile({
      ...studentProfile,
      [field]: value,
    });
  };

  const handleDegreeChange = (index: number, field: keyof DegreeListing, value: any) => {
    const newDegrees = [...studentProfile.degrees];
    newDegrees[index] = {
      ...newDegrees[index],
      [field]: value,
    };
    handleInputChange('degrees', newDegrees);
  };

  const addDegree = () => {
    const newDegree: DegreeListing = {
      level: "BS",
      yearStarted: new Date().getFullYear(),
      institution: '',
      major: [],
      minor: [],
      gpa: 0,
    };
    handleInputChange('degrees', [...studentProfile.degrees, newDegree]);
  };

  const removeDegree = (index: number) => {
    const newDegrees = [...studentProfile.degrees];
    newDegrees.splice(index, 1);
    handleInputChange('degrees', newDegrees);
  };

  const memoizedPdfUrl = useMemo(() => studentProfile.resumePdfUrl, [studentProfile.resumePdfUrl]);

  return (
    <Container fluid style={{ marginTop: '2vh' }}>
      <Grid gutter="sm">
        <Grid.Col span={4}>
          <Container>
            <Stack>
              <Group>
                <Stack>
                  <Title order={3}>{studentProfile.name}</Title>
                  <Group>
                    <ThemeIcon color="blue" size={20} radius="xl">
                      <IconMail size={12} />
                    </ThemeIcon>
                    <Text size="sm">{studentProfile.email}</Text>
                  </Group>
                  <Group>
                    <ThemeIcon color="blue" size={20} radius="xl">
                      <IconBrandLinkedin size={12} />
                    </ThemeIcon>
                    {editable ? (
                      <TextInput
                        label="LinkedIn"
                        value={studentProfile.linkedin}
                        onChange={(e) => handleInputChange('linkedin', e.target.value)}
                      />
                    ) : (
                      <Anchor href={studentProfile.linkedin} target="_blank" size="sm">
                        LinkedIn
                      </Anchor>
                    )}
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
                {editable ? (
                  <Textarea
                    value={studentProfile.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                  />
                ) : (
                  <Text size="sm">{studentProfile.bio}</Text>
                )}
              </Box>

              <Box>
                <Title order={5} mb="xs">
                  <Group>
                    <IconSchool size={18} />
                    <Text>Education</Text>
                  </Group>
                </Title>
                <Stack>
                  {studentProfile.degrees.map((degree, index) => (
                    <Box key={index} size="sm">
                      {editable ? (
                        <>
                          <TextInput
                            label="Degree Level"
                            value={degree.level}
                            onChange={(e) => handleDegreeChange(index, 'level', e.target.value)}
                          />
                          <TextInput
                            label="Major"
                            value={degree.major.join(', ')}
                            onChange={(e) => handleDegreeChange(index, 'major', e.target.value.split(', '))}
                          />
                          <TextInput
                            label="Institution"
                            value={degree.institution}
                            onChange={(e) => handleDegreeChange(index, 'institution', e.target.value)}
                          />
                          <TextInput
                            label="Year Started"
                            value={degree.yearStarted.toString()}
                            onChange={(e) => handleDegreeChange(index, 'yearStarted', parseInt(e.target.value))}
                          />
                          <TextInput
                            label="Year Ended"
                            value={degree.yearEnded?.toString() || ''}
                            onChange={(e) => handleDegreeChange(index, 'yearEnded', e.target.value ? parseInt(e.target.value) : undefined)}
                          />
                          <TextInput
                            label="GPA"
                            value={degree.gpa.toString()}
                            onChange={(e) => handleDegreeChange(index, 'gpa', parseFloat(e.target.value))}
                          />
                          <Button onClick={() => removeDegree(index)} color="red">
                            Remove
                          </Button>
                        </>
                      ) : (
                        <>
                          <Text>{degree.level} in {degree.major.join(', ')}</Text>
                          <Text size="xs">{degree.institution}</Text>
                          <Group>
                            <Text size="xs" color="dimmed">
                              {degree.yearStarted} - {degree.yearEnded || 'Present'}
                            </Text>
                            <Badge size="sm" color="blue">
                              GPA: {degree.gpa.toFixed(1)}
                            </Badge>
                          </Group>
                        </>
                      )}
                    </Box>
                  ))}
                  {editable && (
                    <Button onClick={addDegree} color="green">
                      Add Degree
                    </Button>
                  )}
                </Stack>
              </Box>

              <Box>
                <Title order={5} mb="xs">
                  <Group>
                    <IconBriefcase size={18} />
                    <Text>Skills</Text>
                  </Group>
                </Title>
                {editable ? (
                  <Textarea
                    value={studentProfile.skills.join(', ')}
                    onChange={(e) => handleInputChange('skills', e.target.value.split(', '))}
                  />
                ) : (
                  <Group>
                    {studentProfile.skills.map((skill, index) => (
                      <Badge key={index} size="sm">
                        {skill}
                      </Badge>
                    ))}
                  </Group>
                )}
              </Box>

              <Box>
                <Title order={5} mb="xs">
                  <Group>
                    <IconCertificate size={18} />
                    <Text>Work Authorization</Text>
                  </Group>
                </Title>
                {editable ? (
                  <>
                    <Checkbox
                      label="Work Authorization Required"
                      checked={studentProfile.work_auth_required}
                      onChange={(e) => handleInputChange('work_auth_required', e.currentTarget.checked)}
                    />
                    <Checkbox
                      label="Sponsorship Required"
                      checked={studentProfile.sponsorship_required}
                      onChange={(e) => handleInputChange('sponsorship_required', e.currentTarget.checked)}
                    />
                  </>
                ) : (
                  <List spacing="xs" size="sm">
                    <List.Item>
                      Work Authorization Required: {studentProfile.work_auth_required ? 'Yes' : 'No'}
                    </List.Item>
                    <List.Item>
                      Sponsorship Required: {studentProfile.sponsorship_required ? 'Yes' : 'No'}
                    </List.Item>
                  </List>
                )}
              </Box>
            </Stack>
          </Container>
        </Grid.Col>

        <Grid.Col span={8}>
          <PdfViewer url={memoizedPdfUrl} />
        </Grid.Col>
      </Grid>
    </Container>
  );
};

export default StudentProfilePage;
