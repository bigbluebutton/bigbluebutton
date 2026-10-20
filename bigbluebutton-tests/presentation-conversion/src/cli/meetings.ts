import { BbbApi } from '../api';
import { loadTarget } from '../env';

/** Prints the running meetings that this suite did not create; used before restarting bbb-web on a shared server. */
async function main(): Promise<void> {
  const api = new BbbApi(loadTarget());
  const foreign = (await api.meetingIds()).filter((id) => !id.startsWith('pc-'));
  for (const id of foreign) console.log(id);
}

main().catch((e) => {
  console.error(e.message ?? e);
  process.exit(2);
});
