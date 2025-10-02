import { gql } from '@apollo/client';
import useDeduplicatedSubscription from '/imports/ui/core/hooks/useDeduplicatedSubscription';
import { useEffect, useState } from 'react';

interface GetNotesLastUpdatedAtResponse {
  sharedNotes: Array<{
    lastUpdatedAt: string | null;
  }>;
}

const GET_NOTES_LAST_UPDATED_AT = gql`
  subscription GetNotesLastUpdatedAt($externalId: String!) {
    sharedNotes(
      where: { sharedNotesExtId: { _eq: $externalId } }
    ) {
      lastUpdatedAt
    }
  }
`;

interface UseNotesLastUpdatedAtOptions {
  skip?: boolean;
}

/**
 * Hook that subscribes to shared notes last updated timestamp changes.
 * Returns the timestamp when the notes were last modified, or zero when no updates.
 */
function useNotesLastUpdatedAt(
  externalId: string,
  options: UseNotesLastUpdatedAtOptions = {},
): number {
  const { skip = false } = options;
  const [lastUpdatedAtTimestamp, setLastUpdatedAtTimestamp] = useState<number>(0);

  const { data } = useDeduplicatedSubscription<GetNotesLastUpdatedAtResponse>(
    GET_NOTES_LAST_UPDATED_AT,
    { variables: { externalId }, skip },
  );

  useEffect(() => {
    if (!data || skip) return;
    const notes = data.sharedNotes[0];
    if (!notes?.lastUpdatedAt) return;
    const receivedLastUpdatedAtTimestamp = new Date(notes.lastUpdatedAt).getTime();
    if (lastUpdatedAtTimestamp && lastUpdatedAtTimestamp === receivedLastUpdatedAtTimestamp) return;
    setLastUpdatedAtTimestamp(receivedLastUpdatedAtTimestamp);
  }, [data, skip, lastUpdatedAtTimestamp]);

  return lastUpdatedAtTimestamp;
}

export default useNotesLastUpdatedAt;
