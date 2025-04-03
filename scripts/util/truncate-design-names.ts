import { db } from "@/lib/db";
import readline from "node:readline";

const BATCH_SIZE = 50;

async function truncateDesignNames() {
	try {
		let processedCount = 0;
		let truncatedCount = 0;

		while (true) {
			const designs = await db.design.findMany({
				select: { id: true, name: true },
				take: BATCH_SIZE,
				skip: processedCount,
			});

			if (designs.length === 0) break;

			console.log("Truncating");
			for (const design of designs) {
				console.log(`${design.id}: ${design.name}`);
			}

			// wait for yes input from user
			await new Promise((resolve, reject) => {
				const rl = readline.createInterface({
					input: process.stdin,
					output: process.stdout,
				});
				rl.question("Go ahead? (y/n)", (answer) => {
					if (answer === "y") {
						resolve(true);
					} else {
						reject(new Error("User aborted"));
					}
				});
			});

			await db.$transaction(
				designs.map((design) =>
					db.design.update({
						where: { id: design.id },
						data: { name: design.name.slice(0, 24) },
					}),
				),
			);

			truncatedCount += designs.length;
			processedCount += BATCH_SIZE;
			console.log(
				`Processed ${processedCount} designs, truncated ${truncatedCount} names`,
			);
		}

		console.log(`\nCompleted. Total names truncated: ${truncatedCount}`);
		await db.$disconnect();
		process.exit(0);
	} catch (error) {
		console.error(error);
		process.exit(1);
	}
}

truncateDesignNames();
