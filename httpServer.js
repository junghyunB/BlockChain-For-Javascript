// 웹에 명령어를 입력해서 내 노드를 제어하는 서버
import express from "express"; 
import bodyParser from "body-parser";
import { getBlocks, createBlock } from "./block.js";
import { connectionToPeer, getPeers, sendMessage } from "./p2pServer.js";


const initHttpServer = (myHttpPort) => {
    const app = express();
    app.use(bodyParser.json());

    app.get("/", (req, res) => {
        res.send("Hello")
    })

    app.get("/blocks", (req, res) => {
        res.send(getBlocks());
    })

    app.post("/createblock", (req, res) => {
        res.send(createBlock(req.body.data));
    })

    app.post("/addPeer", (req, res) => {
        res.send(connectionToPeer(req.body.data)); 
    })
    
    app.post("/Sendmessage", (req, res) => {
        res.send(sendMessage(req.body.data));
        
    })

    app.get("/peers", (req, res) => {
        res.send(getPeers());
    })

    app.listen(myHttpPort, () => {
        console.log(`listening httpServer Port : `, myHttpPort)
    })
}

export { initHttpServer }