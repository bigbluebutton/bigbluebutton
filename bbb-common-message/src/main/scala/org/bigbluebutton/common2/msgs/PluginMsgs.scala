package org.bigbluebutton.common2.msgs

import org.bigbluebutton.common2.domain.PluginLearningAnalyticsDashboardGenericData

// In messages

/**
 * Sent from graphql-actions to bbb-akka
 */

trait PluginDataChannelReplaceOrDeleteBaseBody{
    val pluginName: String
    val channelName: String
    val subChannelName: String
    val entryId: String
}

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
case class PluginDataChannelReplaceEntryMsgBody (
                                              pluginName: String,
                                              channelName: String,
                                              subChannelName: String,
                                              payloadJson: Map[String, Any],
                                              entryId: String,
                                            ) extends PluginDataChannelReplaceOrDeleteBaseBody

object PluginDataChannelDeleteEntryMsg { val NAME = "PluginDataChannelDeleteEntryMsg" }
case class PluginDataChannelDeleteEntryMsg(header: BbbClientMsgHeader, body: PluginDataChannelDeleteEntryMsgBody) extends StandardMsg
case class PluginDataChannelDeleteEntryMsgBody(
                                                pluginName: String,
                                                subChannelName: String,
                                                channelName: String,
                                                entryId: String
                                              ) extends PluginDataChannelReplaceOrDeleteBaseBody


object PluginDataChannelResetMsg { val NAME = "PluginDataChannelResetMsg" }
case class PluginDataChannelResetMsg(header: BbbClientMsgHeader, body: PluginDataChannelResetMsgBody) extends StandardMsg
case class PluginDataChannelResetMsgBody(
                                          pluginName: String,
                                          subChannelName: String,
                                          channelName: String
                                        )

object PluginLearningAnalyticsDashboardSendGenericDataMsg { val NAME = "PluginLearningAnalyticsDashboardSendGenericDataMsg" }
case class PluginLearningAnalyticsDashboardSendGenericDataMsg(header: BbbClientMsgHeader, body: PluginLearningAnalyticsDashboardSendGenericDataMsgBody) extends StandardMsg
case class PluginLearningAnalyticsDashboardSendGenericDataMsgBody(
                                                            pluginName: String,
                                                            genericDataForLearningAnalyticsDashboard: PluginLearningAnalyticsDashboardGenericData
                                        )
