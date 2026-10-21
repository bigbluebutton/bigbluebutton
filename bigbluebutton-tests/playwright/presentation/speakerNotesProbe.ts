import { field, queryDocument, runQuery } from '../core/apolloProbe';

const SPEAKER_NOTES_QUERY = queryDocument([
  field('pres_page_speakerNotes', [
    field('presentationId'),
    field('pageId'),
    field('num'),
    field('isCurrentPage'),
    field('speakerNotes'),
  ]),
]);

export interface SpeakerNotesRow {
  presentationId: string;
  pageId: string;
  num: number;
  isCurrentPage: boolean;
  speakerNotes: string;
}

export const getSpeakerNotesRows = async (page: import('@playwright/test').Page): Promise<SpeakerNotesRow[]> => {
  const data = await runQuery(page, SPEAKER_NOTES_QUERY);
  return (data.pres_page_speakerNotes ?? []) as SpeakerNotesRow[];
};
