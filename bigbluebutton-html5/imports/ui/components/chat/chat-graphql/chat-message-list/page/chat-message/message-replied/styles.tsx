import styled from 'styled-components';
import {
  colorGrayLight,
  colorGrayLightest, colorOffWhite, colorPrimary, colorText, colorWhite,
} from '/imports/ui/stylesheets/styled-components/palette';
import { $3xlPadding, smPadding } from '/imports/ui/stylesheets/styled-components/general';
import ReactMarkdown from 'react-markdown';

const Container = styled.div`
  border-top-left-radius: 0.5rem;
  border-top-right-radius: 0.5rem;
  background-color: ${colorWhite};
  box-shadow: inset 0 0 0 1px ${colorGrayLightest};
  padding: ${smPadding} ${$3xlPadding};
  position: relative;
  overflow: hidden;
  cursor: pointer;

  [dir='ltr'] & {
    border-right: 0.5rem solid ${colorPrimary};
  }

  [dir='rtl'] & {
    border-left: 0.5rem solid ${colorPrimary};
  }
`;

const Message = styled.div`
  line-height: normal;
  overflow: hidden;
`;

export const DeleteMessage = styled.span`
  color: ${colorGrayLight};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const Markdown = styled(ReactMarkdown)`
  color: ${colorText};

  & img {
    max-width: 100%;
    max-height: 100%;
  }

  & p {
    margin: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  & code {
    white-space: nowrap;
    background-color: ${colorOffWhite};
    border: solid 1px ${colorGrayLightest};
    border-radius: 4px;
    padding: 2px;
    font-size: 12px;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

export default {
  Container,
  Message,
  DeleteMessage,
  Markdown,
};
