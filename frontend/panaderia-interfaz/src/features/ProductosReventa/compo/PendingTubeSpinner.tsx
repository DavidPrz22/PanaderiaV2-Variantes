import { TubeSpinner } from "@/assets";

export const PendingTubeSpinner = ({
  size,
  extraClass,
}: {
  size: number;
  extraClass?: string;
}) => {
  return (
    <div
      className={`flex justify-center items-center font-bold text-2xl text-gray-700 ${extraClass} z-10`}
    >
      <img src={TubeSpinner} alt="Cargando..." className={`size-${size}`} />
    </div>
  );
};
