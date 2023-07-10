import React from "react";
import { defineMessages, useIntl } from "react-intl";
import Styled from './styles';
import { USER_AGGREGATE_COUNT_SUBSCRIPTION } from "/imports/ui/core/graphql/queries/users";
import { useSubscription } from "@apollo/client";
import UserTitleOptionsContainer from "./user-options-dropdown/component";

interface UserTitleProps {
  count: number;
}

const messages = defineMessages({
  usersTitle: {
    id: 'app.userList.usersTitle',
    description: 'Title for the Header',
  },
});

const UserTitle: React.FC<UserTitleProps> = ({
  count
}) => {
  const intl = useIntl();
  return (
    <Styled.Container>
      <Styled.SmallTitle>
        {intl.formatMessage(messages.usersTitle)}
        {` (${count.toLocaleString("en-US", { notation: "standard" })})`}
      </Styled.SmallTitle>
      <UserTitleOptionsContainer />
    </Styled.Container>
  )
}

const UserTitleContainer: React.FC = () => {
  const {
    loading: countLoading,
    error: countError,
    data: countData,
  } = useSubscription(USER_AGGREGATE_COUNT_SUBSCRIPTION);
  const count = countData?.user_aggregate?.aggregate?.count || 0;
  return <UserTitle count={count} />
}

export default UserTitleContainer;