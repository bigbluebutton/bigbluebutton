import express, { Request, Response } from 'express';
import util from 'util';
import { redisMessageFactory } from './imports/redisMessageFactory';
import { DEBUG, SERVER_HOST, SERVER_PORT } from './config';
import { createRedisClient } from './imports/redis';


// Initialize the application
const app = express();
app.use(express.json());

// Create and configure Redis client
const redisClient = createRedisClient();

// Define a route to handle action submissions
app.post('/', async (req: Request, res: Response) => {
  try {
    const { action: { name: actionName }, input, session_variables: sessionVariables } = req.body;
    const { eventName, routing, header, body } = await redisMessageFactory.buildMessage(sessionVariables, actionName, input);
    
    const redisPayload = {
      envelope: {
        name: eventName,
        routing,
        timestamp: Date.now(),
      },
      core: { header, body },
    };
    
    if( DEBUG ) {
      console.log(util.inspect({
        input: { actionName, input, sessionVariables },
        output: { redisPayload },
      }, { depth: null, colors: true }));
    }
    

    // Publish the constructed payload to Redis
    await redisClient.publish('to-akka-apps-redis-channel', JSON.stringify(redisPayload));
    
    // Send a success response
    res.status(200).json(true);
    
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

// Start the server once the Redis client has connected
redisClient.on('connect', () => {
  app.listen(SERVER_PORT, SERVER_HOST, () => {
    console.log(`Server is running on ${SERVER_HOST}:${SERVER_PORT}`);
  });
});

// Establish a connection between the Redis client and the Redis server
redisClient.connect();

