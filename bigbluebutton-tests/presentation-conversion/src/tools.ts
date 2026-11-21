import fs from 'fs';
import { commandVersion, run } from './host';

/** Versions of everything that shapes conversion output; printed in the summary so two runs can be compared. */
export async function toolVersions(): Promise<Record<string, string>> {
  const out: Record<string, string> = {};
  const pkgs = ['bbb-web', 'bbb-libreoffice-docker', 'poppler-utils', 'libcairo2', 'imagemagick', 'ghostscript', 'libreoffice-core'];
  const r = await run('dpkg-query', ['-W', '-f', '${Package}\t${Version}\n', ...pkgs], { timeoutMs: 15_000 });
  for (const line of r.stdout.split('\n')) {
    const [p, v] = line.split('\t');
    if (p && v) out[p] = v;
  }
  out.pdftocairo = await commandVersion('pdftocairo', ['-v']);
  out.imagemagick = await commandVersion('convert', ['-version']);
  try {
    out['bbb-release'] = fs.readFileSync('/etc/bigbluebutton/bigbluebutton-release', 'utf8').trim();
  } catch {
    out['bbb-release'] = 'unknown';
  }
  try {
    const os = fs.readFileSync('/etc/os-release', 'utf8');
    out.os = os.match(/^PRETTY_NAME="?(.*?)"?$/m)?.[1] ?? 'unknown';
  } catch {
    out.os = 'unknown';
  }
  out.node = process.version;
  return out;
}
