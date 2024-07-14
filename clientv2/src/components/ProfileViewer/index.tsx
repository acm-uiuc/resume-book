import React, { useState, useMemo, useCallback, memo, useEffect } from 'react';
import {
  Container,
  Text,
  Title,
  Group,
  Stack,
  Badge,
  Anchor,
  List,
  ThemeIcon,
  Grid,
  Box,
  Button,
  TextInput,
  Textarea,
  Select,
  Checkbox,
  NumberInput,
  Autocomplete,
  FileButton,
} from '@mantine/core';
import {
  IconBrandLinkedin,
  IconMail,
  IconSchool,
  IconBriefcase,
  IconUser,
  IconCertificate,
} from '@tabler/icons-react';
import { Document, Page, pdfjs } from 'react-pdf';
import { institutionOptions, degreeOptions, DegreeLevel, majorOptions } from './options';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

export interface DegreeListing {
  level: DegreeLevel;
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

const PdfViewer: React.FC<{
  url: File | string;
  file: File | null;
  setFile: CallableFunction;
  showFilePicker: boolean;
}> = memo(({ url, file, setFile, showFilePicker }) => {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [error, setError] = useState<string | null>(null);

  const onDocumentLoadSuccess = useCallback(({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setError(null);
  }, []);

  const onDocumentLoadError = useCallback((error: any) => {
    setError('Failed to load PDF document.');
    console.error('Error loading PDF document:', error);
  }, []);
  const [fileLoaded, setFileLoaded] = useState<boolean>(file == null);
  useEffect(() => {
    setFileLoaded(file instanceof Blob);
  }, [file]);
  return (
    <Box style={{ height: '100vh', minHeight: '600px', display: 'flex', flexDirection: 'column' }}>
      {error && <Text color="red">{error}</Text>}
      <Document
        file={url}
        onLoadSuccess={onDocumentLoadSuccess}
        onLoadError={onDocumentLoadError}
        options={{
          cMapUrl: 'https://unpkg.com/pdfjs-dist@3.4.120/cmaps/',
          cMapPacked: true,
        }}
      >
        <Box
          style={{
            border: fileLoaded ? '2px dashed #FF5F05' : '2px solid #FF5F05',
            borderRadius: '4px',
            padding: '8px',
            display: 'inline-block',
          }}
        >
          <Page pageNumber={pageNumber} renderTextLayer={false} renderAnnotationLayer={false} />
        </Box>
      </Document>
      <Group mt="md">
        <Button
          onClick={() => setPageNumber((page) => Math.max(page - 1, 1))}
          disabled={pageNumber <= 1}
        >
          Previous
        </Button>
        <Text>
          Page {pageNumber} of {numPages}
        </Text>
        <Button
          onClick={() => setPageNumber((page) => Math.min(page + 1, numPages))}
          disabled={pageNumber >= numPages}
        >
          Next
        </Button>
        {showFilePicker ? (
          <FileButton
            onChange={(payload) => {
              setFile(payload);
            }}
            accept="application/pdf"
          >
            {(props) => (
              <Button {...props}>{file && file.size > 0 ? file.name : 'Upload Resume PDF'}</Button>
            )}
          </FileButton>
        ) : null}
      </Group>
    </Box>
  );
});

interface StudentProfilePageProps {
  studentProfile: StudentProfileDetails;
  editable: boolean;
  setStudentProfile: CallableFunction;
  file: File | null;
  setFile: CallableFunction;
  showFilePicker: boolean;
  enrolling: boolean;
}

const StudentProfilePage: React.FC<StudentProfilePageProps> = ({
  studentProfile,
  editable,
  setStudentProfile,
  file,
  setFile,
  showFilePicker,
  enrolling,
}) => {
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
    if (field === 'level') {
      newDegrees[index].major = [];
    }
    handleInputChange('degrees', newDegrees);
  };

  const addDegree = () => {
    const newDegree: DegreeListing = {
      level: "Bachelor's",
      yearStarted: new Date().getFullYear() - 4,
      yearEnded: new Date().getFullYear(),
      institution: 'University of Illinois Urbana-Champaign',
      major: [],
      minor: [],
      gpa: 4.0,
    };
    handleInputChange('degrees', [...studentProfile.degrees, newDegree]);
  };

  const removeDegree = (index: number) => {
    const newDegrees = [...studentProfile.degrees];
    newDegrees.splice(index, 1);
    handleInputChange('degrees', newDegrees);
  };

  const memoizedPdfUrl = useMemo(() => studentProfile.resumePdfUrl, [studentProfile.resumePdfUrl]);

  const processGPA = (gpaUnparsed: number) => {
    let gpa = gpaUnparsed.toString();
    if (gpa.endsWith('.00')) {
      gpa = gpa.slice(0, -1);
    }
    return parseFloat(gpa);
  };
  return (
    <Container fluid style={{ marginTop: '2vh' }}>
      <Grid gutter="sm">
        <Grid.Col span={4}>
          <Container>
            <Stack>
              <Group>
                <Stack>
                  {editable ? (
                    <TextInput
                      label="Name"
                      value={studentProfile.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                    />
                  ) : (
                    <Title order={3}>{studentProfile.name}</Title>
                  )}
                  <Group>
                    <ThemeIcon color="blue" size={20} radius="xl">
                      <IconMail size={12} />
                    </ThemeIcon>
                    <Text size="sm">{studentProfile.email}</Text>
                  </Group>
                  <Group>
                    {editable ? (
                      <TextInput
                        label="LinkedIn Profile URL"
                        value={studentProfile.linkedin}
                        onChange={(e) => handleInputChange('linkedin', e.target.value.trim())}
                      />
                    ) : (
                      <>
                        <ThemeIcon color="blue" size={20} radius="xl">
                          <IconBrandLinkedin size={12} />
                        </ThemeIcon>
                        {studentProfile.linkedin === '' ? (
                          <Text size="sm" style={{ fontStyle: 'italic' }}>
                            LinkedIn Profile not provided
                          </Text>
                        ) : (
                          <Anchor href={studentProfile.linkedin} target="_blank" size="sm">
                            LinkedIn Profile
                          </Anchor>
                        )}
                      </>
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
                          <Select
                            label="Degree Level"
                            value={degree.level}
                            onChange={(value) => {
                              handleDegreeChange(index, 'level', value);
                            }}
                            data={degreeOptions.map((option) => ({ value: option, label: option }))}
                            withAsterisk
                            allowDeselect={false}
                          />
                          <Select
                            label="Major"
                            value={degree.major[0]}
                            onChange={(e) => handleDegreeChange(index, 'major', e?.split(', '))}
                            data={majorOptions[degree.level] || []}
                            withAsterisk
                            required
                            allowDeselect={false}
                          />
                          <Autocomplete
                            label="Institution"
                            value={degree.institution}
                            onChange={(e) => handleDegreeChange(index, 'institution', e)}
                            data={institutionOptions}
                            withAsterisk
                          />
                          <NumberInput
                            label="Year Started"
                            value={degree.yearStarted}
                            min={0}
                            max={new Date().getFullYear() + 10}
                            onChange={(e) => handleDegreeChange(index, 'yearStarted', e)}
                            withAsterisk
                            required
                            clampBehavior="strict"
                            allowNegative={false}
                            hideControls
                          />
                          <NumberInput
                            label="Year Ended (or prospective)"
                            value={degree.yearEnded}
                            min={0}
                            max={new Date().getFullYear() + 10}
                            onChange={(e) => handleDegreeChange(index, 'yearEnded', e)}
                            withAsterisk
                            required
                            clampBehavior="strict"
                            allowNegative={false}
                            hideControls
                          />
                          <NumberInput
                            label="GPA"
                            min={0.0}
                            max={4.0}
                            clampBehavior="strict"
                            allowNegative={false}
                            decimalScale={2}
                            value={degree.gpa}
                            hideControls
                            onChange={(e) => handleDegreeChange(index, 'gpa', e)}
                            withAsterisk
                          />
                          <Button
                            onClick={() => removeDegree(index)}
                            style={{ marginTop: '0.5em' }}
                            color="red"
                            fullWidth
                          >
                            Remove
                          </Button>
                        </>
                      ) : (
                        <>
                          <Text>
                            {degree.level} in {degree.major}
                          </Text>
                          <Text size="xs">{degree.institution}</Text>
                          <Group>
                            <Text size="xs" color="dimmed">
                              {degree.yearStarted} - {degree.yearEnded || 'Present'}
                            </Text>
                            <Badge size="sm" color="blue">
                              GPA: {processGPA(degree.gpa)}
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
                    description="Seperate skills with a comma."
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
                      onChange={(e) =>
                        handleInputChange('work_auth_required', e.currentTarget.checked)
                      }
                    />
                    <Checkbox
                      label="Sponsorship Required"
                      checked={studentProfile.sponsorship_required}
                      style={{ marginTop: '0.25em' }}
                      onChange={(e) =>
                        handleInputChange('sponsorship_required', e.currentTarget.checked)
                      }
                    />
                  </>
                ) : (
                  <List spacing="xs" size="sm">
                    <List.Item>
                      Work Authorization Required?{' '}
                      <b>{studentProfile.work_auth_required ? 'Yes' : 'No'}</b>
                    </List.Item>
                    <List.Item>
                      Sponsorship Required?{' '}
                      <b>{studentProfile.sponsorship_required ? 'Yes' : 'No'}</b>
                    </List.Item>
                  </List>
                )}
              </Box>
            </Stack>
          </Container>
        </Grid.Col>

        <Grid.Col span={8}>
          {!enrolling && file && file.size > 0 && file.type === 'application/pdf' ? (
            <PdfViewer url={file} file={file} setFile={setFile} showFilePicker={showFilePicker} />
          ) : (
            <PdfViewer
              url={memoizedPdfUrl}
              file={file}
              setFile={setFile}
              showFilePicker={showFilePicker}
            />
          )}
        </Grid.Col>
      </Grid>
    </Container>
  );
};

export default StudentProfilePage;
