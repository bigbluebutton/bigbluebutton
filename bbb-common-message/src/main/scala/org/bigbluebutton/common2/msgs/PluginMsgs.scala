package org.bigbluebutton.common2.msgs

import org.bigbluebutton.common2.domain.{PluginLearningAnalyticsDashboardUserData, PluginLearningAnalyticsDashboardUserDataDelete}

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

object PluginLearningAnalyticsDashboardUpsertUserDataMsg { val NAME = "PluginLearningAnalyticsDashboardUpsertUserDataMsg" }
case class PluginLearningAnalyticsDashboardUpsertUserDataMsg(header: BbbClientMsgHeader, body: PluginLearningAnalyticsDashboardUpsertUserDataMsgBody) extends StandardMsg
case class PluginLearningAnalyticsDashboardUpsertUserDataMsgBody(
                                                              pluginName: String,
                                                              userDataForLearningAnalyticsDashboard: PluginLearningAnalyticsDashboardUserData,
                                                              targetUserId: String
                                        )

object PluginLearningAnalyticsDashboardDeleteUserDataMsg { val NAME = "PluginLearningAnalyticsDashboardDeleteUserDataMsg" }
case class PluginLearningAnalyticsDashboardDeleteUserDataMsg(header: BbbClientMsgHeader, body: PluginLearningAnalyticsDashboardDeleteUserDataMsgBody) extends StandardMsg
case class PluginLearningAnalyticsDashboardDeleteUserDataMsgBody(
                                                              pluginName: String,
                                                              userDataForLearningAnalyticsDashboard: PluginLearningAnalyticsDashboardUserDataDelete,
                                                              targetUserId: String
                                        )
object PluginLearningAnalyticsDashboardClearAllUsersDataMsg { val NAME = "PluginLearningAnalyticsDashboardClearAllUsersDataMsg" }
case class PluginLearningAnalyticsDashboardClearAllUsersDataMsg(header: BbbClientMsgHeader, body: PluginLearningAnalyticsDashboardClearAllUsersDataMsgBody) extends StandardMsg
case class PluginLearningAnalyticsDashboardClearAllUsersDataMsgBody(
                                                              pluginName: String,
                                                              cardTitle: String,
                                        )
object PluginPersistEventMsg { val NAME = "PluginPersistEventMsg" }
case class PluginPersistEventMsg(header: BbbClientMsgHeader, body: PluginPersistEventMsgBody) extends StandardMsg
case class PluginPersistEventMsgBody(
                                      pluginName: String,
                                      eventName: String,
                                      payloadJson: Map[String, Object]
                                    )
object PluginPersistEventEvtMsg { val NAME = "PluginPersistEventEvtMsg" }
case class PluginPersistEventEvtMsg(header: BbbClientMsgHeader, body: PluginPersistEventEvtMsgBody) extends StandardMsg
case class PluginPersistEventEvtMsgBody(
                                        pluginName: String,
                                        eventName: String,
                                        payloadJson: Map[String, Object]
                                        )
