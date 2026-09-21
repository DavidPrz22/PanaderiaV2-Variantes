import { Card } from "@/components/ui/card";
import { ResponsiveBar } from "@nivo/bar";
import { useSalesTrends } from "../hooks/queries/queries";
import { ChartSkeleton } from "./DashboardSkeleton";
import { DashboardError } from "./DashboardError";
import { formatCurrency, formatCompactCurrency, formatDate } from "../utils/formatters";
import { nivoTheme } from "../utils/chartHelpers";

export const GridItemTrends = () => {
  const { data, isLoading, isError, error, refetch } = useSalesTrends();

  if (isLoading) {
    return (
      <div className="lg:col-start-1 lg:col-end-7 row-start-1 row-end-2 h-full min-h-[400px]">
        <ChartSkeleton />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <Card className="bg-white lg:col-start-1 lg:col-end-7 row-start-1 row-end-2 h-full min-h-[400px] shadow-sm border-gray-200">
        <DashboardError
          title="Error al cargar tendencias de ventas"
          message={error instanceof Error ? error.message : undefined}
          onRetry={refetch}
        />
      </Card>
    );
  }

  // Pre-process data
  const barData = data.data.map((item) => ({
    date: formatDate(item.date),
    value: item.total_sales,
  }));

  return (
    <Card className="bg-white lg:col-start-1 lg:col-end-7 row-start-1 row-end-2 h-full shadow-sm border-gray-200 flex flex-col p-6 overflow-hidden">
      <h2 className="text-lg font-bold text-slate-800 mb-2">
        Tendencias de Ventas <span className="text-sm font-normal text-slate-500 ml-2">(últimos 7 días)</span>
      </h2>

      <div className="flex-1 w-full min-h-0 relative">
        <div className="absolute inset-0">
          <ResponsiveBar
            data={barData}
            keys={["value"]}
            indexBy="date"
            theme={nivoTheme}
            margin={{ top: 20, right: 30, bottom: 50, left: 60 }}
            padding={0.3}
            valueScale={{ type: "linear" }}
            indexScale={{ type: "band", round: true }}
            colors={["#2563eb"]} // Premium Blue-600
            borderRadius={4}
            borderColor={{
              from: "color",
              modifiers: [["darker", 1.6]],
            }}
            enableLabel={true}
            labelSkipHeight={20}
            labelTextColor="#ffffff"
            axisTop={null}
            axisRight={null}
            axisBottom={{
              tickSize: 0,
              tickPadding: 12,
              tickRotation: -45,
              legend: "",
              legendPosition: "middle",
              legendOffset: 32,
            }}
            axisLeft={{
              tickSize: 0,
              tickPadding: 8,
              tickRotation: 0,
              legend: "Ventas",
              legendPosition: "middle",
              legendOffset: -50,
              // Use compact format for axis labels to avoid clutter
              format: (value) => formatCompactCurrency(Number(value)),
            }}
            gridYValues={5} // Limit number of grid lines to reduce clutter
            tooltip={({ data, value }) => (
              <div className="bg-white px-3 py-2 shadow-xl rounded-lg border border-slate-100 text-sm z-50">
                <strong className="text-slate-700">{data.date}</strong>
                <div className="text-slate-500 mt-1">
                  Ventas: <span className="font-medium text-slate-900">{formatCurrency(Number(value))}</span>
                </div>
              </div>
            )}
            role="application"
            ariaLabel="Gráfico de tendencias de ventas"
          />
        </div>
        {barData.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-slate-400">
            No hay datos disponibles
          </div>
        )}
      </div>
    </Card>
  );
};
