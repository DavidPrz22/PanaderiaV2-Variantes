import { TubeSpinner } from "@/assets";

export default function RecetasFormLoading() {
  return (
    <div
      className="flex flex-col border border-gray-300 w-full h-[120px] shadow-lg
                        absolute top-[86px] left-0 bg-white z-10"
    >
      <div className="flex justify-center items-center h-full p-3">
        <img src={TubeSpinner} alt="loading" className="size-20" />
      </div>
    </div>
  );
}
