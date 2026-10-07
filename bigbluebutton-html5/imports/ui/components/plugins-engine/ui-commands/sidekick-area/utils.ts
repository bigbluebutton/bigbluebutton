import {
  RemoveGenericContentSidekickAreaBadgeCommandArguments,
  RenameGenericContentSidekickAreaCommandArguments,
  SetGenericContentSidekickAreaBadgeCommandArguments,
} from 'bigbluebutton-html-plugin-sdk/dist/cjs/ui-commands/sidekick-area/options/types';
import { setGenericContentBadges } from '/imports/ui/core/local-states/useGenericContentBadges';
import { setGenericContentMenuNames } from '/imports/ui/core/local-states/useGenericContentMenuNames';

const removeBadge = (id: string) => setGenericContentBadges((badges) => {
  if (!(id in badges)) return badges;
  const remainingBadges = { ...badges };
  delete remainingBadges[id];
  return remainingBadges;
});

// Badges and menu names are kept outside the components that display them, which
// unmount whenever the apps gallery closes or switches view and would otherwise
// miss or drop them.
const handleSetBadge = ((event: CustomEvent<SetGenericContentSidekickAreaBadgeCommandArguments>) => {
  const { id, badgeContent } = event.detail ?? {};
  if (!id) return;
  if (!badgeContent) {
    removeBadge(id);
    return;
  }
  setGenericContentBadges((badges) => ({ ...badges, [id]: badgeContent }));
}) as EventListener;

const handleRemoveBadge = ((event: CustomEvent<RemoveGenericContentSidekickAreaBadgeCommandArguments>) => {
  const { id } = event.detail ?? {};
  if (id) removeBadge(id);
}) as EventListener;

const handleRenameMenu = ((event: CustomEvent<RenameGenericContentSidekickAreaCommandArguments>) => {
  const { id, newName } = event.detail ?? {};
  if (!id || !newName) return;
  setGenericContentMenuNames((names) => ({ ...names, [id]: newName }));
}) as EventListener;

export {
  handleSetBadge,
  handleRemoveBadge,
  handleRenameMenu,
};
