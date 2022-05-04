// 블록체인 관련 함수
// 블록 구조 설계
/*
    index : 블록체인의 높이
    data : 블록에 포함된 모든 데이터 (트랜잭션 포함)
    timeStamp : 블록이 생성된 시간.
    hash : 블록 내부 데이터로 생성한 sha256값 (블록의 유일성)
    previousHash : 이전 블록 해쉬 (이전 블록을 참조)
    */
   
    import CryptoJS from 'crypto-js';
    import random from "random"
   
    const BLOCK_GENERATION_INTERVAL = 10;      // SECOND
    const DIFFICULTY_ADJUSTMENT_INTERVAL = 10; // generate block count


    // 블록의 구조
    class Block {
        constructor(index, data, timestamp, hash, previousHash, difficulty, nonce) {
            this.index = index;
            this.data = data;
            this.timestamp = timestamp;
            this.hash = hash;
            this.previousHash = previousHash;
            this.difficulty = difficulty;
            this.nonce = nonce;
         }
     }
     
 
 
 const getBlocks = () => {
     return blocks;
 }

 const getLatestBlock = () => {
     return blocks[blocks.length - 1];
 }
 
 // 블록 해쉬값 계산 함수
 
 const calculateHash = (index, data, timestamp, previousHash, difficulty, nonce) => {
     // CryptoJS.SHA256함수를 사용할때는 인자를 String으로 받는다.
     return CryptoJS.SHA256((index + data + timestamp + previousHash + difficulty + nonce).toString()).toString();
 
     // 0하나로 시작하는 hash값을 만드는 매개변수 (nonce)를 찾는다.
     // 16진수 64자리 16진수 1자리 -> 2진수 4자리 256개의 0과 1로 표현
 }
 
 // 제네시스 블록 생성 함수.
 const createGenesisBlock = () => {
     
     const genesisBlock = new Block(0, 
        // 'The Times 03/Jan/2009 Chancellor on brink of second bailout for banks',
        "test",

     new Date().getTime() / 1000, 
    // 0,
      0, 0, 1, 0);
     
     genesisBlock.hash = calculateHash(genesisBlock.index, genesisBlock.data, genesisBlock.timestamp, genesisBlock.previousHash, genesisBlock.difficulty, genesisBlock.nonce);
     
     return genesisBlock;
     
 }
 let blocks = [createGenesisBlock()]; // 제네시스 블록 선언할때 한번만 호출
 // 블록 만들기
 
 const createBlock = (blockData) => {
    const previousBlock = blocks[blocks.length - 1]; // 이전 블록 번호 : blocks배열의 길이 -1번째 인덱스
    const nextIndex = previousBlock.index + 1; // 다음 블록 번호 = 이전 블록번호 + 1
    const nextTimeStamp = new Date().getTime() / 1000; // 초단위 저장
    const nextDifficulty = getDifficulty();
    const nextNonce = findNonce(nextIndex, blockData, nextTimeStamp, previousBlock.hash, nextDifficulty);
    const nextHash = calculateHash(nextIndex, blockData, nextTimeStamp, previousBlock.hash, nextDifficulty, nextNonce); // 다음 블록의 해쉬값
    const newBlock = new Block(nextIndex, blockData, nextTimeStamp, nextHash, previousBlock.hash, nextDifficulty, nextNonce);

    return newBlock;
}

 const addBlock = (newBlock, previousBlock) => {
    if(isValidNewBlock(newBlock, previousBlock)) {
        blocks.push(newBlock)
        return true  
    } 
    return false
} 



 // 블록 무결성 검증 함수
 /* 
     블록의 인덱스가 이전 블록인덱스보다 1 크다.
     블록의 previousHash가 이전 블록의 hash이다.
     블록의 구조가 일치해야 한다.
 */
 
 const isValidBlockStructure = (newBlock) => {
     if(typeof(newBlock.index) === 'number'
     && typeof(newBlock.data) === 'string' 
     && typeof(newBlock.timestamp) === 'number'
     && typeof(newBlock.hash) === "string"
     && typeof(newBlock.difficulty) === "number"
     && typeof(newBlock.nonce) === "number"
     && typeof(newBlock.previousHash) === "string") {
         return true;
     }
     return false
 }
 
 const isValidNewBlock = (newBlock, previousBlock) => {
     if(newBlock.index !== previousBlock.index + 1) {
         console.log("invalid index");
         return false;
     } else if(newBlock.previousHash !== previousBlock.hash) {
         console.log("invalid previous hash");
         return false;
     } else if(isValidBlockStructure(newBlock) == false) {
         console.log('invalid block structure');
         return false;
     }
     return true;        
 }
 
 // 문제 해결을 검사하는 함수
 
 // hash 문제를 맞췄는지 확인하는 인자, difficulty 난이도에따라 앞자리 0이 몇개인지 결정하는 인자.
 const hashMatchDifficulty = (hash, difficulty) => {
     const binaryHash = hexToBinary(hash);
     const requiredPrefix = '0'.repeat(difficulty); // difficulty번만큼 반복
     
     return binaryHash.startsWith(requiredPrefix);
 }
 
 const hexToBinary = (hex) => {
     const lookupTable = {
         '0': '0000', '1': '0001', '2': '0010', '3': '0011', 
         '4': '0100', '5': '0101', '6': '0110', '7': '0111',
         '8': '1000', '9': '1001', 'a': '1010', 'b': '1011',
         'c': '1100', 'd': '1101', 'e': '1110', 'f': '1111'
     }
 
     // ex '03cf'
     // ex 00000001111001111
 
     let binary = "";
     for(let i = 0; i < hex.length; i++) {
         if(lookupTable[hex[i]]) {
             binary += lookupTable[hex[i]]
         } else {
             console.log("invalid hex : ", hex);
             return null;
         }
     }
     return binary;
 }
 
 // nonce찾는 함수
 
 const findNonce = (index, data, timestamp, previousHash, difficulty) => {
    let nonce = 0;

    while(true) {
        let hash = calculateHash(index, data, timestamp, previousHash, difficulty, nonce);

        if(hashMatchDifficulty(hash, difficulty)) {
            return nonce;
        } else {
            nonce++;
        }
    }

 }
 
 const replaceBlockchain = (receiveBlockchain) => {

    console.log(receiveBlockchain);
    if (isValidBlockchain(receiveBlockchain)) {
        // let blocks = getBlocks();
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

 const isValidBlockchain = (receiveBlockchain) => {
    // 같은 제네시스 블록인가
    if(JSON.stringify(receiveBlockchain[0]) !== JSON.stringify(getBlocks()[0])) {
        console.log("문제있음")
        console.log(receiveBlockchain[0])
        // console.log("2 : ", getBlocks());
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
 const getAdjustmentDifficulty = () => {
    // 현재 시간, 마지막으로 난이도 조정된 시간
    const prevAdjustedBlock = blocks[blocks.length - DIFFICULTY_ADJUSTMENT_INTERVAL - 1];
    const latestBlock = getLatestBlock();
    const elapsedTime = latestBlock.timestamp - prevAdjustedBlock.timestamp;
    const expectedTime = DIFFICULTY_ADJUSTMENT_INTERVAL * BLOCK_GENERATION_INTERVAL;

    if(elapsedTime > expectedTime * 2) {
        // 난이도 하락
        return prevAdjustedBlock.difficulty - 1;

    } else if (elapsedTime < expectedTime / 2) {
        // 난이도 상승
        return prevAdjustedBlock.difficulty + 1;

    } else {

        return prevAdjustedBlock.difficulty;
    }
     
} 


 const getDifficulty = () => {
    const latestBlock = getLatestBlock();
    
    // 난이도 조정 주기 확인
    if(latestBlock.index % DIFFICULTY_ADJUSTMENT_INTERVAL === 0 &&
       latestBlock.index !== 0) {
           return getAdjustmentDifficulty();
       }

    return latestBlock.difficulty
 }
 
 export { getBlocks, getLatestBlock, createBlock, addBlock, isValidNewBlock, replaceBlockchain }