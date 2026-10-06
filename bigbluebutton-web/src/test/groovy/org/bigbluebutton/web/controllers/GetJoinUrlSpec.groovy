package org.bigbluebutton.web.controllers

import grails.testing.web.controllers.ControllerUnitTest
import org.bigbluebutton.api.MeetingService
import org.bigbluebutton.api.ParamsProcessorUtil
import org.bigbluebutton.api.domain.Meeting
import org.bigbluebutton.api.domain.User
import org.bigbluebutton.api.domain.UserSession
import org.bigbluebutton.api.model.shared.GetChecksum
import org.bigbluebutton.api.model.validator.GetChecksumValidator
import org.bigbluebutton.api.service.ServiceUtils
import org.bigbluebutton.api.service.ValidationService
import spock.lang.Specification
import spock.lang.Unroll

/**
 * Coverage for `ApiController#getJoinUrl`.
 *
 * Two independent concerns:
 *
 *  1. The join URL that getJoinUrl signs verifies against the real
 *     `GetChecksumValidator` — the same validator the `join` endpoint uses. If a
 *     future change desynchronises emitter and verifier, these specs fail rather
 *     than every generated join link breaking in production.
 *
 *  2. The `userdata-` gate carries through accepted key names only, and the
 *     blocklist applies to viewers.
 */
class GetJoinUrlSpec extends Specification implements ControllerUnitTest<ApiController> {

  static final String SALT = "b4578c133b8a49acaecacbb3abec91a1"
  static final String SERVER_URL = "http://127.0.0.1"
  static final String SESSION_TOKEN = "wxyz0123456789ab"
  static final String INTERNAL_MEETING_ID = "183f0bf3a0982a127bdb8161e0c44eb696b3e75c-1531155809613"
  static final String EXTERNAL_MEETING_ID = "Test Meeting"
  static final String INTERNAL_USER_ID = "w_euxnssffnsjl"

  // Mirrors the shipped default in bigbluebutton.properties.
  static final String USERDATA_BLOCKLIST =
      "bbb_record_permission,bbb_record_video,bbb_fullaudio_bridge,bbb_transparent_listen_only," +
      "bbb_multi_user_pen_only,bbb_presenter_tools,bbb_multi_user_tools"

  ParamsProcessorUtil paramsProcessorUtil
  MeetingService meetingService
  ValidationService validationService
  Meeting meeting

  def setup() {
    paramsProcessorUtil = new ParamsProcessorUtil()
    paramsProcessorUtil.setSecuritySalt(SALT)
    paramsProcessorUtil.setDefaultServerUrl(SERVER_URL)
    paramsProcessorUtil.setGetJoinUrlUserdataBlocklist(USERDATA_BLOCKLIST)
    controller.paramsProcessorUtil = paramsProcessorUtil

    meetingService = new MeetingService()
    meetingService.paramsProcessorUtil = paramsProcessorUtil
    controller.meetingService = meetingService

    validationService = new ValidationService()
    validationService.setSecuritySalt(SALT)
    validationService.setSupportedChecksumAlgorithms("sha1,sha256,sha384,sha512")
    controller.validationService = validationService

    // UserSessionValidator and GetChecksumValidator reach these through statics.
    ServiceUtils serviceUtils = new ServiceUtils()
    serviceUtils.setMeetingService(meetingService)
    serviceUtils.setValidationService(validationService)

    meeting = buildMeeting(false)
    registerMeeting(meeting)

    controller.REDIRECT_RESPONSE = false
  }

  /**
   * `isBreakout` matters because moderators bypass the blocklist only in
   * non-breakout meetings.
   */
  private Meeting buildMeeting(boolean isBreakout) {
    Meeting m = new Meeting.Builder(EXTERNAL_MEETING_ID, INTERNAL_MEETING_ID, 1531155809613L)
        .withName("Test Meeting")
        .withMaxUsers(20)
        .withLogoutUrl(SERVER_URL + "/api/logout")
        .withIsBreakout(isBreakout)
        .build()

    // getJoinUrl rejects unless meeting.isRunning(), which is `!users.isEmpty()`.
    m.userJoined(new User(INTERNAL_USER_ID, "u1", "Existing User", "VIEWER",
        false, "", "", false, false, "ALLOW", "HTML5"))

    return m
  }

  /**
   * Replaces the registered meeting with a breakout one carrying the same
   * internal id, so the UserSession registered by registerUserSession still
   * resolves to it.
   */
  private void makeMeetingABreakout() {
    meeting = buildMeeting(true)
    registerMeeting(meeting)
  }

  private void useBlocklist(String blocklist) {
    paramsProcessorUtil.setGetJoinUrlUserdataBlocklist(blocklist)
  }

  /***********************************
   * CHECKSUM ROUND TRIP
   ***********************************/

  def "The signed join URL verifies against GetChecksumValidator"() {
    given: "a viewer session"
    registerUserSession(controller.ROLE_ATTENDEE)

    when: "a join URL is requested"
    requestJoinUrl()

    then: "the URL is returned and its checksum verifies as the join endpoint would verify it"
    def url = responseJoinUrl()
    url.startsWith(SERVER_URL + "/bigbluebutton/api/join?")
    checksumVerifies(url)
  }

  def "The signed join URL still verifies when an accepted userdata key is carried through"() {
    given: "a viewer session and a well-formed, non-blocklisted userdata key"
    registerUserSession(controller.ROLE_ATTENDEE)
    addRequestParameter("userdata-lang", "fr")

    when: "a join URL is requested"
    requestJoinUrl()

    then: "the key is carried through and the checksum still covers it"
    def url = responseJoinUrl()
    queryOf(url).get("userdata-lang") == "fr"
    checksumVerifies(url)
  }

  def "A tampered checksum does not verify"() {
    given: "a viewer session"
    registerUserSession(controller.ROLE_ATTENDEE)

    when: "the returned URL has a parameter appended after signing"
    requestJoinUrl()
    def tampered = responseJoinUrl().replace("?&", "?&extra=1&")

    then: "verification fails — proving the round-trip assertions above are not vacuous"
    !checksumVerifies(tampered)
  }

  /***********************************
   * USERDATA GATE
   ***********************************/

  @Unroll
  def "Viewer userdata key #rawKey is #outcome"() {
    given: "a viewer session and a userdata parameter"
    registerUserSession(controller.ROLE_ATTENDEE)
    addRequestParameter(rawKey, "false")

    when: "a join URL is requested"
    requestJoinUrl()

    then: "the key is present only if it should be, and the URL remains correctly signed"
    def url = responseJoinUrl()
    queryOf(url).containsKey(rawKey) == shouldSurvive
    checksumVerifies(url)

    and: "the signed URL gains no additional parameters"
    !queryOf(url).containsKey("b")
    !queryOf(url).containsKey("d")

    where:
    rawKey                                                              | shouldSurvive
    // Accepted key names.
    "userdata-lang"                                                     | true
    "userdata-bbb_custom_style_url"                                     | true
    // Blocklisted.
    "userdata-bbb_record_video"                                         | false
    // Blocklist matching is case-insensitive.
    "userdata-BBB_RECORD_VIDEO"                                         | false
    "userdata-Bbb_record_video"                                         | false
    // '-' is not an accepted character in a key name.
    "userdata-bbb_record_video-"                                        | false
    "userdata-bbb_record_video---"                                      | false
    // Key names outside [A-Za-z0-9_.] are not accepted.
    "userdata-a&b=c&d"                                                   | false
    "userdata-a=b"                                                      | false
    "userdata-"                                                         | false

    outcome = shouldSurvive ? "carried through" : "dropped"
  }

  @Unroll
  def "Moderator userdata key #rawKey is #outcome"() {
    given: "a moderator session and a userdata parameter"
    registerUserSession(controller.ROLE_MODERATOR)
    addRequestParameter(rawKey, "false")

    when: "a join URL is requested"
    requestJoinUrl()

    then: "the blocklist does not apply, but the key name rule does"
    def url = responseJoinUrl()
    queryOf(url).containsKey(rawKey) == shouldSurvive
    checksumVerifies(url)

    where:
    rawKey                                                        | shouldSurvive
    // The blocklist applies to viewers only.
    "userdata-bbb_record_video"                                   | true
    "userdata-lang"                                               | true
    // The key name rule applies to every role.
    "userdata-my:theme"                                           | false
    "userdata-a&b=c&d"                                             | false

    outcome = shouldSurvive ? "carried through" : "dropped"
  }

  /***********************************
   * BLOCKLIST PARSING
   ***********************************/

  @Unroll
  def "A blocklist entry padded with #description still blocks the key"() {
    given: "a blocklist whose entries carry surrounding whitespace"
    useBlocklist(blocklist)
    registerUserSession(controller.ROLE_ATTENDEE)
    addRequestParameter("userdata-bbb_record_video", "false")

    when: "a viewer requests a join URL"
    requestJoinUrl()

    then: "the entry is matched despite the padding"
    def url = responseJoinUrl()
    !queryOf(url).containsKey("userdata-bbb_record_video")
    checksumVerifies(url)

    where:
    description        | blocklist
    "a leading space"  | "bbb_record_permission, bbb_record_video,bbb_presenter_tools"
    "a trailing space" | "bbb_record_video ,bbb_presenter_tools"
    "spaces both ends" | "bbb_record_permission , bbb_record_video , bbb_presenter_tools"
    "a tab"            | "bbb_record_permission,\tbbb_record_video,bbb_presenter_tools"
    "a newline"        | "bbb_record_permission,\nbbb_record_video\n,bbb_presenter_tools"
    "only the entry"   | "  bbb_record_video  "
  }

  def "A padded blocklist entry does not block an unrelated key"() {
    given: "a padded blocklist and a key that is not on it"
    useBlocklist("bbb_record_permission, bbb_record_video ,bbb_presenter_tools")
    registerUserSession(controller.ROLE_ATTENDEE)
    addRequestParameter("userdata-lang", "fr")

    when: "a viewer requests a join URL"
    requestJoinUrl()

    then: "trimming does not over-match"
    def url = responseJoinUrl()
    queryOf(url).get("userdata-lang") == "fr"
    checksumVerifies(url)
  }

  @Unroll
  def "A blocklist of \"#blocklist\" blocks all viewer userdata"() {
    given: "a blocklist set to the catch-all value"
    useBlocklist(blocklist)
    registerUserSession(controller.ROLE_ATTENDEE)
    addRequestParameter("userdata-lang", "fr")
    addRequestParameter("userdata-bbb_custom_style_url", "https://example.com/s.css")

    when: "a viewer requests a join URL"
    requestJoinUrl()

    then: "no userdata survives"
    def url = responseJoinUrl()
    queryOf(url).keySet().every { !it.startsWith("userdata-") }
    checksumVerifies(url)

    where:
    // The catch-all is matched case-insensitively, and the entry is trimmed.
    blocklist << ["all", "ALL", "All", " all ", "bbb_record_video,all"]
  }

  def "A blocklist of \"all\" does not block moderator userdata"() {
    given: "the catch-all blocklist and a moderator session"
    useBlocklist("all")
    registerUserSession(controller.ROLE_MODERATOR)
    addRequestParameter("userdata-lang", "fr")

    when: "a join URL is requested"
    requestJoinUrl()

    then: "the moderator bypass still applies"
    def url = responseJoinUrl()
    queryOf(url).get("userdata-lang") == "fr"
    checksumVerifies(url)
  }

  /***********************************
   * BREAKOUT MEETINGS
   ***********************************/

  def "A moderator in a breakout meeting does not bypass the blocklist"() {
    given: "a breakout meeting and a moderator session"
    makeMeetingABreakout()
    registerUserSession(controller.ROLE_MODERATOR)
    addRequestParameter("userdata-bbb_record_video", "false")

    when: "a join URL is requested"
    requestJoinUrl()

    then: "the blocklist applies, because the bypass is gated on !meeting.isBreakout()"
    def url = responseJoinUrl()
    !queryOf(url).containsKey("userdata-bbb_record_video")
    checksumVerifies(url)
  }

  def "A moderator in a breakout meeting still receives non-blocklisted userdata"() {
    given: "a breakout meeting and a moderator session"
    makeMeetingABreakout()
    registerUserSession(controller.ROLE_MODERATOR)
    addRequestParameter("userdata-lang", "fr")

    when: "a join URL is requested"
    requestJoinUrl()

    then: "only blocklisted keys are dropped"
    def url = responseJoinUrl()
    queryOf(url).get("userdata-lang") == "fr"
    checksumVerifies(url)
  }

  /***********************************
   * QUERY STRING STRUCTURE
   *
   * The parameter-name encoding at ApiController#getJoinUrl is defence in depth:
   * every non-userdata name is a literal, and the key-name regex rejects any
   * userdata name containing a separator before it can reach the encoder. These
   * specs pin the structural property that both layers exist to protect, so that
   * loosening either one is caught here.
   ***********************************/

  def "Every parameter name in the signed URL is free of separator characters"() {
    given: "a viewer session and a spread of hostile userdata keys"
    registerUserSession(controller.ROLE_ATTENDEE)
    addRequestParameter("userdata-a&b=c&d", "1")
    addRequestParameter("userdata-x=y", "2")
    addRequestParameter("userdata-p&q", "3")
    addRequestParameter("userdata-lang", "fr")

    when: "a join URL is requested"
    requestJoinUrl()

    then: "no emitted name can be mistaken for a separator by a servlet container"
    def url = responseJoinUrl()
    String rawQuery = url.substring(url.indexOf('?') + 1)

    rawQuery.split("&").findAll { !it.isEmpty() }.every { String pair ->
      String rawName = pair.contains("=") ? pair.substring(0, pair.indexOf('=')) : pair
      rawName ==~ /[A-Za-z0-9_.%-]+/
    }

    and: "the pair count equals exactly the parameters getJoinUrl means to emit"
    // fullName, meetingID, role, redirect, existingUserID, userdata-lang, checksum
    rawQuery.split("&").findAll { !it.isEmpty() }.size() == 7

    and: "the hostile keys contributed nothing"
    def parsed = queryOf(url)
    parsed.get("userdata-lang") == "fr"
    !parsed.containsKey("b")
    !parsed.containsKey("d")
    !parsed.containsKey("x")
    !parsed.containsKey("y")
    !parsed.containsKey("q")
    checksumVerifies(url)
  }

  def "The signed URL carries no parameter beyond the expected set"() {
    given: "a viewer session with no extra parameters"
    registerUserSession(controller.ROLE_ATTENDEE)

    when: "a join URL is requested"
    requestJoinUrl()

    then: "exactly the baseline parameters are present"
    def url = responseJoinUrl()
    queryOf(url).keySet() as Set == [
        "fullName", "meetingID", "role", "redirect", "existingUserID", "checksum"
    ] as Set
    checksumVerifies(url)
  }

  /***********************************
   * NON-USERDATA PASS-THROUGH
   ***********************************/

  def "enforceLayout is carried through and covered by the checksum"() {
    given: "a viewer session and an enforceLayout parameter"
    registerUserSession(controller.ROLE_ATTENDEE)
    addRequestParameter("enforceLayout", "PRESENTATION_FOCUS")

    when: "a join URL is requested"
    requestJoinUrl()

    then: "enforceLayout bypasses the userdata rules by design"
    def url = responseJoinUrl()
    queryOf(url).get("enforceLayout") == "PRESENTATION_FOCUS"
    checksumVerifies(url)
  }

  def "A repeated userdata parameter yields a single occurrence"() {
    given: "a viewer session and the same userdata key supplied twice"
    registerUserSession(controller.ROLE_ATTENDEE)
    request.addParameter("userdata-lang", "en")
    request.addParameter("userdata-lang", "fr")
    params["userdata-lang"] = "fr"

    when: "a join URL is requested"
    requestJoinUrl()

    then: "the last value wins and the key appears once"
    def url = responseJoinUrl()
    String rawQuery = url.substring(url.indexOf('?') + 1)
    rawQuery.split("&").count { it.startsWith("userdata-lang=") } == 1
    queryOf(url).get("userdata-lang") == "fr"
    checksumVerifies(url)
  }

  def "An empty-valued userdata parameter is dropped"() {
    given: "a viewer session and a userdata key with an empty value"
    registerUserSession(controller.ROLE_ATTENDEE)
    addRequestParameter("userdata-lang", "")

    when: "a join URL is requested"
    requestJoinUrl()

    then: "the key does not reach the signed URL"
    def url = responseJoinUrl()
    !queryOf(url).containsKey("userdata-lang")
    checksumVerifies(url)
  }

  /***********************************
   * HELPER METHODS
   ***********************************/

  /**
   * MeetingService exposes only an unmodifiable view via getMeetings(), and
   * createMeeting() also publishes to the message gateway, which is not wired in
   * a controller unit test. Injecting into the backing map keeps this a unit.
   */
  private void registerMeeting(Meeting m) {
    def meetingsField = MeetingService.class.getDeclaredField("meetings")
    meetingsField.setAccessible(true)
    meetingsField.get(meetingService).put(m.getInternalId(), m)
  }

  private void registerUserSession(String role) {
    UserSession us = new UserSession()
    us.meetingID = INTERNAL_MEETING_ID
    us.externMeetingID = EXTERNAL_MEETING_ID
    us.internalUserId = INTERNAL_USER_ID
    us.externUserID = "u1"
    us.fullname = "Test User"
    us.role = role
    us.authToken = SESSION_TOKEN
    us.conferencename = "Test Meeting"
    us.logoutUrl = SERVER_URL + "/api/logout"
    meetingService.addUserSession(SESSION_TOKEN, us)

    // hasValidSession() accepts either a live HTTP session entry or a meeting
    // configured with allowRequestsWithoutSession; the former keeps this unit.
    session[SESSION_TOKEN] = true
  }

  private void addRequestParameter(String name, String value) {
    request.addParameter(name, value)
    params[name] = value
  }

  private void requestJoinUrl() {
    addRequestParameter("sessionToken", SESSION_TOKEN)
    request.addHeader("Accept", "application/json")
    request.format = "json"
    controller.getJoinUrl()
  }

  private String responseJoinUrl() {
    def payload = response.json.response
    assert payload.returncode == controller.RESP_CODE_SUCCESS:
        "getJoinUrl did not succeed: ${response.text}"
    return payload.url
  }

  /**
   * Parses a query string the way a servlet container would: split on the
   * separators, then decode. Names are compared decoded so that a key carrying
   * separator characters would surface as extra parameters if encoding regressed.
   */
  private Map<String, String> queryOf(String url) {
    String query = url.substring(url.indexOf('?') + 1)
    Map<String, String> parsed = [:]

    query.split("&").findAll { !it.isEmpty() }.each { String pair ->
      int i = pair.indexOf('=')
      String name = i < 0 ? pair : pair.substring(0, i)
      String value = i < 0 ? "" : pair.substring(i + 1)
      parsed.put(URLDecoder.decode(name, "UTF-8"), URLDecoder.decode(value, "UTF-8"))
    }

    return parsed
  }

  /**
   * Verifies the URL exactly as the `join` endpoint does: the raw query string
   * minus the checksum, hashed with the api call name and the salt.
   */
  private boolean checksumVerifies(String url) {
    String rawQuery = url.substring(url.indexOf('?') + 1)
    String checksum = queryOf(url).get("checksum")

    assert checksum != null: "no checksum in generated URL: ${url}"
    assert !validationService.getSecuritySalt().isEmpty():
        "salt must be set or GetChecksumValidator short-circuits to true"

    GetChecksum getChecksum = new GetChecksum("join", checksum, rawQuery, null)
    return new GetChecksumValidator().isValid(getChecksum, null)
  }
}
