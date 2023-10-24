import {useSubscription, gql, useMutation} from '@apollo/client';
import usePatchedSubscription from "./usePatchedSubscription";
import {useState} from "react";

export default function PluginDataChannel({userId}) {
    const [textAreaValue, setTextAreaValue] = useState('');

    const [dispatchPluginDataChannelMessage] = useMutation(gql`
      mutation DispatchPluginDataChannelMessageMsg($pluginName: String!, $dataChannel: String!, $msgId: String!, $msgJson: String!, $toRole: String!,$toUserId: String!) {
        dispatchPluginDataChannelMessageMsg(
          pluginName: $pluginName,
          dataChannel: $dataChannel,
          msgId: $msgId,
          msgJson: $msgJson,
          toRole: $toRole,
          toUserId: $toUserId,
        )
      }
    `);

    const handleDispatchPluginDataChannelMessage = (role, userId) => {
        if (textAreaValue.trim() !== '') {
            dispatchPluginDataChannelMessage({
                variables: {
                    pluginName: 'my-plugin',
                    dataChannel: 'my-channel',
                    msgId: 'xxx',
                    msgJson: textAreaValue,
                    toRole: role,
                    toUserId: userId,
                },
            });
        }
    };

    const { loading, error, data } = usePatchedSubscription(
        gql`subscription {
              pluginDataChannel(order_by: {createdAt: asc}) {
                createdAt
                dataChannel
                msgId
                msgJson
                msgSenderUserId
                pluginName
                toRole
                toUserId
              }
            }
            `
    );

    return  !loading && !error &&
        (<table border="1">
            <thead>
            <tr>
                <th colSpan="6">Plugin Data Channel</th>
            </tr>
            <tr>
                <th>pluginName</th>
                <th>dataChannel</th>
                <th>msgSenderUserId</th>
                <th>msgId</th>
                <th>msgJson</th>
                <th>createdAt</th>
                <th></th>
            </tr>
            </thead>
            <tbody>
            {data.map((curr) => {
                console.log('message', curr);
                return (
                    <tr key={curr.msgId}>
                        <td>{curr.pluginName}</td>
                        <td>{curr.dataChannel}</td>
                        <td>{curr.msgSenderUserId}</td>
                        <td>{curr.msgId}</td>
                        <td>{JSON.stringify(curr.msgJson)}</td>
                        <td>{curr.createdAt}</td>
                    </tr>
                );
            })}
            </tbody>
            <tfoot>
            <tr>
                <td colSpan="6">
                    <textarea name="test"
                              style={{height: '100px'}}
                              value={textAreaValue}
                              onChange={(e) => setTextAreaValue(e.target.value)}
                    ></textarea>
                    <button onClick={() => handleDispatchPluginDataChannelMessage('','')}>Dispatch to All!</button>
                    <button onClick={() => handleDispatchPluginDataChannelMessage('MODERATOR', '')}>Dispatch to Moderators!</button>
                    <button onClick={() => handleDispatchPluginDataChannelMessage('VIEWER', '')}>Dispatch to Viewers!</button>
                    <button onClick={() => handleDispatchPluginDataChannelMessage('', userId)}>Dispatch to Me!</button>
                </td>
            </tr>
            </tfoot>
        </table>);
}

