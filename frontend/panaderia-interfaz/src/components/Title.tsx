export default function Title({
  extraClass,
  children,
}: {
  extraClass?: string;
  children: React.ReactNode;
}) {
  return (
    <h2 className={`text-lg font-semibold font-[Roboto] ${extraClass}`}>
      {children}
    </h2>
  );
}
