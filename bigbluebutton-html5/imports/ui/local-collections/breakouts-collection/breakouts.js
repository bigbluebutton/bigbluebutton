import Breakouts from '/imports/api/breakouts';
import AbstractCollection from '/imports/ui/local-collections/abstract-collection/abstract-collection';

const localBreakouts = new Mongo.Collection('local-breakouts', { connection: null });

export const localBreakoutsSync = new AbstractCollection(Breakouts, localBreakouts);

export default localBreakouts;
