import { type APIRequestContext, expect, type Page as PlaywrightPage, type TestInfo } from '@playwright/test';
import axios from 'axios';
import { readFileSync } from 'fs';
import path from 'path';

import { UPLOAD_PDF_WAIT_TIME } from '../core/constants';
import { readRows } from '../core/graphql';
import { createMeeting, endMeetings, getApiCallUrl } from '../core/helpers';
import { MultiUsers } from '../user/multiusers';

const PRESENTATIONS = 'subscription { pres_presentation { name uploadCompleted } }';

interface Presentation {
  name: string;
  uploadCompleted: boolean;
}

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
  // insertDocument answers SUCCESS once the request is accepted and hands each document to a
  // pool of worker threads, so they are judged concurrently and the outcome is read from the
  // meeting's presentations. A document that passes the MIME check gets its pres_presentation
  // row as soon as its conversion starts; a refused one never gets a row. So once the PDF sent
  // along with the SVG has finished converting, an accepted SVG would be listed next to it.
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
      const presentations = () => readRows<Presentation>(this.modPage, PRESENTATIONS, 'pres_presentation');
      await expect
        .poll(presentations, { timeout: UPLOAD_PDF_WAIT_TIME, message: 'the PDF should be added and converted' })
        .toContainEqual({ name: 'control.pdf', uploadCompleted: true });
      // Both checks on one read: an empty answer (readRows turns a closed connection into an
      // empty list) must not pass the negative one.
      const names = (await presentations()).map(({ name }) => name);
      expect(names, 'the PDF should still be listed').toContain('control.pdf');
      expect(names, 'the SVG should not be added').not.toContain('vector.svg');
    } finally {
      await endMeetings(request, [meetingID]);
    }
  }
}
