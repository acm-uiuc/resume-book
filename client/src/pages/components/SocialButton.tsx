import { FC } from "react";

interface SocialButtonProps {
  type: string;
}

// SVG's
const LinkedIn_svg = () => (
  <>
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-6 w-4"
      fill="currentColor"
      viewBox="0 0 24 24"
    >
      <path d="M4.98 3.5c0 1.381-1.11 2.5-2.48 2.5s-2.48-1.119-2.48-2.5c0-1.38 1.11-2.5 2.48-2.5s2.48 1.12 2.48 2.5zm.02 4.5h-5v16h5v-16zm7.982 0h-4.968v16h4.969v-8.399c0-4.67 6.029-5.052 6.029 0v8.399h4.988v-10.131c0-7.88-8.922-7.593-11.018-3.714v-2.155z" />
    </svg>
  </>
);
const Email_svg = () => (
  <>
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-7 w-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="22" y1="2" x2="11" y2="13"></line>
      <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
    </svg>
  </>
);

const icons: {
  [key: string]: { name: string; svg: FC; color: string; link: string };
} = {
  linkedin: {
    name: "LinkedIn",
    svg: LinkedIn_svg,
    color: "#0077b5",
    link: "https://www.linkedin.com/in/ben/",
  },
  email: {
    name: "Email",
    svg: Email_svg,
    color: "grey",
    link: "mailto:example@illinois.edu",
  },
};

const SocialButton: FC<SocialButtonProps> = (props) => {
  const { type } = props;
  const SvgRender: FC = icons[type].svg;
  return (
    <>
      <button
        onClick={() => {
          if (icons[type].link.includes("mailto:"))
            location.href = icons[type].link;
          else
            window.open(
              icons[type].link,
              "_blank" // new window.
            );
        }}
        type="button"
        className=" flex gap-3 rounded-md px-4 py-1 text-md font-normal leading-7 text-white shadow-md transition duration-150 ease-in-out hover:shadow-lg focus:shadow-lg focus:outline-none focus:ring-0 active:shadow-lg"
        style={{ backgroundColor: `${icons[type].color}` }}
      >
        {/* <LinkedIn_svg /> */}
        <SvgRender />
        {icons[type].name}
      </button>
    </>
  );
};

export default SocialButton;
