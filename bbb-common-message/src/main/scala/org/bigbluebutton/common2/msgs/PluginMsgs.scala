package org.bigbluebutton.common2.msgs

// In messages

/**
 * Sent from graphql-actions to bbb-akka
 */
object DispatchPluginDataChannelMessageMsg { val NAME = "DispatchPluginDataChannelMessageMsg" }
case class DispatchPluginDataChannelMessageMsg(header: BbbClientMsgHeader, body: DispatchPluginDataChannelMessageMsgBody) extends StandardMsg
case class DispatchPluginDataChannelMessageMsgBody(
                                              pluginName: String,
                                              dataChannel: String,
                                              payloadJson: String,
                                              toRoles: List[String],
                                              toUserIds: List[String],
                                            )
