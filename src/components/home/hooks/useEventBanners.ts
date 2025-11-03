import { useQuery } from '@tanstack/react-query'

import { getEventBanners } from '@remote/banner'
import useAccount from '@hooks/useAccount'

function useEventBanners() {
  const { data: account } = useAccount()

  return useQuery({
    queryKey: ['event-banners'],
    queryFn: () =>
      getEventBanners({
        hasAccount: account != null && account.status === 'DONE',
      }),
  })
}

export default useEventBanners
