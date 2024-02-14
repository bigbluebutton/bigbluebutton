import {gql, useMutation} from '@apollo/client';
import usePatchedSubscription from "./usePatchedSubscription";
import {useState} from "react";

export default function PluginDataChannel({userId}) {
    const [textAreaValue, setTextAreaValue] = useState(``);

    const [pluginDataChannelDispatchMessage] = useMutation(gql`
      mutation PluginDataChannelDispatchMessage($pluginName: String!, $dataChannel: String!, $payloadJson: String!, $toRoles: [String]!,$toUserIds: [String]!) {
        pluginDataChannelDispatchMessage(
          pluginName: $pluginName,
          dataChannel: $dataChannel,
          payloadJson: $payloadJson,
          toRoles: $toRoles,
          toUserIds: $toUserIds,
        )
      }
    `);
    const handlePluginDataChannelDispatchMessage = (roles, userIds) => {
        if (textAreaValue.trim() !== '') {
            pluginDataChannelDispatchMessage({
                variables: {
                    pluginName: 'SelectRandomUserPlugin',
                    dataChannel: 'pickRandomUser',
                    payloadJson: textAreaValue,
                    toRoles: roles,
                    toUserIds: userIds,
                },
            });
        }
    };

    const [pluginDataChannelReset] = useMutation(gql`
      mutation PluginDataChannelReset($pluginName: String!, $dataChannel: String!) {
        pluginDataChannelReset(
          pluginName: $pluginName,
          dataChannel: $dataChannel
        )
      }
    `);
    const handlePluginDataChannelReset = () => {
        pluginDataChannelReset({
            variables: {
                pluginName: 'SelectRandomUserPlugin',
                dataChannel: 'pickRandomUser'
            },
        });
    };

    const [pluginDataChannelDeleteMessage] = useMutation(gql`
      mutation PluginDataChannelDeleteMessage($pluginName: String!, $dataChannel: String!, $messageId: String!) {
        pluginDataChannelDeleteMessage(
          pluginName: $pluginName,
          dataChannel: $dataChannel,
          messageId: $messageId
        )
      }
    `);
    const handlePluginDataChannelDeleteMessage = (messageId) => {
        pluginDataChannelDeleteMessage({
            variables: {
                pluginName: 'SelectRandomUserPlugin',
                dataChannel: 'pickRandomUser',
                messageId: messageId
            },
        });
    };

    const { loading, error, data } = usePatchedSubscription(
        gql`subscription {
              pluginDataChannelMessage(order_by: {createdAt: asc}) {
                createdAt
                dataChannel
                messageId
                payloadJson
                fromUserId
                pluginName
                toRoles
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
                <th>payloadJson</th>
                <th>toRoles</th>
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
                        <td>{JSON.stringify(curr.payloadJson)}</td>
                        <td>{JSON.stringify(curr.toRoles)}</td>
                        <td>{curr.createdAt}</td>
                        <td>
                            <button onClick={() => handlePluginDataChannelDeleteMessage(curr.messageId)}>Delete!</button>
                        </td>
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
                    <button onClick={() => handlePluginDataChannelDispatchMessage([],[])}>Dispatch to All!</button>
                    <button onClick={() => handlePluginDataChannelDispatchMessage(['moderator'], [])}>Dispatch to Moderators!</button>
                    <button onClick={() => handlePluginDataChannelDispatchMessage(['viewer'], [])}>Dispatch to Viewers!</button>
                    <button onClick={() => handlePluginDataChannelDispatchMessage(['moderator','viewer'], [])}>Dispatch to Moderators and Viewers!</button>
                    <button onClick={() => handlePluginDataChannelDispatchMessage(['presenter'], [])}>Dispatch to Presenter!</button>
                    <button onClick={() => handlePluginDataChannelDispatchMessage([], [userId, 'user-xxx'])}>Dispatch to Me!</button>
                    <button onClick={() => handlePluginDataChannelReset()}>Reset!</button>
                </td>
            </tr>
            </tfoot>
        </table>);
}

