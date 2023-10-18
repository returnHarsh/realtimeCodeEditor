const express = require("express");
const app = express();
const http = require("http");
const {Server} = require("socket.io");
const ACTIONS = require("./src/Action");
const path = require("path");


const server = http.createServer(app);



const io = new Server(server , {
    cors : {
        origin: "*"
    }
});


app.use(express.static('build'));


//   this is the global middleware
//  so isse ye ho rha h ki jab bhi humare server pe request aayegi to ye use fornt end pe bhej dega , hum usko index.html page serve kar rhe h har request par
app.use((req , res , next)=>{
    res.sendFile(path.join(__dirname , 'build' , 'index.html'));
})

const userSocketMap = {};


//  getting all the connected cliened in a room 
const getAllConnectedClients= (roomId)=>{
    // ye code kya kareka -- jitne bhi room h socket server ke andar usme se jiski bhi id ye h us room ko get karega and it will return me a map
    return   Array.from(io.sockets.adapter.rooms.get(roomId) || []).map(socketId=>{
        return {
            socketId,
            username : userSocketMap[socketId],
        }
    })
}


io.on("connection" , (socket)=>{

    console.log(userSocketMap);


    socket.on(ACTIONS.JOIN , ( {roomId , username} )=>{
        userSocketMap[socket.id] = username;
        socket.join(roomId);

        // jo current room id h usme jitne bhi clients h unki details le rhe h
        const clients = getAllConnectedClients(roomId);
        clients.forEach(( {socketId} )=>{
            io.to(socketId).emit(ACTIONS.JOINED , {
                clients,
                username,
                socketId : socket.id,
            })
        })
     
    })

    socket.on(ACTIONS.CODE_CHANGE , ( {roomId , code} )=>{
        socket.in(roomId).emit(ACTIONS.CODE_CHANGE , code);
    })

    socket.on(ACTIONS.SYNC_CODE , ( {socketId , code} )=>{
        if(code != null){
            io.to(socketId).emit(ACTIONS.CODE_CHANGE , code);
        }

    })

    
    socket.on('disconnecting' , ()=>{
        const  rooms = [...socket.rooms];
        rooms.forEach( (roomId)=>{
            //  us room ke andar hume kuch notify karna h
            socket.in(roomId).emit(ACTIONS.DISCONNECTED , {
                socketId: socket.id,
                username : userSocketMap[socket.id],
            })
        } )
        delete userSocketMap[socket.id];
        socket.leave();
    })


})


const PORT = process.env.PORT || 5000;
server.listen(5000 , ()=>{
    console.log("server online");
})

