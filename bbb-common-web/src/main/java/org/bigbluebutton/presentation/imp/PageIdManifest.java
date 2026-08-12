package org.bigbluebutton.presentation.imp;

import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;
import org.bigbluebutton.presentation.UploadedPresentation;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.File;
import java.lang.reflect.Type;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.util.Map;
import java.util.TreeMap;

// Persists the page-number to pageId mapping of a conversion as pages.json in
// the presentation directory. The on-disk filenames are keyed by the opaque
// pageId, so a conversion restored from the S3 cache can only be matched back
// to page numbers through this manifest.
public class PageIdManifest {
    private static final Logger log = LoggerFactory.getLogger(PageIdManifest.class);

    public static final String FILENAME = "pages.json";

    private static final Type MAP_TYPE = new TypeToken<TreeMap<String, String>>() {}.getType();

    public static void save(UploadedPresentation pres) {
        File manifest = new File(pres.getUploadedFile().getParent() + File.separatorChar + FILENAME);
        Map<String, String> byPageNum = new TreeMap<>();
        for (Map.Entry<Integer, String> e : pres.getPageIds().entrySet()) {
            byPageNum.put(String.valueOf(e.getKey()), e.getValue());
        }
        try {
            Files.write(manifest.toPath(), new Gson().toJson(byPageNum).getBytes(StandardCharsets.UTF_8));
        } catch (Exception e) {
            log.error("Failed to write page id manifest {}: {}", manifest.getAbsolutePath(), e.getMessage());
        }
    }

    // Matches cache-restored artifact files back to page numbers through the cached manifest,
    // then re-keys them under freshly minted page ids. The cached ids must not be adopted:
    // pageId is the global primary key of pres_page and the cache is keyed only by file hash,
    // so re-using cached ids would collide with the earlier upload that produced the cache
    // entry (e.g. a second insert of the same blank page) and silently re-home its rows.
    public static void restoreWithFreshIds(UploadedPresentation pres) {
        File presDir = pres.getUploadedFile().getParentFile();
        File manifest = new File(presDir, FILENAME);
        if (!manifest.exists()) return;
        try {
            String json = new String(Files.readAllBytes(manifest.toPath()), StandardCharsets.UTF_8);
            Map<String, String> byPageNum = new Gson().fromJson(json, MAP_TYPE);
            if (byPageNum == null) return;
            for (Map.Entry<String, String> e : byPageNum.entrySet()) {
                int pageNum = Integer.parseInt(e.getKey());
                PageArtifacts.rename(presDir, e.getValue(), pres.getOrMintPageId(pageNum));
            }
            log.info("Restored {} cached pages under fresh page ids for presentation {}", byPageNum.size(), pres.getId());
        } catch (Exception e) {
            log.warn("Ignoring unreadable page id manifest {}: {}", manifest.getAbsolutePath(), e.getMessage());
        }
    }
}
