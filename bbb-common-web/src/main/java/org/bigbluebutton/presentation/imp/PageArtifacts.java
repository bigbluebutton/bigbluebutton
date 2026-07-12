package org.bigbluebutton.presentation.imp;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.File;

/**
 * The per-page slide artifact naming scheme, shared by the insert-pages splicer and the
 * conversion-cache restore: subdir, filename prefix, extension. svgs use "slide&lt;id&gt;"
 * (no dash), the rest use a dashed prefix.
 */
public final class PageArtifacts {
  private static final Logger log = LoggerFactory.getLogger(PageArtifacts.class);

  private static final String[][] TYPES = {
      {"svgs", "slide", ".svg"},
      {"pngs", "slide-", ".png"},
      {"textfiles", "slide-", ".txt"},
      {"thumbnails", "thumb-", ".png"},
  };

  private PageArtifacts() {
  }

  /** Moves one page's artifacts from one presentation dir to another, keeping the page id. */
  static void move(File fromDir, File toDir, String pageId) {
    for (String[] a : TYPES) {
      File src = new File(new File(fromDir, a[0]), a[1] + pageId + a[2]);
      if (!src.exists()) {
        // Tolerated: not every conversion flow produces every artifact type (e.g. no pngs).
        continue;
      }
      File subTo = new File(toDir, a[0]);
      if (!subTo.isDirectory() && !subTo.mkdirs()) {
        log.warn("Could not create artifact dir {}", subTo.getAbsolutePath());
        continue;
      }
      File dst = new File(subTo, a[1] + pageId + a[2]);
      if (!src.renameTo(dst)) {
        log.warn("Failed to move {} -> {}", src.getAbsolutePath(), dst.getAbsolutePath());
      }
    }
  }

  /** Renames one page's artifacts in place from one page id to another. */
  static void rename(File presDir, String fromId, String toId) {
    for (String[] a : TYPES) {
      File src = new File(new File(presDir, a[0]), a[1] + fromId + a[2]);
      if (!src.exists()) {
        continue;
      }
      File dst = new File(new File(presDir, a[0]), a[1] + toId + a[2]);
      if (!src.renameTo(dst)) {
        log.warn("Failed to rename {} -> {}", src.getAbsolutePath(), dst.getAbsolutePath());
      }
    }
  }
}
