import styled from 'styled-components';
import {
  colorWhite,
  colorPrimary,
  colorBlueAux,
  appsGalleryOutlineColor,
  colorNeutral2,
  colorDangerDark,
  colorGrayLightest,
  colorOffWhite,
} from '/imports/ui/stylesheets/styled-components/palette';
import OrIcon from '/imports/ui/components/common/icon/component';

const Wrapper = styled.div`
  background: ${colorWhite};
  border-radius: 6px;
  border: 1px solid ${appsGalleryOutlineColor};
  padding: 1rem;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
`;

const Title = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1rem;
`;

const PinnedBy = styled.span`
  color: inherit;
  font-size: 13px;
`;

const PinnedByName = styled.span`
  color: ${colorPrimary};
  font-weight: 600;
  margin-left: 6px;
`;

const Controls = styled.div`
  display: flex;
  gap: 6px;
  align-items: center;
`;

const ToggleButton = styled.button`
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 4px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
`;

const MessagePreview = styled.div`
  color: inherit;
  font-size: 1.25rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  /* prevent long continuous text/URLs from overflowing the preview */
  overflow-wrap: anywhere;
  word-break: break-word;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: ${colorBlueAux};
  }

  &:focus {
    outline: 2px solid ${colorPrimary};
    outline-offset: 2px;
  }

  & p {
    margin: 0;
    white-space: pre-wrap;
  }

  & pre:has(code), p code:not(pre > code) {
    background-color: ${colorOffWhite};
    border: solid 1px ${colorGrayLightest};
    border-radius: 4px;
    padding: 2px;
    margin: 0;
    font-size: 12px;
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
  font-size: 0.875rem;
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
  Icon,
};
