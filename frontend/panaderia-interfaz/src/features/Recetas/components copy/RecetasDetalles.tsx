import { DeleteComponent } from "./DeleteComponent";
import { useRecetasContext } from "@/context/RecetasContext";
import RecetasFormShared from "./RecetasFormShared";
import Title from "@/components/Title";
import Button from "@/components/Button";

import { EditarIcon, BorrarIcon, CerrarIcon } from "@/assets/DashboardAssets";
import { TitleDetails } from "@/components/TitleDetails";
import { DetailsComponentsTable } from "./DetailsComponentsTable";
import { useRecetaDetallesQuery } from "../hooks/queries/queries";
import { useEffect } from "react";
import type { TRecetasFormSchema } from "../schemas/schemas";
import type { componenteListadosReceta } from "../types/types";
import { useDeleteRecetaMutation } from "../hooks/mutations/recetasMutations";
import { DetailsTable } from "./DetailsTable";
import DetailsRecetasRelacionadas from "./DetailsRecetasRelacionadas";

export default function RecetasDetalles() {
  const {
    showRecetasDetalles,
    updateRegistro,
    setUpdateRegistro,
    setRegistroDelete,
    setShowRecetasDetalles,
    setRecetaDetalles,
    setRecetaDetallesLoading,
    registroDelete,
    recetaDetalles,
    recetaId,
    setEnabledRecetaDetalles,
    enabledRecetaDetalles,
    setComponentesListadosReceta,
    setRecetasListadas,
  } = useRecetasContext();
  const {
    mutateAsync: deleteRecetaMutation,
    isPending: isDeleteRecetaPending,
  } = useDeleteRecetaMutation();

  const {
    data: recetaDetallesData,
    isSuccess,
    isLoading,
  } = useRecetaDetallesQuery(recetaId!);

  useEffect(() => {
    if (recetaId && enabledRecetaDetalles && isSuccess) {
      setRecetaDetalles(recetaDetallesData);
      setShowRecetasDetalles(true);
      setEnabledRecetaDetalles(false);
    }
  }, [
    recetaId,
    enabledRecetaDetalles,
    isSuccess,
    recetaDetallesData,
    setRecetaDetalles,
    setShowRecetasDetalles,
    setEnabledRecetaDetalles,
  ]);

  useEffect(() => {
    setRecetaDetallesLoading(isLoading);
  }, [isLoading, setRecetaDetallesLoading]);

  useEffect(() => {
    if (updateRegistro && recetaDetalles?.componentes) {
      const ListedComponentes: componenteListadosReceta[] =
        recetaDetalles.componentes.map(({ id, nombre, tipo, unidad_medida, cantidad }) => {
          return {
            id_componente: id,
            componente_tipo:
              tipo === "Materia Prima" ? "MateriaPrima" : "ProductoIntermedio",
            cantidad: cantidad || 0,
            unidad_medida: unidad_medida || "",
            nombre,
          };
        });
      setComponentesListadosReceta(ListedComponentes);
    }
  }, [updateRegistro, recetaDetalles, setComponentesListadosReceta]);

  useEffect(() => {
    if (
      recetaDetalles &&
      recetaDetalles.relaciones_recetas.length > 0 &&
      updateRegistro
    ) {
      setRecetasListadas(recetaDetalles.relaciones_recetas);
    }
  }, [recetaDetalles, setRecetasListadas, updateRegistro]);

  if (!showRecetasDetalles) return <></>;

  const handleCloseUpdate = () => {
    setShowRecetasDetalles(false);
    setUpdateRegistro(false);
  };

  function handleClose() {
    setShowRecetasDetalles(false);
  }

  if (updateRegistro) {
    const componentesReceta = recetaDetalles?.componentes.map(
      ({ tipo, id, cantidad }) => {
        if (tipo === "Materia Prima") {
          return {
            componente_id: id,
            materia_prima: true,
            cantidad: cantidad || 0
          };
        }
        if (tipo === "Producto Intermedio") {
          return {
            componente_id: id,
            producto_intermedio: true,
            cantidad: cantidad || 0
          };
        }
      },
    );

    const formatData: TRecetasFormSchema = {
      nombre: recetaDetalles!.receta.nombre,
      rendimiento: recetaDetalles!.receta.rendimiento,
      componente_receta:
        componentesReceta as TRecetasFormSchema["componente_receta"],
      notas: recetaDetalles!.receta.notas || "",
      receta_relacionada: recetaDetalles!.relaciones_recetas.map(
        ({ id }) => id,
      ),
    };

    return (
      <RecetasFormShared
        title="Editar Receta"
        initialData={formatData}
        isUpdate={true}
        onClose={handleCloseUpdate}
        onSubmitSuccess={handleCloseUpdate}
      />
    );
  }

  return (
    <div className="flex flex-col gap-5 mx-8 border border-gray-200 p-5 rounded-lg shadow-md h-full">
      <div className="flex justify-between items-center">
        <Title>{recetaDetalles?.receta.nombre}</Title>
        <div className="flex gap-2">
          <Button
            type="edit"
            onClick={() => {
              setUpdateRegistro(true);
            }}
          >
            <div className="flex items-center gap-2">
              Editar
              <img src={EditarIcon} alt="Editar" />
            </div>
          </Button>
          <Button
            type="delete"
            onClick={() => {
              setRegistroDelete(true);
            }}
          >
            <div className="flex items-center gap-2">
              Eliminar
              <img src={BorrarIcon} alt="Eliminar" />
            </div>
          </Button>
          <div className="ml-6">
            <Button type="close" onClick={handleClose}>
              <img src={CerrarIcon} alt="Cerrar" />
            </Button>
          </div>
        </div>
      </div>

      {registroDelete && recetaId !== null && (
        <DeleteComponent
          deleteFunction={() => deleteRecetaMutation(recetaId)}
          isLoading={isDeleteRecetaPending}
        />
      )}
      <div className="flex flex-col gap-6">
        <TitleDetails>Detalles de la receta</TitleDetails>
        <DetailsTable />
        <DetailsComponentsTable />

        {recetaDetalles?.relaciones_recetas &&
          recetaDetalles?.relaciones_recetas.length > 0 && (
            <DetailsRecetasRelacionadas />
          )}
      </div>
    </div>
  );
}
