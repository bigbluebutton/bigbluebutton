import {gql, useMutation} from '@apollo/client';
import usePatchedSubscription from "./usePatchedSubscription";
import {useState} from "react";

export default function PluginDataChannel({userId}) {
    const [textAreaValue, setTextAreaValue] = useState(``);

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
                    dataChannel: 'public-channel',
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
                    <button onClick={() => handleDispatchPluginDataChannelMessage([],[])}>Dispatch to All!</button>
                    <button onClick={() => handleDispatchPluginDataChannelMessage(['moderator'], [])}>Dispatch to Moderators!</button>
                    <button onClick={() => handleDispatchPluginDataChannelMessage(['viewer'], [])}>Dispatch to Viewers!</button>
                    <button onClick={() => handleDispatchPluginDataChannelMessage(['moderator','viewer'], [])}>Dispatch to Moderators and Viewers!</button>
                    <button onClick={() => handleDispatchPluginDataChannelMessage(['presenter'], [])}>Dispatch to Presenter!</button>
                    <button onClick={() => handleDispatchPluginDataChannelMessage([], [userId, 'user-xxx'])}>Dispatch to Me!</button>
                </td>
            </tr>
            </tfoot>
        </table>);
}

