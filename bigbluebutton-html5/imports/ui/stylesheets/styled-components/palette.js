const colorWhite = 'var(--color-white, #FFF)';
const colorOffWhite = 'var(--color-off-white, #F3F6F9)';

const colorBlack = 'var(--color-black, #000000)';

const colorGray = 'var(--color-gray, #4E5A66)';
const colorGrayDark = 'var(--color-gray-dark, #06172A)';
const colorGrayLight = 'var(--color-gray-light, #8B9AA8)';
const colorGrayLighter = 'var(--color-gray-lighter, #A7B3BD)';
const colorGrayLightest = 'var(--color-gray-lightest, #D4D9DF)';

const colorBlueLight = 'var(--color-blue-light, #54a1f3)';
const colorBlueLighter = 'var(--color-blue-lighter, #92BCEA)';
const colorBlueLightest = 'var(--color-blue-lightest, #E4ECF2)';

const colorTransparent = 'var(--color-transparent, #ff000000)';

const colorPrimary = 'var(--color-primary, #0F70D7)';
const colorDanger = 'var(--color-danger, #DF2721)';
const colorSuccess = 'var(--color-success, #008081)';
const colorWarning = 'var(--color-warning, purple)';
const colorOffline = `var(--color-offline, ${colorGrayLight})`;
const colorMuted = 'var(--color-muted, #586571)';
const colorMutedBackground = 'var(--color-muted-background, #F3F6F9)';

const colorBackground = `var(--color-background, ${colorGrayDark})`;
const colorOverlay = `var(--color-overlay, rgba(6, 23, 42, 0.75))`;

const userListBg = `var(--user-list-bg, ${colorOffWhite})`;
const userListText = `var(--user-list-text, ${colorGray})`;
const unreadMessagesBg = `var(--unread-messages-bg, ${colorDanger})`;
const colorGrayLabel = `var(--color-gray-label, ${colorGray})`;
const colorText = `var(--color-text, ${colorGray})`;
const colorLink = `var(--color-link, ${colorPrimary})`;

const listItemBgHover = 'var(--list-item-bg-hover, #DCE4ED)';
const colorTipBg = 'var(--color-tip-bg, #333333)';
const itemFocusBorder = `var(--item-focus-border, ${colorBlueLighter})`;

const btnDefaultColor = `var(--btn-default-color, ${colorGray})`;
const btnDefaultBg = `var(--btn-default-bg, ${colorWhite})`;
const btnDefaultBorder = `var(--btn-default-border, ${colorWhite})`;

const btnPrimaryBorder = `var(--btn-primary-border, ${colorPrimary})`;
const btnPrimaryColor = `var(--btn-primary-color, ${colorWhite})`;
const btnPrimaryBg = `var(--btn-primary-bg, ${colorPrimary})`;

const btnSuccessBorder = `var(--btn-success-border, ${colorSuccess})`;
const btnSuccessColor = `var(--btn-success-color, ${colorWhite})`;
const btnSuccessBg = `var(--btn-success-bg, ${colorSuccess})`;

const btnWarningBorder = `var(--btn-warning-border, ${colorWarning})`;
const btnWarningColor = `var(--btn-warning-color, ${colorWhite})`;
const btnWarningBg = `var(--btn-warning-bg, ${colorWarning})`;

const btnDangerBorder = `var(--btn-danger-border, ${colorDanger})`;
const btnDangerColor = `var(--btn-danger-color, ${colorWhite})`;
const btnDangerBg = `var(--btn-danger-bg, ${colorDanger})`;

const btnDarkBorder = `var(--btn-dark-border, ${colorDanger})`;
const btnDarkColor = `var(--btn-dark-color, ${colorWhite})`;
const btnDarkBg = `var(--btn-dark-bg, ${colorGrayDark})`;

const btnOfflineBorder = `var(--btn-offline-border, ${colorOffline})`;
const btnOfflineColor = `var(--btn-offline-color, ${colorWhite})`;
const btnOfflineBg = `var(--btn-offline-bg, ${colorOffline})`;

const btnMutedBorder = `var(--btn-muted-border, ${colorMutedBackground})`;
const btnMutedColor = `var(--btn-muted-color, ${colorMuted})`;
const btnMutedBg = `var(--btn-muted-bg, ${colorMutedBackground})`;

const toolbarButtonColor = `var(--toolbar-button-color, ${btnDefaultColor})`;
const userThumbnailBorder = `var(--user-thumbnail-border, ${colorGrayLight})`;
const loaderBg = `var(--loader-bg, ${colorGrayDark})`;
const loaderBullet = `var(--loader-bullet, ${colorWhite})`;

const systemMessageBackgroundColor = 'var(--system-message-background-color, #F9FBFC)';
const systemMessageBorderColor = 'var(--system-message-border-color, #C5CDD4)';
const systemMessageFontColor = `var(--system-message-font-color, ${colorGrayDark})`;
const highlightedMessageBackgroundColor = 'var(--system-message-background-color, #fef9f1)';
const highlightedMessageBorderColor = 'var(--system-message-border-color, #f5c67f)';
const colorHeading = `var(--color-heading, ${colorGrayDark})`;
const palettePlaceholderText = 'var(--palette-placeholder-text, #787675)';
const pollAnnotationGray = 'var(--poll-annotation-gray, #333333)';

const toolbarButtonBorderColor = `var(--toolbar-button-border-color, ${colorGrayLighter})`;
const toolbarListColor = `var(--toolbar-list-color, ${colorGray})`;
const toolbarButtonBg = `var(--toolbar-button-bg, ${btnDefaultBg})`;
const toolbarListBg = 'var(--toolbar-list-bg, #DDD)';
const toolbarListBgFocus = 'var(--toolbar-list-bg-focus, #C6C6C6)';
const colorContentBackground = 'var(--color-content-background, #1B2A3A)';

const dropdownBg = `var(--dropdown-bg, ${colorWhite})`;

const pollStatsBorderColor = 'var(--poll-stats-border-color, #D4D9DF)';
const pollBlue = `var(--poll-blue, ${colorPrimary})`;

const toastDefaultColor = `var(--toast-default-color, ${colorWhite})`;
const toastDefaultBg = `var(--toast-default-bg, ${colorGray})`;

const toastInfoColor = `var(--toast-info-color, ${colorWhite})`;
const toastInfoBg = `var(--toast-info-bg, ${colorPrimary})`;

const toastSuccessColor = `var(--toast-success-color, ${colorWhite})`;
const toastSuccessBg = `var(--toast-success-bg, ${colorSuccess})`;

const toastErrorColor = `var(--toast-error-color, ${colorWhite})`;
const toastErrorBg = `var(--toast-error-bg, ${colorDanger})`;

const toastWarningColor = `var(--toast-warning-color, ${colorWhite})`;
const toastWarningBg = `var(--toast-warning-bg, ${colorWarning})`;

export {
  colorWhite,
  colorOffWhite,
  colorBlack,
  colorGray,
  colorGrayDark,
  colorGrayLight,
  colorGrayLighter,
  colorGrayLightest,
  colorTransparent,
  colorBlueLight,
  colorBlueLighter,
  colorBlueLightest,
  colorPrimary,
  colorDanger,
  colorSuccess,
  colorWarning,
  colorBackground,
  colorOverlay,
  userListBg,
  userListText,
  unreadMessagesBg,
  colorGrayLabel,
  colorText,
  colorLink,
  listItemBgHover,
  colorTipBg,
  itemFocusBorder,
  btnDefaultColor,
  btnDefaultBg,
  btnDefaultBorder,
  btnPrimaryBorder,
  btnPrimaryColor,
  btnPrimaryBg,
  btnSuccessBorder,
  btnSuccessColor,
  btnSuccessBg,
  btnWarningBorder,
  btnWarningColor,
  btnWarningBg,
  btnDangerBorder,
  btnDangerColor,
  btnDangerBg,
  btnDarkBorder,
  btnDarkColor,
  btnDarkBg,
  btnOfflineBorder,
  btnOfflineColor,
  btnOfflineBg,
  btnMutedBorder,
  btnMutedColor,
  btnMutedBg,
  toolbarButtonColor,
  userThumbnailBorder,
  loaderBg,
  loaderBullet,
  systemMessageBackgroundColor,
  systemMessageBorderColor,
  systemMessageFontColor,
  highlightedMessageBackgroundColor,
  highlightedMessageBorderColor,
  colorHeading,
  palettePlaceholderText,
  pollAnnotationGray,
  toolbarButtonBorderColor,
  toolbarListColor,
  toolbarButtonBg,
  toolbarListBg,
  toolbarListBgFocus,
  pollStatsBorderColor,
  pollBlue,
  colorContentBackground,
  dropdownBg,
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
};
