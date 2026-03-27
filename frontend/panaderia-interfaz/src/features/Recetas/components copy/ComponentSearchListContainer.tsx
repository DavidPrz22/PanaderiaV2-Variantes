import { useRecetasContext } from "@/context/RecetasContext";
import { RecetasSearchListContent } from "./RecetasSearchListContent";
import type { watchSetValueProps } from "../types/types";

export default function ComponentSearchListContainer({
  watch,
  setValue,
}: watchSetValueProps) {
  const { searchListComponentes } = useRecetasContext();
  return (
    <div
      className="
            flex flex-col border border-gray-300 w-full max-h-[var(--search-list-long-height)] shadow-lg
            overflow-y-auto absolute top-[86px] left-0 bg-white z-10"
    >
      {searchListComponentes.map((item, index) => (
        <RecetasSearchListContent
          key={index}
          category={Object.keys(item)[0]}
          items={Object.values(item)[0]}
          watch={watch}
          setValue={setValue}
        />
      ))}
    </div>
  );
}
