import {useSubscription, gql, useMutation} from '@apollo/client';
import usePatchedSubscription from "./usePatchedSubscription";
import {useState} from "react";

export default function PluginDataChannel({userId}) {
    const [textAreaValue, setTextAreaValue] = useState(`{"bla": "sent by ${userId}"}`);

    const [dispatchPluginDataChannelMessage] = useMutation(gql`
      mutation DispatchPluginDataChannelMessageMsg($pluginName: String!, $dataChannel: String!, $payloadJson: String!, $toRoles: [String]!,$toUserIds: [String]!) {
        dispatchPluginDataChannelMessageMsg(
          pluginName: $pluginName,
          dataChannel: $dataChannel,
          payloadJson: $payloadJson,
          toRoles: $toRoles,
          toUserIds: $toUserIds,
        )
      }
    `);
    const handleDispatchPluginDataChannelMessage = (roles, userIds) => {
        if (textAreaValue.trim() !== '') {
            dispatchPluginDataChannelMessage({
                variables: {
                    pluginName: 'SamplePresentationToolbarPlugin',
                    dataChannel: 'special-channel',
                    payloadJson: textAreaValue,
                    toRoles: roles,
                    toUserIds: userIds,
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
                payloadJson
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
                <th colSpan="6">Plugin Data Channel</th>
            </tr>
            <tr>
                <th>pluginName</th>
                <th>dataChannel</th>
                <th>fromUserId</th>
                <th>messageId</th>
                <th>payloadJson</th>
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
                    <button onClick={() => handleDispatchPluginDataChannelMessage([],[])}>Dispatch to All!</button>
                    <button onClick={() => handleDispatchPluginDataChannelMessage(['MODERATOR','VIEWER'], [])}>Dispatch to Moderators and Viewers!</button>
                    <button onClick={() => handleDispatchPluginDataChannelMessage(['PRESENTER'], [])}>Dispatch to Presenter!</button>
                    <button onClick={() => handleDispatchPluginDataChannelMessage([], [userId, 'aaabbb'])}>Dispatch to Me!</button>
                </td>
            </tr>
            </tfoot>
        </table>);
}

