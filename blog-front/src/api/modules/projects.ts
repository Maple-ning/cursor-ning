import { http } from '../request'

import type { ProjectApiItem } from '../types'

export const getProjectsApi = async (): Promise<ProjectApiItem[]> => {
  const { data } = await http.get<ProjectApiItem[]>('/projects')
  return data
}
