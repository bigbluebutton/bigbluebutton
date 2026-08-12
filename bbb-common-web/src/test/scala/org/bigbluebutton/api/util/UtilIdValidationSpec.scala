package org.bigbluebutton.api.util

import org.bigbluebutton.api.Util

/**
 * Regression tests for the id format gate that PresentationController applies to the
 * insert-pages targetPresentationId before using it as a path segment of the target
 * presentation directory. Ids are opaque lowercase hex tokens; anything else, notably
 * path traversal sequences, must be rejected.
 */
class UtilIdValidationSpec extends UnitSpec {

  it should "accept a real presentation id" in {
    assert(Util.isPresIdValidFormat("8f65b1e4c4f316acb47278bcf07dea0925215d7f-1751925766297"))
  }

  it should "reject path traversal attempts" in {
    assert(!Util.isPresIdValidFormat("../../../etc/passwd"))
    assert(!Util.isPresIdValidFormat(".."))
    assert(!Util.isPresIdValidFormat("a/../b"))
    assert(!Util.isPresIdValidFormat("..%2f..%2fetc"))
  }

  it should "reject separators, null bytes and empty ids" in {
    assert(!Util.isPresIdValidFormat("abc/def"))
    assert(!Util.isPresIdValidFormat("abc\\def"))
    assert(!Util.isPresIdValidFormat("abc\u0000def"))
    assert(!Util.isPresIdValidFormat(""))
    assert(!Util.isPresIdValidFormat("ABC-DEF"))
  }
}
