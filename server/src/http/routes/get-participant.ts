import { prisma } from '@/lib/prisma'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'

export const getTripParticipants = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().get(
    '/participants/:participantId',
    {
      schema: {
        tags: ['participants'],
        summary: 'Get a trip participant details',
        params: z.object({
          participantId: z.string().uuid(),
        }),
        response: {
          200: z.object({
            participant: z.object({
              id: z.string(),
              name: z.string().nullable(),
              email: z.string().email(),
              is_confirmed: z.boolean(),
            }),
          }),
          400: z.object({ message: z.string() }).describe('Bad request'),
        },
      },
    },
    async (request) => {
      const { participantId } = request.params

      const participant = await prisma.participant.findUnique({
        select: {
          id: true,
          name: true,
          email: true,
          is_confirmed: true,
        },
        where: {
          id: participantId,
        },
      })

      if (!participant) {
        throw new Error('Participant not found.')
      }

      return { participant }
    },
  )
}
