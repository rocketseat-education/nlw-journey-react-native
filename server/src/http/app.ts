import fastifyCors from '@fastify/cors'
import fastifySwagger from '@fastify/swagger'
import fastifySwaggerUI from '@fastify/swagger-ui'
import { fastify } from 'fastify'
import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
  ZodTypeProvider,
} from 'fastify-type-provider-zod'

import { errorHandler } from './errors'
import { confirmTrip } from './routes/confirm-trip'
import { createInvite } from './routes/create-invite'
import { createTripActivity } from './routes/create-trip-activity'
import { createTripLink } from './routes/create-trip-link'
import { createTrip } from './routes/create-trip'
import { getTripActivities } from './routes/get-trip-activities'
import { getTripDetails } from './routes/get-trip-details'
import { getTripLinks } from './routes/get-trip-links'
import { getTripParticipants } from './routes/get-trip-participants'
import { updateTrip } from './routes/update-trip'
import { confirmParticipant } from './routes/confirm-participant'

export const app = fastify().withTypeProvider<ZodTypeProvider>()

app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)

app.register(fastifySwagger, {
  openapi: {
    openapi: '3.0.0',
    info: {
      title: 'plann.er',
      description:
        'Especificações da API para o back-end da aplicação plann.er construída durante o NLW Journey da Rocketseat.',
      version: '1.0.0',
    },
  },
  transform: jsonSchemaTransform,
})

app.register(fastifySwaggerUI, {
  routePrefix: '/docs',
})

app.register(fastifyCors, {
  origin: '*',
  credentials: true,
})

app.setErrorHandler(errorHandler)

app.register(confirmTrip)
app.register(confirmParticipant)
app.register(createInvite)
app.register(createTripActivity)
app.register(createTripLink)
app.register(createTrip)
app.register(getTripActivities)
app.register(getTripDetails)
app.register(getTripLinks)
app.register(getTripParticipants)
app.register(updateTrip)
