import { queryClient } from "@/app/global-query-client";
import { addItemAction, type ActiveCartAndProducts } from "@/lib/actions/cart";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ShoppingBag } from "@phosphor-icons/react";
import { Spinner } from "@/components/spinner";

export const AddToCartButton = ({
	designId,
	setIsModalOpen,
}: {
	designId: string;
	setIsModalOpen: (isModalOpen: boolean) => void;
}) => {
	const data = queryClient.getQueryData<ActiveCartAndProducts>(["cart"]);

	const isInCart = data?.products.some(
		(product) => product.designId === designId,
	);

	const { mutate, isPending } = useMutation({
		mutationKey: ["add-to-cart", designId],
		mutationFn: () => addItemAction(designId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["cart"] });
			toast.success("Added to cart", {
				dismissible: true,
				duration: 1000,
			});
			setIsModalOpen(false);
		},
		onError: () => {
			toast.error("Failed to add to cart", {
				dismissible: true,
			});
		},
	});

	if (isInCart) {
		return (
			<Button disabled className="gap-2">
				<ShoppingBag weight="bold" />
				<span>Added to Cart</span>
			</Button>
		);
	}

	return (
		<Button disabled={isPending} onClick={() => mutate()} className="gap-2">
			{isPending ? <Spinner /> : <ShoppingBag weight="bold" />}
			<span>Add to Cart</span>
		</Button>
	);
};
