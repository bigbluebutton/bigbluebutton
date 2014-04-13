postal = require('postal')
{SocketIoMessageHandler} = require './lib/clientproxy'
crypto = require 'crypto'

io = require('socket.io').listen(3019)
sio = new SocketIoMessageHandler(io)








