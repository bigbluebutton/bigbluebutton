import Meetings from '/imports/api/meetings';
import AbstractCollection from '/imports/ui/local-collections/abstract-collection/abstract-collection';

const localMeetings = new Mongo.Collection('local-meetings', { connection: null });

export const localMeetingsSync = new AbstractCollection(Meetings, localMeetings);

export default localMeetings;
