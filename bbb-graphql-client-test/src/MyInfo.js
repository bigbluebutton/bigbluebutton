import {gql, useQuery} from '@apollo/client';

export default function MyInfo() {
  const { loading, error, data } = useQuery(
    gql`query {
      user_current {
        userId
        name
        meeting {
            name
        }
      }
    }`
  );

  return  !loading && !error &&
    (<table border="1">
      <thead>
        <tr>
            <th colSpan={3}>My info</th>
        </tr>
        <tr>
            {/*<th>Id</th>*/}
            <th>userId</th>
            <th>name</th>
            <th>Meeting</th>
        </tr>
      </thead>
      <tbody>
        {data.user_current.map((curr) => {
            console.log('meeting', curr);
          return (
              <tr key={curr.userId}>
                  <td>{curr.userId}</td>
                  <td>{curr.name}</td>
                  <td>{curr.meeting.name}</td>
              </tr>
          );
        })}
      </tbody>
    </table>);
}

