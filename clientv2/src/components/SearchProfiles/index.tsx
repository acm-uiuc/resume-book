import React, { useState } from 'react';
import { Button, Grid, Group, MultiSelect, NumberInput, Stack, Tooltip } from '@mantine/core';
import { csPlusXMajors, degreeOptions, majorOptions } from '../ProfileViewer/options';
import { IconSearch } from '@tabler/icons-react';

interface DegreeFilterProps {
  onFilter: CallableFunction;
}

export interface Filters {
  degreeTypes: string[];
  gpa?: number;
  graduationYears: string[];
  majors: string[];
  skills?: string[];
}

const DegreeFilter: React.FC<DegreeFilterProps> = ({ onFilter }) => {
  const [degreeTypes, setDegreeType] = useState<string[]>([]);
  const [graduationYears, setGraduationYears] = useState<string[]>([]);
  const [majors, setMajors] = useState<string[]>([]);
  const [gpa, setGpa] = useState<number>(3.0);

  const currentYear = new Date().getFullYear();
  const validGradYears: string[] = [
    currentYear - 1,
    currentYear,
    currentYear + 1,
    currentYear + 2,
    currentYear + 3,
    currentYear + 4,
    currentYear + 5,
  ].map((x) => x.toString());

  const handleFilter = () => {
    const filters: Filters = {
      degreeTypes,
      gpa,
      graduationYears,
      majors,
    };
    onFilter(filters);
  };

  const selectAlCsMajors = () => {
    setMajors(['Computer Science', ...csPlusXMajors]);
  };

  const SelectAllCSButton = () => (
    <Tooltip label="Selects Computer Science and CS + X majors.">
      <Button onClick={selectAlCsMajors} fullWidth mt="xs">
        Select All CS Majors
      </Button>
    </Tooltip>
  );

  return (
    <Stack>
      <MultiSelect
        label="Degree Level"
        placeholder="Select degree level"
        data={degreeOptions}
        value={degreeTypes}
        onChange={setDegreeType}
        clearable
      />
      <NumberInput
        label="GPA (Minimum, Inclusive)"
        min={0.0}
        max={4.0}
        clampBehavior="strict"
        allowNegative={false}
        decimalScale={2}
        value={gpa}
        hideControls
        onChange={(e) => setGpa(parseFloat(e as string))}
      />
      <MultiSelect
        label="Graduation Year"
        placeholder="Select graduation years"
        data={validGradYears}
        value={graduationYears}
        onChange={setGraduationYears}
      />
      <Grid align="flex-end">
        <Grid.Col span={9}>
          <MultiSelect
            label="Major"
            placeholder="Select majors"
            data={majorOptions["Bachelor's"]}
            value={majors}
            onChange={setMajors}
            clearable
          />
        </Grid.Col>
        <Grid.Col span={3}>
          <SelectAllCSButton />
        </Grid.Col>
      </Grid>
      <Group>
        <Button color="green" leftSection={<IconSearch size={14} />} onClick={handleFilter}>
          Search
        </Button>
      </Group>
    </Stack>
  );
};

export default DegreeFilter;
