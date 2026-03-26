import { getProfileApi } from '@/api/modules/profile'

export interface ProfileItem {
  name: string
  intro: string
  email: string
  github: string
}

export const getProfile = async (): Promise<ProfileItem | null> => {
  const payload = await getProfileApi()
  if (!payload) return null
  return {
    name: String(payload.name ?? ''),
    intro: String(payload.intro ?? ''),
    email: String(payload.email ?? ''),
    github: String(payload.github ?? ''),
  }
}
