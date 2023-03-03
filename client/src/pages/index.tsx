import Image from "next/image";
import { useState, useEffect } from "react";

export default function Home() {
	const [scrollTop, setScrollTop] = useState(0);

	useEffect(() => {
		const handleScroll = (event: any) => {
			setScrollTop(window.scrollY);
		};

		window.addEventListener("scroll", handleScroll);

		return () => {
			window.removeEventListener("scroll", handleScroll);
		};
	}, []);

	return (
		<div className="bg-slate-400 h-screen">
			<div className="w-screen text-center py-1 bg-slate-500 text-white">welcome, recruiter!</div>
			{/* <div className="sticky top-0 w-full h-32 z-20 bg-red-500">
				<h1 className="text-3xl font-bold underline">Resume Book</h1>

				<input
					type="text"
					placeholder="Type here"
					className="w-full max-w-xs h-7 flex-shrink pl-1 pr-1 rounded-md leading-loose text-sm border-2 m-2 focus:outline-none"
				/>
			</div>

			<div className="h-screen flex items-center justify-center flex-col gap-4">
				<div className="h-full w-28 fixed z-10 top-0 left-0 bg-slate-300 overflow-x-hidden pt-5 ">
					<a href="#">About</a>
					<a href="#">Services</a>
					<a href="#">Clients</a>
					<a href="#">Contact</a>
				</div>
				<h1>Title</h1>
				<p>Content</p>
			</div> */}

			<div className={"h-fit w-full z-10 bg-acm pt-5 top-0 p-4 flex items-center " + (scrollTop >= 0 && "sticky")}>
				<Image
					src="data:image/png;base64,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"
					alt="Logo"
					width={130}
					height={130}
				/>
				<h1 className="ml-6 text-3xl text-white">Resume Book</h1>
				<div className="flex-1"></div>
				<button className="mr-5 select-none	p-2 px-4 bg-slate-500 rounded-md text-slate-300 border-solid border-2 border-slate-400">
					Recruiter Login
				</button>
				<button className="mr-5 select-none	p-2 px-4 bg-slate-500 rounded-md text-slate-300 border-solid border-2 border-slate-400">
					Student Login
				</button>
			</div>

			<div className="flex justify-center align-center flex-row h-full">
				{/* <div className="h-full w-28 bg-slate-200 overflow-x-hidden pt-5 fixed left-0"></div> */}

				<div className=" w-52 h-full bg-slate-300 flex justify-center items-center">SIDE CONTENT</div>
				<div className="h-[100] bg-slate-100 flex-1 flex justify-center items-center">MAIN CONTENT</div>
			</div>
		</div>
	);
}
