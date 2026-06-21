import { MoreHorizontal } from "lucide-react";
import type { Product } from "@seapedia/shared";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";

export function ProductActions({
	product,
	onEdit,
	onDelete,
}: {
	product: Product;
	onEdit: (product: Product) => void;
	onDelete: (product: Product) => void;
}) {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger className="inline-flex size-8 items-center justify-center rounded-md text-gray-700 transition-colors hover:bg-gray-100 focus:outline-none cursor-pointer">
				<MoreHorizontal className="size-4" />
				<span className="sr-only">Open menu for {product.name}</span>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="min-w-32">
				<DropdownMenuItem onClick={() => onEdit(product)}>
					Edit
				</DropdownMenuItem>
				<DropdownMenuItem
					variant="destructive"
					onClick={() => onDelete(product)}
				>
					Delete
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
