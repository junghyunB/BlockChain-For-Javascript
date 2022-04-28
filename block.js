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
   

   // 블록의 구조
   class Block {
       constructor(index, data, timestamp, hash, previousHash) {
           this.index = index;
           this.data = data;
           this.timestamp = timestamp;
           this.hash = hash;
           this.previousHash = previousHash;
        }
    }
    


const getBlocks = () => {
    return blocks;
}

// 블록 해쉬값 계산 함수

const calculateHash = (index, data, timestamp, previousHash) => {
    // CryptoJS.SHA256함수를 사용할때는 인자를 String으로 받는다.
    return CryptoJS.SHA256((index + data + timestamp + previousHash).toString()).toString();
}

// 제네시스 블록 생성 함수.
const createGenesisBlock = () => {
    
    const genesisBlock = new Block(0, 'The Times 03/Jan/2009 Chancellor on brink of second bailout for banks', new Date().getTime() / 1000, 0, 0);
    
    genesisBlock.hash = calculateHash(genesisBlock.index, genesisBlock.data, genesisBlock.timestamp, genesisBlock.previousHash);
    
    return genesisBlock;
    
}
const blocks = [createGenesisBlock()]; // 제네시스 블록 선언할때 한번만 호출
// 블록 만들기

const createBlock = (blockData) => {
    const previousBlock = blocks[blocks.length - 1]; // 이전 블록 번호 : blocks배열의 길이 -1번째 인덱스
    const nextIndex = previousBlock.index + 1; // 다음 블록 번호 = 이전 블록번호 + 1
    const nextTimeStamp = new Date().getTime() / 1000; // 초단위 저장
    const nextHash = calculateHash(nextIndex, blockData, nextTimeStamp, previousBlock.hash); // 다음 블록의 해쉬값
    const newBlock = new Block(nextIndex, blockData, nextTimeStamp, nextHash, previousBlock.hash);
    if(isValidNewBlock(newBlock, previousBlock)) {
        blocks.push(newBlock)
        return newBlock  
    } 
    console.log("fail to create newblock")
    return null;
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

export { getBlocks, createBlock }