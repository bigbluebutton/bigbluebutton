package org.bigbluebutton.web.controllers

import grails.testing.web.controllers.ControllerUnitTest
import org.apache.commons.codec.digest.DigestUtils
import org.bigbluebutton.api.MeetingService
import org.bigbluebutton.api.service.ServiceUtils
import org.bigbluebutton.api.service.ValidationService
import spock.lang.Specification
import spock.lang.Unroll

/**
 * Coverage for the duplicate-checksum rejection in
 * `ValidationService#validate(ApiCall, HttpServletRequest)`.
 *
 * Why it matters: `initializeRequest` picks the checksum to verify with
 * `params.get("checksum")[0]` — the FIRST value — while `GetChecksum` verifies
 * against the RAW query string, from which `removeChecksumFromQueryString()`
 * strips that value by literal `String.replace`. A request carrying two
 * checksums therefore had two disagreeing readings of itself, and for the
 * identical-value case the stripping removed BOTH occurrences, leaving a query
 * string that verified. The fix rejects any such request outright.
 *
 * ---------------------------------------------------------------------------
 * A NOTE ON WHAT ACTUALLY DISCRIMINATES
 *
 * `checksumError` / "Checksums do not match" is NOT unique to the new guard:
 * `GetChecksumConstraint.message()` defaults to the very same string, so an
 * ordinary checksum mismatch is indistinguishable from a guard rejection by the
 * violations map alone. Asserting that key on a checksummed call therefore
 * proves nothing — such a request fails validation either way.
 *
 * Two specs below are the load-bearing ones, and both stay red if the guard is
 * removed:
 *
 *   1. "getJoinUrl ..." — getJoinUrl is a RequestWithSession with no checksum
 *      constraint at all, so a `checksumError` on that call can ONLY come from
 *      the new guard. Without the guard the request reports a session violation.
 *
 *   2. "A duplicated but individually valid checksum ..." — this is the request
 *      shape that VERIFIED before the fix, because stripping `checksum=X`
 *      globally removes both copies and leaves exactly the signed query string.
 *
 * The remaining specs are breadth coverage: they pin that the guard applies
 * across endpoints and counts, and they would survive the guard's removal.
 * ---------------------------------------------------------------------------
 *
 * The guard sits before `initializeRequest`, so rejection needs no salt, no
 * `ServiceUtils` statics and no meeting. Only the controls do.
 *
 * This spec runs against the `bbb-common-web` jar published to mavenLocal, not
 * the working-tree source — `bigbluebutton-web` consumes the module as a binary
 * dependency. A stale jar makes these specs FAIL rather than pass, but
 * republish (`bbb-common-web/deploy.sh`) before trusting a failure.
 */
class ValidationServiceChecksumSpec extends Specification implements ControllerUnitTest<ApiController> {

  static final String SALT = "b4578c133b8a49acaecacbb3abec91a1"
  static final String ALGORITHMS = "sha1,sha256,sha384,sha512"
  static final String DUPLICATE_MESSAGE = "Checksums do not match"

  // Any 40-hex string is a well-formed sha1 checksum as far as the validator's
  // algorithm inference is concerned.
  static final String CHECKSUM_A = "a" * 40
  static final String CHECKSUM_B = "b" * 40

  ValidationService validationService

  def setup() {
    validationService = new ValidationService()
    validationService.setSecuritySalt(SALT)
    validationService.setSupportedChecksumAlgorithms(ALGORITHMS)

    // GetChecksumValidator reaches the salt through these statics, and
    // UserSessionValidator reaches the meeting store the same way.
    ServiceUtils serviceUtils = new ServiceUtils()
    serviceUtils.setValidationService(validationService)
    serviceUtils.setMeetingService(new MeetingService())
  }

  /**
   * The checksum that verifies for a query string consisting of nothing but the
   * checksum parameter itself: stripping it leaves "", so the signed data is
   * just the api call name plus the salt.
   */
  private static String validChecksumFor(String apiCallName) {
    return DigestUtils.sha1Hex(apiCallName + SALT)
  }

  /***********************************
   * DISCRIMINATING SPECS
   *
   * These two fail if the duplicate-checksum guard is removed.
   ***********************************/

  def "getJoinUrl rejects duplicate checksums even though it never verifies one"() {
    given: "duplicate checksums on a call that is authenticated by session token alone"
    request.addParameter("checksum", CHECKSUM_A)
    request.addParameter("checksum", CHECKSUM_B)
    request.setQueryString("checksum=${CHECKSUM_A}&checksum=${CHECKSUM_B}")

    when: "the request is validated"
    Map<String, String> violations = validationService.validate(
        ValidationService.ApiCall.GET_JOIN_URL, request)

    then: "the only possible source of a checksum error here is the new guard"
    violations["checksumError"] == DUPLICATE_MESSAGE

    and: "and it short-circuits, so the session-token constraint never reports"
    violations.size() == 1
  }

  def "getJoinUrl without duplicate checksums reports a session violation, not a checksum one"() {
    given: "a single checksum, which getJoinUrl has no constraint for"
    request.addParameter("checksum", CHECKSUM_A)
    request.setQueryString("checksum=${CHECKSUM_A}")

    when: "the request is validated"
    Map<String, String> violations = validationService.validate(
        ValidationService.ApiCall.GET_JOIN_URL, request)

    then: "this is the baseline the spec above is measured against"
    !violations.containsKey("checksumError")

    and: "the missing session token is what fails instead"
    !violations.isEmpty()
  }

  def "A duplicated but individually valid checksum is rejected"() {
    given: "one correct checksum, supplied twice"
    // This is the shape that VERIFIED before the fix. removeChecksumFromQueryString
    // replaces `checksum=<value>` globally, so both copies are stripped and what
    // remains is exactly the query string the checksum was computed over.
    String valid = validChecksumFor("getMeetings")
    request.addParameter("checksum", valid)
    request.addParameter("checksum", valid)
    request.setQueryString("checksum=${valid}&checksum=${valid}")

    when: "the request is validated"
    Map<String, String> violations = validationService.validate(
        ValidationService.ApiCall.GET_MEETINGS, request)

    then: "the guard rejects it rather than letting the stripping quirk wave it through"
    violations["checksumError"] == DUPLICATE_MESSAGE
  }

  def "The same checksum supplied once still verifies"() {
    given: "the identical checksum value, supplied only once"
    String valid = validChecksumFor("getMeetings")
    request.addParameter("checksum", valid)
    request.setQueryString("checksum=${valid}")

    when: "the request is validated"
    Map<String, String> violations = validationService.validate(
        ValidationService.ApiCall.GET_MEETINGS, request)

    then: "the fix rejects duplication specifically, not this checksum value"
    violations.isEmpty()
  }

  /***********************************
   * BREADTH COVERAGE
   *
   * These pin the guard's reach. They do not discriminate on their own, because
   * a checksummed call fails anyway when its checksum does not verify.
   ***********************************/

  @Unroll
  def "#count checksum parameters are rejected"() {
    given: "a request carrying more than one checksum parameter"
    String value = "c" * 40
    count.times { request.addParameter("checksum", value) }
    request.setQueryString((1..count).collect { "checksum=${value}" }.join("&"))

    when: "the request is validated"
    Map<String, String> violations = validationService.validate(
        ValidationService.ApiCall.GET_JOIN_URL, request)

    then: "any count above one is rejected — asserted on getJoinUrl so the guard is the only source"
    violations["checksumError"] == DUPLICATE_MESSAGE

    where:
    count << [2, 3, 5]
  }

  @Unroll
  def "Duplicate checksums are rejected for the #apiCall call"() {
    given: "a request with duplicate checksums"
    request.addParameter("checksum", CHECKSUM_A)
    request.addParameter("checksum", CHECKSUM_B)
    request.setQueryString("checksum=${CHECKSUM_A}&checksum=${CHECKSUM_B}")

    when: "the request is validated"
    Map<String, String> violations = validationService.validate(apiCall, request)

    then: "the guard is not specific to one endpoint"
    violations["checksumError"] == DUPLICATE_MESSAGE

    and: "it short-circuits before the per-call constraints, so nothing else reports"
    violations.size() == 1

    where:
    apiCall << [
        ValidationService.ApiCall.CREATE,
        ValidationService.ApiCall.JOIN,
        ValidationService.ApiCall.GET_MEETINGS,
        ValidationService.ApiCall.GET_MEETING_INFO,
        ValidationService.ApiCall.END,
        ValidationService.ApiCall.MEETING_RUNNING,
        ValidationService.ApiCall.GET_SESSIONS,
        ValidationService.ApiCall.GET_JOIN_URL,
    ]
  }

  def "Duplicate checksums are rejected before any other validation runs"() {
    given: "a CREATE request that is also invalid for unrelated reasons"
    // CREATE carries content-type, URL and password constraints on top of the
    // checksum. If the guard did not return first, several of those would report.
    request.addParameter("checksum", CHECKSUM_A)
    request.addParameter("checksum", CHECKSUM_B)
    request.setQueryString("checksum=${CHECKSUM_A}&checksum=${CHECKSUM_B}")

    when: "the request is validated"
    Map<String, String> violations = validationService.validate(
        ValidationService.ApiCall.CREATE, request)

    then: "the checksum error is the only violation reported"
    violations.size() == 1
    violations["checksumError"] == DUPLICATE_MESSAGE
  }

  /***********************************
   * CONTROLS
   ***********************************/

  def "A single wrong checksum is rejected"() {
    given: "one checksum that does not verify"
    request.addParameter("checksum", CHECKSUM_A)
    request.setQueryString("checksum=${CHECKSUM_A}")

    when: "the request is validated"
    Map<String, String> violations = validationService.validate(
        ValidationService.ApiCall.GET_MEETINGS, request)

    then: "proving the positive control is not vacuous"
    violations["checksumError"] == DUPLICATE_MESSAGE
  }

  def "The salt must be set or every checksum assertion here would be vacuous"() {
    expect: "an empty salt makes GetChecksumValidator return true unconditionally"
    !validationService.getSecuritySalt().isEmpty()
  }

  /***********************************
   * CHARACTERISATION
   *
   * Not an endorsement of the behaviour — a record of it, so that a change shows
   * up here as a deliberate decision rather than a silent drift.
   ***********************************/

  def "A whitespace-padded duplicate checksum key collapses instead of duplicating"() {
    given: "a second checksum parameter whose NAME carries a leading space"
    // sanitizeParams trims parameter names, so ` checksum` becomes `checksum`
    // and overwrites the real entry via Map#put rather than extending it. The
    // array length stays 1, so the duplicate guard does not fire.
    String valid = validChecksumFor("getMeetings")
    request.addParameter("checksum", valid)
    request.addParameter(" checksum", CHECKSUM_B)
    request.setQueryString("checksum=${valid}&%20checksum=${CHECKSUM_B}")

    when: "validated as getJoinUrl, where only the guard can raise a checksum error"
    Map<String, String> violations = validationService.validate(
        ValidationService.ApiCall.GET_JOIN_URL, request)

    then: "the guard does NOT fire — the collapse hides the duplication from it"
    !violations.containsKey("checksumError")

    and: "so the request falls through to the ordinary constraints"
    !violations.isEmpty()
  }

  def "The padded-key collapse is not a checksum bypass"() {
    given: "the same padded-key request, on a call that does verify checksums"
    String valid = validChecksumFor("getMeetings")
    request.addParameter("checksum", valid)
    request.addParameter(" checksum", CHECKSUM_B)
    request.setQueryString("checksum=${valid}&%20checksum=${CHECKSUM_B}")

    when: "the request is validated"
    Map<String, String> violations = validationService.validate(
        ValidationService.ApiCall.GET_MEETINGS, request)

    then: "the surviving value is the padded one, which cannot verify against a raw query string that still contains both parameters"
    violations["checksumError"] == DUPLICATE_MESSAGE
  }
}
