const express = require('express')
const app = express()
const port = process.env.PORT || 3000
const bodyParser = require('body-parser')
const bc = require('./block.js')
const ws = require('./network.js')

app.use(bodyParser.json())

app.get('/blocks',(req,res)=>{
    res.send(bc.getBlocks())
})

app.get('/version',(req,res)=>{
    res.send(bc.getVersion())
})

// Blocks 배열에 객체{}
// curl http://localhost:3000/mineBlock -X POST -H "Content-Type:application/json" -d "{\"data\":[\"Hello World!\"]}" 
app.post('/mineBlock',(req,res)=>{
    const data = req.body.data
    const result = bc.addBlock(data) //{} or false
    if(result == false) { 
        res.send('mineBlock failed')
    } else{
        res.send(result)
    }
})

// peers -> 현재 갖고 있는 소켓리스트 getSockets GET
app.get('/peers',(req,res)=>{
    res.send(ws.getSockets().map( socket =>{
        return `${socket._socket.remoteAddress}:${socket._socket.remotePort}`;
    }))
})
// addPeers -> 내가 보낼 주소값에 소켓을 생성하는 작업 connectionToPeers POST

//curl -X POST -H "Content-Type:application/json" -d "{\"peers\":[\"ws://localhost:7001\",\"ws://localhost:7002\"]}" http://localhost:3000/addPeers

app.post('/addPeers',(req,res)=>{
    const peers = req.body.peers || []
    ws.connectionToPeers(peers)
    res.send('success')
})
// curl http://localhost:3000/stop
app.get('/stop',(req,res)=>{
    res.send('server stop')
    process.exit(0)
})

ws.wsInit()
app.listen(port,()=>{
    console.log(`server running ${port}`)
})