import { env } from '@/env'
import { dayjs } from '@/lib/dayjs'
import { prisma } from '@/lib/prisma'
import nodemailer from 'nodemailer'
import { getMailClient } from '@/mail'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'

export const confirmTrip = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().get(
    '/trips/:tripId/confirm',
    {
      schema: {
        tags: ['trips'],
        summary: 'Confirm a trip and send e-mail invitations.',
        params: z.object({
          tripId: z.string().uuid(),
        }),
        response: {
          204: z.null(),
          400: z.object({ message: z.string() }).describe('Bad request'),
        },
      },
    },
    async (request, reply) => {
      const { tripId } = request.params

      const trip = await prisma.trip.findUnique({
        where: {
          id: tripId,
        },
        include: {
          participants: {
            where: {
              is_owner: false,
            },
          },
        },
      })

      const tripDetailsURL = new URL(`/trips/${tripId}`, env.WEB_BASE_URL)

      if (!trip) {
        throw new Error('Trip not found')
      }

      if (trip.is_confirmed) {
        return reply.redirect(tripDetailsURL.toString())
      }

      await prisma.trip.update({
        where: { id: tripId },
        data: {
          is_confirmed: true,
        },
      })

      const mail = await getMailClient()

      const formattedTripStartDate = dayjs(trip.starts_at).format('D[ de ]MMMM')
      const formattedTripEndDate = dayjs(trip.ends_at).format('D[ de ]MMMM')

      await Promise.all(
        trip.participants.map(async (participant) => {
          const confirmationLink = new URL(
            `/trips/${trip.id}/confirm/${participant.id}`,
            env.WEB_BASE_URL,
          )

          const message = await mail.sendMail({
            from: {
              name: 'Equipe plann.er',
              address: 'oi@plann.er',
            },
            to: participant.email,
            subject: `Confirme sua presença na viagem para ${trip.destination} em ${formattedTripStartDate}`,
            html: `
            <div style="font-family: sans-serif; font-size: 16px; line-height: 1.6;">
              <p>Você foi convidado(a) para participar de uma viagem para <strong>${trip.destination}</strong> nas datas de <strong>${formattedTripStartDate} até ${formattedTripEndDate}</strong>.</p>
              <p></p>
              <p>Para confirmar sua presença na viagem, clique no link abaixo:</p>
              <p></p>
              <p>
                <a href="${confirmationLink.toString()}">Confirmar viagem</a>
              </p>
              <p>Caso você não saiba do que se trata esse e-mail, apenas ignore esse e-mail.</p>
            </div>
          `.trim(),
          })

          console.log(nodemailer.getTestMessageUrl(message))
        }),
      )

      return reply.redirect(tripDetailsURL.toString())
    },
  )
}
