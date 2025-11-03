import { useInfiniteQuery } from '@tanstack/react-query'

import { getTransactions } from '@remote/transaction'
import useUser from '@hooks/useUser'
import { TransactionFilterType } from '@/models/transaction'

function useTransactions({
  suspense,
  filter,
}: { suspense?: boolean; filter?: TransactionFilterType } = {}) {
  const user = useUser()

  return useInfiniteQuery({
    queryKey: ['transactions', user?.id, filter],
    queryFn: ({ pageParam }: any) =>
      getTransactions({ userId: user?.id as string, pageParam, filter }),
    getNextPageParam: (snapshot) => {
      return snapshot.lastVisible
    },
    initialPageParam: null,
  })
}

export default useTransactions
