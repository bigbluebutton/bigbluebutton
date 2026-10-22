import { BbbApi, isSuiteMeeting } from '../api';
import { loadTarget } from '../env';

/**
 * Prints the running meetings that this suite did not create; used before restarting bbb-web on a shared server.
 * Exits 2 when getMeetings fails, so a failed call never reads as a server without meetings.
 */
async function main(): Promise<void> {
  const api = new BbbApi(loadTarget());
  for (const m of await api.meetings()) if (!isSuiteMeeting(m)) console.log(m.meetingID);
}

main().catch((e) => {
  console.error(e.message ?? e);
  process.exit(2);
});
