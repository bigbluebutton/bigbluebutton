package org.bigbluebutton.common2.msgs

// In messages

/**
 * Sent from graphql-actions to bbb-akka
 */
object PluginDataChannelPushEntryMsg { val NAME = "PluginDataChannelPushEntryMsg" }
case class PluginDataChannelPushEntryMsg(header: BbbClientMsgHeader, body: PluginDataChannelPushEntryMsgBody) extends StandardMsg
case class PluginDataChannelPushEntryMsgBody(
                                              pluginName: String,
                                              channelName: String,
                                              subChannelName: String,
                                              payloadJson: String,
                                              toRoles: List[String],
                                              toUserIds: List[String],
                                            )

object PluginDataChannelDeleteEntryMsg { val NAME = "PluginDataChannelDeleteEntryMsg" }
case class PluginDataChannelDeleteEntryMsg(header: BbbClientMsgHeader, body: PluginDataChannelDeleteEntryMsgBody) extends StandardMsg
case class PluginDataChannelDeleteEntryMsgBody(
                                                    pluginName: String,
                                                    subChannelName: String,
                                                    channelName: String,
                                                    entryId: String
                                                  )


object PluginDataChannelResetMsg { val NAME = "PluginDataChannelResetMsg" }
case class PluginDataChannelResetMsg(header: BbbClientMsgHeader, body: PluginDataChannelResetMsgBody) extends StandardMsg
case class PluginDataChannelResetMsgBody(
                                                    pluginName: String,
                                                    subChannelName: String,
                                                    channelName: String
                                                  )
