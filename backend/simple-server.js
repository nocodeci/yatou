const http = require('http');

const server = http.createServer((req, res) => {
  res.writeHead(200, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type'
  });
  
  if (req.url === '/api/mapbox/token') {
    res.end(JSON.stringify({
      token: 'sk.eyJ1IjoieW9oYW4wNzA3IiwiYSI6ImNtZWtwbDRkbDA2Y2IybHM5NjhrMXVucmYifQ.7vbwJ89hanJIWR5U0iAcpA',
      message: 'Token Mapbox récupéré avec succès'
    }));
  } else {
    res.end(JSON.stringify({
      message: 'Serveur Yatou Delivery fonctionnel',
      status: 'running'
    }));
  }
});

server.listen(3001, () => {
  console.log('🚀 Serveur simple démarré sur le port 3001');
  console.log('🌐 URL: http://localhost:3001');
});
