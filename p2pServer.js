// 다른 노드와 통신을 위한 서버
import WebSocket from "ws";
import { WebSocketServer } from "ws"; // 포트만 넣어주면 웹소켓 서버를 만들어주는 클래스

const sockets = [];

const initP2PServer = (p2pPort) => {
    const server = new WebSocketServer({port:p2pPort});

    // connection, close등 이벤트는 이미 들어 있는 예약어
    server.on('connection', (ws) => {
        initConnection(ws);
    })
    console.log("listening P2PServer Port : ", p2pPort);
}

const initConnection = (ws) => {
    sockets.push(ws);
}

// Peer간의 연결 코드

const connectionToPeer = (newPeer) => {
    const ws = new WebSocket(newPeer);
    ws.on('open', () => {initConnection(ws); return true;})
    ws.on("error", () => {console.log("Fail to Connection peer : ", ws.remoteAddress); return false;})
}

export { initP2PServer, connectionToPeer };