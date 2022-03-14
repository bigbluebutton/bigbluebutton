import styled from 'styled-components';
import Icon from '/imports/ui/components/common/icon/component';
import { lineHeightComputed } from '/imports/ui/stylesheets/styled-components/typography';
import {
  colorGrayDark,
  colorPrimary,
  colorWhite,
  colorText,
} from '/imports/ui/stylesheets/styled-components/palette';
import { borderSize } from '/imports/ui/stylesheets/styled-components/general';
import { smallOnly } from '/imports/ui/stylesheets/styled-components/breakpoints';

const ItemIcon = styled(Icon)`
  margin: 0 calc(${lineHeightComputed} / 2) 0 0;
  color: ${colorText};
  flex: 0 0;

  [dir="rtl"] & {
    margin: 0 0 0 calc(${lineHeightComputed} / 2);
  }
`;

const ItemLabel = styled.span`
  color: ${colorGrayDark};
  font-size: 90%;
  flex: 1;
`;

const IconRight = styled(ItemIcon)`
  margin-right: 0;
  margin-left: 1rem;
  font-size: 12px;
  line-height: 16px;

  [dir="rtl"] & {
    margin-left: 0;
    margin-right: 1rem;
    -webkit-transform: scale(-1, 1);
    -moz-transform: scale(-1, 1);
    -ms-transform: scale(-1, 1);
    -o-transform: scale(-1, 1);
    transform: scale(-1, 1);
  }
`;

const Item = styled.li`
  display: flex;
  flex: 1 1 100%;
  align-items: center;
  padding: calc(${lineHeightComputed} / 3) 0;

  &:hover,
  &:focus {
    outline: transparent;
    outline-style: dotted;
    outline-width: ${borderSize};

    cursor: pointer;
    background-color: ${colorPrimary};
    color: ${colorWhite};

    & > span {
      color: ${colorWhite} !important;
    }

    margin-left: -.25rem;
    margin-right: -.25rem;
    padding-left: .25rem;
    padding-right: .25rem;

    [dir="rtl"] & {
      margin-right: -.25rem;
      margin-left: -.25rem;
      padding-right: .25rem;
      padding-left: .25rem;
    }


    @media ${smallOnly} {
      border-radius: 0.2rem;
    }

    & i {
      color: inherit;
    }
  }

  &:focus {
    box-shadow: 0 0 0 2px ${colorWhite}, 0 0 2px 4px rgba(${colorPrimary}, .4);
    outline-style: solid;
  }
`;

export default {
  ItemIcon,
  ItemLabel,
  IconRight,
  Item,
};
