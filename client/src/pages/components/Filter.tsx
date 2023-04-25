import { useState, FC, ReactElement } from "react";

import Select from "react-select";

interface FilterProps {}

interface GroupProps {
  name: string;
  children: ReactElement<JSX.Element | JSX.Element[] | (() => JSX.Element)>;
}

const Group: FC<GroupProps> = ({ name, children }) => {
  // Filter (grade, major, gpa (slider), tags skills)
  return (
    <div>
      <h1 className="flex gap-4 text-acm-main text-xl uppercase mb-2">
        {name}
      </h1>
      {children}
    </div>
  );
};

const Filter: FC<FilterProps> = (props) => {
  // Filter (grade, major, gpa (slider), tags skills)

  const gradeOptions = [
    { value: "1", label: "Freshman" },
    { value: "2", label: "Sophomore" },
    { value: "3", label: "Junior" },
    { value: "4", label: "Senior" },
  ];

  // TODO
  // fetch this list from somewhere...
  const majorOptions = [
    { value: "cs", label: "Computer Science" },
    { value: "cs_cs", label: "Computer Science + Crop Sciences" },
    { value: "psyc", label: "Psychology" },
    { value: "math", label: "Mathematics" },
  ];

  const colors: string[] = [
    "#3F9A64",
    "#3FA8C9",
    "#D8666D",
    "#E17FB8",
    "#5E8FEB",
    "#9869D4",
    "#EF8D46",
  ];

  // TODO
  // fetch this list from somewhere...
  const skillsOptions = [
    { value: "cs", label: "C++", color: colors[0] },
    { value: "cs_cs", label: "Python", color: colors[1] },
    { value: "psyc", label: "Golang", color: colors[2] },
    { value: "math", label: "Fortran", color: colors[3] },
  ];

  // states
  const [gpa, setGpa] = useState<number>(4);

  return (
    <div className="flex flex-col gap-5">
      <Group name={"Grade"}>
        <Select options={gradeOptions} className="rounded-md" />
      </Group>

      <Group name={"Major"}>
        <Select options={majorOptions} className="rounded-md" />
      </Group>

      <Group name={"GPA"}>
        <div className="flex gap-3">
          <input
            className=" flex-1"
            id="typeinp"
            type="range"
            min="0.00"
            max="4.00"
            value={gpa}
            onChange={(e) => {
              setGpa(Number.parseFloat(e.target.value));
            }}
            step="0.01"
          />
          <div className=" w-8">{gpa}</div>
        </div>
      </Group>

      <Group name={"Skills"}>
        <Select
          options={skillsOptions}
          closeMenuOnSelect={false}
          // defaultValue={[]}

          isMulti
          styles={{
            control: (baseStyles, state) => ({
              ...baseStyles,
              // borderColor: state.isFocused ? "grey" : "red",
            }),
            multiValue: (styles, { data }) => {
              return {
                ...styles,
                backgroundColor: data.color,
                // control: (state) => "bg-red-500 rounded-full min-w-fit max-w-full text-white flex px-3 items-center ",
                borderRadius: "9999px",
                paddingLeft: ".75rem",
                paddingRight: ".75rem",
                display: "flex",
                alignItems: "center",
              };
            },
            multiValueLabel: (styles, { data }) => ({
              color: "white",
            }),
            multiValueRemove: (styles, { data }) => ({
              color: "white",
              transform: "translateX(5px) translateY(-2px)",
              ":hover": {},
            }),
          }}
          classNames={
            {
              // control: (state) => "bg-red-500 rounded-full min-w-fit max-w-full text-white flex px-3 items-center ",
            }
          }
          className="rounded-md"
        />
        {/* // className="rounded-full min-w-fit max-w-full text-white flex px-3 items-center " 
                { borderRadius: "1000px", color: "white", padd}
                */}
        {/* <div
					style={{ backgroundColor: colors[chosen] }}
				>
					<p className="">{skill}</p>
					{editMode && (
						<svg
							onClick={() => handleRemoveSkill(skill)}
							xmlns="http://www.w3.org/2000/svg"
							width="16"
							height="16"
							fill="currentColor"
							stroke="white"
							stroke-width="1"
							viewBox="0 0 16 16"
							className=" translate-x-2 cursor-pointer"
						>
							<path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z" />
						</svg>
					)}
				</div> */}
      </Group>

      <button className="select-none p-2 px-4 bg-slate-500 rounded-md text-slate-300 border-solid border-2 border-slate-400">
        Submit
      </button>
    </div>
  );
};

export default Filter;
