export const PRTableHeader = ({ headers }: { headers: string[] }) => {
  return (
    <div className="grid grid-cols-[0.5fr_2fr_1.5fr_1.5fr_1fr_1.5fr_1.5fr] justify-between px-8 py-4 border-b border-gray-300 font-semibold font-[Roboto] text-sm bg-(--table-header-bg) text-(--table-header-text) rounded-t-md">
      {headers.map((header) => (
        <div key={header}>{header}</div>
      ))}
    </div>
  );
};