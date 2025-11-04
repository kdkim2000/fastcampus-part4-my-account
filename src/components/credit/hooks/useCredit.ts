import { useQuery } from '@tanstack/react-query'

import { getCredit } from '@remote/credit'
import useUser from '@hooks/useUser'

function useCredit() {
  const user = useUser()

  return useQuery({
    queryKey: ['credit', user?.id],
    queryFn: () => getCredit(user?.id as string),
    enabled: user != null,
  })
}

export default useCredit
