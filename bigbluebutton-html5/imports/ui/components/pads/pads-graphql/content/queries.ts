import { gql } from '@apollo/client';

export interface GetPadContentDiffStreamResponse {
  sharedNotes_diff_stream: Array<{
    start: number;
    end: number;
    diff: string;
  }>;
}

export const GET_PAD_CONTENT_DIFF_STREAM = gql`
  subscription GetPadContentDiffStream($externalId: String!) {
    sharedNotes_diff_stream(
      batch_size: 10,
      cursor: { initial_value: { rev: 0 } },
      where: { sharedNotesExtId: { _eq: $externalId } }
    ) {
      start
      end
      diff
    }
  }
`;

export default {
  GET_PAD_CONTENT_DIFF_STREAM,
};
