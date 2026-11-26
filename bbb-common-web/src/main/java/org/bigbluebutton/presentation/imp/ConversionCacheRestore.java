package org.bigbluebutton.presentation.imp;

import com.amazonaws.services.s3.model.S3Object;
import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;
import org.apache.commons.io.FileUtils;

import java.io.File;
import java.io.IOException;
import java.io.Reader;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

/**
 * Restores the artifacts of a cached conversion into an upload directory under new page ids, so two
 * uploads of the same file never share a page id.
 */
public final class ConversionCacheRestore {

    private ConversionCacheRestore() {}

    /**
     * Extracts the cached archive into a temporary directory, checks its manifest, and moves into
     * presDir only the artifacts of the manifest's pages, renamed to new page ids. Everything else of
     * the archive is deleted with the temporary directory. On failure, nothing of the archive is left
     * in presDir and the exception is thrown.
     *
     * @return the new page ids, in page order
     */
    public static List<String> restore(S3Object archive, File presDir) throws IOException {
        File temp = Files.createTempDirectory(presDir.toPath(), "cache-restore-").toFile();
        List<File> moved = new ArrayList<>();
        try {
            TarGzManager.decompress(archive, temp.getAbsolutePath());
            List<String> cachedIds = readManifest(temp);

            List<String> newIds = new ArrayList<>(cachedIds.size());
            for (String cachedId : cachedIds) {
                String newId = UUID.randomUUID().toString();
                newIds.add(newId);
                for (PageArtifacts.Type type : PageArtifacts.Type.values()) {
                    File source = type.file(temp, cachedId);
                    if (source.exists()) {
                        File target = type.file(presDir, newId);
                        FileUtils.forceMkdirParent(target);
                        FileUtils.moveFile(source, target);
                        moved.add(target);
                    }
                }
            }
            return newIds;
        } catch (IOException | RuntimeException e) {
            for (File file : moved) {
                FileUtils.deleteQuietly(file);
            }
            throw e;
        } finally {
            FileUtils.deleteQuietly(temp);
        }
    }

    /**
     * Page ids of the manifest, in page order. The keys must be 1..n, the ids valid and distinct, and
     * every page must have one artifact of each required type.
     */
    static List<String> readManifest(File dir) throws IOException {
        File manifestFile = new File(dir, TarGzManager.MANIFEST);
        if (!manifestFile.isFile()) {
            throw new IOException("Cached conversion without manifest");
        }
        Map<String, String> manifest;
        try (Reader reader = Files.newBufferedReader(manifestFile.toPath(), StandardCharsets.UTF_8)) {
            manifest = new Gson().fromJson(reader, new TypeToken<Map<String, String>>() {}.getType());
        }
        if (manifest == null || manifest.isEmpty()) {
            throw new IOException("Empty manifest");
        }

        int n = manifest.size();
        List<String> ids = new ArrayList<>(n);
        Set<String> seen = new HashSet<>();
        for (int num = 1; num <= n; num++) {
            String id = manifest.get(String.valueOf(num));
            if (id == null) {
                throw new IOException("Manifest pages are not 1.." + n);
            }
            if (!PageArtifacts.isValidPageId(id) || !seen.add(id)) {
                throw new IOException("Invalid or repeated page id in manifest: " + id);
            }
            for (PageArtifacts.Type type : PageArtifacts.Type.values()) {
                if (type.required && !type.file(dir, id).isFile()) {
                    throw new IOException("Missing " + type.directory + " artifact for page " + num);
                }
            }
            ids.add(id);
        }
        return ids;
    }
}
