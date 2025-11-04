import { useQuery } from '@tanstack/react-query'
import { useEffect } from 'react'

import { CHECK_STATUS } from '@constants/credit'

interface useCreditCheckProps {
  onSuccess?: (creditScore: number) => void
  onError?: () => void
  enabled: boolean
}

function useCreditCheck({ onSuccess, onError, enabled }: useCreditCheckProps) {
  const query = useQuery({
    queryKey: ['useCreditCheck'],
    queryFn: () => getCheckStatus(),
    enabled,
    refetchInterval: 2_000,
    staleTime: 0,
  })

  useEffect(() => {
    if (query.data === CHECK_STATUS.COMPLETE && onSuccess) {
      onSuccess(getCreditScore(200, 1000))
    }
  }, [query.data, onSuccess])

  useEffect(() => {
    if (query.error && onError) {
      onError()
    }
  }, [query.error, onError])

  return query
}

function getCheckStatus() {
  const values = [
    CHECK_STATUS.REDAY,
    CHECK_STATUS.PROGRESS,
    CHECK_STATUS.COMPLETE,
    CHECK_STATUS.REJECT,
  ]

  const status = values[Math.floor(Math.floor(Math.random() * values.length))]

  if (status === CHECK_STATUS.REJECT) {
    throw new Error('신용점수 조회에 실패했습니다.')
  }

  return status
}

// ex. 200 ~ 1000점
function getCreditScore(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export default useCreditCheck
