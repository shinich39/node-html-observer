let isReconnection = false;

function connect() {
  console.log("Connecting to observer...");

  const socket = new WebSocket();

  socket.addEventListener("open", (event) => {
    console.log("Successfully connected to the observer.");
    if (!isReconnection) {
      isReconnection = true;
    } else {
      window.location.reload();
    }
  });

  socket.addEventListener("close", (event) => {
    setTimeout(function() {
      connect();
    }, 256);
  });

  socket.addEventListener("error", (event) => {
    socket.close();
  });

  socket.addEventListener("message", (event) => {
    console.log("Message from observer ", event.data);
  });
}

connect();