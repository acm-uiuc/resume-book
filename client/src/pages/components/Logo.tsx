// import Image from "next/image";

interface SizeType {
	height: number;
	width: number;
}

const Logo = ({ height, width }: SizeType) => {
	return (
		<>
			<img src="/acm.png" alt="Logo" width={width} height={height} />
		</>
	);
};

export default Logo;
