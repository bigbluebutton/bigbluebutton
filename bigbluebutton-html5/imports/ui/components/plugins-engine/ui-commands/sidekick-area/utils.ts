import {
  RemoveGenericContentSidekickAreaBadgeCommandArguments,
  SetGenericContentSidekickAreaBadgeCommandArguments,
} from 'bigbluebutton-html-plugin-sdk/dist/cjs/ui-commands/sidekick-area/options/types';
import {
  removeGenericContentBadge,
  setGenericContentBadges,
} from '/imports/ui/core/local-states/useGenericContentBadges';

// Kept outside the components that display the badge, which unmount whenever the
// apps gallery closes or switches view and would otherwise miss or drop it.
const handleSetBadge = ((event: CustomEvent<SetGenericContentSidekickAreaBadgeCommandArguments>) => {
  const { id, badgeContent } = event.detail ?? {};
  if (!id) return;
  if (!badgeContent) {
    removeGenericContentBadge(id);
    return;
  }
  setGenericContentBadges((badges) => ({ ...badges, [id]: badgeContent }));
}) as EventListener;

const handleRemoveBadge = ((event: CustomEvent<RemoveGenericContentSidekickAreaBadgeCommandArguments>) => {
  const { id } = event.detail ?? {};
  if (id) removeGenericContentBadge(id);
}) as EventListener;

export {
  handleSetBadge,
  handleRemoveBadge,
};
