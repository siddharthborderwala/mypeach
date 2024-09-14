export const AuthLayout = ({ children }: { children: React.ReactNode }) => {
	return (
		<div className="w-[100svw] h-[100svh] max-lg:flex max-lg:items-center max-lg:justify-center lg:grid lg:grid-cols-2">
			<div className="absolute top-0 left-0 max-lg:flex max-lg:items-center lg:hidden w-full h-auto p-4">
				<img src="/favicon.ico" alt="logo" className="h-10 w-10" />
				<p className="text-black text-3xl font-bold tracking-tight">Peach</p>
			</div>
			<div className="hidden bg-[hsl(351deg,95%,71%)] h-full lg:flex items-center justify-center">
				<img src="/favicon.ico" alt="logo" className="h-20 w-20" />
				<p className="text-white text-6xl font-bold tracking-tight">Peach</p>
			</div>
			{children}
		</div>
	);
};
