const colorWhite = 'var(--color-white, #FFF)';
const colorWhiteBorder = `var(--color-white-border, ${colorWhite})`;
const colorWhiteSurface = `var(--color-white-surface, ${colorWhite})`;
const scrollFadeColor = `var(--scroll-fade-color, ${colorWhiteSurface})`;
const scrollbarThumb = 'var(--scrollbar-thumb, rgba(0, 0, 0, 0.25))';
const scrollbarThumbHover = 'var(--scrollbar-thumb-hover, rgba(0, 0, 0, 0.5))';
const colorOffWhite = 'var(--color-off-white, #F3F6F9)';
const colorOffWhiteBorder = `var(--color-off-white-border, ${colorOffWhite})`;
const colorOffWhiteText = `var(--color-off-white-text, ${colorOffWhite})`;
const colorNeutral2 = 'var(--color-neutral-2, #717C91)';

const colorBlack = 'var(--color-black, #000000)';
const colorBlackBorder = `var(--color-black-border, ${colorBlack})`;
const colorBlackSurface = `var(--color-black-surface, ${colorBlack})`;

const colorGray = 'var(--color-gray, #4E5A66)';
const colorGrayBorder = `var(--color-gray-border, ${colorGray})`;
const colorGrayDark = 'var(--color-gray-dark, #06172A)';
const colorGrayDarkBorder = `var(--color-gray-dark-border, ${colorGrayDark})`;
const colorGrayDarkSurface = `var(--color-gray-dark-surface, ${colorGrayDark})`;
const colorGrayLight = 'var(--color-gray-light, #8B9AA8)';
const colorGrayLightBorder = `var(--color-gray-light-border, ${colorGrayLight})`;
const colorGrayLightSurface = `var(--color-gray-light-surface, ${colorGrayLight})`;
const colorGrayLighter = 'var(--color-gray-lighter, #A7B3BD)';
const colorGrayLighterSurface = `var(--color-gray-lighter-surface, ${colorGrayLighter})`;
const colorGrayLighterText = `var(--color-gray-lighter-text, ${colorGrayLighter})`;
const colorGrayLightest = 'var(--color-gray-lightest, #D4D9DF)';
const colorGrayLightestBorder = `var(--color-gray-lightest-border, ${colorGrayLightest})`;
const colorGrayLightestText = `var(--color-gray-lightest-text, ${colorGrayLightest})`;
const colorGrayIcons = 'var(--color-gray-icons, #909CAF)';
const colorGrayUserListToolbar = 'var(--color-gray-user-list-toolbar, #F4F6FA)';

const colorBorder = 'var(--color-border, #B8C9D8)';
const colorBorderSurface = `var(--color-border-surface, ${colorBorder})`;

const colorBlueLight = 'var(--color-blue-light, #54a1f3)';
const colorBlueLighter = 'var(--color-blue-lighter, #92BCEA)';
const colorBlueLighterBorder = `var(--color-blue-lighter-border, ${colorBlueLighter})`;
const colorBlueLightest = 'var(--color-blue-lightest, #E4ECF2)';
const colorBlueLightestBorder = `var(--color-blue-lightest-border, ${colorBlueLightest})`;
const colorBlueAux = 'var(--color-blue-aux, #E5EFFB)';
const colorInfoBannerBg = 'var(--color-info-banner-bg, #e8f0fe)';
const colorBlueLightestChannel = '228 236 242';
const colorBlueLighterChannel = '146 188 234';

const colorTransparent = 'var(--color-transparent, #ff000000)';

const colorUserModerator = 'var(--color-user-moderator, #7B209F)';
const colorUserYou = 'var(--color-user-you, #19237C)';
const colorUserViewer = 'var(--color-user-viewer, #2296C9)';

const colorPrimary = 'var(--color-primary, #0F70D7)';
const colorDanger = 'var(--color-danger, #DF2721)';
const colorDangerDark = 'var(--color-danger-dark, #AE1010)';
const colorSuccess = 'var(--color-success, #008081)';
const colorWarning = 'var(--color-warning, purple)';
const colorOffline = `var(--color-offline, ${colorGrayLight})`;
const colorMuted = 'var(--color-muted, #586571)';
const colorMutedBackground = 'var(--color-muted-background, #F3F6F9)';

const colorBackground = 'var(--color-background, #102133)';
const colorOverlay = 'var(--color-overlay, rgba(6, 23, 42, 0.75))';

const userListBg = `var(--user-list-bg, ${colorOffWhite})`;
const userListBgBorder = `var(--user-list-bg-border, ${userListBg})`;
const userListText = `var(--user-list-text, ${colorGray})`;
const unreadMessagesBg = `var(--unread-messages-bg, ${colorDanger})`;
const notificationBadgeBg = 'var(--notification-badge-bg, #FF3939)';
const colorGrayLabel = `var(--color-gray-label, ${colorGray})`;
const colorText = `var(--color-text, ${colorGray})`;
const colorTextBorder = `var(--color-text-border, ${colorText})`;
const colorLink = `var(--color-link, ${colorPrimary})`;

const listItemBgHover = `var(--list-item-bg-hover, ${colorBlueAux})`;
const colorControlBorder = 'var(--color-control-border, #CDD6E0)';
const colorControlActiveSurface = 'var(--color-control-active-surface, #bdccdb)';
const colorControlActiveText = 'var(--color-control-active-text, #2c333a)';
const colorSurfaceMuted = 'var(--color-surface-muted, #F4F4F4)';
const colorSurfaceNeutral = 'var(--color-surface-neutral, #EEEEEE)';
const colorSwitchThumb = 'var(--color-switch-thumb, #FAFAFA)';
const colorInfoSurface = 'var(--color-info-surface, #E3F2FD)';
const colorInfoSurfaceAlt = 'var(--color-info-surface-alt, #E9F0FF)';
const colorDisabledSurface = 'var(--color-disabled-surface, #AAAAAA)';
const colorBorderMuted = 'var(--color-border-muted, #CCCCCC)';
const colorTipBg = 'var(--color-tip-bg, #333333)';
const colorTextStrong = 'var(--color-text-strong, #2d2d2d)';
const colorTextEmphasis = 'var(--color-text-emphasis, #333333)';
const colorTextSecondary = 'var(--color-text-secondary, #666666)';
const itemFocusBorder = `var(--item-focus-border, ${colorPrimary})`;

const btnDefaultColor = `var(--btn-default-color, ${colorGray})`;
const btnDefaultColorSurface = `var(--btn-default-color-surface, ${btnDefaultColor})`;
const btnDefaultBg = `var(--btn-default-bg, ${colorWhite})`;
const btnDefaultBgText = `var(--btn-default-bg-text, ${btnDefaultBg})`;
const btnDefaultBorder = `var(--btn-default-border, ${colorWhite})`;

const btnDefaultGhostColor = `var(--btn-default-ghost-color, var(--btn-default-color, ${colorWhite}))`;
const btnDefaultGhostColorBorder = `var(--btn-default-ghost-color-border, ${btnDefaultGhostColor})`;
const btnDefaultGhostBg = 'var(--btn-default-ghost-bg, var(--btn-default-bg, rgba(255, 255, 255, 0.1)))'; // colorWhite, 10%
const btnDefaultGhostBorder = 'var(--btn-default-ghost-border, var(--btn-default-border, rgba(255, 255, 255, 0.5)))'; // colorWhite, 50%
const btnDefaultGhostActiveBg = 'var(--btn-default-active-bg, rgba(255, 255, 255, 0.2))'; // colorWhite, 20%

const btnPrimaryBorder = 'var(--btn-primary-border, rgba(15, 112, 215, 0.5))'; // colorPrimary, 50%
const btnPrimaryColor = `var(--btn-primary-color, ${colorWhite})`;
const btnPrimaryColorSurface = `var(--btn-primary-color-surface, ${btnPrimaryColor})`;
const btnPrimaryBg = `var(--btn-primary-bg, ${colorPrimary})`;
const btnPrimaryHoverBg = 'var(--btn-primary-hover-bg, #0C57A7)';
const btnPrimaryActiveBg = 'var(--btn-primary-active-bg, #0A4B8F)';

const btnSuccessBorder = `var(--btn-success-border, ${colorSuccess})`;
const btnSuccessColor = `var(--btn-success-color, ${colorWhite})`;
const btnSuccessColorSurface = `var(--btn-success-color-surface, ${btnSuccessColor})`;
const btnSuccessBg = `var(--btn-success-bg, ${colorSuccess})`;

const btnWarningBorder = `var(--btn-warning-border, ${colorWarning})`;
const btnWarningColor = `var(--btn-warning-color, ${colorWhite})`;
const btnWarningColorSurface = `var(--btn-warning-color-surface, ${btnWarningColor})`;
const btnWarningBg = `var(--btn-warning-bg, ${colorWarning})`;

const btnDangerBorder = `var(--btn-danger-border, ${colorDanger})`;
const btnDangerColor = `var(--btn-danger-color, ${colorWhite})`;
const btnDangerColorSurface = `var(--btn-danger-color-surface, ${btnDangerColor})`;
const btnDangerBg = `var(--btn-danger-bg, ${colorDanger})`;
const btnDangerBgHover = 'var(--btn-danger-bg-hover, #C61C1C)';

const btnDarkBorder = `var(--btn-dark-border, ${colorDanger})`;
const btnDarkColor = `var(--btn-dark-color, ${colorWhite})`;
const btnDarkColorSurface = `var(--btn-dark-color-surface, ${btnDarkColor})`;
const btnDarkBg = `var(--btn-dark-bg, ${colorGrayDark})`;
const btnDarkBgText = `var(--btn-dark-bg-text, ${btnDarkBg})`;

const btnOfflineBorder = `var(--btn-offline-border, ${colorOffline})`;
const btnOfflineColor = `var(--btn-offline-color, ${colorWhite})`;
const btnOfflineColorSurface = `var(--btn-offline-color-surface, ${btnOfflineColor})`;
const btnOfflineBg = `var(--btn-offline-bg, ${colorOffline})`;
const btnOfflineBgText = `var(--btn-offline-bg-text, ${btnOfflineBg})`;

const btnMutedBorder = `var(--btn-muted-border, ${colorMutedBackground})`;
const btnMutedColor = `var(--btn-muted-color, ${colorMuted})`;
const btnMutedColorSurface = `var(--btn-muted-color-surface, ${btnMutedColor})`;
const btnMutedBg = `var(--btn-muted-bg, ${colorMutedBackground})`;
const btnMutedBgText = `var(--btn-muted-bg-text, ${btnMutedBg})`;

const toolbarButtonColor = `var(--toolbar-button-color, ${btnDefaultColor})`;
const toolbarButtonColorDisabled = `var(--toolbar-button-color-disabled, var(--toolbar-button-color, ${colorGrayLight}))`;
const userThumbnailBorder = `var(--user-thumbnail-border, ${colorBorder})`;
const loaderBg = `var(--loader-bg, ${colorGrayDark})`;
const loaderBullet = `var(--loader-bullet, ${colorWhite})`;

const systemMessageBackgroundColor = 'var(--system-message-background-color, #F9FBFC)';
const systemMessageBorderColor = `var(--system-message-border-color, ${colorBorder})`;
const systemMessageFontColor = `var(--system-message-font-color, ${colorGrayDark})`;
const highlightedMessageBackgroundColor = 'var(--highlighted-message-background-color, var(--system-message-background-color, #fef9f1))';
const highlightedMessageBorderColor = `var(--highlighted-message-border-color, ${colorBorder})`;
const emphasizedMessageBackgroundColor = 'var(--emphasized-message-background-color, #E9F1F9)';
const colorHeading = `var(--color-heading, ${colorGrayDark})`;
const palettePlaceholderText = 'var(--palette-placeholder-text, #787675)';
const pollAnnotationGray = 'var(--poll-annotation-gray, #333333)';

const appsGalleryOutlineColor = 'var(--apps-gallery-outline, #DCE4EC)';
const appsGalleryOutlineColorSurface = `var(--apps-gallery-outline-surface, ${appsGalleryOutlineColor})`;
const unpinnedAppIconColor = 'var(--apps-unpinned-icon-color, #A5B2C7)';
const appsPanelTextColor = 'var(--apps-panel-text-color, #393C48)';

const settingsModalTabSelected = 'var(--settings-modal-tab-selected, #eaf4fc)';

const toolbarButtonBorderColor = `var(--toolbar-button-border-color, ${colorGrayLighter})`;
const toolbarListColor = `var(--toolbar-list-color, ${colorGray})`;
const toolbarButtonBg = `var(--toolbar-button-bg, ${btnDefaultBg})`;
const toolbarListBg = 'var(--toolbar-list-bg, #DDD)';
const toolbarListBgFocus = 'var(--toolbar-list-bg-focus, #C6C6C6)';
const colorContentBackground = 'var(--color-content-background, #1B2A3A)';

const dropdownBg = `var(--dropdown-bg, ${colorWhite})`;

const pollStatsBorderColor = `var(--poll-stats-border-color, ${colorBorder})`;
const pollBlue = `var(--poll-blue, ${colorPrimary})`;

const toastSurface = `var(--toast-surface, ${colorWhiteSurface})`;
const toastTextColor = 'var(--toast-text-color, #757575)';

const toastDefaultColor = `var(--toast-default-color, ${colorWhite})`;
const toastDefaultBg = `var(--toast-default-bg, ${colorGray})`;

const toastInfoColor = `var(--toast-info-color, ${colorWhite})`;
const toastInfoBg = `var(--toast-info-bg, ${colorPrimary})`;

const toastSuccessColor = `var(--toast-success-color, ${colorWhite})`;
const toastSuccessBg = `var(--toast-success-bg, ${colorSuccess})`;

const toastErrorColor = `var(--toast-error-color, ${colorWhite})`;
const toastErrorBg = `var(--toast-error-bg, ${colorDanger})`;

const audioModalIconBg = 'var(--audio-modal-icon-bg, #f1f8ff)';
const audioModalIconColor = 'var(--audio-modal-icon-color, #1b3c4b)';
const audioModalIconSecondaryColor = 'var(--audio-modal-icon-secondary-color, #3c5764)';
const mediaSharingChipBg = 'var(--media-sharing-chip-bg, #e0e0e0)';
const webcamBackgroundColor = 'var(--webcam-background-color, #001428FF)';
const webcamBackgroundColorBorder = `var(--webcam-background-color-border, ${webcamBackgroundColor})`;
const webcamPlaceholderBorder = 'var(--webcam-placeholder-border, rgba(255, 255, 255, 0.5))'; // colorWhite, 50%

// rgba version of colorPrimary (0F70D7) with 15% opacity for talking indicator background
const webcamTalkingBackgroundColor = 'var(--webcam-talking-background-color, rgba(13, 109, 252, 0.15))';

const toastWarningColor = `var(--toast-warning-color, ${colorWhite})`;
const toastWarningBg = `var(--toast-warning-bg, ${colorWarning})`;
const defaultBorder = 'var(--default-border, #B0BDC9)';

// Dark theme values live in public/stylesheets/theme-dark.css. Nothing is declared here:
// every token below is read with its light value as the fallback, so the dark sheet only
// has to redefine the custom property.

const SegmentedButtonRingOffsetShadow = 'var(--ring-offset-shadow, 0 0 #0000)';
const SegmentedButtonRingShadow = 'var(--ring-shadow, 0 0 #0000)';
const SegmentedButtonBoxShadowSm = 'var(--shadow, 0 1px 2px 0 rgba(0, 0, 0, 0.05))';
const slate900 = 'var(--slate-900, #111827)';
const slate600 = 'var(--slate-600, #4B5563)';
const darkCyanLime = 'var(--dark-cyan-lime, #16A34A)';

const colorInfoBoxQuizText = 'var(--color-info-box-quiz-text, #15803D)';
const colorInfoBoxQuizBg = 'var(--color-info-box-quiz-bg, #F0FDF4)';
const colorInfoBoxQuizBorder = `var(--color-info-box-quiz-border, ${colorSuccess})`;

const colorSelectedCorrectAnswerText = 'var(--color-selected-correct-answer-text, #A16207)';
const colorSelectedCorrectAnswerTextBorder = `var(--color-selected-correct-answer-text-border, ${colorSelectedCorrectAnswerText})`;
const colorSelectedCorrectAnswerBg = 'var(--color-selected-correct-answer-bg, #FEF9C3)';

const colorSelectedCorrectAnswerTextActive = 'var(--color-selected-correct-answer-text-active, #15803D)';
const colorSelectedCorrectAnswerBgActive = 'var(--color-selected-correct-answer-bg-active, #DCFCE7)';

const colorGreen600 = 'var(--color-green-600, #16A34A)';
const colorGreen100 = 'var(--color-green-100, #DCFCE7)';

export {
  colorBorderMuted,
  colorControlActiveSurface,
  colorControlActiveText,
  colorControlBorder,
  colorDisabledSurface,
  colorInfoSurface,
  colorInfoSurfaceAlt,
  colorSurfaceMuted,
  colorSurfaceNeutral,
  colorSwitchThumb,
  audioModalIconBg,
  audioModalIconColor,
  audioModalIconSecondaryColor,
  colorTextEmphasis,
  colorTextSecondary,
  colorTextStrong,
  mediaSharingChipBg,
  colorWhite,
  colorWhiteBorder,
  colorWhiteSurface,
  scrollFadeColor,
  scrollbarThumb,
  scrollbarThumbHover,
  colorOffWhite,
  colorOffWhiteBorder,
  colorOffWhiteText,
  colorNeutral2,
  colorBlack,
  colorBlackBorder,
  colorBlackSurface,
  colorGray,
  colorGrayBorder,
  colorGrayDark,
  colorGrayDarkBorder,
  colorGrayDarkSurface,
  colorGrayLight,
  colorGrayLightBorder,
  colorGrayLightSurface,
  colorGrayLighter,
  colorGrayLighterSurface,
  colorGrayLighterText,
  colorGrayLightest,
  colorGrayLightestBorder,
  colorGrayLightestText,
  colorGrayIcons,
  colorGrayUserListToolbar,
  colorBorder,
  colorBorderSurface,
  colorTransparent,
  colorUserModerator,
  colorUserYou,
  colorUserViewer,
  colorBlueLight,
  colorBlueLighter,
  colorBlueLighterBorder,
  colorBlueLightest,
  colorBlueLightestBorder,
  colorBlueLightestChannel,
  colorBlueLighterChannel,
  colorBlueAux,
  colorInfoBannerBg,
  colorPrimary,
  colorDanger,
  colorDangerDark,
  colorSuccess,
  colorWarning,
  colorBackground,
  colorOverlay,
  userListBg,
  userListBgBorder,
  userListText,
  unreadMessagesBg,
  notificationBadgeBg,
  colorGrayLabel,
  colorText,
  colorTextBorder,
  colorLink,
  listItemBgHover,
  colorTipBg,
  itemFocusBorder,
  btnDefaultColor,
  btnDefaultColorSurface,
  btnDefaultBg,
  btnDefaultBgText,
  btnDefaultBorder,
  btnDefaultGhostColor,
  btnDefaultGhostColorBorder,
  btnDefaultGhostBg,
  btnDefaultGhostBorder,
  btnDefaultGhostActiveBg,
  btnPrimaryBorder,
  btnPrimaryColor,
  btnPrimaryColorSurface,
  btnPrimaryBg,
  btnPrimaryHoverBg,
  btnPrimaryActiveBg,
  btnSuccessBorder,
  btnSuccessColor,
  btnSuccessColorSurface,
  btnSuccessBg,
  btnWarningBorder,
  btnWarningColor,
  btnWarningColorSurface,
  btnWarningBg,
  btnDangerBorder,
  btnDangerColor,
  btnDangerColorSurface,
  btnDangerBg,
  btnDarkBorder,
  btnDarkColor,
  btnDarkColorSurface,
  btnDarkBg,
  btnDarkBgText,
  btnOfflineBorder,
  btnOfflineColor,
  btnOfflineColorSurface,
  btnOfflineBg,
  btnOfflineBgText,
  btnMutedBorder,
  btnMutedColor,
  btnMutedColorSurface,
  btnMutedBg,
  btnMutedBgText,
  toolbarButtonColor,
  toolbarButtonColorDisabled,
  userThumbnailBorder,
  loaderBg,
  loaderBullet,
  btnDangerBgHover,
  systemMessageBackgroundColor,
  systemMessageBorderColor,
  systemMessageFontColor,
  highlightedMessageBackgroundColor,
  highlightedMessageBorderColor,
  emphasizedMessageBackgroundColor,
  colorHeading,
  palettePlaceholderText,
  pollAnnotationGray,
  appsGalleryOutlineColor,
  appsGalleryOutlineColorSurface,
  unpinnedAppIconColor,
  appsPanelTextColor,
  settingsModalTabSelected,
  toolbarButtonBorderColor,
  toolbarListColor,
  toolbarButtonBg,
  toolbarListBg,
  toolbarListBgFocus,
  pollStatsBorderColor,
  pollBlue,
  colorContentBackground,
  dropdownBg,
  toastSurface,
  toastTextColor,
  toastDefaultColor,
  toastDefaultBg,
  toastInfoColor,
  toastInfoBg,
  toastSuccessColor,
  toastSuccessBg,
  toastErrorColor,
  toastErrorBg,
  toastWarningColor,
  toastWarningBg,
  defaultBorder,
  webcamBackgroundColor,
  webcamBackgroundColorBorder,
  webcamPlaceholderBorder,
  webcamTalkingBackgroundColor,
  SegmentedButtonRingOffsetShadow,
  SegmentedButtonRingShadow,
  SegmentedButtonBoxShadowSm,
  slate900,
  slate600,
  darkCyanLime,
  colorInfoBoxQuizText,
  colorInfoBoxQuizBg,
  colorInfoBoxQuizBorder,
  colorSelectedCorrectAnswerText,
  colorSelectedCorrectAnswerTextBorder,
  colorSelectedCorrectAnswerBg,
  colorSelectedCorrectAnswerTextActive,
  colorSelectedCorrectAnswerBgActive,
  colorGreen600,
  colorGreen100,
};
