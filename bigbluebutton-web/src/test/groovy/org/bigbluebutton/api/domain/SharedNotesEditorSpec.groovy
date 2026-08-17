package org.bigbluebutton.api.domain

import org.bigbluebutton.api.ParamsProcessorUtil
import spock.lang.Specification
import spock.lang.Unroll

class SharedNotesEditorSpec extends Specification {

  @Unroll
  def "canonicalizes #input to #expected"() {
    expect:
    SharedNotesEditor.canonicalize(input) == expected

    where:
    input                                || expected
    "etherpad"                           || "etherpad"
    "Etherpad"                           || "etherpad"
    "blockNote"                          || "blockNote"
    "blocknote"                          || "blockNote"
    ""                                   || null
    null                                 || null
    "pleasebreakme"                      || null
    "123456789012345678901234567890"     || null
  }

  def "canonicalizes valid and invalid configured defaults"() {
    given:
    def paramsProcessor = new ParamsProcessorUtil()
    def defaultField = ParamsProcessorUtil.getDeclaredField("defaultSharedNotesEditor")
    defaultField.accessible = true

    when:
    paramsProcessor.setSharedNotesEditor("ETHERPAD")

    then:
    defaultField.get(paramsProcessor) == "etherpad"

    when:
    paramsProcessor.setSharedNotesEditor("unknown")

    then:
    defaultField.get(paramsProcessor) == "blockNote"
  }

  @Unroll
  def "validates #input as #expected"() {
    expect:
    input.matches(SharedNotesEditor.VALID_PATTERN) == expected

    where:
    input                                || expected
    "etherpad"                           || true
    "Etherpad"                           || true
    "blockNote"                          || true
    "blocknote"                          || true
    ""                                   || true
    "pleasebreakme"                      || false
    "123456789012345678901234567890"     || false
  }
}
