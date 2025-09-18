import styled from 'styled-components';
import { colorPrimary, colorGray } from '/imports/ui/stylesheets/styled-components/palette';
import { smPaddingX } from '/imports/ui/stylesheets/styled-components/general';

export const ContentWrapper = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  gap: ${smPaddingX};
`;

export const IconWrapper = styled.div`
  color: ${colorPrimary};
  font-size: 1.5rem;
  display: flex;
  align-items: center;
`;

export const TextWrapper = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  line-height: 1.2;
`;

export const AnnotationText = styled.span`
  font-size: 0.75rem;
  color: ${colorGray};
  text-transform: capitalize;
`;

export const DownloadLink = styled.a`
  color: ${colorPrimary};
  text-decoration: none;
  font-weight: 500;
  white-space: nowrap;

  &:hover {
    text-decoration: underline;
  }
`;

export default {
  ContentWrapper,
  IconWrapper,
  TextWrapper,
  AnnotationText,
  DownloadLink,
};
