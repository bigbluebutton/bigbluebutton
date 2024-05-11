import express, { Request, Response } from 'express';
import util from 'util';
import { redisMessageFactory } from './imports/redisMessageFactory';
import { DEBUG, SERVER_HOST, SERVER_PORT, MAX_BODY_SIZE } from './config';
import { createRedisClient } from './imports/redis';
import { ValidationError } from './types/ValidationError';

// Initialize Express Application
const app = express();
app.use(express.json({ limit: MAX_BODY_SIZE }));

// Create and configure Redis client
const redisClient = createRedisClient();

/**
 * Handles action submissions and publishes them to Redis.
 */
app.post('/', async (req: Request, res: Response) => {
  try {
    // Destructure relevant information from the request body.
    const { action: { name: actionName }, input, session_variables: sessionVariables } = req.body;


    if(DEBUG) {
      console.debug('-------------------------------------------');
      console.debug(actionName);
      console.debug(sessionVariables);
    }

    // Build message using received information.
    const {
      eventName,
      routing,
      header,
      body
    } = await redisMessageFactory.buildMessage(sessionVariables, actionName, input);

    // Construct payload to be sent to Redis.
    const redisPayload = {
      envelope: {
        name: eventName,
        routing,
        timestamp: Date.now(),
      },
      core: { header, body },
    };

    // If in debug mode, log the input and output information.
    if(DEBUG) {
      console.log(util.inspect({
        input: { actionName, input, sessionVariables },
        output: { redisPayload },
      }, { depth: null, colors: true }));
    }

    // Publish the constructed payload to Redis.
    if(actionName == 'userThirdPartyInfoResquest') {
      await redisClient.publish('to-third-party-redis-channel', JSON.stringify(redisPayload));
    } else {
      await redisClient.publish('to-akka-apps-redis-channel', JSON.stringify(redisPayload));
    }

    // Send a success response.
    res.status(200).json(true);

  } catch (error) {
    if (error instanceof ValidationError) {
      res.status(error.status).send({message: error.message});
    } else {
      console.error(error);
      res.status(400).send({message: 'Internal Server Error'});
    }
  }
});

// Start the server and establish a connection to Redis.
const startServer = () => {
  console.info("Starting server");
  app.listen(SERVER_PORT, SERVER_HOST, () => {
    console.log(`Server is running on ${SERVER_HOST}:${SERVER_PORT}`);
    console.info("Waiting for Redis connection");
    redisClient.connect();
  });
}

// Redis Client Event Listeners
redisClient.on('connect', () => console.info("Connected with Redis"));
redisClient.on('disconnect', () => console.info("Disconnected from Redis"));

if(DEBUG) {
  console.log('Debug mode Enabled!');
}

// Start the Server and Redis client.
startServer();
