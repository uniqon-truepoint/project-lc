import {
  WebSocketServer,
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  OnGatewayDisconnect,
  OnGatewayConnection,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import {
  SocketInfo,
  SocketIdandDevice,
  PurchaseMessage,
  PageUrlAndDevice,
  RoomAndText,
  RoomAndDate,
  RoomAndVideoType,
} from '@project-lc/shared-types';
import { OverlayService } from '@project-lc/nest-modules';
import { AppService } from './app.service';

@WebSocketGateway({ cors: true, transports: ['websocket'] })
export class AppGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  socketInfo: SocketInfo = {};

  constructor(
    private readonly appService: AppService,
    private readonly overlayService: OverlayService,
  ) {}

  private logger: Logger = new Logger('AppGateway');

  afterInit() {
    this.logger.log('Initialized!');
  }

  handleConnection(socket: Socket) {
    this.logger.log(`Client Connected ${socket.id}`);
  }

  handleDisconnect(socket: Socket) {
    const SOCKET_ID: string = socket.id;
    if (Object.values(this.socketInfo)) {
      const itemToFind = Object.values(this.socketInfo)[0]?.find(
        (item) => item.socketId === SOCKET_ID,
      );
      const idx = Object.values(this.socketInfo)[0]?.indexOf(itemToFind);
      if (idx > -1) {
        return Object.values(this.socketInfo)[0]?.splice(idx, 1);
      }
    }
    return null;
  }

  @SubscribeMessage('new client')
  handleClient(socket: Socket, clientUrlDevice: PageUrlAndDevice): void {
    const { pageUrl } = clientUrlDevice;
    const roomName = pageUrl?.split('/').pop();
    if (roomName) {
      socket.join(roomName);
    }
    const { device } = clientUrlDevice;
    if (this.socketInfo[pageUrl]) {
      const socketIdandDevice: SocketIdandDevice[] = this.socketInfo[pageUrl];
      socketIdandDevice.push({ socketId: socket.id, device });
    } else {
      const socketIdandDevice: SocketIdandDevice[] = [];
      socketIdandDevice.push({ socketId: socket.id, device });
      this.socketInfo[pageUrl] = socketIdandDevice;
    }
  }

  @SubscribeMessage('request creator list')
  handleCreatorList(@MessageBody() roomAndUrl: { roomName: string; url: string }) {
    const advertiseUrl =
      roomAndUrl && roomAndUrl.url ? roomAndUrl.url.split('/')[1] : null;
    const fullUrl: (string | undefined)[] = Object.keys(this.socketInfo)
      .map((url: string) => {
        if (advertiseUrl && url && url.split('/').indexOf(advertiseUrl) !== -1) {
          return url;
        }
        return '';
      })
      .filter((url: string | undefined) => url !== undefined && url !== '');
    if (process.env.NODE_ENV === 'development') {
      this.server
        .to(roomAndUrl.roomName)
        .emit(
          'creator list from server',
          fullUrl[0] ? this.socketInfo[fullUrl[0]] : null,
        );
    }
    if (process.env.NODE_ENV === 'production') {
      this.server
        .to(roomAndUrl.roomName)
        .emit(
          'creator list from server',
          fullUrl[0] ? this.socketInfo[fullUrl[0]] : null,
        );
    }
  }

  @SubscribeMessage('get ranking')
  async getRanking(@MessageBody() roomName: string) {
    const nicknameAndPrice = [];
    const rankings = await this.appService.getRanking();
    rankings.forEach((eachNickname) => {
      const price = Object.values(eachNickname._sum).toString();
      const { nickname } = eachNickname;
      nicknameAndPrice.push({ nickname, price: Number(price) });
    });
    nicknameAndPrice.sort((a, b) => {
      return b.price - a.price;
    });

    this.server.to(roomName).emit('get top-left ranking', nicknameAndPrice);
  }

  @SubscribeMessage('right top purchase message')
  async getRightTopPurchaseMessage(@MessageBody() purchase: PurchaseMessage) {
    const { roomName } = purchase;
    const nicknameAndPrice = [];
    const bottomAreaTextAndNickname: string[] = [];
    const rankings = await this.appService.getRanking();
    const totalSold = await this.appService.getTotalSoldPrice();
    const messageAndNickname = await this.appService.getMessageAndNickname();

    rankings.forEach((eachNickname) => {
      const price = Object.values(eachNickname._sum).toString();
      const { nickname } = eachNickname;
      nicknameAndPrice.push({ nickname, price: Number(price) });
    });
    nicknameAndPrice.sort((a, b) => {
      return b.price - a.price;
    });

    messageAndNickname.forEach((d: { nickname: string; text: string }) => {
      bottomAreaTextAndNickname.push(`${d.text} - [${d.nickname}]`);
    });

    const audioBuffer = await this.overlayService.googleTextToSpeech(purchase);

    this.server
      .to(roomName)
      .emit('get right-top purchase message', [purchase, audioBuffer]);
    this.server.to(roomName).emit('get top-left ranking', nicknameAndPrice);
    this.server.to(roomName).emit('get current quantity', totalSold);
    this.server
      .to(roomName)
      .emit('get bottom purchase message', bottomAreaTextAndNickname);
  }

  @SubscribeMessage('get all data')
  async getAllPurchaseMessage(@MessageBody() roomName: string) {
    const nicknameAndPrice = [];
    const bottomAreaTextAndNickname: string[] = [];
    const rankings = await this.appService.getRanking();
    const totalSold = await this.appService.getTotalSoldPrice();
    const messageAndNickname = await this.appService.getMessageAndNickname();

    rankings.forEach((eachNickname) => {
      const price = Object.values(eachNickname._sum).toString();
      const { nickname } = eachNickname;
      nicknameAndPrice.push({ nickname, price: Number(price) });
    });
    nicknameAndPrice.sort((a, b) => {
      return b.price - a.price;
    });

    messageAndNickname.forEach((d: { nickname: string; text: string }) => {
      bottomAreaTextAndNickname.push(`${d.text} - [${d.nickname}]`);
    });

    this.server.to(roomName).emit('get top-left ranking', nicknameAndPrice);
    this.server.to(roomName).emit('get current quantity', totalSold);
    this.server
      .to(roomName)
      .emit('get bottom purchase message', bottomAreaTextAndNickname);
  }

  @SubscribeMessage('toggle right-top onad logo')
  handleLogo(@MessageBody() roomName: string) {
    this.server.to(roomName).emit('toggle right-top onad logo from server');
  }

  @SubscribeMessage('bottom area message')
  handleBottomAreaReply(@MessageBody() data: RoomAndText) {
    const { roomName } = data;
    const { message } = data;
    this.server.to(roomName).emit('get bottom area message', message);
  }

  @SubscribeMessage('toggle bottom area from admin')
  handleBottomMessageArea(@MessageBody() roomName: string) {
    this.server.to(roomName).emit('handle bottom area to client');
  }

  @SubscribeMessage('show live commerce')
  showLiveCommerce(@MessageBody() roomName: string) {
    this.server.to(roomName).emit('show screen');
  }

  @SubscribeMessage('quit live commerce')
  hideLiveCommerce(@MessageBody() roomName: string) {
    this.server.to(roomName).emit('hide screen');
  }

  @SubscribeMessage('get d-day')
  getDday(@MessageBody() roomAndDate: RoomAndDate) {
    const { date } = roomAndDate;
    const { roomName } = roomAndDate;
    this.server.to(roomName).emit('d-day from server', date);
  }

  @SubscribeMessage('get non client purchase message from admin')
  getNonClientMessage(@MessageBody() data: PurchaseMessage) {
    const { roomName } = data;
    this.server.to(roomName).emit('get non client purchase message', data);
  }

  @SubscribeMessage('refresh')
  handleRefresh(@MessageBody() roomName: string) {
    this.server.to(roomName).emit('refresh signal');
  }

  @SubscribeMessage('show video from admin')
  showVideo(@MessageBody() roomAndType: RoomAndVideoType) {
    const { roomName } = roomAndType;
    const { type } = roomAndType;
    this.server.to(roomName).emit('show video from server', type);
  }

  @SubscribeMessage('clear full video')
  clearVideo(@MessageBody() roomName: string) {
    this.server.to(roomName).emit('clear full video from server');
  }
}
