// 코인을 어디로 얼마나 보냈는가

import CryptoJS from 'crypto-js';

const COINBASE_AMOUNT = 50;

class TxOut {
    constructor(address, amount) {
        this.address = address; // string
        this.amount = amount; // number
    }
}

// 보내진 코인을 실제로 소유했다에 대한 증거

class TxIn {
    constructor(txOutId, txOutIndex, sign) {
        this.txOutId = txOutId; // string
        this.txOutIndex = txOutIndex; // number
        this.sign = sign; // string
    }
}


class Transaction {
    constructor(id, txIns, txOuts) {
        this.id = id; // string
        this.txIns = txIns; // TxIn []
        this.txOuts = txOuts; // TxOut []
    }
}

// transaction id 
const getTransactionId = (transaction) => {
    // txIns에 있는 내용들을 하나의 문자열로 만든다.
    const txInsContent = transaction.txIns.map((txIn) => {
        (txIn.txOutId + txIn.txOutIndex).reduce((a, b) => {
            a + b, ""
        })
    }) 
    // txOuts에 있는 내용들을 하나의 문자열로 만든다.

    const txOutsContent = transaction.txOuts.map((txOut) => {
        (txOut.address + txOut.amount).reduce((a, b) => {
            a + b, ""
        })
    }) 
    // 위의 두내용을 다 더해서 hash값으로 변환한다.
    return CryptoJS.SHA256(txInsContent + txOutsContent).toString();
}


// transaction signature

const signTxIn = (transaction, txInIndex, privateKey) => {
    // const txIn = transaction.txIns[txInIndex];

    const signature = toHexString(privateKey, transaction.id).toDER();
    return signature;

}

// coinbase Transaction
const getCoinbaseTransaction = (address, blockIndex) => {
    const tr = new Transaction();
    const txIn = new TxIn();
    txIn.sign = "";
    txIn.txOutId = "";
    txIn.txoutIndex = blockIndex;   

    const txOut = new TxOut();
    txOut.address = address;
    txOut.amount = COINBASE_AMOUNT;

    tr.txIns = [txIn];
    tr.txOuts = [txOut];

    tr.id = getTransactionId(tr);

    return tr;
}