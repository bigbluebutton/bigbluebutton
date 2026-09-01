package org.bigbluebutton.core.apps.layout

import org.scalatest.flatspec.AnyFlatSpec

class LayoutHdlrHelpersSpec extends AnyFlatSpec {

  import LayoutHdlrHelpers.clampPresentationVideoRate

  it should "clamp a rate above one to one" in {
    assert(clampPresentationVideoRate(2) == 1)
  }

  it should "clamp a negative rate to zero" in {
    assert(clampPresentationVideoRate(-1) == 0)
  }

  it should "keep rates within the valid range" in {
    assert(clampPresentationVideoRate(0.5) == 0.5)
  }

  it should "keep the valid boundary rates" in {
    assert(clampPresentationVideoRate(0) == 0)
    assert(clampPresentationVideoRate(1) == 1)
  }

  it should "replace non-finite rates with zero" in {
    assert(clampPresentationVideoRate(Double.NaN) == 0)
    assert(clampPresentationVideoRate(Double.PositiveInfinity) == 0)
    assert(clampPresentationVideoRate(Double.NegativeInfinity) == 0)
  }
}
