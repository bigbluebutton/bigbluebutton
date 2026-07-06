package org.bigbluebutton.presentation.imp;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.File;
import java.io.IOException;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Splices the per-page slide artifacts of a freshly converted presentation (the "insert"
 * presentation) into an existing "target" presentation directory at a 1-based position.
 *
 * <p>BigBlueButton serves slides by page number (svgs/slideN.svg, pngs/slide-N.png,
 * textfiles/slide-N.txt, thumbnails/thumb-N.png) and the recording processor copies the same
 * directories and references them by the integer page number stored in events.xml. So to insert
 * K pages at position P we shift the existing files with number &gt;= P up by K (descending, to
 * avoid collisions) and move the inserted files into the freed slots. After this, slideN on disk
 * matches the final logical page number, keeping both live playback and recordings coherent.
 *
 * <p>The combined per-presentation PDF (&lt;presId&gt;.pdf, used only for the download-full feature
 * and the recording search-text loop) is intentionally not spliced here; the visual page set is
 * fully described by the per-page artifacts above.
 */
public class InsertPagesSplicer {
  private static final Logger log = LoggerFactory.getLogger(InsertPagesSplicer.class);

  // subdir, filename prefix, extension. svgs use "slideN" (no dash), the rest use a dashed prefix.
  private static final String[][] ARTIFACTS = {
      {"svgs", "slide", ".svg"},
      {"pngs", "slide-", ".png"},
      {"textfiles", "slide-", ".txt"},
      {"thumbnails", "thumb-", ".png"},
  };

  /**
   * @return a two-element array: [clamped 1-based insert position, total pages after the insert].
   */
  public static int[] splice(File insertDir, File targetDir, int rawPosition, int insertCount) throws IOException {
    if (!targetDir.isDirectory()) {
      throw new IOException("Target presentation dir does not exist: " + targetDir.getAbsolutePath());
    }

    int targetTotal = countTargetPages(targetDir);
    int position = Math.max(1, Math.min(rawPosition, targetTotal + 1));

    // Shift existing target pages [position..targetTotal] up by insertCount, descending to
    // avoid overwriting a slot we have not moved yet.
    for (int n = targetTotal; n >= position; n--) {
      renameAcrossArtifacts(targetDir, n, targetDir, n + insertCount);
    }

    // Move the inserted pages [1..insertCount] into the freed slots [position..position+K-1].
    for (int k = 1; k <= insertCount; k++) {
      renameAcrossArtifacts(insertDir, k, targetDir, position + k - 1);
    }

    log.info("Spliced {} page(s) into presentation dir {} at position {} (was {} pages, now {})",
        insertCount, targetDir.getName(), position, targetTotal, targetTotal + insertCount);
    return new int[] { position, targetTotal + insertCount };
  }

  private static void renameAcrossArtifacts(File fromDir, int fromNum, File toDir, int toNum) {
    for (String[] a : ARTIFACTS) {
      File subFrom = new File(fromDir, a[0]);
      File subTo = new File(toDir, a[0]);
      File src = new File(subFrom, a[1] + fromNum + a[2]);
      if (!src.exists()) {
        continue;
      }
      if (!subTo.isDirectory() && !subTo.mkdirs()) {
        log.warn("Could not create artifact dir {}", subTo.getAbsolutePath());
        continue;
      }
      File dst = new File(subTo, a[1] + toNum + a[2]);
      if (!src.renameTo(dst)) {
        log.warn("Failed to move {} -> {}", src.getAbsolutePath(), dst.getAbsolutePath());
      }
    }
  }

  private static int countTargetPages(File targetDir) {
    File svgs = new File(targetDir, "svgs");
    File[] files = svgs.listFiles();
    if (files == null) {
      return 0;
    }
    Pattern p = Pattern.compile("^slide(\\d+)\\.svg$");
    int max = 0;
    for (File f : files) {
      Matcher m = p.matcher(f.getName());
      if (m.matches()) {
        max = Math.max(max, Integer.parseInt(m.group(1)));
      }
    }
    return max;
  }
}
