import type { ApiResponse } from '~/types/api';
import type { HouseBalance } from '~/types/composables/balance';

/**
 * Composable to provide balance functionality
 *
 * Provides methods for fetching house balance data.
 */
export const useBalance = () => {
  const api = useApi();
  const baseUrl = '/api/balance';

  const getHouseBalance = async (
    houseId: string,
  ): Promise<ApiResponse<HouseBalance>> => {
    try {
      const result = await api.fetch<{ data: HouseBalance }>(
        `${baseUrl}/${houseId}`,
        {},
        true,
      );
      return { data: result.data, error: null };
    } catch (error) {
      const err = error as { data?: { message?: string }; message?: string };
      return {
        data: null,
        error: err?.data?.message || err?.message || 'Failed to fetch balance',
      };
    }
  };

  const settleUserToUser = async (
    houseId: string,
    fromUserId: string,
    toUserId: string,
  ): Promise<ApiResponse<{ settled_count: number }>> => {
    try {
      const result = await api.fetch<{ data: { settled_count: number } }>(
        `/api/houses/${houseId}/settle`,
        {
          method: 'POST',
          body: { from_user_id: fromUserId, to_user_id: toUserId },
        },
        true,
      );
      return { data: result.data, error: null };
    } catch (error) {
      const err = error as { data?: { message?: string }; message?: string };
      return {
        data: null,
        error:
          err?.data?.message || err?.message || 'Failed to settle transaction',
      };
    }
  };

  return {
    getHouseBalance,
    settleUserToUser,
  };
};
