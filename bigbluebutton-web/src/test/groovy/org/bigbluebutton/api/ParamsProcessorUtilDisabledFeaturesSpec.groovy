package org.bigbluebutton.api

import org.bigbluebutton.api.domain.Meeting
import spock.lang.Specification
import spock.lang.Unroll

class ParamsProcessorUtilDisabledFeaturesSpec extends Specification {

  ParamsProcessorUtil paramsProcessorUtil

  def setup() {
    paramsProcessorUtil = new ParamsProcessorUtil()
    paramsProcessorUtil.setSecuritySalt("test-salt")
    paramsProcessorUtil.setDefaultServerUrl("https://example.test")
    paramsProcessorUtil.setDefaultWelcomeMessage("")
    paramsProcessorUtil.setDefaultDialAccessNumber("")
    paramsProcessorUtil.setDefaultLogoutUrl("https://example.test/logout")
    paramsProcessorUtil.setWaitingGuestUsersTimeout(0L)
    paramsProcessorUtil.setUseDefaultLogo(false)
    paramsProcessorUtil.setUseDefaultDarkLogo(false)
    paramsProcessorUtil.setMaxNumPages(0)
  }

  @Unroll
  def "disabledFeaturesExclude removes #exclude from #disabledFeatures with server default #serverDefault"() {
    given:
    paramsProcessorUtil.setDisabledFeatures(serverDefault)
    Map<String, String> params = [
        (ApiParams.NAME): "Test meeting",
        (ApiParams.MEETING_ID): "test-meeting",
        (ApiParams.DISABLED_FEATURES): disabledFeatures,
        (ApiParams.DISABLED_FEATURES_EXCLUDE): exclude,
    ]

    when:
    Meeting meeting = paramsProcessorUtil.processCreateParams(params)

    then:
    meeting.disabledFeatures as Set == expected as Set

    where:
    serverDefault  | disabledFeatures | exclude         || expected
    ""             | "polls,chat"    | "polls, chat"  || []
    "polls,timer"  | ""              | "timer, polls" || []
    "polls,timer"  | ""              | "polls"        || ["timer"]
  }
}
