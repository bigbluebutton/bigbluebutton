package org.bigbluebutton.api.util

import org.scalatest.BeforeAndAfterAll
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers

// scalatest >= 3.2 package layout; the aliases this used to import were removed there.
abstract class UnitSpec extends AnyFlatSpec with Matchers with BeforeAndAfterAll
