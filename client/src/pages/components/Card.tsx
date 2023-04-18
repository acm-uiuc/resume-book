import { FC } from "react";
import Image from "next/image";

const Card: FC = () => {
  return (
    <>
      <div className="w-[260px] h-[200px] bg-slate-400">
        <div>
          {/* <Image
						src="https://cultivatedculture.com/wp-content/themes/x5-child/assets/images/templates/template6.jpg"
						alt="Resume"
						fill
					/> */}
        </div>
        <div>Bottom</div>
      </div>
    </>
  );
};

export default Card;
