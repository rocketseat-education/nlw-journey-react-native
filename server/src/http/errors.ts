import { FastifyInstance } from 'fastify'

import { env } from '@/env'
// import { BadRequestError } from './routes/_errors/bad-request-error'
// import { ConflictError } from './routes/_errors/conflict-error'

type FastifyErrorHandler = FastifyInstance['errorHandler']

export const errorHandler: FastifyErrorHandler = function (
  error,
  _request,
  reply,
) {
  const { validation, validationContext } = error

  if (validation) {
    return reply.status(error.statusCode ?? 400).send({
      message: `Error validating request ${validationContext}.`,
      errors: validation,
    })
  }

  // if (error instanceof BadRequestError) {
  //   return reply.status(400).send({
  //     message: error.message,
  //   })
  // }

  // if (error instanceof ConflictError) {
  //   return reply.status(409).send({
  //     message: error.message,
  //   })
  // }

  console.error(error)

  if (env.NODE_ENV === 'production') {
    // Maybe send to observability platform?
  }

  return reply.status(500).send({ message: 'Internal server error.' })
}
