import CryptoJS from "crypto-js";
import _ from 'lodash';
import { getPublicKeyFromWallet, getPrivateKeyFromWallet} from "./wallet";
const COINBASE_AMOUNT = 50;

let transactionPool = [];
const getTransactionPool = () => {
    return _.cloneDeep(transactionPool);
}

let unspentTxOuts = []; // UnspentTxOut의 배열[]

class UnspentTxOut {
    constructor(txOutId, txOutIndex, address, amount) {
        this.txOutId = txOutId;
        this.txOutIndex = txOutIndex;
        this.address= address;
        this.amount = amount;
    }
}

// 얕은 복사 = 안에있는 데이터 주소만 복사
// 깊은 복사 = 메모리 하나하나를 전부다 가져와서 복사

// 코인을 어디로 얼만큼 보냈는가
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
    const txInsContent = transaction.txIns
        .map((txIn) => txIn.txOutId + txIn.txOutIndex)
        .reduce((a,b) => a + b, '');

    // txOuts에 있는 내용들을 하나의 문자열로 만든다.
    const txOutsContent = transaction.txOuts
        .map((txOut) => txOut.address + txOut.amount)
        .reduce((a,b) => a + b, '');
    
    // 위의 두 내용을 다 합해서 hash처리를 한다.

    return CryptoJS.SHA256(txInsContent + txOutsContent).toString();
}


// transaction signature
const signTxIn = (transaction, txInIndex, privateKey) => {
    // const txIn = transaction.txIns[txInIndex];

    // TODO : sign 코드 검증
    const signature = toHexString(privateKey, transaction.id).toDER();
    return signature;
}

// coinbase Transaction 
const getCoinbaseTransaction = (address, blockIndex) => {
    const tr = new Transaction();
    const txIn = new TxIn();
    txIn.sign = '';
    txIn.txOutId = '';
    txIn.txOutIndex = blockIndex;


    const txOut = new TxOut();
    txOut.address = address;
    txOut.amount = COINBASE_AMOUNT;

    tr.txIns = [txIn];
    tr.txOuts = [txOut];
    tr.id = getTransactionId(tr);
    
    return tr;
}

const sendTransaction = (address, amount) => {
    // 1. 트랜잭션 생성
    const tx = createTransaction();
    // 2. 트랜잭션 풀에 추가
    transactionPool.push(tx);
    // 3. 주변 노드에 전파

    return tx;
}

const createTransaction = (amount, address) => {
    // 1. 아직 처리되지 않았지만 트랜잭션 풀에 올라가 있는 내용을 확인
    const myAddress = getPublicKeyFromWallet();
    // unspentTxOuts.filter(uTxO => uTxO.address === myAddress);
    const myUnspentTxOuts = unspentTxOuts.filter((uTxO) => uTxO.address === myAddress);

    const filteredUnspentTxOuts = filterTxPoolTxs(myUnspentTxOuts);

    // 2. 거래에 사용되지 않은 TxOuts을 구성, 트랜잭션에 필요한 코인을 확인
    // 넘기는 금액은 다시 나한테 전달
    const {includeTxOuts, leftoverAmount} = findTxoutsForAmount(amount, filteredUnspentTxOuts);
    // 3. 서명 전의 TxIns로 구성
    const unsignedTxIns = includeTxOuts.map(createUnsignedTxIn());
    // 4. 트랜잭션 구성'
    const tx = new Transaction();
    tx.txIns = unsignedTxIns;
    tx.txOuts = createTxOuts(address, amount, leftoverAmount);
    tx.id = getTransactionId();

    tx.txIns = tx.txIns.map((txIn) => {
        txIn.sign = signTxIn(tx, tx.txIns.txOutIndex, getPrivateKeyFromWallet());
        return txIn;
    });

    return tx;
}

const filterTxPoolTxs = (myUnspentTxOuts) => {
    // 트랜잭션 풀에서 트랜잭션 인풋 내용만 추출
    const txIns = _(transactionPool)
                    .map((tx) => tx.txIns)
                    .flatten()
                    .value();
    console.log('트랜잭션 풀 : ',transactionPool);
    console.log('트랜잭션 풀 안의 Inputs : ',txIns);
    const removable = [];
    for(const unspentTxOut of myUnspentTxOuts){
        const findTxIn = _.find(txIns, (txIn) => {
            return txIn.txOutIndex === unspentTxOut.txOutIndex &&
                txIn.txOutId === unspentTxOut.txOutId;
        })

        if(findTxIn === undefined) {
            console.log("undefind임");
        } 
        else {
            removable.push(unspentTxOut);
        }
    }
    return _.without(myUnspentTxOuts, ...removable);
}

const findTxoutsForAmount = (amount, filteredUnspentTxOuts) => {
    let currentAmount = 0;
    const includeTxOuts = [];

    for(const unspentTxOut of filteredUnspentTxOuts) {
        includeTxOuts.push(unspentTxOut);

        currentAmount = currentAmount + unspentTxOut.amount;
        if(currentAmount >= amount) {
            const leftoverAmount = currentAmount - amount;
            return {includeTxOuts, leftoverAmount};
        }
    }

    throw Error('보내려는 금액보다 보유 금액이 적음')
}

const createUnsignedTxIn = (unspentTxOut) => {
    const txIn = new TxIn();
    txIn.txOutId = unspentTxOut.txOutId;
    txIn.txOutInex = unspentTxOut.txOutIndex;

    return txIn;
}

const createTxOuts = (address, amount, leftoverAmount) => {
    const txOut = new TxOut(address, amount);
    if(leftoverAmount > 0) {
        const leftoverTxOut = new TxOut(getPublicKeyFromWallet(), leftoverAmount)
        return [leftoverTxOut, txOut];
    } else {
        return [txOut];
    }
}

const addToTransactionPool = (transaction) => {
    // 올바른 트랜잭션인지 검사
    if(!isValidateTransaction(transaction, unspentTxOuts)) {
        throw Error('추가하려는 트랜잭션이 올바르지 않음 ', transaction)
    }
    // 중복되는지 
    if(!isValidateTxForPool(transaction)) {
        throw Error('추가하려는 트랜잭션이 트랜잭션 풀에 있음 ', transaction)
    }
    transactionPool.push(transaction);
}

const isValidateTransaction = (transaction, unspentTxOuts) => {
    if(getTransactionId(transaction) !== transaction.id) {
        console.log('invalid transaction id : ', transaction.id);
        return false;
    }

    const totalTxInValues = transaction.txIns
    .map((txIn) => getTxInAmount(txIn, unspentTxOuts))
    .reduce((a, b) => (a + b), 0); 

    const totalTxOutValues = transaction.txOuts
        .map((txOut) => txOut.amount)
        .reduce((a, b) => (a + b), 0);
    
    if(totalTxInValues !== totalTxOutValues) {
        console.log("totalTxInValues !== totalTxOutValues id : ", transaction.id);
        return false;
    }

    return true;
}

const getTxInAmount = (txIn, unspentTxOuts) => {
    const findUnspentTxOut = unspentTxOuts.find((uTxO) => uTxO.txOutId === txIn.txOutId &&
        uTxO.txOutIndex === txIn.txOutIndex);
    return findUnspentTxOut.amount;
}

const isValidateTxForPool = (transaction) => {
    // 트랜잭션 풀에 있는 txIns들과 transaction에 txIns들을 비교해서 같은 것이 있는지 확인
    const txPoolIns = _(transactionPool)
        .map((tx) => tx.txIns)
        .flatten()
        .value();

    const containTxIn = (txIn) => {
        return _.find(txPoolIns, (txPoolIn) => {
            return txIn.txOutIndex === txPoolIn.txOutIndex && 
                txIn.txOutId === txPoolIn.txOutId
        })
    }

    for( const txIn of transaction.txIns) {
        if(containTxIn(txIn)) {
            console.log("이미 존재하는 트랜잭션입니다. id : ", transaction.id);
            return false;
        }
    }

    return true;
}



export { getTransactionPool, addToTransactionPool }