import styled from 'styled-components';
import { smPaddingX } from '/imports/ui/stylesheets/styled-components/general';
import { colorGrayLight } from '/imports/ui/stylesheets/styled-components/palette';

const ItemAction = styled.div`
  margin-left: ${smPaddingX};

  &, & i {
    margin-top: .25rem;
    display: inline-block;
    border: 0;
    background: transparent;
    cursor: pointer;
    font-size: 1.35rem;
    color: ${colorGrayLight};
    padding: 0;

    ${({ animations }) => animations && `
      transition: all .25s;
    `}

    :hover, :focus {
      padding: unset !important;
    }
  }
`;

export default {
  ItemAction,
};
