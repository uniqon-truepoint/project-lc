import { useMutation, UseMutationResult, useQueryClient } from 'react-query';
import { LiveShoppingDTO } from '@project-lc/shared-types';
import { LiveShopping } from '@prisma/client';
import { AxiosError } from 'axios';
import axios from '../../axios';

export const useCreateLiveShoppingMutation = (): UseMutationResult<
  LiveShopping,
  AxiosError,
  LiveShoppingDTO
> => {
  const queryClient = useQueryClient();
  return useMutation(
    async (dto: LiveShoppingDTO) => {
      return axios.post<LiveShopping>('/live-shopping', dto).then((res) => res.data);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('Profile');
      },
    },
  );
};
