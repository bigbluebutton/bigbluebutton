package org.bigbluebutton.common2.msgs

// In messages

/**
 * Sent from graphql-actions to bbb-akka
 */
object PluginDataChannelDispatchMessageMsg { val NAME = "PluginDataChannelDispatchMessageMsg" }
case class PluginDataChannelDispatchMessageMsg(header: BbbClientMsgHeader, body: PluginDataChannelDispatchMessageMsgBody) extends StandardMsg
case class PluginDataChannelDispatchMessageMsgBody(
                                              pluginName: String,
                                              dataChannel: String,
                                              payloadJson: String,
                                              toRoles: List[String],
                                              toUserIds: List[String],
                                            )

object PluginDataChannelDeleteMessageMsg { val NAME = "PluginDataChannelDeleteMessageMsg" }
case class PluginDataChannelDeleteMessageMsg(header: BbbClientMsgHeader, body: PluginDataChannelDeleteMessageMsgBody) extends StandardMsg
case class PluginDataChannelDeleteMessageMsgBody(
                                                    pluginName: String,
                                                    dataChannel: String,
                                                    messageId: String
                                                  )


object PluginDataChannelResetMsg { val NAME = "PluginDataChannelResetMsg" }
case class PluginDataChannelResetMsg(header: BbbClientMsgHeader, body: PluginDataChannelResetMsgBody) extends StandardMsg
case class PluginDataChannelResetMsgBody(
                                                    pluginName: String,
                                                    dataChannel: String
                                                  )
