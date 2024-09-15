import { task, retry, logger, wait } from "@trigger.dev/sdk/v3";
import { db } from "@/lib/db";

/**
 * This task is used to check if a design has been uploaded completely.
 * If it has, it will be deleted.
 */
export const checkDesignUploadAfterADayTask = task({
	id: "check-design-upload-after-a-day",
	run: async (payload: { designId: string; userId: string }) => {
		logger.info("Scheduling check for design upload", { payload });

		await wait.for({ days: 1 });

		logger.info("Checking design upload", { payload });

		await retry.onThrow(
			async () => {
				const design = await db.design.findUnique({
					where: {
						id: payload.designId,
						userId: payload.userId,
					},
					select: {
						isUploadComplete: true,
					},
				});

				if (!design) {
					return;
				}

				if (!design.isUploadComplete) {
					await db.design.delete({
						where: {
							id: payload.designId,
						},
					});
				}
			},
			{ maxAttempts: 3 },
		);
	},
});
