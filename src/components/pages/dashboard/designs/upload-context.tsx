"use client";

import type { DesignData } from "@/lib/actions/designs";
import { parseAsBoolean, useQueryState } from "nuqs";
import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
} from "react";

type UploadState =
	| {
			state: "idle";
	  }
	| {
			state: "uploading" | "complete" | "error";
			fileName: string;
	  };

type SetState<T> = React.Dispatch<React.SetStateAction<T>>;

type DesignDetails = {
	name: string;
	price: number;
	fileDPI: number;
	tags: string;
};

type UploadContextType = {
	uploadState: UploadState;
	setUploadState: SetState<UploadState>;
	newDesignId: string | undefined;
	setNewDesignId: SetState<string | undefined>;
	newDesignDetails: DesignDetails | undefined;
	setNewDesignDetails: SetState<DesignDetails | undefined>;
	newDesignIsUploaded: boolean;
	setNewDesignIsUploaded: SetState<boolean>;
	newDesignIsCreatedInDb: boolean;
	setNewDesignIsCreatedInDb: SetState<boolean>;
	editDesignDetails: DesignData | undefined;
	setEditDesignDetails: SetState<DesignData | undefined>;
	reset: () => void;
};

export const UploadContext = createContext<UploadContextType | null>(null);

export const UploadProvider = ({ children }: { children: React.ReactNode }) => {
	const [uploadState, setUploadState] = useState<UploadState>({
		state: "idle",
	});
	const [newDesignId, setNewDesignId] = useState<string | undefined>(undefined);
	const [newDesignDetails, setNewDesignDetails] = useState<
		| {
				name: string;
				price: number;
				fileDPI: number;
				tags: string;
		  }
		| undefined
	>(undefined);
	const [newDesignIsUploaded, setNewDesignIsUploaded] =
		useState<boolean>(false);
	const [newDesignIsCreatedInDb, setNewDesignIsCreatedInDb] =
		useState<boolean>(false);
	const [editDesignDetails, setEditDesignDetails] = useState<
		DesignData | undefined
	>(undefined);

	const [openNewDesignModal, setOpenNewDesignModal] = useQueryState(
		"new",
		parseAsBoolean,
	);

	const reset = useCallback(() => {
		setNewDesignId(undefined);
		setNewDesignDetails(undefined);
		setNewDesignIsUploaded(false);
		setNewDesignIsCreatedInDb(false);
	}, []);

	useEffect(() => {
		if (openNewDesignModal) {
			setOpenNewDesignModal(null);
		}
	}, [openNewDesignModal, setOpenNewDesignModal]);

	const value = useMemo(
		() => ({
			uploadState,
			setUploadState,
			newDesignId,
			setNewDesignId,
			newDesignDetails,
			setNewDesignDetails,
			newDesignIsUploaded,
			setNewDesignIsUploaded,
			newDesignIsCreatedInDb,
			setNewDesignIsCreatedInDb,
			editDesignDetails,
			setEditDesignDetails,
			reset,
		}),
		[
			uploadState,
			newDesignId,
			newDesignDetails,
			newDesignIsUploaded,
			newDesignIsCreatedInDb,
			editDesignDetails,
			reset,
		],
	);

	return (
		<UploadContext.Provider value={value}>{children}</UploadContext.Provider>
	);
};

export const useUploadContext = () => {
	const context = useContext(UploadContext);
	if (!context) {
		throw new Error("useUploadContext must be used within a UploadContext");
	}
	return context;
};
