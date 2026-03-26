export interface PostApiItem {
  id: number
  title: string
  summary: string
  content: string
  tags: unknown
  date: string
  category: 'tech' | 'review'
  status: 'draft' | 'published'
}

export interface ProfileApiItem {
  name: string
  intro: string
  email: string
  github: string
}

export interface ProjectApiItem {
  id: number
  name: string
  description: string
  tech_stack: unknown
  url: string
}
