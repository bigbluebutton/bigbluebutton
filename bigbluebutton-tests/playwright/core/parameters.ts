import * as dotenv from 'dotenv';

dotenv.config();

const bbbUrl: string | undefined = process.env.BBB_URL;

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
  welcome: '%3Cbr%3EWelcome+to+%3Cb%3E%25%25CONFNAME%25%25%3C%2Fb%3E%21',
  fullName: 'User1',
  moderatorPW: 'mp',
  attendeePW: 'ap',
  hostname: bbbUrl ? new URL(bbbUrl).hostname : undefined,
};
