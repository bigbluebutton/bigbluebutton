import { expect, test } from '@playwright/test';

import { outage } from './util';

test.describe('reconnection packet-filter cleanup', () => {
  test('cleans the inserted TCP rule when UDP insertion fails', async () => {
    const commands: string[] = [];
    await expect(
      outage(
        0.001,
        { media: true },
        {
          runCommand: async (command) => {
            commands.push(command);
            if (command.includes('-I OUTPUT') && command.includes('-p udp'))
              throw new Error('injected insertion failure');
          },
          getSessions: async () => [],
          killSessions: async () => undefined,
        },
      ),
    ).rejects.toThrow('injected insertion failure');
    expect(commands.filter((command) => command.includes('-D OUTPUT'))).toEqual([expect.stringContaining('-p tcp')]);
  });

  test('cleans every inserted rule after callback failure', async () => {
    const commands: string[] = [];
    await expect(
      outage(
        0.001,
        {
          media: true,
          duringOutage: async () => {
            throw new Error('injected callback failure');
          },
        },
        {
          runCommand: async (command) => {
            commands.push(command);
          },
          getSessions: async () => [],
          killSessions: async () => undefined,
        },
      ),
    ).rejects.toThrow('injected callback failure');
    expect(commands.filter((command) => command.includes('-D OUTPUT'))).toEqual([
      expect.stringContaining('-p udp'),
      expect.stringContaining('-p tcp'),
    ]);
  });
});
