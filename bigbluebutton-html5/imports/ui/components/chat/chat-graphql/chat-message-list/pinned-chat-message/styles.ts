import styled from 'styled-components';
import {
  colorWhite,
  colorBlueAux,
  appsGalleryOutlineColor,
  colorNeutral2,
  colorDangerDark,
  colorGrayLightest,
  colorOffWhite,
} from '/imports/ui/stylesheets/styled-components/palette';
import {
  fontSizeSmall,
  fontSizeSmaller,
  fontSizeBase,
  fontSizeLarge,
} from '/imports/ui/stylesheets/styled-components/typography';
import {
  borderSizeSmall,
  borderRadius,
  borderRadiusRounded,
  smPadding,
  mdPadding,
  lgPadding,
  $2xlPadding,
} from '/imports/ui/stylesheets/styled-components/general';
import OrIcon from '/imports/ui/components/common/icon/component';

const Wrapper = styled.div`
  background: ${colorWhite};
  border-radius: ${borderRadiusRounded};
  border: ${borderSizeSmall} solid ${appsGalleryOutlineColor};
  padding: ${$2xlPadding};
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: ${lgPadding};
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${lgPadding};
`;

const Title = styled.div`
  display: flex;
  align-items: center;
  gap: ${lgPadding};
  font-size: ${fontSizeBase};
  min-width: 0;
  overflow: hidden;
  flex: 1;
`;

const PinnedBy = styled.span`
  color: inherit;
  font-size: ${fontSizeSmall};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
`;

const PinnedByName = styled.span`
  color: inherit;
  margin-left: ${mdPadding};
`;

const Controls = styled.div`
  display: flex;
  gap: ${mdPadding};
  align-items: center;
`;

const ToggleButton = styled.button`
  background: transparent;
  border: none;
  cursor: pointer;
  padding: ${smPadding};
  display: inline-flex;
  align-items: center;
  justify-content: center;
`;

const MessagePreview = styled.div<{ $collapsed?: boolean }>`
  color: inherit;
  font-size: ${fontSizeLarge};
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: ${({ $collapsed }) => ($collapsed ? 1 : 8)};
  overflow: hidden;
  text-overflow: ellipsis;
  /* prevent long continuous text/URLs from overflowing the preview */
  overflow-wrap: anywhere;
  word-break: break-word;
  cursor: pointer;
  padding: ${smPadding};
  border-radius: ${borderRadius};
  transition: background-color 0.2s ease;

  &:hover {
    background-color: ${colorBlueAux};
  }

  & p {
    margin: 0;
    white-space: pre-wrap;
  }

  & pre:has(code), p code:not(pre > code) {
    background-color: ${colorOffWhite};
    border: solid ${borderSizeSmall} ${colorGrayLightest};
    border-radius: ${borderRadius};
    padding: ${smPadding};
    margin: 0;
    font-size: ${fontSizeSmaller};
    white-space: pre-wrap;
    word-wrap: break-word;
    overflow-wrap: anywhere;
  }

  & p code:not(pre > code) {
    color: ${colorDangerDark};
  }

  & h1 { font-size: 1.5em; margin: 0; }
  & h2 { font-size: 1.3em; margin: 0; }
  & h3 { font-size: 1.1em; margin: 0; }
  & h4, & h5, & h6 { margin: 0; }
`;

const Footer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const FooterUserInfo = styled.div`
  color: ${colorNeutral2};
  font-size: ${fontSizeSmall};
  display: flex;
  align-items: center;
  min-width: 0;
  gap: ${smPadding};
`;

const FooterSenderName = styled.span`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
`;

const FooterTime = styled.span`
  white-space: nowrap;
  flex-shrink: 0;
`;

const Icon = styled(OrIcon)<{ iconName: string }>`
  color: ${colorNeutral2};
`;

export default {
  Wrapper,
  Header,
  Title,
  PinnedBy,
  PinnedByName,
  Controls,
  ToggleButton,
  MessagePreview,
  Footer,
  FooterUserInfo,
  FooterSenderName,
  FooterTime,
  Icon,
};
