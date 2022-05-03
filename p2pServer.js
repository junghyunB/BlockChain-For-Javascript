// 다른 노드와 통신을 위한 서버
import WebSocket from "ws";
import { WebSocketServer } from "ws"; // 포트만 넣어주면 웹소켓 서버를 만들어주는 클래스
import { getBlocks, getLatestBlock, addBlock, createBlock, isValidNewBlock } from "./block.js";

const sockets = [];
const MessageType = {
    // RESPONSE_MESSAGE : 0,
    // SENT_MESSAGE : 1

    //최신 블록 요청
    QUERY_LATEST : 0,
    //모든 블록 요청
    QUERY_ALL : 1,
    //블록 전달
    RESPONSE_BLOCKCHAIN : 2
}
const getPeers = () => {
    return sockets;
}

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
    initMessageHandler(ws);
    write(ws, queryAllMessage());
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
            // case MessageType.SENT_MESSAGE: 
            // console.log(ws._socket.remoteAddress, " : ", message.message);
            //     break;
            case MessageType.QUERY_LATEST:
                break;
            case MessageType.QUERY_ALL:
                write(ws, responseAllMessage());
                break;
            case MessageType.RESPONSE_BLOCKCHAIN:
                console.log(ws._socket.remoteAddress, " : ", message.data);
                replaceBlockchain(message.data)
                // handleBlockchainResponse(message);
                break;
        }
    })
}

const isValidBlockchain = (receiveBlockchain) => {
    // 같은 제네시스 블록인가
    if(JSON.stringify(receiveBlockchain[0]) !== JSON.stringify(getBlocks()[0])) {
        console.log("같지않다")
        return false;
    }
    // 체인 내의 모든 블록을 확인
    for (let i = 1; i < receiveBlockchain.length; i++) {
        if(isValidNewBlock(receiveBlockchain[i], receiveBlockchain[i - 1]) == false) {
            return false;
        }
    }
    return true;
}

const replaceBlockchain = (receiveBlockchain) => {
    if (isValidBlockchain(receiveBlockchain)) {

        let blocks = getBlocks();
        if(receiveBlockchain.length > blocks.length) {
            console.log("받은 블록체인 길이가 길다")
            blocks = receiveBlockchain;

        } else if(receiveBlockchain.length == blocks.length && random.boolean()) {
            console.log("받은 블록체인 길이가 같다")
            blocks = receiveBlockchain;
        }
    } else {
        console.log("받은 블록체인에 문제가 있습니다.")
    }
}

const handleBlockchainResponse = (receiveBlockchain) => {
    // 받은 블록체인보다 현재 블록체인이 더 길면. ( 안 바꾼다  )

    // 같으면 (바꾸거나 안바꾼다.)

    // 받은 블록체인이 현재 블록체인보다 길면 ( 바꾼다. )

}

const queryLatestMessage = () => {
    return ({ 
          "type" : MessageType.QUERY_LATEST, 
          "data" : null
        })
}

const queryAllMessage = () => {
    return ({ 
          "type" : MessageType.QUERY_ALL, 
          "data" : null
        })
}

const responseLatestMessage = () => {
    return ({ 
        "type" : MessageType.RESPONSE_BLOCKCHAIN, 
        "data" : JSON.stringify(getLatestBlock())
      })
}

const responseAllMessage = () => {
    return ({ 
        "type" : MessageType.RESPONSE_BLOCKCHAIN, 
        "data" : JSON.stringify(getBlocks())
      })
}

const write = (ws, message) => {

    console.log("write", message);
    ws.send(JSON.stringify(message));
}

// 나한테 연결되어 있는 peer에게 일괄적으로 메시지를 전송
const broadcasting = (message) => {
    sockets.forEach( (socket) => {
        write(socket, message);
    });
}

const mineBlock = (blockData) => {
    const newBlock = createBlock(blockData);
    if(addBlock(newBlock, getLatestBlock())) {
        broadcasting(responseLatestMessage());
    }
}

// 새로운 블록을 채굴했을 때 연결된 노드들에게 전파



export { initP2PServer, connectionToPeer, getPeers, broadcasting, mineBlock };