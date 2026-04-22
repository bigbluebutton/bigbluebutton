import { env } from 'node:process';
import { format } from 'node:util';

import { type Browser, type ConsoleMessage, expect, test, type TestInfo } from '@playwright/test';
import axios, { AxiosResponse } from 'axios';
// This is version 4 of chalk, not version 5, which uses ESM
import * as chalk from 'chalk';
import * as dotenv from 'dotenv';
import sha from 'sha.js';
import * as xml2js from 'xml2js';

import { MultiUsers } from '../user/multiusers';
import { Page } from './page';
import { parameters } from './parameters';
import { runScript } from './util';

dotenv.config();

interface ErrorInfo {
  type: 'error' | 'pageerror';
  timestamp: string;
  text: string;
  stack?: string;
  user: string;
}

interface ConsoleOptions {
  colorize?: boolean;
  drop_references?: boolean;
  drop_timestamps?: boolean;
  line_label?: string;
}

interface InitOptions {
  isMultiUser?: boolean;
  createParameter?: string;
  joinParameter?: string;
  testInfo?: TestInfo;
}

interface GetJoinUrlProp {
  meetingID: string;
  fullName: string;
  options?: {
    isModerator?: boolean;
    joinParameter?: string;
    skipSessionDetailsModal?: boolean;
  };
}

export function getChecksum(text: string, secret: string): string {
  let algorithm = (process.env.CHECKSUM || '').toLowerCase();
  if (!['sha1', 'sha256', 'sha512'].includes(algorithm)) {
    switch (secret.length) {
      case 128:
        algorithm = 'sha512';
        break;
      case 64:
        algorithm = 'sha256';
        break;
      case 40:
      default:
        algorithm = 'sha1';
    }
  }

  return sha(algorithm as 'sha1' | 'sha256' | 'sha512')
    .update(text)
    .digest('hex');
}

export function getRandomInt(min: number, max: number): number {
  const minCeiled = Math.ceil(min);
  const maxFloored = Math.floor(max);
  return Math.floor(Math.random() * (maxFloored - minCeiled)) + minCeiled;
}

export function getApiCallUrl(name: string, callParams: Record<string, string> | null): string {
  const { secret } = parameters;
  if (!secret) {
    throw new Error('BBB_SECRET environment variable is required');
  }
  const query = callParams ? new URLSearchParams(callParams).toString() : '';
  const apiCall = `${name}${query}${secret}`;
  const checksum = getChecksum(apiCall, secret);
  const url = `${parameters.server}/api/${name}?${query}&checksum=${checksum}`;
  return url;
}

export async function apiCall<T = unknown>(
  name: string,
  callParams?: Record<string, string>,
): Promise<AxiosResponse<T>> {
  const url = getApiCallUrl(name, callParams || null);
  const response = await axios.get<T>(url, { adapter: 'http' });
  const parsedData = typeof response.data === 'string' ? await xml2js.parseStringPromise(response.data) : response.data;
  return {
    ...response,
    data: parsedData,
  };
}

export function createMeetingUrl(createParameter?: string, customMeetingId?: string): string {
  const meetingID = customMeetingId || `random-${getRandomInt(1000000, 10000000).toString()}`;
  const mp = parameters.moderatorPW;
  const ap = parameters.attendeePW;
  const baseQuery =
    `name=${meetingID}&meetingID=${meetingID}&attendeePW=${ap}&moderatorPW=${mp}` +
    `&allowStartStopRecording=true&autoStartRecording=false&welcome=${parameters.welcome}`;
  const query = createParameter !== undefined ? `${baseQuery}&${createParameter}` : baseQuery;
  const apiCall = `create${query}${parameters.secret}`;
  const checksum = getChecksum(apiCall, parameters.secret!);
  const url = `${parameters.server}/api/create?${query}&checksum=${checksum}`;
  return url;
}

export function createMeetingPromise(createParameter?: string, customMeetingId?: string): Promise<AxiosResponse> {
  const url = createMeetingUrl(createParameter, customMeetingId);
  return axios.get(url, { adapter: 'http' });
}

export async function createMeeting(createParameter?: string, customMeetingId?: string): Promise<string> {
  const promise = createMeetingPromise(createParameter, customMeetingId);
  const response = await promise;
  expect(response.status).toEqual(200);
  const xmlResponse = await xml2js.parseStringPromise(response.data);
  return xmlResponse.response.meetingID[0];
}

export function getJoinURL({ meetingID, fullName, options }: GetJoinUrlProp): string {
  const { isModerator, joinParameter, skipSessionDetailsModal } = options || {};

  const pw = isModerator ? parameters.moderatorPW : parameters.attendeePW;
  const shouldSkipSessionDetailsModal = skipSessionDetailsModal
    ? '&userdata-bbb_show_session_details_on_join=false'
    : ''; // default value in settings.yml is true
  const baseQuery = `fullName=${fullName}&meetingID=${meetingID}`
    + `&password=${pw}${shouldSkipSessionDetailsModal}`; // prettier-ignore
  const query = joinParameter !== undefined ? `${baseQuery}&${joinParameter}` : baseQuery;
  const apiCall = `join${query}${parameters.secret}`;
  const checksum = getChecksum(apiCall, parameters.secret!);
  return `${parameters.server}/api/join?${query}&checksum=${checksum}`;
}

export async function checkRootPermission(): Promise<void> {
  const checkSudo = await runScript('timeout -k 1 1 sudo id', {
    handleError: () => false,
    handleOutput: (stdout: string) => !!stdout,
    timeout: 5000,
  });
  await expect(
    checkSudo,
    'Sudo failed: need to run this test with root permission (can be fixed by running "sudo -v" and entering the password)',
  ).toBeTruthy();
}

async function sanitizeLog(
  msg: ConsoleMessage,
  { colorize, drop_references }: { colorize?: boolean; drop_references?: boolean } = {},
): Promise<string> {
  const args = await Promise.all(msg.args().map((itm) => itm.jsonValue()));

  // Handle cases where args[0] might be undefined or not a string
  if (!args[0] || typeof args[0] !== 'string') {
    args[0] = String(args[0] || '');
  }

  // For Chrome, args[0] is a format string that we will process using
  // node.js's util.format, but that function discards css style
  // information from "%c" format specifiers.  So first loop over the
  // format string, replacing every "%c" with "%s" and replacing the
  // corresponding css style with an ANSI color sequence.
  //
  // See https://console.spec.whatwg.org/ sections 2.2.1 and 2.3.4

  const split_arg0 = args[0].split('%');
  for (let i = 1, j = 1; i < split_arg0.length; i++, j++) {
    if (split_arg0[i].startsWith('c')) {
      split_arg0[i] = `s${split_arg0[i].substr(1)}`;
      const styles = args[j].split(';');
      args[j] = '';
      for (const style of styles) {
        const stdStyle = style.trim().toLowerCase();
        if (stdStyle.startsWith('color:') && colorize) {
          const color = stdStyle.substring(6).trim();
          args[j] = chalk.keyword(color)('');
        } else if (stdStyle.startsWith('font-size:') && drop_references) {
          // For Chrome, we "drop references" by discarding everything after a font size change
          split_arg0.length = i;
          args.length = j;
        }
      }
    } else if (split_arg0[i] === '') {
      // format is "%%", so don't do special processing for
      // split_arg0[i+1], and only increment i, not j
      i++; // NOSONAR
    }
  }
  args[0] = split_arg0.join('%');

  // see playwright consoleMessage class documentation
  return format(...args);
}

async function console_format(msg: ConsoleMessage | string, CONSOLE_options: ConsoleOptions): Promise<string> {
  let sanitizedLog: string;
  if (typeof msg === 'string') {
    sanitizedLog = msg;
  } else {
    sanitizedLog = await sanitizeLog(msg, {
      colorize: true,
      drop_references: true,
    });
  }

  if (CONSOLE_options.drop_references) {
    // For Firefox, we "drop references" by discarding a URL at the end of the line
    sanitizedLog = sanitizedLog.replace(/https:\/\/\S*$/, '');
  }

  if (CONSOLE_options.drop_timestamps) {
    // timestamp formatting is a bit complicated, with four "%s" fields and corresponding arguments,
    // so just filter them out (if requested) after all the other formatting is done
    sanitizedLog = sanitizedLog.replace(/\[\d\d:\d\d:\d\d:\d\d\d\d\] /, '');
  }

  if (CONSOLE_options.line_label) {
    if (CONSOLE_options.colorize) {
      sanitizedLog = chalk.keyword('green')(CONSOLE_options.line_label) + sanitizedLog;
    } else {
      sanitizedLog = CONSOLE_options.line_label + sanitizedLog;
    }
  }

  return sanitizedLog;
}

export async function setBrowserLogs(pageInstance: Page, forceErrorLogFailure?: boolean): Promise<void> {
  const CONSOLE_strings = env.CONSOLE ? env.CONSOLE.split(',').map((opt) => opt.trim().toLowerCase()) : [];
  const CONSOLE_options: ConsoleOptions = {
    colorize: CONSOLE_strings.includes('color') || CONSOLE_strings.includes('colour'),
    drop_references: CONSOLE_strings.includes('norefs'),
    drop_timestamps: CONSOLE_strings.includes('nots'),
    line_label: CONSOLE_strings.includes('label') ? `${pageInstance.username} ` : undefined,
  };

  pageInstance.page.on('console', async (msg: ConsoleMessage) => {
    let errorInfo: ErrorInfo | null = null;

    if (msg.type() === 'error') {
      errorInfo = {
        type: 'error',
        timestamp: new Date().toISOString(),
        text: msg.text(),
        user: pageInstance.username,
      };

      pageInstance.logger.pageError(errorInfo);
    }

    const sanitizedMessage = await sanitizeLog(msg);
    pageInstance.logger.pageLog(sanitizedMessage);

    if (env.CONSOLE_MONITOR === 'true') {
      const formattedMessage = await console_format(msg, CONSOLE_options);
      console.log(formattedMessage);
    }

    if ((env.CONSOLE_FAIL === 'true' || forceErrorLogFailure) && errorInfo) {
      throw new Error(`Console error detected: ${errorInfo.text}`);
    }
  });

  pageInstance.page.on('pageerror', async (error: Error) => {
    const errorInfo: ErrorInfo = {
      type: 'pageerror',
      timestamp: new Date().toISOString(),
      text: error.message,
      stack: error.stack,
      user: pageInstance.username,
    };

    pageInstance.logger.pageError(errorInfo);

    if (env.CONSOLE_MONITOR === 'true') {
      const formattedErrorLog = await console_format(errorInfo.text, CONSOLE_options);
      console.log(formattedErrorLog);
    }

    if (env.CONSOLE_FAIL === 'true' || forceErrorLogFailure) {
      throw new Error(errorInfo.text);
    }
  });
}

export function linkIssue(issueNumber: number): void {
  test.info().annotations.push({
    type: 'Issue/PR',
    description: `https://github.com/bigbluebutton/bigbluebutton/issues/${issueNumber}`,
  });
}

export async function initializePages(
  testInstance: MultiUsers,
  browser: Browser,
  initOptions?: InitOptions,
): Promise<void> {
  const { isMultiUser, createParameter, joinParameter, testInfo } = initOptions || {};
  const context = await browser.newContext();
  const page = await context.newPage();
  await testInstance.initModPage(page, { createParameter, joinParameter, testInfo });
  if (isMultiUser) await testInstance.initUserPage(context, { createParameter, joinParameter, testInfo });
}
