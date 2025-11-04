import { useQuery } from '@tanstack/react-query'
import { getCards } from '@remote/card'

function useCards() {
  return useQuery({
    queryKey: ['home-cards'],
    queryFn: () => getCards(),
  })
}

export default useCards
