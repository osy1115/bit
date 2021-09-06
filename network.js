const websocket = require('ws')
const wsPORT = process.env.WS_PORT || 6005
const bc = require('./block.js')



let sockets = []
function getSockets(){
    return sockets
}

const MessageAction = {
    QUERY_LAST:0,
    QUERY_ALL:1,
    RESPONSE_BLOCK:2,
}

// reducer create
function initMessageHandler(ws){
    ws.on("message", data=>{
        const message = JSON.parse(data)
        switch(message.type){
            case MessageAction.QUERY_LAST:
                    write(ws,responseLastMsg())
                break;
            case MessageAction.QUERY_ALL:
                    write(ws,responseBlockMsg())
                break;
            case MessageAction.RESPONSE_BLOCK:
                    handlerBlockResponse(message)
                break;
        }
    })
}
function queryAllMsg(){
    return{
        type:MessageAction.QUERY_ALL,
        data:null
    }
}

function queryBlockMsg(){
    return{
        type:MessageAction.QUERY_LAST,
        data:null
    }
}

function responseLastMsg(){
    return {
        type:MessageAction.RESPONSE_BLOCK,
        data:JSON.stringify([bc.getLastBlocks()])
    }
}

function responseBlockMsg(){
    return {
        type:MessageAction.RESPONSE_BLOCK,
        data:JSON.stringify(bc.getBlocks())
    }
}

function handlerBlockResponse(message){
    const receivedBlocks = JSON.parse(message.data);
    const lastBlockReceived = receivedBlocks[receivedBlocks.length - 1]
    const lastBlockHeld = bc.getLastBlocks()

    if (lastBlockReceived.header.index > lastBlockHeld.header.index) {
        console.log(
        "블록의 갯수 \n" + 
        `내가 받은 블록의 index 값 ${lastBlockReceived.header.index}\n`+
        `내가 가지고 있는 블록의 index 값 ${lastBlockHeld.header.index}\n`
        )

        if(bc.createHash(lastBlockHeld) === lastBlockReceived.header.previousHash){
            console.log(`마지막 하나만 비어있는 경우에는 하나만 추가.`)
            if(bc.addBlock(lastBlockReceived)){
                broadcast(responseLastMsg())
            }
        } else if (receivedBlocks.length === 1 ){
            console.log(`피어로부터 블록을 연결해야함`)
            broadcast(queryAllMsg())
        } else {
            console.log('블록을 최신화로 진행합니다.')
            bc.replaceBlock(receivedBlocks)
        }
    } else {
        console.log('블록이 이미 최신화입니다.')
    }
}

function initErrorHandler(ws){
    ws.on("close",()=>{closeConnection(ws)})
    ws.on("error",()=>{closeConnection(ws)})
}

function closeConnection(ws){
    console.log(`Connection close ${ws.url}` )
    sockets.splice(sockets.indexOf(ws),1)
}

//최초의 접속
function wsInit(){
    const server = new websocket.Server({port:wsPORT})
    server.on("connection",(ws)=>{
        console.log(ws)
        init(ws)
    })
}

function write(ws,message){
    ws.send(JSON.stringify(message))
}

function broadcast(message){
    sockets.forEach( socket =>{
        write(socket,message)
    })
}

function connectionToPeers(newPeers){ // 배열로 들어감
    newPeers.forEach(peer=>{ // 주소값 ws://localhost:7001
        const ws = new websocket(peer)
        ws.on('open',()=>{
            init(ws)
        })
        ws.on('error',()=>{
            console.log("connection failed")
        })
    })
}


function init(ws){
    sockets.push(ws)
    initMessageHandler(ws)
    initErrorHandler(ws)
    write(ws,{type:MessageAction.QUERY_LAST,data:null})
    //ws.send(JSON.stringify({type:MessageAction.QUERY_LAST,data:null}))
}

module.exports = {
    wsInit,
    getSockets,
    broadcast,
    connectionToPeers,
    responseLastMsg
}