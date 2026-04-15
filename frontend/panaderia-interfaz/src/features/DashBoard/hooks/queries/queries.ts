import { useQuery } from "@tanstack/react-query";
import { dashBoardDataOptions, DBNotificationOptions } from "./queryOptions";
import { useDashBoardContext } from "@/context/DashBoardContext";
import {
  getSalesToday,
  getPendingOrders,
  getStockAlerts,
  getRecentProductions,
  getSalesTrends,
  getTopProducts,
  getRecentPurchases,
  getRecentSales,
} from "@/features/DashBoard/api/dashboardApi";
import { dashboardKeys } from "./queryKeys";

// Existing dashboard data & notifications hooks
export const useDashBoardData = () => {
  return useQuery(dashBoardDataOptions);
};

export const useDBNotification = () => {
  const { showNotificaciones } = useDashBoardContext();
  return useQuery({ ...DBNotificationOptions, enabled: showNotificaciones });
};

// New dashboard metric hooks
export const useSalesToday = () => {
  return useQuery({
    queryKey: dashboardKeys.salesToday(),
    queryFn: getSalesToday,
    staleTime: Infinity,
  });
};

export const usePendingOrders = () => {
  return useQuery({
    queryKey: dashboardKeys.pendingOrders(),
    queryFn: getPendingOrders,
    staleTime: Infinity,
  });
};

export const useStockAlerts = () => {
  return useQuery({
    queryKey: dashboardKeys.stockAlerts(),
    queryFn: getStockAlerts,
    staleTime: Infinity,
  });
};

export const useRecentProductions = () => {
  return useQuery({
    queryKey: dashboardKeys.recentProductions(),
    queryFn: getRecentProductions,
    staleTime: Infinity,
  });
};

export const useSalesTrends = () => {
  return useQuery({
    queryKey: dashboardKeys.salesTrends(),
    queryFn: getSalesTrends,
    staleTime: Infinity,
  });
};

export const useTopProducts = () => {
  return useQuery({
    queryKey: dashboardKeys.topProducts(),
    queryFn: getTopProducts,
    staleTime: Infinity,
    retry: false,
  });
};

export const useRecentPurchases = () => {
  return useQuery({
    queryKey: dashboardKeys.recentPurchases(),
    queryFn: getRecentPurchases,
    staleTime: Infinity,
  });
};

export const useRecentSales = () => {
  return useQuery({
    queryKey: dashboardKeys.recentSales(),
    queryFn: getRecentSales,
    staleTime: Infinity,
  });
};
