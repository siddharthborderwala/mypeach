import { cn } from "@/lib/utils";
import styles from "./styles.module.css";

const bars = Array(12).fill(0);

export function Spinner({ color = "currentColor", size = 20, className = "" }) {
	return (
		<div
			className={cn(styles.wrapper, className)}
			style={
				{
					"--spinner-size": `${size}px`,
					"--spinner-color": color,
				} as React.CSSProperties
			}
		>
			<div className={styles.spinner}>
				{bars.map((_, i) => (
					// biome-ignore lint:
					<div className={styles.bar} key={`spinner-bar-${i}`} />
				))}
			</div>
		</div>
	);
}
