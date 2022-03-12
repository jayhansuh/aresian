const express = require('express');
const webpack = require('webpack');
const webpackDevMiddleware = require('webpack-dev-middleware');
const socketio = require('socket.io');

//const Game = require('./game');
const users = {};
const webpackConfig = require('../bundler/webpack.dev.js');

// Setup an Express server
const app = express();
app.use(express.static('static'));

// if (process.env.NODE_ENV === 'development') {
//   // Setup Webpack for development
//   const compiler = webpack(webpackConfig);
//   app.use(webpackDevMiddleware(compiler));
// } else {
//   // Static serve the dist/ folder in production
//   app.use(express.static('dist'));
// }
app.use(express.static('dist'));

// Listen on port
const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
    console.log(`Server listening on port ${port}`)
});

// Setup socket.io
const io = socketio(server);

// Listen for socket.io connections
io.on('connection', socket => {
    console.log('Player connected!', socket.id);
    users[socket.id] = { 'socket' : socket };
    
    //let other players know the user has connected
    //io.emit('add_user', socket.id);

    //update player state as requested and braodcast to other players
    socket.on('set', ({attr,val}) => {
        if(users[socket.id] && attr) {
            users[socket.id][attr] = val;
            io.emit('set', {id: socket.id, attr: attr, val: val});
        }
    });

    socket.on('disconnect', () =>{
        console.log('Player disconnected!', socket.id);
        delete users[socket.id];
        io.emit('removeNeighbor', socket.id);
        console.log('Remaining players', Object.keys(users));
    });
});