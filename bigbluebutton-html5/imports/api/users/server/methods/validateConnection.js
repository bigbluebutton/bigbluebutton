import { Client } from 'pg';
import upsertValidationState from '/imports/api/auth-token-validation/server/modifiers/upsertValidationState';
import { ValidationStates } from '/imports/api/auth-token-validation';
import userJoin from '/imports/api/users/server/handlers/userJoin';
import Users from '/imports/api/users';

import createDummyUser from '../modifiers/createDummyUser';
import updateUserConnectionId from '../modifiers/updateUserConnectionId';

async function validateConnection(requesterToken, meetingId, userId) {
  try {
    const client = new Client({
      host: 'localhost',
      port: 5432,
      database: 'bbb_graphql',
      user: 'bbb_frontend',
      password: 'bbb_frontend',
      query_timeout: 30000,
    });

    await client.connect();

    const res = await client.query('select "meetingId", "userId" from v_user_connection_auth where "authToken" = $1', [requesterToken]);

    if (res.rows.length === 0) {
      await upsertValidationState(
        meetingId,
        userId,
        ValidationStates.INVALID,
        this.connection.id,
      );
    } else {
      const sessionId = `${meetingId}--${userId}`;
      this.setUserId(sessionId);
      await upsertValidationState(
        meetingId,
        userId,
        ValidationStates.VALIDATED,
        this.connection.id,
      );

      const User = await Users.findOneAsync({
        meetingId,
        userId,
      });

      if (!User) {
        await createDummyUser(meetingId, userId, requesterToken);
      } else {
        await updateUserConnectionId(meetingId, userId, this.connection.id);
      }
      userJoin(meetingId, userId, requesterToken);
    }
    await client.end();
  } catch (e) {
    await upsertValidationState(
      meetingId,
      userId,
      ValidationStates.INVALID,
      this.connection.id,
    );
  }
}

export default validateConnection;
