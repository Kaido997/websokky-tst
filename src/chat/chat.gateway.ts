import { Logger } from '@nestjs/common';
import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from "socket.io";

@WebSocketGateway({
    cors: {
        origin: "*"
    }
})
export class ChatGateway implements OnGatewayInit, OnGatewayDisconnect, OnGatewayConnection {

    @SubscribeMessage("survey")
    handleMessage(client: Socket, payload: any) {
        this.logger.log(`Client id: ${client.id} connected`);
        this.logger.debug(`Payload: ${payload}`)

        return {
            event: "message",
            data: "Hello, World!"
        };
    }

    private readonly logger = new Logger(ChatGateway.name);

    @WebSocketServer()
    io: Server

    afterInit(server: any) {
        this.logger.log("Initialazied");
    }

    handleConnection(client: Socket, ...args: any[]) { 
        const { sockets } = this.io.sockets;
        this.logger.log(`Client id: ${client.id} connected`);
        this.logger.log(`Client data: ${JSON.stringify(client.handshake.auth)}`);
        this.logger.debug(`Number of connected clients: ${sockets.size}`)
        this.io.to(client.id).emit('message', {question: "Ciao benvenuto, vogliamo iniziare?", answers: [{text: "si", value: true}, {text: "no", value: false}]})
        
    }

    handleDisconnect(client: Socket) {
        this.logger.log(`Client id: ${client.id} disconnected`)
        
    }
    

}
