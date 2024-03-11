import { Meteor } from 'meteor/meteor';
import useRev from '/imports/ui/components/pads/pads-graphql/hooks/useRev';
import useNotesLastRev from './useNotesLastRev';

const NOTES_CONFIG = Meteor.settings.public.notes;

const useHasUnreadNotes = () => {
  const { lastRev } = useNotesLastRev();
  const rev = useRev(NOTES_CONFIG.id);
  return rev > lastRev;
};

export default useHasUnreadNotes;