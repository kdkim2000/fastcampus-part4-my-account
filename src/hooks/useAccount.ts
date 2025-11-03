import { useQuery } from '@tanstack/react-query'

import { getAccount } from '@remote/account'
import useUser from './useUser'

function useAccount() {
  const user = useUser()

  return useQuery({
    queryKey: ['account', user?.id],
    queryFn: () => getAccount(user?.id as string),
    enabled: user != null,
  })
}

export default useAccount
