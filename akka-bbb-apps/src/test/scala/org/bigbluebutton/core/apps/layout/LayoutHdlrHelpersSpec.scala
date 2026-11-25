package org.bigbluebutton.core.apps.layout

import org.scalatest.flatspec.AnyFlatSpec

// The dock size a presenter pushes is a fraction of the area the dock sits in. The handler stores it
// within [0, 1] and turns anything not finite into 0, the "not set" value.
class LayoutHdlrHelpersSpec extends AnyFlatSpec {

  import LayoutHdlrHelpers.clampCameraDockSize

  "clampCameraDockSize" should "keep a fraction within [0, 1] as it is" in {
    assert(clampCameraDockSize(0) == 0)
    assert(clampCameraDockSize(0.35) == 0.35)
    assert(clampCameraDockSize(1) == 1)
  }

  it should "hold values outside [0, 1] at the nearest bound" in {
    assert(clampCameraDockSize(-0.2) == 0)
    assert(clampCameraDockSize(2) == 1)
  }

  it should "turn values that are not finite into 0" in {
    assert(clampCameraDockSize(Double.NaN) == 0)
    assert(clampCameraDockSize(Double.PositiveInfinity) == 0)
    assert(clampCameraDockSize(Double.NegativeInfinity) == 0)
  }
}
