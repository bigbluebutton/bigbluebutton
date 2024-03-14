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
      host: process.env.POSTGRES_HOST || Meteor.settings.private.postgresql.host,
      port: process.env.POSTGRES_PORT || Meteor.settings.private.postgresql.port,
      database: process.env.POSTGRES_HOST || Meteor.settings.private.postgresql.database,
      user: process.env.POSTGRES_USER || Meteor.settings.private.postgresql.user,
      password: process.env.POSTGRES_PASSWORD || Meteor.settings.private.postgresql.password,
      query_timeout: process.env.POSTGRES_TIMEOUT || Meteor.settings.private.postgresql.timeout,
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
