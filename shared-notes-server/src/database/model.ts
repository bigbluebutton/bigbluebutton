import postgresConnection from './bbb-postgres';
import { Logger } from '../common/logger';
import { ViewerUser, MeetingLockSettings } from './type';

const logger = new Logger('Database Model');

/**
 * Fetches all viewers (users with role 'VIEWER') in a meeting by internal meeting ID.
 * Uses the v_user view joined with v_user_sessionToken to get session information.
 * Only returns users currently in the meeting with active sessions.
 *
 * @param meetingId - The internal meeting ID
 * @returns Promise<ViewerUser[]> - Array of viewer users with limited fields
 */
export async function fetchViewersByMeetingId(meetingId: string): Promise<ViewerUser[]> {
  try {
    const query = `
      SELECT
        u."userId",
        u."name",
        u."extId",
        u."role",
        u."disconnected",
        ust."sessionToken"
      FROM "v_user" u
      JOIN "v_user_sessionToken" ust
        ON u."meetingId" = ust."meetingId"
        AND u."userId" = ust."userId"
      WHERE u."meetingId" = $1
        AND u."role" = 'VIEWER'
        AND ust."removedAt" IS NULL
      ORDER BY u."name" ASC, u."userId" ASC
    `;

    const result = await postgresConnection.query(query, [meetingId]);

    logger.debug(`Fetched ${result.rows.length} viewers for meeting ${meetingId}`);

    return result.rows as ViewerUser[];
  } catch (error) {
    logger.error(`Error fetching viewers for meeting ${meetingId}`, error as Error);
    throw error;
  }
}

/**
 * Fetches the lock settings for a meeting, specifically the disableNotes setting.
 * Uses the v_meeting_lockSettings view.
 *
 * @param meetingId - The internal meeting ID
 * @returns Promise<MeetingLockSettings | null> - Meeting lock settings or null if not found
 */
export async function fetchMeetingLockSettings(meetingId: string): Promise<MeetingLockSettings | null> {
  try {
    const query = `
      SELECT
        "meetingId",
        "disableNotes"
      FROM "v_meeting_lockSettings"
      WHERE "meetingId" = $1
    `;

    const result = await postgresConnection.query(query, [meetingId]);

    if (result.rows.length === 0) {
      logger.debug(`No lock settings found for meeting ${meetingId}`);
      return null;
    }

    logger.debug(`Fetched lock settings for meeting ${meetingId}`);

    return result.rows[0] as MeetingLockSettings;
  } catch (error) {
    logger.error(`Error fetching lock settings for meeting ${meetingId}`, error as Error);
    throw error;
  }
}

/**
 * Fetches lock settings for all active meetings.
 * Uses the v_meeting_lockSettings view.
 *
 * @returns Promise<MeetingLockSettings[]> - Array of meeting lock settings
 */
export async function fetchAllMeetingLockSettings(): Promise<MeetingLockSettings[]> {
  try {
    const query = `
      SELECT
        "meetingId",
        "disableNotes"
      FROM "v_meeting_lockSettings"
    `;

    const result = await postgresConnection.query(query);

    logger.debug(`Fetched lock settings for ${result.rows.length} meetings`);

    return result.rows as MeetingLockSettings[];
  } catch (error) {
    logger.error('Error fetching all meeting lock settings', error as Error);
    throw error;
  }
}
