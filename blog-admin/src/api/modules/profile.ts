import type { AboutProfile } from '@/types/content'

import { http } from '../request'

export const getProfileApi = async (): Promise<AboutProfile | null> => {
  const { data } = await http.get<AboutProfile | null>('/profile')
  return data
}

export const saveProfileApi = async (payload: AboutProfile) => {
  const { data } = await http.put('/profile', payload)
  return data
}
