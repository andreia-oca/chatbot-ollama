import { useCallback } from 'react';

import { useFetch } from '@/hooks/useFetch';

import {OllamaModel} from '@/types/ollama'


const useApiService = () => {
  const fetchService = useFetch();

  const getModels = useCallback(
    (): Promise<OllamaModel[]>  => {
      return fetchService.get(`/api/models`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
    },
    [fetchService],
  );
  return {
    getModels
  };
};

export default useApiService;

