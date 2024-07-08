import { dayjs } from "@/lib/dayjs"
import { prisma } from "@/lib/prisma"
import { getMailClient } from "@/mail"
import nodemailer from "nodemailer"
import type { FastifyInstance } from "fastify"
import type { ZodTypeProvider } from "fastify-type-provider-zod"
import z from "zod"
import { env } from "@/env"

export const createInvite = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().post(
    "/trips/:tripId/invites",
    {
      schema: {
        tags: ["participants"],
        summary: "Invite someone to the trip.",
        params: z.object({
          tripId: z.string().uuid(),
        }),
        body: z.object({
          email: z.string().email(),
        }),
        response: {
          201: z.null(),
          400: z.object({ message: z.string() }).describe("Bad request"),
        },
      },
    },
    async (request, reply) => {
      const { tripId } = request.params
      const { email } = request.body

      const trip = await prisma.trip.findUnique({
        where: { id: tripId },
      })

      if (!trip) {
        throw new Error("Trip not found.")
      }

      const participant = await prisma.participant.create({
        data: {
          trip_id: tripId,
          email,
        },
      })

      const mail = await getMailClient()

      const formattedTripStartDate = dayjs(trip.starts_at).format("D[ de ]MMMM")
      const formattedTripEndDate = dayjs(trip.ends_at).format("D[ de ]MMMM")

      const confirmationLink = new URL(
        `planner://trip/${trip.id}?participant=${participant.id}`,
        "http://192.168.0.156:3000"
      )

      const message = await mail.sendMail({
        from: {
          name: "Equipe plann.er",
          address: "oi@plann.er",
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

      return reply.status(201).send()
    }
  )
}
