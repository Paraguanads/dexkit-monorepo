import { DexkitApiProvider } from '@dexkit/core/providers';
import { useMutation } from '@tanstack/react-query';
import { useContext } from 'react';
import { CheckoutFormType } from '../../types';

export default function useUpdateOrder() {
  const { instance } = useContext(DexkitApiProvider);

  return useMutation(async (data: CheckoutFormType) => {
    if (!instance) {
      throw new Error('no instance');
    }

    return (await instance?.put(`/orders/${data?.id}`, data)).data;
  });
}
