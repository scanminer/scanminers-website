export interface GenericApiResponse<T = unknown> {
  success: boolean
  message?: string
  errors?: string[]
  payload?: T
}

export type ApiResponse<T extends Record<string, unknown> = Record<string, unknown>> = GenericApiResponse<T> & T
