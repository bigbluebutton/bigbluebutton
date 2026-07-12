package org.bigbluebutton.presentation.imp;

import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.File;
import java.io.IOException;
import java.lang.reflect.Type;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.TreeMap;

/**
 * Splices the per-page slide artifacts of a freshly converted presentation (the "insert"
 * presentation) into an existing "target" presentation directory at a 1-based position.
 *
 * <p>Slide artifacts are named by opaque page id (svgs/slide&lt;pageId&gt;.svg,
 * pngs/slide-&lt;pageId&gt;.png, textfiles/slide-&lt;pageId&gt;.txt,
 * thumbnails/thumb-&lt;pageId&gt;.png) and served by page id, so file names never encode position
 * and inserting pages renames nothing that already exists. The insert amounts to: move the
 * inserted pages' artifacts into the target directory under their unchanged page-id names, and
 * re-key the target's pages.json manifest (the num -&gt; pageId source of truth, which an S3 cache
 * restore reads back through {@link PageIdManifest}) so positions at/after the insert shift up.
 *
 * <p>The combined per-presentation PDF (&lt;presId&gt;.pdf, used only for the download-full feature
 * and the recording search-text loop) is intentionally not spliced here; the visual page set is
 * fully described by the per-page artifacts above.
 */
public class InsertPagesSplicer {
  private static final Logger log = LoggerFactory.getLogger(InsertPagesSplicer.class);

  private static final Type MANIFEST_TYPE = new TypeToken<Map<String, String>>() {}.getType();

  /**
   * Synchronized: the manifest re-key below is a read-modify-write of the target's pages.json,
   * and inserts can complete concurrently (the image path finishes on a supervisor pool thread,
   * and the plugin command is fire-and-forget). Two unserialized splices into the same target
   * would lose one insert's manifest entries. A single global lock is enough here: splices are
   * rare and amount to a few renames plus a small json rewrite.
   *
   * @param insertPageIds 1-based page number to pageId of the converted insert presentation.
   * @return a two-element array: [clamped 1-based insert position, total pages after the insert].
   */
  public static synchronized int[] splice(File insertDir, File targetDir, int rawPosition,
                             Map<Integer, String> insertPageIds) throws IOException {
    if (!targetDir.isDirectory()) {
      throw new IOException("Target presentation dir does not exist: " + targetDir.getAbsolutePath());
    }
    if (insertPageIds == null || insertPageIds.isEmpty()) {
      throw new IOException("No page ids for the pages to insert into " + targetDir.getAbsolutePath());
    }

    // The manifest is the num -> pageId source of truth for the target; without it we cannot
    // know how many pages the target has nor which position each id occupies, so abort rather
    // than guess.
    TreeMap<Integer, String> targetPages = readManifest(targetDir);
    int targetTotal = targetPages.size();
    int insertCount = insertPageIds.size();
    int position = Math.max(1, Math.min(rawPosition, targetTotal + 1));

    // Move the inserted pages' artifacts into the target dir. Names are opaque page ids, so
    // nothing collides and no existing target file is touched.
    for (String pageId : insertPageIds.values()) {
      PageArtifacts.move(insertDir, targetDir, pageId);
    }

    // Re-key the manifest: positions at/after the insert shift up by insertCount, the inserted
    // ids take position..position+insertCount-1.
    TreeMap<Integer, String> merged = new TreeMap<>();
    for (Map.Entry<Integer, String> e : targetPages.entrySet()) {
      int num = e.getKey();
      merged.put(num >= position ? num + insertCount : num, e.getValue());
    }
    int nextNum = position;
    for (Map.Entry<Integer, String> e : new TreeMap<>(insertPageIds).entrySet()) {
      merged.put(nextNum++, e.getValue());
    }
    writeManifest(targetDir, merged);

    log.info("Spliced {} page(s) into presentation dir {} at position {} (was {} pages, now {})",
        insertCount, targetDir.getName(), position, targetTotal, targetTotal + insertCount);
    return new int[] { position, targetTotal + insertCount };
  }

  private static TreeMap<Integer, String> readManifest(File targetDir) throws IOException {
    File manifest = new File(targetDir, PageIdManifest.FILENAME);
    if (!manifest.exists()) {
      throw new IOException("Target presentation has no page id manifest: " + manifest.getAbsolutePath());
    }
    String json = new String(Files.readAllBytes(manifest.toPath()), StandardCharsets.UTF_8);
    Map<String, String> byNum = new Gson().fromJson(json, MANIFEST_TYPE);
    if (byNum == null || byNum.isEmpty()) {
      throw new IOException("Target page id manifest is empty: " + manifest.getAbsolutePath());
    }
    TreeMap<Integer, String> pages = new TreeMap<>();
    try {
      for (Map.Entry<String, String> e : byNum.entrySet()) {
        pages.put(Integer.parseInt(e.getKey()), e.getValue());
      }
    } catch (NumberFormatException e) {
      throw new IOException("Target page id manifest has a non-numeric page number: " + manifest.getAbsolutePath());
    }
    return pages;
  }

  private static void writeManifest(File targetDir, TreeMap<Integer, String> pages) throws IOException {
    Map<String, String> byNum = new LinkedHashMap<>();
    for (Map.Entry<Integer, String> e : pages.entrySet()) {
      byNum.put(String.valueOf(e.getKey()), e.getValue());
    }
    File manifest = new File(targetDir, PageIdManifest.FILENAME);
    Files.write(manifest.toPath(), new Gson().toJson(byNum).getBytes(StandardCharsets.UTF_8));
  }
}
