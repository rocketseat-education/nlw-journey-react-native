import { prisma } from '@/lib/prisma'
import dayjs from 'dayjs'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'

export const getTripActivities = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().get(
    '/trips/:tripId/activities',
    {
      schema: {
        tags: ['activities'],
        summary: 'Get a trip activities.',
        description:
          'This route will return all the dates between the trip starts_at and ends_at dates, even those without activities.',
        params: z.object({
          tripId: z.string().uuid(),
        }),
        response: {
          200: z.object({
            activities: z.array(
              z.object({
                date: z.date(),
                activities: z.array(
                  z.object({
                    id: z.string().uuid(),
                    title: z.string(),
                    occurs_at: z.date(),
                  }),
                ),
              }),
            ),
          }),
          400: z.object({ message: z.string() }).describe('Bad request'),
        },
      },
    },
    async (request) => {
      const { tripId } = request.params

      const trip = await prisma.trip.findUnique({
        where: { id: tripId },
        include: {
          activities: {
            select: {
              id: true,
              title: true,
              occurs_at: true,
            },
          },
        },
      })

      if (!trip) {
        throw new Error('Trip not found.')
      }

      const differenceInDaysBetweenTripStartAndEnd = dayjs(trip.ends_at).diff(
        trip.starts_at,
        'days',
      )

      const activities = Array.from({
        length: differenceInDaysBetweenTripStartAndEnd + 1,
      }).map((_, daysToAdd) => {
        const dateToCompare = dayjs(trip.starts_at).add(daysToAdd, 'days')

        return {
          date: dateToCompare.toDate(),
          activities: trip.activities.filter((activity) => {
            return dayjs(activity.occurs_at).isSame(dateToCompare, 'day')
          }),
        }
      })

      return { activities }
    },
  )
}
