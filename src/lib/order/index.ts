import axios from "axios";

export const updateOrderInDb = async (orderId: string) => {
	const response = await axios.delete(`/api/order?order_id=${orderId}`);

	return response.data;
};
