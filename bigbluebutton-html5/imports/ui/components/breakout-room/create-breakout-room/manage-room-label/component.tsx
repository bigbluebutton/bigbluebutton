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
  assignModeratorsRandomly: {
    id: 'app.createBreakoutRoom.assignModeratorsRandomly',
    description: 'assign moderators randomly label',
  },
  assignModeratorsRandomlyDesc: {
    id: 'app.createBreakoutRoom.assignModeratorsRandomlyDesc',
    description: 'assign moderators randomly label description',
  },
});

interface ManageRoomLabelProps {
  numberOfRoomsIsValid: boolean;
  leastOneUserIsValid: boolean;
  allUnassignedAreModerators: boolean;
  onAssignReset: () => void;
  onAssignRandomly: () => void;
  onAssignModeratorsRandomly: () => void;
}

const ManageRoomLabel: React.FC<ManageRoomLabelProps> = ({
  numberOfRoomsIsValid,
  leastOneUserIsValid,
  allUnassignedAreModerators,
  onAssignReset,
  onAssignRandomly,
  onAssignModeratorsRandomly,
}) => {
  const intl = useIntl();

  const renderAssignButton = () => {
    if (leastOneUserIsValid) {
      return (
        <Styled.AssignBtns
          data-test="resetAssignments"
          label={intl.formatMessage(intlMessages.resetAssignments)}
          aria-describedby="resetAssignmentsDesc"
          onClick={onAssignReset}
          size="sm"
          color="default"
          disabled={!numberOfRoomsIsValid}
        />
      );
    }
    if (allUnassignedAreModerators) {
      return (
        <Styled.AssignBtns
          $random
          data-test="assignModeratorsRandomly"
          label={intl.formatMessage(intlMessages.assignModeratorsRandomly)}
          aria-describedby="assignModeratorsRandomlyDesc"
          onClick={onAssignModeratorsRandomly}
          size="sm"
          color="default"
        />
      );
    }
    return (
      <Styled.AssignBtns
        $random
        data-test="randomlyAssign"
        label={intl.formatMessage(intlMessages.randomlyAssign)}
        aria-describedby="randomlyAssignDesc"
        onClick={onAssignRandomly}
        size="sm"
        color="default"
      />
    );
  };

  return (
    <Styled.AssignBtnsContainer>
      <Styled.LabelText bold aria-hidden>
        {intl.formatMessage(intlMessages.manageRooms)}
      </Styled.LabelText>
      {renderAssignButton()}
    </Styled.AssignBtnsContainer>
  );
};

export default ManageRoomLabel;
