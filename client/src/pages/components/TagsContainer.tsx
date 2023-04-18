import { useState, FC } from "react";

interface TagsContainerProps {
  src: string[];
  editMode: boolean;
}

const colors: string[] = [
  "#3F9A64",
  "#3FA8C9",
  "#D8666D",
  "#E17FB8",
  "#5E8FEB",
  "#9869D4",
  "#EF8D46",
];

const TagsContainer: FC<TagsContainerProps> = ({ src, editMode }) => {
  const handleRemoveSkill = (remove_skill: string) => {
    // this will unrender the skill tag
    setSkills((prev) =>
      prev.filter((skill) => {
        return skill !== remove_skill;
      })
    );

    // TODO: remove from database
  };

  const [skills, setSkills] = useState<string[]>(src);

  // useEffect(() => {}, []);

  return (
    <div className="flex gap-2 flex-wrap">
      {skills.map((skill, index) => {
        // determines chosen color (accounting for index overflow)
        const chosen: number = index % colors.length;

        return (
          <div
            key={skill}
            className="rounded-full min-w-fit max-w-full text-white flex px-3 items-center "
            style={{ backgroundColor: colors[chosen] }}
          >
            <p className="">{skill}</p>

            {/* CONDITIONALLY RENDER "X" */}
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
          </div>
        );
      })}
    </div>
  );
};

export default TagsContainer;
