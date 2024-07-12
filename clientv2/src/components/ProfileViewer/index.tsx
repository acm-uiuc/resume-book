import React from 'react';
import { Container, Text, Title, Group, Stack, Badge, Avatar, Anchor, List, ThemeIcon, Grid, Box } from '@mantine/core';
import { IconBrandLinkedin, IconMail, IconSchool, IconBriefcase, IconUser, IconCertificate } from '@tabler/icons-react';
import { Document, pdfjs } from "react-pdf";
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
  return (
    <Container fluid style={{marginTop: '2vh'}}>
      <Grid gutter="xl">
        <Grid.Col span={4}>
          <Container>
            <Stack spacing="md">
              <Group position="apart" align="flex-start">
                <Stack spacing="xs">
                  <Title order={3}>{mockStudentProfile.name}</Title>
                  <Group spacing="xs">
                    <ThemeIcon color="blue" size={20} radius="xl">
                      <IconMail size={12} />
                    </ThemeIcon>
                    <Text size="sm">{mockStudentProfile.email}</Text>
                  </Group>
                  <Group spacing="xs">
                    <ThemeIcon color="blue" size={20} radius="xl">
                      <IconBrandLinkedin size={12} />
                    </ThemeIcon>
                    <Anchor href={mockStudentProfile.linkedin} target="_blank" size="sm">LinkedIn</Anchor>
                  </Group>
                </Stack>
              </Group>

              <Box>
                <Title order={5} mb="xs">
                  <Group spacing="xs">
                    <IconUser size={18} />
                    <Text>Bio</Text>
                  </Group>
                </Title>
                <Text size="sm">{mockStudentProfile.bio}</Text>
              </Box>

              <Box>
                <Title order={5} mb="xs">
                  <Group spacing="xs">
                    <IconSchool size={18} />
                    <Text>Education</Text>
                  </Group>
                </Title>
                <Stack spacing="sm">
                  {mockStudentProfile.degrees.map((degree, index) => (
                    <Box key={index} size="sm">
                      <Text weight={500}>{degree.level} in {degree.major.join(", ")}</Text>
                      <Text size="xs">{degree.institution}</Text>
                      <Group position="apart">
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
                  <Group spacing="xs">
                    <IconBriefcase size={18} />
                    <Text>Skills</Text>
                  </Group>
                </Title>
                <Group spacing="xs">
                  {mockStudentProfile.skills.map((skill, index) => (
                    <Badge key={index} size="sm">{skill}</Badge>
                  ))}
                </Group>
              </Box>

              <Box>
                <Title order={5} mb="xs">
                  <Group spacing="xs">
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
          <Container>
            <Document file={mockStudentProfile.resumePdfUrl} onLoadError={console.error}/>
          </Container>
        </Grid.Col>
      </Grid>
    </Container>
  );
};

export default StudentProfilePage;
