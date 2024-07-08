import { prisma } from '@/lib/prisma'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'

export const createTripLink = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/trips/:tripId/links',
    {
      schema: {
        tags: ['links'],
        summary: 'Create a trip link.',
        params: z.object({
          tripId: z.string().uuid(),
        }),
        body: z.object({
          title: z.string(),
          url: z.string().url(),
        }),
        response: {
          201: z.object({
            linkId: z.string().uuid(),
          }),
          400: z.object({ message: z.string() }).describe('Bad request'),
        },
      },
    },
    async (request, reply) => {
      const { tripId } = request.params
      const { title, url } = request.body

      const link = await prisma.link.create({
        data: {
          trip_id: tripId,
          title,
          url,
        },
      })

      return reply.status(201).send({ linkId: link.id })
    },
  )
}
