import { z } from "zod"

function url(url: string) {
  const urlSchema = z.string().url()

  return urlSchema.safeParse(url).success
}

function email(email: string) {
  const emailSchema = z.string().email()

  return emailSchema.safeParse(email).success
}

export const validateInput = { url, email }
