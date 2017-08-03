import net from "net";
import {http} from "./http";

const PORT = 5000 || process.env.PORT;
const ADDRESS = "127.0.0.1" || process.env.ADDRESS;

const normalizeData = (data) => data.replace(/\r\n/g,"\n")
const onData = (socket) => (data) => socket.write(http(normalizeData(data)));

const onClientConnected = (socket) => {
  socket.setEncoding("utf8");
  socket.on("data", onData(socket));
}

const server = net.createServer(onClientConnected);
server.on("listening", () => console.log(`Listening on ${ADDRESS}:${PORT}`));
server.listen(PORT, ADDRESS);
