import { prisma } from '@/lib/prisma'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'

export const getTripDetails = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().get(
    '/trips/:tripId',
    {
      schema: {
        tags: ['trips'],
        summary: 'Get a trip details.',
        params: z.object({
          tripId: z.string().uuid(),
        }),
        response: {
          200: z.object({
            trip: z.object({
              id: z.string().uuid(),
              destination: z.string().min(4),
              starts_at: z.date(),
              ends_at: z.date(),
              is_confirmed: z.boolean(),
            }),
          }),
          400: z.object({ message: z.string() }).describe('Bad request'),
        },
      },
    },
    async (request) => {
      const { tripId } = request.params

      const trip = await prisma.trip.findUnique({
        select: {
          id: true,
          destination: true,
          starts_at: true,
          ends_at: true,
          is_confirmed: true,
        },
        where: { id: tripId },
      })

      if (!trip) {
        throw new Error('Trip not found.')
      }

      return { trip }
    },
  )
}
