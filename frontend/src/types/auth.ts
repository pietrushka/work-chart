export enum UserRole {
  ADMIN = "ADMIN",
  WORKER = "WORKER",
}

export type RegisterPayload = {
  email: string
  password: string
  firstName: string
  lastName: string
}

export type LoginPayload = {
  email: string
  password: string
}

export type ActivateAccountPayload = {
  token: string
  password: string
}
