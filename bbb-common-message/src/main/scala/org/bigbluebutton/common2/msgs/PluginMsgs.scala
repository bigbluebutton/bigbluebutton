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
                                              payloadJson: Map[String, Any],
                                              toRoles: List[String],
                                              toUserIds: List[String],
                                            )

object PluginDataChannelReplaceEntryMsg { val NAME = "PluginDataChannelReplaceEntryMsg" }
case class PluginDataChannelReplaceEntryMsg(header: BbbClientMsgHeader, body: PluginDataChannelReplaceEntryMsgBody) extends StandardMsg
case class PluginDataChannelReplaceEntryMsgBody(
                                              pluginName: String,
                                              channelName: String,
                                              subChannelName: String,
                                              payloadJson: Map[String, Any],
                                              entryId: String,
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

object PluginLearningAnalyticsDashboardSendDataMsg { val NAME = "PluginLearningAnalyticsDashboardSendDataMsg" }
case class PluginLearningAnalyticsDashboardSendDataMsg(header: BbbClientMsgHeader, body: PluginLearningAnalyticsDashboardSendDataMsgBody) extends StandardMsg
case class PluginLearningAnalyticsDashboardSendDataMsgBody(
                                          pluginName: String,
                                          genericDataForLearningAnalyticsDashboard: Map[String, Any]
                                        )
