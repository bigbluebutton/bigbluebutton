import * as dotenv from 'dotenv';

dotenv.config();

const bbbUrl: string | undefined = process.env.BBB_URL;

function parseHostname(url: string | undefined): string | undefined {
  if (!url) return undefined;
  try {
    return new URL(url).hostname;
  } catch {
    console.warn(`Invalid BBB_URL: ${url}`);
    return undefined;
  }
}

export interface ParametersData {
  server: string | undefined;
  secret: string | undefined;
  welcome: string;
  fullName: string;
  moderatorPW: string;
  attendeePW: string;
  hostname: string | undefined;
}

export const parameters: ParametersData = {
  server: bbbUrl,
  secret: process.env.BBB_SECRET,
  welcome: encodeURIComponent('<br>Welcome to <b>%%CONFNAME%%</b>!'),
  fullName: 'User1',
  moderatorPW: 'mp',
  attendeePW: 'ap',
  hostname: parseHostname(bbbUrl),
};
