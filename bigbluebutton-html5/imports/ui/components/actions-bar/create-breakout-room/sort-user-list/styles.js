import styled from 'styled-components';
import Button from '/imports/ui/components/common/button/component';
import { TextElipsis, TitleElipsis } from '/imports/ui/stylesheets/styled-components/placeholders';
import Styled from '/imports/ui/components/actions-bar/create-breakout-room/styles';
import { colorWhite, colorGrayLighter } from '/imports/ui/stylesheets/styled-components/palette';
import { borderSize } from '/imports/ui/stylesheets/styled-components/general';
import { lineHeightComputed } from '/imports/ui/stylesheets/styled-components/typography';

const SelectUserContainer = styled.div`
  margin: 1.5rem 1rem;
`;

const Round = styled.span`
  position: relative;

  & > label {
    margin-top: -10px;
    background-color: #fff;
    border: 1px solid #ccc;
    border-radius: 50%;
    cursor: pointer;
    height: 28px;
    left: 0;
    right : auto;
    position: absolute;
    top: 0;
    width: 28px;

    [dir="rtl"] & {
      left : auto;
      right: 0;
    }
  }

  & > label:after {
    border: {
      style: solid;
      color:  #fff;
      width: 2px;
      right: {
        style : none;
      }
      top: {
        style: none;
      }
    }
    content: "";
    height: 6px;
    left: 7px;
    opacity: 0;
    position: absolute;
    top: 8px;
    transform: rotate(-45deg);
    width: 12px;

    [dir="rtl"] & {
      border: {
        style: solid;
        color:  #fff;
        width: 2px;
        left: {
          style : none;
        }
        top: {
          style: none;
        }
      }
    }
  }

  & > input[type="checkbox"] {
    visibility: hidden;
  }

  & > input[type="checkbox"]:checked + label {
    background-color: #66bb6a;
    border-color: #66bb6a;
  }

  & > input[type="checkbox"]:checked + label:after {
    opacity: 1;
  }
`;

const TextName = styled(TextElipsis)`
  margin-left: 1.5rem;
`;

const LockIcon = styled(Styled.LockIcon)`
background:red;
`;

const SelectUserScreen = styled.div`
  position: fixed;
  display: block;
  height: 100vh;
  width: 100%;
  background-color: ${colorWhite};
  z-index: 1002;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
`;

const Header = styled.header`
  display: flex;
  padding: ${lineHeightComputed} 0;
  border-bottom: ${borderSize} solid ${colorGrayLighter};
  margin: 0 1rem 0 1rem;
`;

const Title = styled(TitleElipsis)`
  align-content: flex-end;
  flex: 1;
  margin: 0;
  font-weight: 400;
`;

const ButtonAdd = styled(Button)`
  flex: 0 1 35%;
`;

export default {
  SelectUserContainer,
  Round,
  TextName,
  LockIcon,
  SelectUserScreen,
  Header,
  Title,
  ButtonAdd,
};
