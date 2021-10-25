import styled from 'styled-components';
import { smallOnly } from '/imports/ui/stylesheets/styled-components/breakpoints';
import { ScrollboxVertical } from '/imports/ui/stylesheets/styled-components/scrollable';
import HoldButton from '/imports/ui/components/presentation/presentation-toolbar/zoom-tool/holdButton/component';
import Button from '/imports/ui/components/button/component';
import { FlexRow, FlexColumn } from '/imports/ui/stylesheets/styled-components/placeholders';

const BoxContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(4rem, 16rem));
  grid-template-rows: repeat(auto-fill, minmax(4rem, 8rem));
  grid-gap: 1.6rem 1rem;
  box-sizing: border-box;
  padding-bottom: 1rem;
`;

const Alert = styled.div`
  ${({ valid }) => !valid && `
    position: relative;

    & > * {
      border-color: var(--color-danger) !important;
      color: var(--color-danger);
    }
  `}
`;

const FreeJoinLabel = styled.label`
  font-size: var(--font-size-small);
  font-weight: bolder;
  display: flex;
  align-items: center;
  font-size: var(--font-size-small);
  margin-bottom: 0;

  & > * {
    margin: 0 .5rem 0 0;

    [dir="rtl"] & {
      margin: 0 0 0 .5rem;
    }
  }
`;

const BreakoutNameInput = styled.input`
  width: 100%;
  text-align: left;
  font-weight: normal;
  padding: .25rem;
  margin: 0;
  &::placeholder {
    color: var(--color-gray);
    opacity: 1;
  }
`;

const BreakoutBox = styled(ScrollboxVertical)`
  width: 100%;
  height: 80%;
  min-height: 4rem;
  max-height: 8rem;
  border: 1px solid var(--color-gray-lighter);
  border-radius: var(--border-radius); 
`;

const SpanWarn = styled.span`
  ${({ valid }) => valid && `
    display: none;
  `}

  ${({ valid }) => !valid && `
    margin: .25rem;
    position: absolute;
    font-size: var(--font-size-small);
    color: var(--color-danger);
    font-weight: 200;
    white-space: nowrap;
  `}
`;

const RoomName = styled(BreakoutNameInput)`
  ${({ value }) => value.length === 0 && `
    border-color: var(--color-danger) !important;
  `}

  ${({ duplicated }) => duplicated === 0 && `
    border-color: var(--color-danger) !important;
  `}
`;

const BreakoutSettings = styled.div`
  display: grid;
  grid-template-columns: 2fr 2fr 1fr; 
  grid-template-rows: 1fr;
  grid-gap: 1rem;

  @media ${smallOnly} {
    grid-template-columns: 1fr ;
    grid-template-rows: 1fr 1fr 1fr; 
    flex-direction: column;
  }
`;

const FormLabel = styled.p`
  color: var(--color-gray);
  white-space: nowrap;
  margin-bottom: .5rem;

  ${({ valid }) => !valid && `
    color: var(--color-danger);
  `}
`;

const InputRooms = styled.select`
  background-color: var(--color-white);
  color: var(--color-gray);
  border: 1px solid var(--color-gray-lighter);
  border-radius: var(--border-radius);
  width: 100%;
  padding-top: .25rem;
  padding-bottom: .25rem;
  padding: .25rem 0 .25rem .25rem;

  ${({ valid }) => !valid && `
      border-color: var(--color-danger) !important;
  `}
`;

const DurationLabel = styled.label`
  ${({ valid }) => !valid && `
    & > * {
      border-color: var(--color-danger) !important;
      color: var(--color-danger);
    }
  `}
`;

const LabelText = styled.p`
  color: var(--color-gray);
  white-space: nowrap;
  margin-bottom: .5rem;
`;

const DurationArea = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const DurationInput = styled.input`
  background-color: var(--color-white);
  color: var(--color-gray);
  border: 1px solid var(--color-gray-lighter);
  border-radius: var(--border-radius);
  width: 50%;
  text-align: center;
  padding: .25rem;

  &::placeholder {
    color: var(--color-gray);
    opacity: 1;
  }
`;

const HoldButtonWrapper = styled(HoldButton)`
  & > button > span {
    padding-bottom: var(--border-size);
  }

  & > button > span > i {
    color: var(--color-gray);
    width: var(--lg-padding-x);
    height: var(--lg-padding-x);
    font-size: 170% !important;
  }
`;

const RandomlyAssignBtn = styled(Button)`
  color: var(--color-primary);
  font-size: var(--font-size-small);
  white-space: nowrap;
  margin: 0 auto 0 0;
  align-self: flex-end;

  [dir="rtl"] & {
    margin: 0 0 0 auto;
  }
`;

const CheckBoxesContainer = styled(FlexRow)`
  margin-top: 2rem;
`;

const FreeJoinCheckbox = styled.input`
  width: 1rem;
  height: 1rem;
`;

const RoomUserItem = styled.p`
  margin: 0;
  padding: .25rem 0 .25rem .25rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  cursor: pointer;
  border-bottom: solid .5px var(--color-gray-lighter);

  [dir="rtl"] & {
    padding: .25rem .25rem .25rem 0;
  }

  ${({ selected }) => selected && `
    background-color: var(--color-primary);
    color: var(--color-white)
  `}

  ${({ disabled }) => disabled && `
    cursor: not-allowed;
    color: var(--color-gray-lighter);
  `}
`;

const LockIcon = styled.span`
  float: right;
  margin-right: 1rem;

  @media ${smallOnly} {
    margin-left: .5rem;
    margin-right: auto;
    float: left;
  }

  &:after {
    font-family: 'bbb-icons' !important;
    content: '\\e926';
    color: var(--color-gray-light);
  }
`;

const ListContainer = styled(FlexColumn)`
  justify-content: flex-start;
`;

const RoomItem = styled.div`
  margin: 1rem 0 1rem 0;
`;

const ItemTitle = styled.h2`
  margin: 0;
  color: var(--color-blue-light);
`;

const ItemButton = styled(Button)`
  padding: 0;
  outline: none !important;

  & > span {
    color: var(--color-blue-light);
  }
`;

const WithError = styled.span`
  color: var(--color-danger);
`;

const SubTitle = styled.p`
  font-size: var(--font-size-base);
  text-align: justify;
  color: var(--color-gray);
`;

const Content = styled(FlexColumn)``;

export default {
  BoxContainer,
  Alert,
  FreeJoinLabel,
  BreakoutNameInput,
  BreakoutBox,
  SpanWarn,
  RoomName,
  BreakoutSettings,
  FormLabel,
  InputRooms,
  DurationLabel,
  LabelText,
  DurationArea,
  DurationInput,
  HoldButtonWrapper,
  RandomlyAssignBtn,
  CheckBoxesContainer,
  FreeJoinCheckbox,
  RoomUserItem,
  LockIcon,
  ListContainer,
  RoomItem,
  ItemTitle,
  ItemButton,
  WithError,
  SubTitle,
  Content,
};
