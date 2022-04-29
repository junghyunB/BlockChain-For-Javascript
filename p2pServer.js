// 다른 노드와 통신을 위한 서버
import WebSocket from "ws";
import { WebSocketServer } from "ws"; // 포트만 넣어주면 웹소켓 서버를 만들어주는 클래스

const sockets = [];
const MessageType = {
    RESPONSE_MESSAGE : 0,
    SENT_MESSAGE : 1

    //최신 블록 요청
    //모든 블록 요청
    //블록 전달
}
const getPeers = () => {
    return sockets;
}

const initP2PServer = (p2pPort) => {
    const server = new WebSocketServer({port:p2pPort});

    // connection, close등 이벤트는 이미 들어 있는 예약어
    server.on('connection', (ws) => {
        initConnection(ws);
        console.log(`${p2pPort}`);
    })
    
    console.log("listening P2PServer Port : ", p2pPort);

}

const initConnection = (ws) => {
    sockets.push(ws);
    initMessageHandler(ws);
}

// Peer간의 연결 코드

const connectionToPeer = (newPeer, message) => {
    const ws = new WebSocket(newPeer);
    ws.on('open', () => {initConnection(ws); console.log("Connect peer : ", newPeer )})
    ws.on("error", () => {console.log("Fail to Connection peer : ", newPeer);})
}

const initMessageHandler = (ws) => {
    ws.on('message', (data) => {
        const message = JSON.parse(data);
        switch(message.type) {
            case MessageType.SENT_MESSAGE: 
            console.log(message.message);
                break;
        }
    })
}

const write = (ws, message) => {
    console.log("write", message);
    ws.send(JSON.stringify(message));
}

// 나한테 연결되어 있는 peer에게 일괄적으로 메시지를 전송
const sendMessage = (message) => {
    sockets.forEach( (socket) => {
        write(socket, message);
    });
}

export { initP2PServer, connectionToPeer, getPeers, sendMessage };