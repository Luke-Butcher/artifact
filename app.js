const express = require('express');
const server = express();
const port = 8080;

server.get("/", (req, res) => {
    res.sendFile(__dirname + '/public/pages/index.html');
});

server.listen(port, () => {
    console.log(`Server listening at ${port}`);
});

