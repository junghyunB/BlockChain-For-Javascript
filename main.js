// p2p 서버 초기화, 사용
// http 서버 초기화, 사용
// 블록체인 함수 사용

import { initHttpServer } from "./httpServer.js";
import { initP2PServer } from "./p2pServer.js";

const httpPort = parseInt(process.env.HTTP_PORT) || 3001;
const p2pPort = parseInt(process.env.P2P_Port) || 6001;


initHttpServer(httpPort);
initP2PServer(p2pPort);



// p2p포트가 더 빠르게 작동해서 콘솔에 먼저찍힘 비동기 코드 특성