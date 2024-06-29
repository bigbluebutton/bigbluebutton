import useRev from '/imports/ui/components/pads/pads-graphql/hooks/useRev';
import useNotesLastRev from './useNotesLastRev';

const useHasUnreadNotes = () => {
  const NOTES_CONFIG = window.meetingClientSettings.public.notes;

  const { lastRev } = useNotesLastRev();
  const rev = useRev(NOTES_CONFIG.id);
  return rev > lastRev;
};

export default useHasUnreadNotes;
