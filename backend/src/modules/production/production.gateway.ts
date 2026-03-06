import {
  WebSocketGateway, WebSocketServer,
  OnGatewayConnection, OnGatewayDisconnect,
  SubscribeMessage, MessageBody,
} from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'
import { Logger } from '@nestjs/common'

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  },
  transports: ['websocket', 'polling'],
})
export class ProductionGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server

  private readonly logger = new Logger(ProductionGateway.name)
  private connectedClients = 0

  handleConnection(client: Socket) {
    this.connectedClients++
    this.logger.log(`Client connected: ${client.id} (total: ${this.connectedClients})`)
    client.emit('connected', { message: 'Conectado ao AUTOTRACK' })
  }

  handleDisconnect(client: Socket) {
    this.connectedClients--
    this.logger.log(`Client disconnected: ${client.id} (total: ${this.connectedClients})`)
  }

  emitNewProduction(production: unknown) {
    this.server.emit('production:new', production)
    this.logger.log(`Emitted production:new`)
  }

  emitGoalReached() {
    this.server.emit('production:goalReached', { message: 'META ATINGIDA!' })
    this.logger.log('Emitted production:goalReached')
  }

  @SubscribeMessage('ping')
  handlePing(@MessageBody() data: unknown) {
    return { event: 'pong', data }
  }
}
