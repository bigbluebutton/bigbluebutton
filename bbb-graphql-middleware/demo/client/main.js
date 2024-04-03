const WebSocket = require('ws');
//const ws = new WebSocket("wss://bbb-graphql-test-server.bbb.imdt.dev/v1/graphql", ['graphql-ws'], {
const ws = new WebSocket("ws://127.0.0.1:8378/v1/graphql", ['graphql-ws'], {
    headers: {
        "Cookie": "JSESSIONID=C98F5E0FE417223BB0DE764D37E1B26D; sessionID="
    }
});

 
ws.onmessage = (event) => {
    console.log(`Received: ${event.data}`);
}

ws.onclose = (event) => {
    console.log(`Closed: ${event.reason}`);
    process.exit(0);
}

ws.onopen = (event) => {
    const num = new Date().getTime();
    let msg = 0;

    ws.send(`{"type":"connection_init","payload":{"headers":{"X-Session-Token":"ma1cxfxtzy0ouzpy"}}}	`);

    const query = `subscription {
        user(where: {joined: {_eq: true}}, order_by: {name: asc}) {
          userId
          __typename
        }
      }`;
      
      const payload = { variables:{}, extensions: {}, query: query };
    //   console.log(`Sending: ${JSON.stringify(payload)}`);
      ws.send(JSON.stringify({id:"1", type: "start", payload }));
      
}

// Close the node process in a random time (to simulate disconnections in different moments)
const min = 100
const max = 5000

setTimeout(() => {process.exit(0)}, Math.floor(Math.random() * (max - min + 1) + min))


