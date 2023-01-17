/*initialise our express project*/
const express = require('express');
const bodyParser = require('body-parser')
/*this is how we initialise our express application*/
const app = express();
/*Server*/
const server = require('http').Server(app);
/* importing socket.io */
const io = require('socket.io')(server)
/*importing uuid into this server.js */
const {v4: uuidv4 } = require('uuid');
app.set('view engine','ejs');
/*importing peer.js */
const { ExpressPeerServer } = require('peer');
const { resolveSoa } = require('dns');

const peerServer = ExpressPeerServer(server, {
    debug:true
});

app.use(express.static('public'));
/*parse application/x-www-form-urlencoded*/
app.use(bodyParser.urlencoded({ extended: false }))
/* parse application/json */
app.use(bodyParser.json())

app.get('/endcall',(req,res)=>{
    res.render('endcall', { roomId:req.body.RoomId,name:req.body.Name});
})
app.get('/entry',(err,res)=>{
    res.render('entry',{title:'welcome'})
})
/* the main route is the roomid so when we go to the root it will generate the room id and pass it as a parameter */
app.get('/room', (req, res) => {
    res.redirect(`/${uuidv4()}`);
  })
/*hey what URL are you going to use? */
app.use('/peerjs',peerServer);

app.get('/:room',(req,res)=> {
    res.render('room', { roomId:req.params.room});
})

app.post('/join',(req,res)=> {
    //res.render('join', { roomId:req.params.join});
    //console.log(req.body,"hiiii");
    let code=req.body.code;
//let finalCode=code.split('/')[3];
    res.render('room', { roomId:req.body.RoomId,name:req.body.Name});
})

/*end call*/

/*building connection */

var allClients = [];
io.on('connection', socket => {
    socket.on('join-room' , (roomId, name,id) => {
        socket.join(roomId);
        allClients.push(socket);
        io.to(roomId).emit('user-connected',id);
        socket.on('message',message => {
           console.log("USER NAME:",name); 
            io.to(roomId).emit('createMessage',{name,message});
        });
        socket.on('voicemessage',message => {
            console.log('dabaaa')
            io.to(roomId).emit('createvoice',message);
        });
        socket.on('disconnect', name => {
        console.log('Got disconnect!');

        var i = allClients.indexOf(name);
        allClients.splice(i, 1);
        });
        
        socket.on('subs',subs => {
            io.to(roomId).emit('createSubs',subs);
        });
        
    });
});
server.listen(8080);
