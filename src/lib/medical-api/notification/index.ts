import { get, post } from '../../apiClient';

const BASE_PATH = '/notification';

export const getNotifications = async (userId: number) => {
  return await get(`${BASE_PATH}/${userId}`);
};

export const markNotificationAsRead = async (notificationId: number) => {
  return await post(`${BASE_PATH}/${notificationId}/read`);
};

export default {
  getNotifications,
  markNotificationAsRead,
};
