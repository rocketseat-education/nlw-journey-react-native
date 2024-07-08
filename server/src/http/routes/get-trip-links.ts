import { prisma } from '@/lib/prisma'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'

export const getTripLinks = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().get(
    '/trips/:tripId/links',
    {
      schema: {
        tags: ['links'],
        summary: 'Get a trip links.',
        params: z.object({
          tripId: z.string().uuid(),
        }),
        response: {
          200: z.object({
            links: z.array(
              z.object({
                id: z.string().uuid(),
                title: z.string(),
                url: z.string().url(),
              }),
            ),
          }),
          400: z.object({ message: z.string() }).describe('Bad request'),
        },
      },
    },
    async (request) => {
      const { tripId } = request.params

      const links = await prisma.link.findMany({
        select: {
          id: true,
          title: true,
          url: true,
        },
        where: { trip_id: tripId },
      })

      return { links }
    },
  )
}
