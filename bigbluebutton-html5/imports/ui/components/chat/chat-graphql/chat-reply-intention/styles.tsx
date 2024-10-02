import styled, { css } from 'styled-components';
import {
  colorBlueLight,
  colorOffWhite,
} from '/imports/ui/stylesheets/styled-components/palette';
import Button from '/imports/ui/components/common/button/component';

const Container = styled.div<{ $hidden: boolean; $animations: boolean }>`
  border-radius: 4px;
  border-left: 4px solid ${colorBlueLight};
  background-color: ${colorOffWhite};
  position: relative;
  overflow: hidden;

  ${({ $hidden }) => ($hidden
    ? css`
        height: 0;
      `
    : css`
        height: 4rem;
        padding: 6px;
        margin-right: 0.75rem;
        margin-bottom: 0.25rem;
      `
  )}

  ${({ $animations }) => $animations
    && css`
      transition-property: height;
      transition-duration: 0.1s;
    `}
`;

const Typography = styled.div`
  line-height: 1rem;
  font-size: 1rem;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
`;

const Username = styled(Typography)`
  font-weight: bold;
  color: ${colorBlueLight};
  margin-bottom: 6px;
`;

const Message = styled(Typography)``;

// @ts-ignore
const CloseBtn = styled(Button)`
  position: absolute;
  top: 2px;
  right: 2px;
`;

export default {
  Container,
  Username,
  CloseBtn,
  Message,
};
