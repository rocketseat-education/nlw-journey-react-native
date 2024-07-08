import { env } from "@/env"
import { prisma } from "@/lib/prisma"
import type { FastifyInstance } from "fastify"
import type { ZodTypeProvider } from "fastify-type-provider-zod"
import z from "zod"

export const confirmParticipant = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().patch(
    "/participants/:participantId/confirm",
    {
      schema: {
        tags: ["participants"],
        summary: "Confirms a participant on a trip.",
        params: z.object({
          participantId: z.string().uuid(),
        }),
        body: z.object({
          name: z.string(),
          email: z.string().email(),
        }),
        response: {
          204: z.null(),
          400: z.object({ message: z.string() }).describe("Bad request"),
        },
      },
    },
    async (request, reply) => {
      const { participantId } = request.params
      const { name, email } = request.body

      const participant = await prisma.participant.findUnique({
        where: {
          id: participantId,
        },
      })

      if (!participant) {
        throw new Error("Participant not found.")
      }

      const tripDetailsURL = new URL(
        `/trips/${participant.trip_id}`,
        env.WEB_BASE_URL
      )

      await prisma.participant.update({
        where: { id: participantId },
        data: {
          is_confirmed: true,
          name,
        },
      })

      //return reply.redirect(tripDetailsURL.toString())
      return reply.status(204).send()
    }
  )
}
