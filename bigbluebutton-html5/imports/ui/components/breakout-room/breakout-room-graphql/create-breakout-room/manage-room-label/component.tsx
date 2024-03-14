import React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import Styled from '../styles';

const intlMessages = defineMessages({
  manageRooms: {
    id: 'app.createBreakoutRoom.manageRoomsLabel',
    description: 'Label for manage rooms',
  },
  resetAssignments: {
    id: 'app.createBreakoutRoom.resetAssignments',
    description: 'reset assignments label',
  },
  resetAssignmentsDesc: {
    id: 'app.createBreakoutRoom.resetAssignmentsDesc',
    description: 'reset assignments label description',
  },
  randomlyAssign: {
    id: 'app.createBreakoutRoom.randomlyAssign',
    description: 'randomly assign label',
  },
  randomlyAssignDesc: {
    id: 'app.createBreakoutRoom.randomlyAssignDesc',
    description: 'randomly assign label description',
  },
});

interface ManageRoomLabelProps {
  numberOfRoomsIsValid: boolean;
  leastOneUserIsValid: boolean;
  onAssignReset: () => void;
  onAssignRandomly: () => void;
}

const ManageRoomLabel: React.FC<ManageRoomLabelProps> = ({
  numberOfRoomsIsValid,
  leastOneUserIsValid,
  onAssignReset,
  onAssignRandomly,
}) => {
  const intl = useIntl();
  return (
    <Styled.AssignBtnsContainer>
      <Styled.LabelText bold aria-hidden>
        {intl.formatMessage(intlMessages.manageRooms)}
      </Styled.LabelText>
      {leastOneUserIsValid ? (
        <Styled.AssignBtns
          data-test="resetAssignments"
          label={intl.formatMessage(intlMessages.resetAssignments)}
          aria-describedby="resetAssignmentsDesc"
          onClick={onAssignReset}
          size="sm"
          color="default"
          disabled={!numberOfRoomsIsValid}
        />
      ) : (
        <Styled.AssignBtns
          $random
          data-test="randomlyAssign"
          label={intl.formatMessage(intlMessages.randomlyAssign)}
          aria-describedby="randomlyAssignDesc"
          onClick={onAssignRandomly}
          size="sm"
          color="default"
        />
      )}
    </Styled.AssignBtnsContainer>
  );
};

export default ManageRoomLabel;
