import { Navbar } from "@/components/navbar";
import { Autocomplete } from "@/components/profile/autocomplete";
import SocialButton from "@/components/profile/social-button";
import TagsContainer from "@/components/profile/tags-container";
import { example_skills } from "@/contants";
import Image from "next/image";
import { FC, useEffect, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const Profile: FC = () => {
  const [editMode, setEditMode] = useState<boolean>(false);

  useEffect(() => {
    // console.log("EDIT MODE", editMode);
    // if (editMode === true) return;
  }, [editMode]);

  return (
    <div className="bg-slate-400 h-screen w-full flex flex-col">
      <Navbar />

      {/* CONTENT CONTAINER */}
      <div className="w-full flex-1 justify-self-stretch self-stretch flex flex-row items-center relative h-[calc(100%-120px)]">
        {/* EDIT BUTTON (POSITIONED ABSOLUTELY) */}
        <button
          onClick={() => setEditMode((prev) => !prev)}
          type="button"
          className=" z-10 absolute top-4 right-4 flex gap-3 rounded-md px-4 py-1 text-md font-normal leading-7 bg-acm-main text-white shadow-md transition duration-150 ease-in-out hover:shadow-lg focus:shadow-lg focus:outline-none focus:ring-0 active:shadow-lg"
        >
          {editMode ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-7 w-4"
              viewBox="0 0 16 16"
              fill="currentColor"
            >
              <path d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l3.052 3.093 5.4-6.425a.247.247 0 0 1 .02-.022Z" />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-7 w-4"
              viewBox="0 0 16 16"
              fill="currentColor"
            >
              <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293l6.5-6.5zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z" />
            </svg>
          )}
          {editMode ? "Done" : "Edit Profile"}
        </button>

        {/* PROFILE CONTAINER */}
        <div className="h-full w-full bg-slate-200 flex justify-center items-center flex-1">
          <div className="p-8 lg:p-16 justify-self-stretch self-stretch flex flex-col justify-items-center items-stretch gap-10 overflow-y-scroll">
            <div className="flex flex-row gap-8">
              {/* PFP CONTAINER */}
              <div>
                <Image
                  width={96}
                  height={96}
                  className="rounded-full"
                  alt="profile picture"
                  // src="https://encrypted-tbn2.gstatic.com/images?q=tbn:ANd9GcTyKN-iSchpbCqguP_UfZXbrQrb3Zu7LcPfQqhq9gF3hDhGyWB_"
                  src="https://www.corporatephotographerslondon.com/wp-content/uploads/2021/07/LinkedIn_profile_photo_sample_1-300x300.jpg"
                />
              </div>

              {/* NAME AND BLOCK CONTAINER */}
              <div className="flex flex-col gap-3">
                <h1 className=" font-bold text-3xl ">Cenjamin Bosman</h1>
                {/* BUTTON CONTAINER */}
                <div className="flex gap-2">
                  <SocialButton type="email" />
                  <SocialButton type="linkedin" />
                </div>
              </div>
            </div>

            {/* ATTRIBUTES */}
            <div className="flex gap-7 text-acm-main text-xl">
              <div className="flex gap-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  fill="currentColor"
                  className="h-7"
                  viewBox="0 0 16 16"
                >
                  <path d="M1 2.828c.885-.37 2.154-.769 3.388-.893 1.33-.134 2.458.063 3.112.752v9.746c-.935-.53-2.12-.603-3.213-.493-1.18.12-2.37.461-3.287.811V2.828zm7.5-.141c.654-.689 1.782-.886 3.112-.752 1.234.124 2.503.523 3.388.893v9.923c-.918-.35-2.107-.692-3.287-.81-1.094-.111-2.278-.039-3.213.492V2.687zM8 1.783C7.015.936 5.587.81 4.287.94c-1.514.153-3.042.672-3.994 1.105A.5.5 0 0 0 0 2.5v11a.5.5 0 0 0 .707.455c.882-.4 2.303-.881 3.68-1.02 1.409-.142 2.59.087 3.223.877a.5.5 0 0 0 .78 0c.633-.79 1.814-1.019 3.222-.877 1.378.139 2.8.62 3.681 1.02A.5.5 0 0 0 16 13.5v-11a.5.5 0 0 0-.293-.455c-.952-.433-2.48-.952-3.994-1.105C10.413.809 8.985.936 8 1.783z" />
                </svg>
                <h3>CS + CS</h3>
              </div>

              <div className="flex gap-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  fill="currentColor"
                  className=""
                  viewBox="0 0 16 16"
                >
                  <path d="M8.211 2.047a.5.5 0 0 0-.422 0l-7.5 3.5a.5.5 0 0 0 .025.917l7.5 3a.5.5 0 0 0 .372 0L14 7.14V13a1 1 0 0 0-1 1v2h3v-2a1 1 0 0 0-1-1V6.739l.686-.275a.5.5 0 0 0 .025-.917l-7.5-3.5ZM8 8.46 1.758 5.965 8 3.052l6.242 2.913L8 8.46Z" />
                  <path d="M4.176 9.032a.5.5 0 0 0-.656.327l-.5 1.7a.5.5 0 0 0 .294.605l4.5 1.8a.5.5 0 0 0 .372 0l4.5-1.8a.5.5 0 0 0 .294-.605l-.5-1.7a.5.5 0 0 0-.656-.327L8 10.466 4.176 9.032Zm-.068 1.873.22-.748 3.496 1.311a.5.5 0 0 0 .352 0l3.496-1.311.22.748L8 12.46l-3.892-1.556Z" />
                </svg>
                <h3>Super Senior</h3>
              </div>

              <div className="flex gap-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  fill="currentColor"
                  className=""
                  viewBox="0 0 16 16"
                >
                  <path d="M5 10.5a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 0 1h-2a.5.5 0 0 1-.5-.5zm0-2a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5zm0-2a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5zm0-2a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5z" />
                  <path d="M3 0h10a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2v-1h1v1a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1v1H1V2a2 2 0 0 1 2-2z" />
                  <path d="M1 5v-.5a.5.5 0 0 1 1 0V5h.5a.5.5 0 0 1 0 1h-2a.5.5 0 0 1 0-1H1zm0 3v-.5a.5.5 0 0 1 1 0V8h.5a.5.5 0 0 1 0 1h-2a.5.5 0 0 1 0-1H1zm0 3v-.5a.5.5 0 0 1 1 0v.5h.5a.5.5 0 0 1 0 1h-2a.5.5 0 0 1 0-1H1z" />
                </svg>
                <h3>2.3</h3>
              </div>
            </div>

            {/* DESCRIPTION */}
            <div>
              <div className="flex gap-4 text-acm-main text-xl uppercase mb-2">
                Description
              </div>

              {editMode ? (
                <textarea
                  value={
                    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed congue eleifend ante id dictum. Quisque pretium leo a congue laoreet. Aliquam ultrices tristique gravida. Aliquam ultrices tristique gravida. Aliquam ultrices tristique gravida."
                  }
                  onChange={(e) => {}}
                  className="w-full h-60 flex-shrink rounded-xl leading-loose text-md border-2 border-slate-300 focus:outline-none bg-slate-200 px-4 py-2"
                ></textarea>
              ) : (
                <p>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed
                  congue eleifend ante id dictum. Quisque pretium leo a congue
                  laoreet. Aliquam ultrices tristique gravida. Aliquam ultrices
                  tristique gravida. Aliquam ultrices tristique gravida.
                </p>
              )}
            </div>

            {/* SKILLS */}
            <div>
              <div className="flex gap-4 text-acm-main text-xl uppercase mb-2 w-full">
                Skills
              </div>

              <TagsContainer src={example_skills} editMode={editMode} />
            </div>

            {editMode && (
              <div className=" ">
                <div className="flex gap-4 text-acm-main text-xl uppercase mb-2 w-full">
                  Add Skill
                </div>
                <Autocomplete src={example_skills} />
              </div>
            )}
          </div>
        </div>

        {/* RESUME CONTAINER */}
        <div className="h-full bg-slate-300 p-5 w-92 overflow-hidden">
          <Document
            className="h-full"
            // file="https://www.overleaf.com/latex/templates/jakes-resume/syzfjbzwjncs.pdf"
            file={{
              url: "/sample.pdf",
              // url: "https://www.overleaf.com/latex/templates/jakes-resume/syzfjbzwjncs.pdf",
            }}
            onLoadSuccess={() => {}}
            onLoadError={console.error}
          >
            <Page
              pageNumber={1}
              width={350}
              className="flex justify-center h-full py-16"
              renderTextLayer={false}
              renderAnnotationLayer={false}
            />
          </Document>
        </div>
      </div>
    </div>
  );
};

export default Profile;
