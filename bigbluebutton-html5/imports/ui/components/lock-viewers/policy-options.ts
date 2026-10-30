import { defineMessages, MessageDescriptor } from 'react-intl';

/**
 * The guest and presentation policies a moderator picks from, with their
 * labels: one list for the lock viewers modal and the room mode summaries.
 */

export type PresenterPolicy = 'moderatorOnly' | 'requireApproval' | 'freeForAll';

const intlMessages = defineMessages({
  askModerator: {
    id: 'app.guest-policy.button.askModerator',
    description: 'Ask moderator button label',
  },
  alwaysAccept: {
    id: 'app.guest-policy.button.alwaysAccept',
    description: 'Always accept button label',
  },
  alwaysAcceptAuth: {
    id: 'app.guest-policy.button.alwaysAcceptAuth',
    description: 'Always accept authenticated button label',
  },
  alwaysDeny: {
    id: 'app.guest-policy.button.alwaysDeny',
    description: 'Always deny button label',
  },
  moderatorOnly: {
    id: 'app.lock-viewers.presentationPermissions.moderatorOnly',
    description: 'Presentation policy: the presenter is assigned by a moderator',
  },
  moderatorOnlyTooltip: {
    id: 'app.lock-viewers.presentationPermissions.moderatorOnly.tooltip',
    description: 'Tooltip for moderator only option',
  },
  requireApproval: {
    id: 'app.lock-viewers.presentationPermissions.requireApproval',
    description: 'Presentation policy: participants present with moderator approval',
  },
  requireApprovalTooltip: {
    id: 'app.lock-viewers.presentationPermissions.requireApproval.tooltip',
    description: 'Tooltip for require approval option',
  },
  freeForAll: {
    id: 'app.lock-viewers.presentationPermissions.freeForAll',
    description: 'Presentation policy: participants present freely',
  },
  freeForAllTooltip: {
    id: 'app.lock-viewers.presentationPermissions.freeForAll.tooltip',
    description: 'Tooltip for free for all option',
  },
});

export interface PolicyOption<V extends string = string> {
  value: V;
  label: MessageDescriptor;
  dataTest: string;
}

export interface PresentationPolicyOption extends PolicyOption<PresenterPolicy> {
  tooltip: MessageDescriptor;
}

export const GUEST_POLICY_OPTIONS: PolicyOption[] = [
  { value: 'ASK_MODERATOR', label: intlMessages.askModerator, dataTest: 'askModerator' },
  { value: 'ALWAYS_ACCEPT', label: intlMessages.alwaysAccept, dataTest: 'alwaysAccept' },
  { value: 'ALWAYS_DENY', label: intlMessages.alwaysDeny, dataTest: 'alwaysDeny' },
];

// Not offered for picking: set only through the API, shown while it is the room's.
export const ALWAYS_ACCEPT_AUTH_OPTION: Omit<PolicyOption, 'dataTest'> = {
  value: 'ALWAYS_ACCEPT_AUTH',
  label: intlMessages.alwaysAcceptAuth,
};

export const PRESENTATION_POLICY_OPTIONS: PresentationPolicyOption[] = [
  {
    value: 'moderatorOnly',
    label: intlMessages.moderatorOnly,
    tooltip: intlMessages.moderatorOnlyTooltip,
    dataTest: 'presModeratorOnly',
  },
  {
    value: 'requireApproval',
    label: intlMessages.requireApproval,
    tooltip: intlMessages.requireApprovalTooltip,
    dataTest: 'presRequireApproval',
  },
  {
    value: 'freeForAll',
    label: intlMessages.freeForAll,
    tooltip: intlMessages.freeForAllTooltip,
    dataTest: 'presFreeForAll',
  },
];

export const DEFAULT_PRESENTATION_POLICY: PresenterPolicy = 'requireApproval';
