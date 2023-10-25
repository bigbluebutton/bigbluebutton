import {useSubscription, gql, useMutation} from '@apollo/client';
import usePatchedSubscription from "./usePatchedSubscription";
import {useState} from "react";

export default function PluginDataChannel({userId}) {
    const [textAreaValue, setTextAreaValue] = useState('');

    const [dispatchPluginDataChannelMessage] = useMutation(gql`
      mutation DispatchPluginDataChannelMessageMsg($pluginName: String!, $dataChannel: String!, $messageContent: String!, $toRole: String!,$toUserId: String!) {
        dispatchPluginDataChannelMessageMsg(
          pluginName: $pluginName,
          dataChannel: $dataChannel,
          messageContent: $messageContent,
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
                    // messageInternalId is optional
                    // messageInternalId: 'ID' + new Date().getTime(),
                    messageContent: textAreaValue,
                    toRole: role,
                    toUserId: userId,
                },
            });
        }
    };

    const { loading, error, data } = usePatchedSubscription(
        gql`subscription {
              pluginDataChannelMessage(order_by: {createdAt: asc}) {
                createdAt
                dataChannel
                messageId
                messageInternalId
                messageContent
                fromUserId
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
                <th colSpan="7">Plugin Data Channel</th>
            </tr>
            <tr>
                <th>pluginName</th>
                <th>dataChannel</th>
                <th>fromUserId</th>
                <th>messageId</th>
                <th>messageInternalId</th>
                <th>messageContent</th>
                <th>createdAt</th>
                <th></th>
            </tr>
            </thead>
            <tbody>
            {data.map((curr) => {
                console.log('message', curr);
                return (
                    <tr key={curr.messageId}>
                        <td>{curr.pluginName}</td>
                        <td>{curr.dataChannel}</td>
                        <td>{curr.fromUserId}</td>
                        <td>{curr.messageId}</td>
                        <td>{curr.messageInternalId}</td>
                        <td>{JSON.stringify(curr.messageContent)}</td>
                        <td>{curr.createdAt}</td>
                    </tr>
                );
            })}
            </tbody>
            <tfoot>
            <tr>
                <td colSpan="7">
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

