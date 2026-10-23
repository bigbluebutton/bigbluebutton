import { execFile } from 'child_process';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);

export interface ExecResult {
  code: number;
  stdout: string;
  stderr: string;
}

export async function run(cmd: string, args: string[], opts: { timeoutMs?: number; input?: string } = {}): Promise<ExecResult> {
  try {
    const { stdout, stderr } = await execFileAsync(cmd, args, {
      timeout: opts.timeoutMs ?? 60_000,
      maxBuffer: 256 * 1024 * 1024,
      encoding: 'utf8',
    });
    return { code: 0, stdout, stderr };
  } catch (e: any) {
    return { code: typeof e.code === 'number' ? e.code : 1, stdout: e.stdout ?? '', stderr: e.stderr ?? String(e.message) };
  }
}

export async function bash(script: string, timeoutMs = 60_000): Promise<ExecResult> {
  return run('bash', ['-c', script], { timeoutMs });
}

export function shellQuote(s: string): string {
  return `'${s.replace(/'/g, `'\\''`)}'`;
}

export async function sudo(args: string[], timeoutMs = 60_000): Promise<ExecResult> {
  return run('sudo', ['-n', ...args], { timeoutMs });
}

export async function canReadDir(dir: string): Promise<boolean> {
  try {
    await fs.promises.readdir(dir);
    return true;
  } catch {
    return false;
  }
}

export async function listDir(dir: string): Promise<string[]> {
  try {
    return await fs.promises.readdir(dir);
  } catch (e: any) {
    if (e.code === 'ENOENT') return [];
    if (e.code === 'EACCES') {
      const r = await sudo(['ls', '-1A', dir]);
      return r.code === 0 ? r.stdout.split('\n').filter(Boolean) : [];
    }
    throw e;
  }
}

export async function statSize(file: string): Promise<number | null> {
  try {
    return (await fs.promises.stat(file)).size;
  } catch (e: any) {
    if (e.code === 'ENOENT') return null;
    if (e.code === 'EACCES') {
      const r = await sudo(['stat', '-c', '%s', file]);
      return r.code === 0 ? Number(r.stdout.trim()) : null;
    }
    throw e;
  }
}

export async function readFileBytes(file: string): Promise<Buffer> {
  try {
    return await fs.promises.readFile(file);
  } catch (e: any) {
    if (e.code !== 'EACCES') throw e;
    const r = await new Promise<Buffer>((resolve, reject) => {
      execFile('sudo', ['-n', 'cat', file], { encoding: 'buffer', maxBuffer: 512 * 1024 * 1024 }, (err, stdout) =>
        err ? reject(err) : resolve(stdout as Buffer),
      );
    });
    return r;
  }
}

export async function copyTree(src: string, dest: string): Promise<void> {
  await fs.promises.mkdir(path.dirname(dest), { recursive: true });
  const r = await run('cp', ['-a', src, dest], { timeoutMs: 120_000 });
  if (r.code === 0) return;
  const owner = `${process.getuid?.()}:${process.getgid?.()}`;
  for (const args of [['rm', '-rf', dest], ['cp', '-a', src, dest], ['chown', '-R', owner, dest], ['chmod', '-R', 'u+rwX', dest]]) {
    const s = await sudo(args, 120_000);
    if (s.code !== 0) throw new Error(`copy ${src} -> ${dest} failed at sudo ${args[0]}: ${s.stderr.trim()}`);
  }
}

export async function commandVersion(cmd: string, args: string[]): Promise<string> {
  const r = await run(cmd, args, { timeoutMs: 15_000 });
  return (r.stdout || r.stderr).split('\n')[0].trim() || 'unknown';
}
