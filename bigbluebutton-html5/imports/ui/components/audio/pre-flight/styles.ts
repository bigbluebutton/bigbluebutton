import styled, { keyframes, css } from 'styled-components';
import Button from '/imports/ui/components/common/button/component';
import Icon from '/imports/ui/components/common/icon/component';
import ModalSimple from '/imports/ui/components/common/modal/simple/component';
import { smallOnly } from '/imports/ui/stylesheets/styled-components/breakpoints';
import {
  colorGrayLightest,
  colorGrayLight,
  colorPrimary,
  colorText,
  colorDanger,
  colorSuccess,
  colorWhite,
  colorOffWhite,
  colorGrayDark,
  colorBackground,
  colorBlueAux,
  colorBlueLighter,
  colorGreen600,
  btnPrimaryHoverBg,
  btnPrimaryActiveBg,
} from '/imports/ui/stylesheets/styled-components/palette';
import {
  borderRadiusRounded,
  lgBorderRadius,
  smPaddingX,
  mdPaddingX,
  jumboPaddingY,
} from '/imports/ui/stylesheets/styled-components/general';
import {
  fontSizeLarger,
  fontSizeMD,
  fontSizeSmall,
  fontSizeBase,
} from '/imports/ui/stylesheets/styled-components/typography';

// ---- Design tokens ---------------------------------------------------------
const spaceXs = smPaddingX; // 0.75rem
const spaceSm = mdPaddingX; // 1rem
const spaceMd = jumboPaddingY; // 1.5rem
const spaceLg = '2rem';
const radiusControl = borderRadiusRounded; // 0.5rem
const radiusMedia = '0.75rem';
const radiusCard = lgBorderRadius; // 1rem
const radiusPill = '999px';
const controlHeight = '2.75rem';
const overlayControl = '2.75rem'; // 44px round on-preview control

// Soft, colorGrayDark-tinted elevation - never pure black.
const shadowSm = '0 1px 2px rgba(6, 23, 42, 0.06), 0 1px 3px rgba(6, 23, 42, 0.08)';
const shadowMd = '0 8px 24px rgba(6, 23, 42, 0.12), 0 2px 6px rgba(6, 23, 42, 0.08)';
const shadowLg = '0 16px 48px rgba(6, 23, 42, 0.18), 0 4px 12px rgba(6, 23, 42, 0.10)';
const shadowPrimary = '0 4px 12px rgba(15, 112, 215, 0.32)';
const focusRing = '0 0 0 3px rgba(15, 112, 215, 0.35)';

// v4: controls that sit ON the video need a darker, glassy chrome.
const glassBg = 'rgba(6, 23, 42, 0.55)';
const glassBgHover = 'rgba(6, 23, 42, 0.72)';
const glassBlur = 'blur(10px) saturate(120%)';
const shadowOverlay = '0 2px 8px rgba(0, 0, 0, 0.28), 0 1px 3px rgba(0, 0, 0, 0.22)';
const dangerSolidHover = '#C61C1C';
const netFair = '#E8A33D'; // amber - the only genuinely new color in v4
const motionEmphasis = '200ms cubic-bezier(0.2, 0, 0, 1)';

const reduceMotion = css`
  @media (prefers-reduced-motion: reduce) {
    transition: none;
    animation: none;
  }
`;

const pulse = keyframes`
  0%, 100% { opacity: 0.55; transform: scale(0.85); }
  50% { opacity: 1; transform: scale(1); }
`;

const spin = keyframes`to { transform: rotate(360deg); }`;

const cardEnter = keyframes`
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
`;

// ---- Modal / card surface --------------------------------------------------
const PreFlightModal = styled(ModalSimple)`
  padding: ${spaceLg};
  max-width: 44rem;
  max-height: 90vh;
  overflow-y: auto;
  border-radius: ${radiusCard};
  box-shadow: ${shadowMd};

  @media ${smallOnly} {
    padding: 1.25rem;
  }
`;

// Fades/lifts the card content in on mount, and softly hands off to the meeting
// on join (opacity + scale). Both guarded by prefers-reduced-motion.
const CardFx = styled.div<{ joining?: boolean }>`
  animation: ${cardEnter} ${motionEmphasis} both;
  transition:
    opacity ${motionEmphasis},
    transform ${motionEmphasis};
  ${reduceMotion}
  ${({ joining }) => joining && 'opacity: 0; transform: scale(0.98);'}
`;

// ---- Header ----------------------------------------------------------------
const Header = styled.header`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  margin-bottom: ${spaceMd};
`;

const Title = styled.h1`
  margin: 0;
  font-size: ${fontSizeLarger};
  font-weight: 600;
  line-height: 1.3;
  color: ${colorGrayDark};
`;

const Subtitle = styled.p`
  margin: 0;
  font-size: ${fontSizeMD};
  font-weight: 400;
  line-height: 1.4;
  color: ${colorText};
`;

// ---- Layout ----------------------------------------------------------------
const Content = styled.div`
  display: flex;
  flex-direction: row;
  gap: ${spaceMd};
  width: 100%;
  align-items: flex-start;

  @media ${smallOnly} {
    flex-direction: column;
    gap: ${spaceSm};
  }
`;

// v4: preview-dominant split (self-view is the hero, devices recede).
const CameraColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spaceSm};
  flex: 1 1 63%;
  min-width: 0;
`;

const DevicesColumn = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1 1 34%;
  gap: ${spaceMd};
  min-width: 0;
`;

// ---- Video preview (the hero + its on-preview controls) --------------------
const VideoWrapper = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  background-color: ${colorBackground};
  border-radius: ${radiusMedia};
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  color: ${colorWhite};
  text-align: center;
  box-shadow:
    ${shadowSm},
    inset 0 0 0 1px rgba(255, 255, 255, 0.06);
`;

const VideoPreview = styled.video<{ mirrored: boolean }>`
  width: 100%;
  height: 100%;
  border-radius: inherit;
  object-fit: cover;
  transition: opacity 150ms ease;
  ${reduceMotion}
  ${({ mirrored }) => mirrored && 'transform: scale(-1, 1);'}
`;

const CameraChip = styled.span`
  position: absolute;
  bottom: 0.5rem;
  left: 0.5rem;
  max-width: calc(100% - 1rem);
  padding: 0.25rem 0.5rem;
  border-radius: 0.375rem;
  background: rgba(6, 23, 42, 0.55);
  backdrop-filter: blur(4px);
  color: ${colorWhite};
  font-size: 0.75rem;
  line-height: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const CameraOff = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  color: rgba(255, 255, 255, 0.7);
  font-size: ${fontSizeSmall};
`;

const CameraOffIcon = styled(Icon)`
  font-size: 2rem;
  color: rgba(255, 255, 255, 0.6);
`;

const PlaceholderText = styled.span`
  padding: ${spaceSm};
  font-size: ${fontSizeSmall};
  color: rgba(255, 255, 255, 0.75);
`;

// ---- Camera-off avatar (warm initial, never a black void) ------------------
const Avatar = styled.div`
  position: absolute;
  inset: 0;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
  background: ${colorBackground};
`;

const AvatarCircle = styled.span`
  width: 4rem;
  height: 4rem;
  border-radius: 50%;
  background: ${colorBlueAux};
  color: ${colorPrimary};
  display: grid;
  place-items: center;
  font-size: 1.75rem;
  font-weight: 600;
`;

const AvatarLabel = styled.span`
  color: rgba(255, 255, 255, 0.75);
  font-size: ${fontSizeSmall};
`;

// ---- On-preview controls (the defining v4 move) ----------------------------
const OverlayControls = styled.div`
  position: absolute;
  bottom: 0.75rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 0.75rem;
  z-index: 2;
`;

const OverlayButton = styled.button<{ off?: boolean }>`
  width: ${overlayControl};
  height: ${overlayControl};
  border-radius: ${radiusPill};
  border: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: ${colorWhite};
  cursor: pointer;
  box-shadow: ${shadowOverlay};
  background: ${({ off }) => (off ? colorDanger : glassBg)};
  /* backdrop-filter degrades to the solid glassBg where unsupported */
  backdrop-filter: ${({ off }) => (off ? 'none' : glassBlur)};
  transition:
    background-color 150ms ease,
    transform 150ms ease;
  ${reduceMotion}

  i {
    font-size: 1.15rem;
  }
  &:hover:not(:disabled) {
    background: ${({ off }) => (off ? dangerSolidHover : glassBgHover)};
    transform: scale(1.06);
  }
  &:active:not(:disabled) {
    transform: scale(0.96);
  }
  &:focus-visible {
    outline: none;
    box-shadow: ${shadowOverlay}, ${focusRing};
  }
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const MirrorButton = styled.button`
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  z-index: 2;
  width: 2.25rem;
  height: 2.25rem;
  border: none;
  border-radius: ${radiusPill};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: ${colorWhite};
  background: ${glassBg};
  backdrop-filter: ${glassBlur};
  box-shadow: ${shadowOverlay};
  cursor: pointer;
  transition: background-color 150ms ease;
  ${reduceMotion}
  i {
    font-size: 1rem;
  }
  &:hover {
    background: ${glassBgHover};
  }
  &:focus-visible {
    outline: none;
    box-shadow: ${shadowOverlay}, ${focusRing};
  }
`;

// ---- Connection readiness (a quiet hint, never a dashboard) ----------------
const ConnectionBadge = styled.div`
  position: absolute;
  top: 0.75rem;
  left: 0.75rem;
  z-index: 2;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.25rem 0.55rem;
  border-radius: ${radiusPill};
  background: ${glassBg};
  backdrop-filter: ${glassBlur};
  color: ${colorWhite};
  font-size: 0.75rem;
  font-weight: 600;
`;

const SignalBars = styled.span<{
  level: 'good' | 'fair' | 'poor' | 'checking';
  filled: number;
}>`
  display: inline-flex;
  align-items: flex-end;
  gap: 2px;
  height: 0.75rem;

  span {
    width: 3px;
    border-radius: 1px;
    background: rgba(255, 255, 255, 0.35);
  }
  span:nth-child(1) {
    height: 30%;
  }
  span:nth-child(2) {
    height: 55%;
  }
  span:nth-child(3) {
    height: 78%;
  }
  span:nth-child(4) {
    height: 100%;
  }
  ${({ level, filled }) => {
    if (level === 'checking') return '';
    const colorByLevel = {
      good: colorGreen600,
      fair: netFair,
      poor: colorDanger,
    };
    const color = colorByLevel[level] || colorGreen600;
    return Array.from(
      { length: filled },
      (_, i) => `span:nth-child(${i + 1}) { background: ${color}; }`,
    ).join('\n');
  }}
`;

// ---- Device groups / labels ------------------------------------------------
const DeviceGroup = styled.label`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  font-size: ${fontSizeSmall};
  font-weight: 600;
  color: ${colorText};
`;

// Unified control (mic / speaker / camera). Restyles any native <select>
// descendant so the three dropdowns are visually identical. Scoped to the
// pre-flight - the shared device-selector/audio modal styling is untouched.
const SelectField = styled.div`
  position: relative;
  width: 100%;

  select {
    appearance: none;
    -webkit-appearance: none;
    width: 100%;
    min-height: ${controlHeight};
    height: ${controlHeight};
    padding: 0 2.25rem 0 ${spaceXs};
    font-size: ${fontSizeMD};
    font-weight: 400;
    color: ${colorGrayDark};
    background: ${colorWhite};
    border: 1px solid ${colorGrayLightest};
    border-radius: ${radiusControl};
    box-shadow: ${shadowSm};
    cursor: pointer;
    transition:
      border-color 150ms ease,
      box-shadow 150ms ease;
    ${reduceMotion}
  }

  select:hover {
    border-color: ${colorGrayLight};
  }

  select:focus,
  select:focus-visible {
    outline: none;
    border-color: ${colorPrimary};
    box-shadow: ${focusRing};
  }

  select:disabled {
    background: ${colorOffWhite};
    color: ${colorGrayLight};
    cursor: not-allowed;
    box-shadow: none;
  }

  /* custom chevron - identical for all three controls */
  &::after {
    content: "";
    position: absolute;
    right: 1rem;
    top: 50%;
    width: 0.5rem;
    height: 0.5rem;
    border-right: 2px solid ${colorGrayLight};
    border-bottom: 2px solid ${colorGrayLight};
    transform: translateY(-70%) rotate(45deg);
    pointer-events: none;
  }
`;

const NotFound = styled.span`
  font-size: ${fontSizeMD};
  font-weight: 400;
  color: ${colorGrayLight};
  padding: 0.6rem ${spaceXs};
  border: 1px dashed ${colorGrayLightest};
  border-radius: ${radiusControl};
`;

// Reserve the mic block height so the layout never jumps between the selector,
// the loading skeleton and the permission-denied notice.
const MicSlot = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  min-height: 5.5rem;
`;

// ---- Mic level meter (segmented "hardware" bar) ----------------------------
const MeterCaption = styled.div`
  font-size: ${fontSizeSmall};
  font-weight: 400;
  color: ${colorGrayLight};
`;

// 14 rounded ticks that light green with input level, so it reads as alive even
// at low levels (a hairline never does).
const MeterTicks = styled.div`
  display: flex;
  gap: 2px;
  width: 100%;
  height: 0.5rem;

  span {
    flex: 1;
    border-radius: 1px;
    background: ${colorOffWhite};
    transition: background-color 90ms linear;
    ${reduceMotion}
  }
  span[data-on="true"] {
    background: ${colorGreen600};
  }
`;

// ---- Skeleton (loading) ----------------------------------------------------
const shimmer = keyframes`
  0% { background-position: -200px 0; }
  100% { background-position: calc(200px + 100%) 0; }
`;

const Skeleton = styled.div`
  width: 100%;
  height: ${controlHeight};
  border-radius: ${radiusControl};
  background: ${colorOffWhite};
  background-image: linear-gradient(
    90deg,
    ${colorOffWhite} 0px,
    #e9eef3 40px,
    ${colorOffWhite} 80px
  );
  background-size: 200px 100%;
  background-repeat: no-repeat;
  animation: ${shimmer} 1.2s ease-in-out infinite;
  ${reduceMotion}
`;

// ---- Footer / primary action ----------------------------------------------
const Footer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 0.5rem;
  margin-top: ${spaceMd};
`;

// @ts-ignore - as button comes from JS, we can't provide its props
const JoinButton = styled(Button)`
  width: 100%;
  min-height: 3rem;
  font-size: ${fontSizeBase};
  font-weight: 600;
  border-radius: ${radiusControl};
  box-shadow: 0 1px 2px rgba(6, 23, 42, 0.1);
  transition:
    background-color 150ms ease,
    box-shadow 150ms ease,
    transform 150ms ease;
  ${reduceMotion}

  &:hover:not(:disabled) {
    background-color: ${btnPrimaryHoverBg};
    box-shadow: ${shadowPrimary};
    transform: translateY(-1px);
  }
  &:active:not(:disabled) {
    background-color: ${btnPrimaryActiveBg};
    transform: translateY(0);
    box-shadow: 0 1px 2px rgba(6, 23, 42, 0.1);
  }
  &:focus-visible {
    outline: none;
    box-shadow: ${focusRing};
  }
`;

// Spinner shown inside the Join button while joining.
const Spinner = styled.span`
  display: inline-block;
  width: 1rem;
  height: 1rem;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.5);
  border-top-color: ${colorWhite};
  animation: ${spin} 0.7s linear infinite;
  ${reduceMotion}
`;

const ListenOnlyLink = styled.button`
  align-self: center;
  background: none;
  border: none;
  color: ${colorText};
  cursor: pointer;
  font-size: ${fontSizeSmall};
  font-weight: 500;
  padding: 0.5rem 0.25rem;
  border-radius: 0.25rem;
  text-decoration: none;
  transition: color 150ms ease;
  ${reduceMotion}

  &:hover,
  &:focus-visible {
    color: ${colorPrimary};
    text-decoration: underline;
  }
  &:focus-visible {
    outline: none;
    box-shadow: ${focusRing};
  }
  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }
`;

// Neutral secondary button (retry / test).
const SecondaryButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  align-self: flex-start;
  padding: 0.45rem 0.85rem;
  border-radius: ${radiusControl};
  border: 1px solid ${colorGrayLightest};
  background: ${colorWhite};
  color: ${colorPrimary};
  font-size: ${fontSizeSmall};
  font-weight: 600;
  cursor: pointer;
  transition:
    background-color 150ms ease,
    border-color 150ms ease;
  ${reduceMotion}

  &:hover {
    background: ${colorBlueAux};
    border-color: ${colorBlueLighter};
  }
  &:focus-visible {
    outline: none;
    box-shadow: ${focusRing};
  }
`;

// ---- Permission-denied notice ---------------------------------------------
const PermissionDenied = styled.div`
  display: flex;
  gap: 0.75rem;
  align-items: flex-start;
  padding: ${spaceSm};
  border-radius: ${radiusControl};
  background: rgba(223, 39, 33, 0.06);
  border: 1px solid rgba(223, 39, 33, 0.2);
`;

const PermissionIconCircle = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  background: rgba(223, 39, 33, 0.12);
`;

const PermissionIcon = styled(Icon)`
  color: ${colorDanger};
  font-size: 1rem;
`;

const PermissionBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
`;

const PermissionTitle = styled.div`
  font-size: ${fontSizeSmall};
  font-weight: 600;
  color: ${colorGrayDark};
`;

const PermissionText = styled.div`
  font-size: ${fontSizeSmall};
  color: ${colorText};
  line-height: 1.4;
`;

// ---- Green room ------------------------------------------------------------
const GuestRoomContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: ${spaceLg};
`;

const GuestRoomCard = styled.section`
  background-color: ${colorWhite};
  border-radius: ${radiusCard};
  padding: ${spaceLg};
  width: 100%;
  max-width: 46rem;
  max-height: 92vh;
  overflow-y: auto;
  box-shadow: ${shadowLg};

  @media ${smallOnly} {
    padding: 1.25rem;
  }
`;

const StatusBanner = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.35rem;
  margin-top: ${spaceMd};
  padding: 0.75rem ${spaceSm};
  border-radius: ${radiusControl};
  background: ${colorBlueAux};
`;

const StatusHeadline = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: ${colorPrimary};
  font-size: ${fontSizeSmall};
  font-weight: 600;
`;

const WaitingDot = styled.span`
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
  background-color: ${colorSuccess};
  animation: ${pulse} 2s ease-in-out infinite;
  ${reduceMotion}
`;

const WaitingPosition = styled.div`
  font-size: ${fontSizeSmall};
  color: ${colorText};
`;

const HostMessage = styled.div`
  background-color: ${colorOffWhite};
  border-radius: ${radiusControl};
  padding: ${spaceSm};
  margin-top: ${spaceSm};
  font-size: ${fontSizeSmall};
  color: ${colorText};
  text-align: center;
`;

const HostMessageLabel = styled.div`
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  opacity: 0.7;
  margin-bottom: 0.35rem;
`;

export default {
  PreFlightModal,
  CardFx,
  Header,
  Title,
  Subtitle,
  Content,
  CameraColumn,
  DevicesColumn,
  VideoWrapper,
  VideoPreview,
  CameraChip,
  CameraOff,
  CameraOffIcon,
  PlaceholderText,
  Avatar,
  AvatarCircle,
  AvatarLabel,
  OverlayControls,
  OverlayButton,
  MirrorButton,
  ConnectionBadge,
  SignalBars,
  DeviceGroup,
  SelectField,
  NotFound,
  MicSlot,
  MeterCaption,
  MeterTicks,
  Skeleton,
  Footer,
  JoinButton,
  Spinner,
  ListenOnlyLink,
  SecondaryButton,
  PermissionDenied,
  PermissionIconCircle,
  PermissionIcon,
  PermissionBody,
  PermissionTitle,
  PermissionText,
  GuestRoomContainer,
  GuestRoomCard,
  StatusBanner,
  StatusHeadline,
  WaitingDot,
  WaitingPosition,
  HostMessage,
  HostMessageLabel,
};
