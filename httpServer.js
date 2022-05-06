// 웹에 명령어를 입력해서 내 노드를 제어하는 서버
import express from "express"; 
import bodyParser from "body-parser";
import { getBlocks, createBlock } from "./block.js";
import { connectionToPeer, getPeers, mineBlock } from "./p2pServer.js";
import { getPublicKeyFromWallet } from "./wallet.js"
import nunjucks from "nunjucks"

const initHttpServer = (myHttpPort) => {
    const app = express();
    app.use(express.urlencoded({extended:true}))
    app.use(bodyParser.json());

    app.set('view engine', "html")
    nunjucks.configure('views', {
        express:app,
    })

    app.get("/", (req, res) => {
        res.render("index")
    })

    app.get("/blocks", (req, res) => {
        res.send(getBlocks());
    })

    app.post("/createblock", (req, res) => {
        res.send(createBlock(req.body.data));
    })

    app.post("/mineBlock", (req, res) => {
        let newBlockHash = [];
        let newBlockArr = mineBlock(req.body.data)
        for(let i = 0; i < newBlockArr.length; i++) {
            newBlockHash.push(newBlockArr[i].hash + '\n')         
        }
        res.render("index")
})

    app.get("/address", (req, res) => {
        const address = getPublicKeyFromWallet();
        res.send({"address : ": address})

    })

    app.post("/addPeer", (req, res) => {
        res.send(connectionToPeer(req.body.data)); 
    })

    app.get("/peers", (req, res) => {
        res.send(getPeers());
    })

    app.listen(myHttpPort, () => {
        console.log(`listening httpServer Port : `, myHttpPort)
    })
}

export { initHttpServer }