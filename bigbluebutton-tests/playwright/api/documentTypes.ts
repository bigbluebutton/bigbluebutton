import { type APIRequestContext, expect, type Page as PlaywrightPage, type TestInfo } from '@playwright/test';
import axios from 'axios';
import { readFileSync } from 'fs';
import path from 'path';

import { ELEMENT_WAIT_LONGER_TIME } from '../core/constants';
import { readRows } from '../core/graphql';
import { createMeeting, endMeetings, getApiCallUrl } from '../core/helpers';
import { MultiUsers } from '../user/multiusers';

const PRESENTATIONS = 'subscription { pres_presentation { name } }';

// A one-page PDF the server accepts, and a minimal SVG, both sent inline.
const pdfBase64 = readFileSync(path.join(__dirname, '../core/media/sample-with-mask.pdf')).toString('base64');
const svgBase64 = Buffer.from(
  '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"><rect width="10" height="10"/></svg>',
).toString('base64');

function documentsXml(documents: { name: string; base64: string }[]) {
  const docs = documents.map(({ name, base64 }) => `<document name="${name}">${base64}</document>`).join('');
  return `<modules><module name="presentation">${docs}</module></modules>`;
}

export class APIDocumentTypes extends MultiUsers {
  // SVG is not an accepted presentation format (dropped in 3.0.19), whatever a client offers.
  // insertDocument answers SUCCESS once the request is accepted and judges each document
  // afterwards, in order, so the outcome is read from the meeting's presentations: the PDF
  // sent after the SVG is added, the SVG is not.
  async testSvgDocumentNotAdded(page: PlaywrightPage, testInfo: TestInfo, request: APIRequestContext) {
    const meetingID = await createMeeting();
    try {
      await this.initModPage(page, { testInfo, meetingId: meetingID });
      const response = await axios.post(
        getApiCallUrl('insertDocument', { meetingID }),
        documentsXml([
          { name: 'vector.svg', base64: svgBase64 },
          { name: 'control.pdf', base64: pdfBase64 },
        ]),
        { adapter: 'http', headers: { 'Content-Type': 'application/xml' } },
      );
      expect(String(response.data), 'insertDocument should accept the request').toContain(
        '<returncode>SUCCESS</returncode>',
      );
      const presentationNames = async () =>
        (await readRows<{ name: string }>(this.modPage, PRESENTATIONS, 'pres_presentation')).map(({ name }) => name);
      await expect
        .poll(presentationNames, { timeout: ELEMENT_WAIT_LONGER_TIME, message: 'the PDF should be added' })
        .toContain('control.pdf');
      expect(await presentationNames(), 'the SVG should not be added').not.toContain('vector.svg');
    } finally {
      await endMeetings(request, [meetingID]);
    }
  }
}
