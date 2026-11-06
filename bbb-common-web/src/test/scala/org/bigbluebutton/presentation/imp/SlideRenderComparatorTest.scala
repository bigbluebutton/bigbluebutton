package org.bigbluebutton.presentation.imp

import java.awt.Color
import java.awt.image.BufferedImage

import org.bigbluebutton.api.util.UnitSpec

/**
 * Tests the comparison used to find the slides pdftocairo renders incorrectly
 * (issue #23953). The renders of a page by the cairo and the splash backend
 * never match pixel by pixel, so only a clear difference covering about 1% of
 * the page or more must count.
 */
class SlideRenderComparatorTest extends UnitSpec {

  private def blankPage(width: Int = 400, height: Int = 283): BufferedImage = {
    fill(new BufferedImage(width, height, BufferedImage.TYPE_INT_RGB), 0, 0, width, height, Color.WHITE)
  }

  private def fill(image: BufferedImage, x: Int, y: Int, width: Int, height: Int, color: Color): BufferedImage = {
    val graphics = image.createGraphics()
    graphics.setColor(color)
    graphics.fillRect(x, y, width, height)
    graphics.dispose()
    image
  }

  // A few dark bars standing for the lines of text of a slide
  private def withText(image: BufferedImage, offset: Int = 0): BufferedImage = {
    List(20, 40, 60, 80).foreach(y => fill(image, 30 + offset, y + offset, 300, 6, Color.DARK_GRAY))
    image
  }

  it should "not tell identical renders apart" in {
    assert(!SlideRenderComparator.differ(withText(blankPage()), withText(blankPage())))
  }

  it should "ignore the rendering noise between two backends" in {
    // One pixel off in size and position, slightly different shades
    val first = withText(blankPage(400, 283))
    val second = withText(blankPage(400, 282), 1)
    fill(second, 200, 150, 100, 100, new Color(235, 235, 235))

    assert(!SlideRenderComparator.differ(first, second))
  }

  it should "detect the content missing from a blank render" in {
    val complete = fill(blankPage(), 27, 32, 229, 55, Color.BLACK)

    assert(SlideRenderComparator.differ(blankPage(), complete))
    assert(SlideRenderComparator.differ(complete, blankPage()))
  }

  it should "detect the content missing from a render that is not blank" in {
    val complete = fill(withText(blankPage()), 250, 180, 92, 22, Color.BLACK)

    assert(SlideRenderComparator.differ(withText(blankPage()), complete))
  }

  it should "ignore a difference too small to matter" in {
    val complete = fill(withText(blankPage()), 250, 180, 12, 12, Color.BLACK)

    assert(!SlideRenderComparator.differ(withText(blankPage()), complete))
  }

  it should "read transparent pixels as white" in {
    val transparent = new BufferedImage(400, 283, BufferedImage.TYPE_INT_ARGB)

    assert(!SlideRenderComparator.differ(transparent, blankPage()))
  }

}
