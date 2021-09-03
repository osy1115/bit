const websocket = require('ws')
const wsPORT = process.env.WS_PORT || 6005



let sockets = []
function getSockets(){
    return sockets
}


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
}

module.exports = {
    wsInit,
    getSockets,
    broadcast,
    connectionToPeers,
}