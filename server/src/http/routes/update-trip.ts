import { prisma } from '@/lib/prisma'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'

export const updateTrip = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().put(
    '/trips/:tripId',
    {
      schema: {
        tags: ['trips'],
        summary: 'Update a trip.',
        params: z.object({
          tripId: z.string().uuid(),
        }),
        body: z.object({
          destination: z.string().min(4),
          starts_at: z.coerce.date(),
          ends_at: z.coerce.date(),
        }),
        response: {
          204: z.null(),
          400: z.object({ message: z.string() }).describe('Bad request'),
        },
      },
    },
    async (request, reply) => {
      const { tripId } = request.params
      const { destination, starts_at, ends_at } = request.body

      const trip = await prisma.trip.findUnique({
        where: {
          id: tripId,
        },
      })

      if (!trip) {
        throw new Error('Trip not found.')
      }

      await prisma.trip.update({
        where: { id: tripId },
        data: {
          destination,
          starts_at,
          ends_at,
        },
      })

      return reply.status(204).send()
    },
  )
}
