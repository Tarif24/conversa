import { createServer } from 'http';
import { Server } from 'socket.io';

const server = createServer();
const io = new Server(server);
const PORT = process.env.PORT || 5000;

io.on('connection', socket => {
  console.log('A user connected');

  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
