// PDF conversion for container deployments, in place of the package's systemd units
// bbb-shared-notes-conversion.socket and bbb-shared-notes-conversion@.service, which have no
// systemd to run them in a container. It does what they do: listen on the socket the notes
// server sends the HTML to (commandExecution.conversionSocket), and for each connection run the
// unit's wkhtmltopdf command with the connection as its stdin and stdout, for at most 30 s
// (RuntimeMaxSec) and 8 connections at a time (MaxConnections). Each connection gets its own
// directory as working directory, HOME and TMPDIR (the unit's PrivateTmp), removed at the end.
// The isolation of the unit (no network, read-only system, own user) is up to the deployment.
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import net from 'node:net';

const socket = '/run/bbb-shared-notes-conversion.sock';
const command = 'wkhtmltopdf -q --disable-local-file-access --encoding utf-8 --dpi 96 --page-size A4 --margin-top 0mm --margin-bottom 0mm --margin-left 0mm --margin-right 0mm --print-media-type --background --no-header-line - out.pdf >/dev/null; cat out.pdf';

const server = net.createServer({ pauseOnConnect: true }, (connection) => {
  connection.on('error', (error) => console.error(`connection: ${error.message}`));
  const dir = fs.mkdtempSync('/tmp/conversion-');
  let ended = false;
  const end = () => {
    if (ended) return;
    ended = true;
    connection.destroy();
    fs.rmSync(dir, { recursive: true, force: true });
  };
  spawn('timeout', ['30', 'sh', '-c', command], {
    cwd: dir,
    env: { ...process.env, HOME: dir, TMPDIR: dir },
    stdio: [connection, connection, 'inherit'],
  })
    .on('error', (error) => {
      console.error(`conversion: ${error.message}`);
      end();
    })
    .on('exit', end);
});
server.maxConnections = 8;

// a socket left from an earlier run would make listen fail
fs.rmSync(socket, { force: true });
server.listen(socket, () => console.log(`listening on ${socket}`));
