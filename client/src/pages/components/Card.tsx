import { FC } from "react";
import Image from "next/image";
const Card: FC = () => {
  return (
    <>
      <div className="w-[300px] h-[300px] bg-slate-400">
        <div className="relative overflow-hidden">
          <img  className="w-[300px] h-[300px]"
						src="https://cultivatedculture.com/wp-content/themes/x5-child/assets/images/templates/template6.jpg"
						alt="Resume"/>
          <section className="mb-2 border bg-neutral-100 p-4 rounded-lg max-w-full bg-neutral-100">
          <div className="-ml-2 -mt-3">
            <div className="card md:flex max-w-lg">
              <div className="w-12 h-12 mx-auto mt-1 md:mr-6 flex-shrink-10">
                <img className="object-cover rounded-full background" src="https://tailwindflex.com/public/images/user.png"/>
              </div>
              <div className="flex-grow text-center md:text-left">
                <h3 className="text-xl">John Doe</h3>
                <p className="mt-0 mb-3 text-sm">John is a Senior</p>     
              </div>
                 
            </div>
            <div className="-mt-2 text-center">
                  <span className = "text-xs"> cs+math </span>
                  <span className = "ml-20 text-xs"> gpa </span>  
                  <span className = "ml-20 text-xs"> year </span>    
            </div>  
            <div className="mt-2 text-center">
                    <span className="bg-blue-200 border px-3 py-1.5 rounded-lg text-xs 0px]">Discrete</span>
                    <span className="bg-pink-200 border px-3 py-1.5 rounded-lg text-xs ml-5">Topology</span> 
                    <span className="bg-yellow-200 border px-3 py-1.5 rounded-lg text-xs ml-5" >Neural</span>
            </div>
          </div> 
          </section>
        </div>
      </div>
    </>
  );
};

export default Card;
