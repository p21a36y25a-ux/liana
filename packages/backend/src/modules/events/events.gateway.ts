import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@WebSocketGateway({
  cors: {
    origin: process.env.SOCKET_IO_CORS || 'http://localhost:5173',
    credentials: true,
  },
  namespace: '/events',
})
export class EventsGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private readonly logger = new Logger(EventsGateway.name);

  afterInit() {
    this.logger.log('WebSocket Gateway initialized');
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  emitPunchEvent(data: any) {
    this.server.emit('punch', data);
  }

  emitAttendanceUpdate(data: any) {
    this.server.emit('attendance_update', data);
  }

  emitLeaveUpdate(data: any) {
    this.server.emit('leave_update', data);
  }

  @SubscribeMessage('join_room')
  handleJoinRoom(client: Socket, @MessageBody() data: { room: string }) {
    client.join(data.room);
  }
}
