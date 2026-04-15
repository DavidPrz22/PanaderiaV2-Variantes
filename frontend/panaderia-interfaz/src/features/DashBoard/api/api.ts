import apiClient from "@/api/client";
import type { DashBoardData, Notificacion } from "../types/types";

export const getDashBoardData = async (): Promise<DashBoardData | null> => {
  try {
    const response = await apiClient.get("/api/core/dashboard/");
    return response.data;
  } catch (error) {
    console.error("Error fetching dashBoardData:", error);
    return null;
  }
};

type NotificacionesResponse = {
  notificaciones: Notificacion[];
};

export const getNotificationData =
  async (): Promise<NotificacionesResponse | null> => {
    try {
      const response = await apiClient.get("/api/core/notificaciones/");
      console.log(response.data)
      return response.data;
    } catch (error) {
      console.error("Error fetching notificationData:", error);
      return null;
    }
  };
