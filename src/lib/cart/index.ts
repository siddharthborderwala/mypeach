import { addItemAction, removeItemAction } from "../actions/cart";
import { updateOrderInDb } from "../order";

export const addToCart = async (designId: string) => {
	const orderId = await addItemAction(designId);

	if (!orderId) return;

	await updateOrderInDb(orderId.toString());
};

export const removeFromCart = async (designId: string) => {
	const orderId = await removeItemAction(designId);

	if (!orderId) return;
	await updateOrderInDb(orderId.toString());
};
