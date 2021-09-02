const fs = require('fs')
const merkle = require('merkle')
const CrytoJs = require('crypto-js')

/* 사용법 */
// const tree = merkle("sha256").sync([]) // return이 tree 구조로 만들어줌
// tree.root()

class BlockHeader {
    constructor(version,index,previousHash,time, merkleRoot){
        this.version = version
        this.index = index
        this.previousHash = previousHash
        this.time = time
        this.merkleRoot = merkleRoot
    }
}

class Block{
    constructor(header,body){
        this.header = header
        this.body = body
    }
}

function createGenesisBlock(){
    const version = getVersion()
    const index = 0
    const time = getCurrentTime()
    const previousHash = '0'.repeat(64)
    const body = ['heloo block']

    const tree =merkle('sha256').sync(body)
    const root = tree.root() || '0'.repeat(64)

    const header = new BlockHeader(version,index,previousHash,time,root)
    return new Block(header,body)
}

// 다음블럭의 header와 body를 만들어주는 함수
function nextBlock(data){
        const prevBlock = getLastBlocks()
        const version = getVersion()
        const index = prevBlock.header.index + 1
        const previousHash = createHash(prevBlock)
        const time = getCurrentTime();
        const merkleTree = merkle("sha256").sync(data)
        const merkleRoot = merkleTree.root() || '0'.repeat(64)

        const header = new BlockHeader(version,index,previousHash,time,merkleRoot)
        return new Block(header,data)
}

function createHash(block){
    const {
        version,
        index,
        previousHash,
        time,
        merkleRoot
    } = block.header
    const blockString = version+index+previousHash+time+merkleRoot
    const Hash = CrytoJs.SHA256(blockString).toString()
    return Hash
}

function addBlock(data){

    const newBlock = nextBlock(data)
    if(isVaildNewBlock(newBlock,getLastBlocks())){
        Blocks.push(newBlock);
        return true;
    }
    return false;
}

function isVaildNewBlock(currentBlock,previousBlock){
    if(!isVaildType(currentBlock)){
        console.log(`invaild block structure ${JSON.stringify(currentBlock)}`)
        return false
    }
    if(previousBlock.header.index + 1 !== currentBlock.header.index){
        console.log(`invalid index`)
        return false
    }
    if(createHash(previousBlock)!== currentBlock.header.previousHash){
        console.log(`invaild previousBlock`)
        return false
    }
    if( currentBlock.body.length === 0 && ( merkle("sha256").sync(currentBlock.body).root() === currentBlock.header.merkleRoot)){
        console.log(`invaild merkleRoot`)
        return false
    }

    return true
}

function isVaildType(block){
    return(
    typeof(block.header.version) === "string" &&
    typeof(block.header.index) === "number" &&
    typeof(block.header.previousHash) === "string" &&
    typeof(block.header.time) === "number" &&
    typeof(block.header.merkleRoot) === "string" &&
    typeof(block.body) === "object"
    ) 
}

let Blocks = [createGenesisBlock()]

function getBlocks(){
    return Blocks
} 

function getLastBlocks(){
  return  Blocks[Blocks.length - 1]
}
//const block = createGenesisBlock()


// const blockchain = new Block(new BlockHeader(1,2,3,4,5),['Hello'])
// console.log(blockchain)


// const header = new BlockHeader(1,2,3,4,5)
// const header2 = new BlockHeader(1,2,3,4,6)

// console.log(header)
// console.log(header2)

// BlockHeader {
//     version:1,
//     index:2,
//     previousHash:3,
//     time:4,
//     merkleRoot:5
// }

function getVersion(){
    const package = fs.readFileSync("../package.json");
    // console.log(package.toString("utf8"));
    // console.log(JSON.parse(package).version);
    return JSON.parse(package).version;
};

function getCurrentTime(){
    return Math.ceil( new Date().getTime()/1000)
}

addBlock(["hello1"])
addBlock(["hello2"])
addBlock(["hello3"])


function isVaildBlock(blocks){
    if(JSON.stringify(blocks[0]) !== JSON.stringify(createGenesisBlock())){
        console.log(`genesis err`)
        return false
    }

    let tempBlocks = [blocks[0]]
}


//console.log(Blocks)