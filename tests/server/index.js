const server = require('./server');

const PORT = 8000;

server.listen(PORT, () => {
    console.log(`Test server started at localhost:${PORT}`);
});
