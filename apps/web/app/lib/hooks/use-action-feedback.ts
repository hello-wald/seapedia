import { useEffect } from "react";
import { toast } from "sonner";

export type ActionFeedback = { ok: boolean; message?: string | null };

export function useActionFeedback<T extends ActionFeedback>(
	actionData: T | undefined,
	options: {
		successFallback?: string;
		onSuccess?: (data: T) => void;
		onError?: (data: T) => void;
	} = {},
) {
	const { successFallback = "Saved.", onSuccess, onError } = options;

	useEffect(() => {
		if (!actionData) return;
		if (actionData.ok) {
			toast.success(actionData.message ?? successFallback);
			onSuccess?.(actionData);
		} else {
			onError?.(actionData);
		}
	}, [actionData]);
}
