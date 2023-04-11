import React from 'react';
import { useSubscription } from '@apollo/client';
import {
  AutoSizer,
  CellMeasurer,
  CellMeasurerCache,
  List,
} from 'react-virtualized';
import Styled from './styles';
import ListItem from './list-item/component';
import Skeleton from './list-item/skeleton/component';
import { USERS_SUBSCRIPTION } from './queries';


import { ListProps } from 'react-virtualized/dist/es/List';

const cache = new CellMeasurerCache({
  fixedWidth: true,
  keyMapper: () => 1,
});

const SKELETON_COUNT = 10;

const rowRenderer: React.FC<ListProps>  = (users, { index, key, parent, }) => {
  const user = users && users[index];    
  return (
    <CellMeasurer
      key={key}
      cache={cache}
      columnIndex={0}
      parent={parent}
      rowIndex={index}
    >
      {
        user ? <ListItem user={user} /> : <Skeleton />
      }
    </CellMeasurer>
  );
};  


const UserListParticipants: React.FC = () => {
  const { loading: usersLoading, error: usersError, data } = useSubscription(
    USERS_SUBSCRIPTION,
  );
  const { user: users } = (data || {});
    console.log('users', users, usersLoading, usersError);
  return (
    <Styled.UserListColumn>
      {
        <AutoSizer>
          {({ width, height }) => {
            return <Styled.VirtualizedList
                rowHeight={cache.rowHeight}
                rowRenderer={rowRenderer.bind(null, users)}
                noRowRenderer={() => <div>no users</div>}
                rowCount={users?.length || SKELETON_COUNT}
                height={height - 1}
                width={width - 1}
                overscanRowCount={30}
                deferredMeasurementCache={cache}
                tabIndex={-1}
            />;
          }}
        </AutoSizer>
      }
    </Styled.UserListColumn>
  );
};
export default UserListParticipants;