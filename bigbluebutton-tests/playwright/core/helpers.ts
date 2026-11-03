import { env } from 'node:process';
import { format } from 'node:util';

import {
  type APIRequestContext,
  type Browser,
  type ConsoleMessage,
  expect,
  test,
  type TestInfo,
} from '@playwright/test';
import axios, { AxiosResponse } from 'axios';
// This is version 4 of chalk, not version 5, which uses ESM
import chalk from 'chalk';
import * as dotenv from 'dotenv';
import sha from 'sha.js';
import * as xml2js from 'xml2js';

import { MultiUsers } from '../user/multiusers';
import { Page } from './page';
import { parameters } from './parameters';

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
  recordVideo?: boolean;
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

// The algorithms bbb-web accepts by default (supportedChecksumAlgorithms).
export const CHECKSUM_ALGORITHMS = ['sha1', 'sha256', 'sha384', 'sha512'] as const;
export type ChecksumAlgorithm = (typeof CHECKSUM_ALGORITHMS)[number];

const isChecksumAlgorithm = (value: string): value is ChecksumAlgorithm =>
  (CHECKSUM_ALGORITHMS as readonly string[]).includes(value);

export function getChecksum(text: string, secret: string, forcedAlgorithm?: ChecksumAlgorithm): string {
  let algorithm = forcedAlgorithm ?? (process.env.CHECKSUM || '').toLowerCase();
  if (!isChecksumAlgorithm(algorithm)) {
    switch (secret.length) {
      case 128:
        algorithm = 'sha512';
        break;
      case 96:
        algorithm = 'sha384';
        break;
      case 64:
        algorithm = 'sha256';
        break;
      case 40:
      default:
        algorithm = 'sha1';
    }
  }

  return sha(algorithm as ChecksumAlgorithm)
    .update(text)
    .digest('hex');
}

export function getRandomInt(min: number, max: number): number {
  const minCeiled = Math.ceil(min);
  const maxFloored = Math.floor(max);
  return Math.floor(Math.random() * (maxFloored - minCeiled)) + minCeiled;
}

interface ApiCallUrlOptions {
  algorithm?: ChecksumAlgorithm;
  // The call name the checksum is computed for; another name than `name` gives
  // a checksum that is valid for a different call.
  signedAs?: string;
}

export function getApiCallUrl(
  name: string,
  callParams: Record<string, string> | null,
  { algorithm, signedAs = name }: ApiCallUrlOptions = {},
): string {
  const { secret } = parameters;
  if (!secret) {
    throw new Error('BBB_SECRET environment variable is required');
  }
  const query = callParams ? new URLSearchParams(callParams).toString() : '';
  const apiCall = `${signedAs}${query}${secret}`;
  const checksum = getChecksum(apiCall, secret, algorithm);
  const url = `${parameters.server}/api/${name}?${query}&checksum=${checksum}`;
  return url;
}

// An element as parsed by xml2js: every child is an array of text or elements
export interface XmlElement {
  [name: string]: (string | XmlElement)[] | undefined;
}

export interface ApiCallResult {
  status: number;
  // Redirect target (join answers most errors with a redirect)
  location?: string;
  // The `errors` list such a redirect carries in its query string
  redirectErrors?: { key: string; message: string }[];
  // The parsed <response> element
  response: XmlElement;
}

// GET an API URL through Playwright's request context without following
// redirects, asking for XML.
export async function requestApiCall(request: APIRequestContext, url: string): Promise<ApiCallResult> {
  const res = await request.get(url, { maxRedirects: 0, headers: { Accept: 'application/xml' } });
  const { location } = res.headers();
  const errors = location ? new URL(location).searchParams.get('errors') : null;
  const body = await res.text();
  const parsed = body.trim().startsWith('<') ? await xml2js.parseStringPromise(body) : {};
  return {
    status: res.status(),
    location,
    redirectErrors: errors ? JSON.parse(errors) : undefined,
    response: parsed.response ?? {},
  };
}

// Ends the given meetings so a test leaves none running.
export async function endMeetings(request: APIRequestContext, meetingIDs: string[]): Promise<void> {
  await Promise.all(meetingIDs.map((meetingID) => request.get(getApiCallUrl('end', { meetingID }))));
}

// Meetings created while a test runs. The test fixture ends them once the test is over,
// so they do not stay on the server until they expire.
const meetingsCreatedByTest: string[] = [];

export function startTrackingCreatedMeetings(): void {
  meetingsCreatedByTest.length = 0;
}

export async function endMeetingsCreatedByTest(): Promise<void> {
  const meetingIDs = meetingsCreatedByTest.splice(0);
  await Promise.all(
    meetingIDs.map((meetingID) =>
      axios
        .get(getApiCallUrl('end', { meetingID }), { adapter: 'http' })
        .catch((error: Error) => console.warn(`could not end meeting ${meetingID} after the test: ${error.message}`)),
    ),
  );
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
    `name=${encodeURIComponent(meetingID)}&meetingID=${encodeURIComponent(meetingID)}` +
    `&attendeePW=${ap}&moderatorPW=${mp}` +
    `&allowStartStopRecording=true&autoStartRecording=false` +
    `&welcome=${parameters.welcome}`;
  // A key the caller passes replaces the default: bbb-web refuses a repeated one.
  const overridden = new Set((createParameter ?? '').split('&').map((pair) => pair.split('=')[0]));
  const defaults = baseQuery
    .split('&')
    .filter((pair) => !overridden.has(pair.split('=')[0]))
    .join('&');
  const query = createParameter !== undefined ? `${defaults}&${createParameter}` : baseQuery;
  const apiCall = `create${query}${parameters.secret}`;
  const checksum = getChecksum(apiCall, parameters.secret!);
  const url = `${parameters.server}/api/create?${query}&checksum=${checksum}`;
  return url;
}

export function createMeetingPromise(
  createParameter?: string,
  customMeetingId?: string,
  createModules?: string,
): Promise<AxiosResponse> {
  const url = createMeetingUrl(createParameter, customMeetingId);
  // Modules (e.g. clientSettingsOverride) travel in the POST body; the
  // checksum covers the query string either way.
  if (createModules !== undefined) {
    return axios.post(url, createModules, {
      adapter: 'http',
      headers: { 'Content-Type': 'application/xml' },
    });
  }
  return axios.get(url, { adapter: 'http' });
}

export async function createMeeting(
  createParameter?: string,
  customMeetingId?: string,
  createModules?: string,
): Promise<string> {
  const promise = createMeetingPromise(createParameter, customMeetingId, createModules);
  const response = await promise;
  expect(response.status).toEqual(200);
  const xmlResponse = await xml2js.parseStringPromise(response.data);
  meetingsCreatedByTest.push(xmlResponse.response.meetingID[0]);
  return xmlResponse.response.meetingID[0];
}

// Create a meeting sending an xml `<modules>` payload in the POST body (e.g.
// sharedNotesInitialContentJson / sharedNotesInitialContentMarkdown). The checksum
// only covers the query string, so createMeetingUrl still yields a valid URL.
export async function createMeetingWithModules(
  modulesXml: string,
  createParameter?: string,
  customMeetingId?: string,
): Promise<string> {
  const url = createMeetingUrl(createParameter, customMeetingId);
  const response = await axios.post(url, modulesXml, {
    adapter: 'http',
    headers: { 'Content-Type': 'application/xml' },
  });
  expect(response.status).toEqual(200);
  const xmlResponse = await xml2js.parseStringPromise(response.data);
  meetingsCreatedByTest.push(xmlResponse.response.meetingID[0]);
  return xmlResponse.response.meetingID[0];
}

export function getJoinURL({ meetingID, fullName, options }: GetJoinUrlProp): string {
  const { isModerator, joinParameter, skipSessionDetailsModal } = options || {};

  const pw = isModerator ? parameters.moderatorPW : parameters.attendeePW;
  const shouldSkipSessionDetailsModal = skipSessionDetailsModal
    ? '&userdata-bbb_show_session_details_on_join=false'
    : ''; // default value in settings.yml is true
  // The checksum covers the query string as the server receives it, so values
  // have to be encoded here - a fullName with a space yields a checksumError.
  const baseQuery = `fullName=${encodeURIComponent(fullName)}&meetingID=${encodeURIComponent(meetingID)}`
    + `&password=${pw}${shouldSkipSessionDetailsModal}`; // prettier-ignore
  const query = joinParameter !== undefined ? `${baseQuery}&${joinParameter}` : baseQuery;
  const apiCall = `join${query}${parameters.secret}`;
  const checksum = getChecksum(apiCall, parameters.secret!);
  return `${parameters.server}/api/join?${query}&checksum=${checksum}`;
}

async function sanitizeLog(
  msg: ConsoleMessage,
  { colorize, drop_references }: { colorize?: boolean; drop_references?: boolean } = {},
): Promise<string> {
  // A navigation (page.reload) destroys the execution context mid-flight;
  // degrade to the arg's string form instead of failing the test from a
  // fire-and-forget console listener.
  const args = await Promise.all(msg.args().map((itm) => itm.jsonValue().catch(() => String(itm))));

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
  const { isMultiUser, createParameter, joinParameter, testInfo, recordVideo } = initOptions || {};
  const context = await browser.newContext(recordVideo ? { recordVideo: { dir: 'test-results/' } } : {});
  const page = await context.newPage();
  await testInstance.initModPage(page, { createParameter, joinParameter, testInfo });
  if (isMultiUser) await testInstance.initUserPage(context, { createParameter, joinParameter, testInfo });
}
