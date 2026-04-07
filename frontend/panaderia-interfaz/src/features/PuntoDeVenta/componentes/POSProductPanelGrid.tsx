import { Package } from "lucide-react";
import { ProductCard } from "./POSProductCard";
import { usePOSContext } from "@/context/POSContext";
import { useProductosQuery } from "../hooks/queries/queries";
import { SkeletonCard } from "@/components/SkeletonCard";

export const POSProductPanelGrid = () => {

    const { data, isPending } = useProductosQuery();
    const productos = data?.productos || [];

    const { tipoProductoSeleccionado, categoriaSeleccionada, search } = usePOSContext();

    const filteredProducts = productos.filter((producto => {

        const matchesCategoria = categoriaSeleccionada === null || producto.categoria === categoriaSeleccionada;
        const matchesTipo = tipoProductoSeleccionado === 'todos' || producto.tipo === tipoProductoSeleccionado;
        const matchesSearch = search === '' || producto.nombre.toLowerCase().includes(search.toLowerCase());

        return matchesCategoria && matchesTipo && matchesSearch;
    }))

    return (
        <div className="flex-1 overflow-auto scrollbar-thin">

            {isPending ? (
                <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-4">
                    {Array.from({ length: 12 }).map((_, index) => (
                        <SkeletonCard key={index} className="w-full aspect-[9/10]" />
                    ))}
                </div>
            ) : filteredProducts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                    <Package className="h-16 w-16 text-muted-foreground/30 mb-4" />
                    <p className="text-lg font-medium text-muted-foreground">
                        No se encontraron productos
                    </p>
                    <p className="text-sm text-muted-foreground/70 mt-1">
                        Intenta ajustar los filtros de búsqueda
                    </p>
                </div>
            ) : (

                <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-4">
                    {filteredProducts.map((product) => (
                        <ProductCard
                            key={product.id}
                            product={product}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}