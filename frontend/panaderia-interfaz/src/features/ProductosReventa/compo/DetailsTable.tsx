import { DetailsField } from "@/components/DetailsField";
import { DetailFieldValue } from "@/components/DetailFieldValue";
import type { ProductosReventaDetalles } from "../types/types";

export const DetailsTable = ({
  productosReventaDetalles,
}: {
  productosReventaDetalles: ProductosReventaDetalles;
}) => {
  return (
    <div className="flex items-center gap-20">
      <div className="grid grid-rows-12 grid-cols-1 gap-2">
        <DetailsField extraClass="min-h-[25px] flex items-center">
          Nombre del producto
        </DetailsField>
        <DetailsField extraClass="min-h-[25px] flex items-center">
          Id del producto
        </DetailsField>
        <DetailsField extraClass="min-h-[25px] flex items-center">
          SKU
        </DetailsField>
        <DetailsField extraClass="min-h-[25px] flex items-center">
          Categoría
        </DetailsField>
        <DetailsField extraClass="min-h-[25px] flex items-center">
          Proveedor preferido
        </DetailsField>
        <DetailsField extraClass="min-h-[25px] flex items-center">
          Unidad base inventario
        </DetailsField>
        <DetailsField extraClass="min-h-[25px] flex items-center">
          Unidad venta
        </DetailsField>
        <DetailsField extraClass="min-h-[25px] flex items-center">
          Factor conversión
        </DetailsField>
        <DetailsField extraClass="min-h-[25px] flex items-center">
          Stock actual
        </DetailsField>
        <DetailsField extraClass="min-h-[25px] flex items-center">
          Punto de Reorden
        </DetailsField>
        <DetailsField extraClass="min-h-[25px] flex items-center">
          Precio venta USD
        </DetailsField>
        <DetailsField extraClass="min-h-[25px] flex items-center">
          Precio de compra por unidad (USD)
        </DetailsField>
        <DetailsField extraClass="min-h-[25px] flex items-center">
          Perecedero
        </DetailsField>
        <DetailsField extraClass="min-h-[25px] flex items-center">
          Marca
        </DetailsField>
        <DetailsField extraClass="min-h-[25px] flex items-center">
          Fecha creación
        </DetailsField>
        <DetailsField extraClass="min-h-[25px] flex items-center">
          Fecha modificación
        </DetailsField>
        <DetailsField extraClass="min-h-[25px] flex items-center">
          Descripción
        </DetailsField>
      </div>
      <div className="grid grid-rows-12 grid-cols-1 gap-2">
        <DetailFieldValue extraClass="min-h-[25px] ">
          {productosReventaDetalles.nombre_producto}
        </DetailFieldValue>
        <DetailFieldValue extraClass="min-h-[25px] ">
          {productosReventaDetalles.id}
        </DetailFieldValue>
        <DetailFieldValue extraClass="min-h-[25px] ">
          {productosReventaDetalles.SKU || "N/A"}
        </DetailFieldValue>
        <DetailFieldValue extraClass="min-h-[25px] ">
          {productosReventaDetalles.categoria.nombre_categoria}
        </DetailFieldValue>
        <DetailFieldValue extraClass="min-h-[25px] ">
          {productosReventaDetalles.proveedor_preferido?.nombre_proveedor || "N/A"}
        </DetailFieldValue>
        <DetailFieldValue extraClass="min-h-[25px] ">
          {productosReventaDetalles.unidad_base_inventario.nombre_completo}
        </DetailFieldValue>
        <DetailFieldValue extraClass="min-h-[25px] ">
          {productosReventaDetalles.unidad_venta.nombre_completo}
        </DetailFieldValue>
        <DetailFieldValue extraClass="min-h-[25px] ">
          {Number(productosReventaDetalles.factor_conversion).toFixed(2)}
        </DetailFieldValue>
        <DetailFieldValue extraClass="min-h-[25px] ">
          {productosReventaDetalles.stock_actual}
        </DetailFieldValue>
        <DetailFieldValue extraClass="min-h-[25px] ">
          {productosReventaDetalles.punto_reorden || "N/A"}
        </DetailFieldValue>
        <DetailFieldValue extraClass="min-h-[25px] ">
          ${productosReventaDetalles.precio_venta_usd}
        </DetailFieldValue>
        <DetailFieldValue extraClass="min-h-[25px] ">
          ${productosReventaDetalles.precio_compra_usd}
        </DetailFieldValue>
        <DetailFieldValue extraClass="min-h-[25px] ">
          {productosReventaDetalles.perecedero ? "Sí" : "No"}
        </DetailFieldValue>
        <DetailFieldValue extraClass="min-h-[25px] ">
          {productosReventaDetalles.marca || "N/A"}
        </DetailFieldValue>
        <DetailFieldValue extraClass="min-h-[25px] ">
          {productosReventaDetalles.fecha_creacion_registro}
        </DetailFieldValue>
        <DetailFieldValue extraClass="min-h-[25px] ">
          {productosReventaDetalles.fecha_modificacion_registro}
        </DetailFieldValue>
        <DetailFieldValue extraClass="min-h-[25px] ">
          {productosReventaDetalles.descripcion || "No hay descripción"}
        </DetailFieldValue>
      </div>
    </div>
  );
};
