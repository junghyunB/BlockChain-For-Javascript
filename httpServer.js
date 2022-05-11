// 웹에 명령어를 입력해서 내 노드를 제어하는 서버
import express from "express"; 
import bodyParser from "body-parser";
import { getBlocks, createBlock, blocks } from "./block.js";
import { connectionToPeer, getPeers, mineBlock } from "./p2pServer.js";
import { getPublicKeyFromWallet } from "./wallet.js"
import nunjucks from "nunjucks"
import {pool} from "./db.js"
import path from 'path';

const __dirname = path.resolve();
const initHttpServer = (myHttpPort) => {
    const app = express();
    app.use(express.static(__dirname + "/public"));
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

    app.post("/mineBlock", async(req, res) => {
        mineBlock(req.body.data)
        
        // await pool.query(`INSERT INTO blockdata(idx, datas, timestamp, hashs, previoushash, difficulty, nonce) VALUES(${latestBlock.index}, "${latestBlock.data}", "${latestBlock.timestamp}", "${latestBlock.hash}", "${latestBlock.previousHash}", ${latestBlock.difficulty}, ${latestBlock.nonce})`)
        // res.redirect("/");
})

    app.get("/getdata", async(req, res) => {
        // let latestBlock = blocks[blocks.length - 1]
        // await pool.query(`SELECT * FROM blockdata where idx=${latestBlock.index} `);
        
    })

    app.get("/address", (req, res) => {
        const address = getPublicKeyFromWallet();
        res.send({"address : ": address})

    })

    app.post("/sendTransaction", (req, res) => {
        const address = req.body.address;
        const amount = req.body.amount;
        res.send(sendTransaction(address, amount));
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