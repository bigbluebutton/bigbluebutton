import { DocumentNode } from 'graphql';
import logger from '/imports/startup/client/logger';
import Auth from '/imports/ui/services/auth';

function getOperationName(document: DocumentNode): string {
  const definition = document.definitions[0];
  if (definition.kind === 'OperationDefinition' && definition.name) {
    return definition.name.value;
  }
  return 'unknown_subscription';
}

function generateLogCode(subscriptionName: string): string {
  return `${subscriptionName.toLowerCase()}_meetingid_mismatch`;
}

interface WithMeetingId {
  meetingId?: string;
}

export function createMeetingIdFilter<T extends object>(
  expectedMeetingId: string | undefined,
  subscription: DocumentNode,
  extractExtraInfo?: (item: T) => Record<string, unknown>,
): (item: T) => boolean {
  const subscriptionName = getOperationName(subscription);
  const logCode = generateLogCode(subscriptionName);

  return (item: T): boolean => {
    // If no expected meetingId, pass through (meeting data not yet loaded)
    if (!expectedMeetingId) {
      return true;
    }

    // Cast to access meetingId (added at runtime via GraphQL)
    const itemWithMeetingId = item as T & WithMeetingId;

    // If item has no meetingId field, pass through (field not available)
    if (itemWithMeetingId.meetingId === undefined) {
      return true;
    }

    const isInMeeting = itemWithMeetingId.meetingId === expectedMeetingId;

    if (!isInMeeting) {
      const extraInfo = extractExtraInfo ? extractExtraInfo(item) : {};
      logger.warn({
        logCode,
        extraInfo: {
          subscriptionName,
          itemMeetingId: itemWithMeetingId.meetingId,
          expectedMeetingId,
          currentUserId: Auth.userID,
          ...extraInfo,
        },
      }, `${subscriptionName}: meetingId mismatch, filtering out item`);
    }

    return isInMeeting;
  };
}

export function filterByMeetingId<T extends object>(
  items: T[] | null | undefined,
  expectedMeetingId: string | undefined,
  subscription: DocumentNode,
  extractExtraInfo?: (item: T) => Record<string, unknown>,
): T[] {
  if (!items || items.length === 0) {
    return [];
  }

  const filterFn = createMeetingIdFilter(expectedMeetingId, subscription, extractExtraInfo);
  return items.filter(filterFn);
}
