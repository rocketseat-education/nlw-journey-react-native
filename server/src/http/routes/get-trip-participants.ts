import { prisma } from '@/lib/prisma'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'

export const getTripParticipants = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().get(
    '/trips/:tripId/participants',
    {
      schema: {
        tags: ['participants'],
        summary: 'Get a trip participants.',
        params: z.object({
          tripId: z.string().uuid(),
        }),
        response: {
          200: z.object({
            participants: z.array(
              z.object({
                id: z.string(),
                name: z.string().nullable(),
                email: z.string().email(),
                is_confirmed: z.boolean(),
              }),
            ),
          }),
          400: z.object({ message: z.string() }).describe('Bad request'),
        },
      },
    },
    async (request) => {
      const { tripId } = request.params

      const participants = await prisma.participant.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          is_confirmed: true,
        },
        where: { trip_id: tripId },
      })

      return { participants }
    },
  )
}
