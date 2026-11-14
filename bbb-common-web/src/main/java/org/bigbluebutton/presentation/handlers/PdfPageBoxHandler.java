package org.bigbluebutton.presentation.handlers;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Reads the size of one page from the per-page lines of `pdfinfo -f N -l N -box`:
 *
 * <pre>
 * Page    3 size:  960 x 540 pts   (the CropBox, before rotation)
 * Page    3 rot:   90
 * </pre>
 */
public class PdfPageBoxHandler extends AbstractCommandHandler {
  private static final Pattern SIZE = Pattern.compile("Page\\s+(\\d+)\\s+size:\\s*([0-9.]+)\\s*x\\s*([0-9.]+)\\s*pts");
  private static final Pattern ROT = Pattern.compile("Page\\s+(\\d+)\\s+rot:\\s*(-?\\d+)");

  private final String id;
  private final int page;

  public PdfPageBoxHandler(String id, int page) {
    this.id = id;
    this.page = page;
  }

  /**
   * @return {width, height} in points as the page is displayed (rotation applied), or null when the
   *         page's size line is missing or unusable.
   */
  public double[] pageSize() {
    String out = stdoutBuilder.toString();
    double width = 0;
    double height = 0;
    boolean found = false;
    Matcher size = SIZE.matcher(out);
    while (size.find()) {
      if (Integer.parseInt(size.group(1)) == page) {
        width = Double.parseDouble(size.group(2));
        height = Double.parseDouble(size.group(3));
        found = true;
        break;
      }
    }
    if (!found || width <= 0 || height <= 0) {
      return null;
    }
    Matcher rot = ROT.matcher(out);
    while (rot.find()) {
      if (Integer.parseInt(rot.group(1)) == page) {
        int degrees = ((Integer.parseInt(rot.group(2)) % 360) + 360) % 360;
        if (degrees == 90 || degrees == 270) {
          return new double[] { height, width };
        }
        break;
      }
    }
    return new double[] { width, height };
  }

  @Override
  protected String getIdTag() {
    return id;
  }
}
