package org.bigbluebutton.presentation.imp;

import java.io.File;
import java.util.regex.Pattern;

/**
 * The per-page artifacts of a presentation and their names. Every page artifact is named by the id
 * of its page, never by its position: {@code <presDir>/<directory>/<prefix><pageId><extension>}.
 */
public final class PageArtifacts {

    /** A page id: a lowercase UUID v4. */
    public static final Pattern PAGE_ID =
            Pattern.compile("^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$");

    public enum Type {
        // No hyphen after "slide": the playback replaces "slide-" with "thumbnails/thumb-" in image paths.
        SVG("svgs", "slide", ".svg", true),
        // Only generated with generatePngs.
        PNG("pngs", "slide-", ".png", false),
        THUMBNAIL("thumbnails", "thumb-", ".png", true),
        TEXT("textfiles", "slide-", ".txt", true),
        // The page extracted from the uploaded PDF (downscaled when big); only for pages that come
        // from a PDF or an office document, and never served by URL.
        PDF("pages", "page-", ".pdf", false);

        public final String directory;
        public final String prefix;
        public final String extension;
        /** Every converted page has one; optional types exist only with some configurations. */
        public final boolean required;

        Type(String directory, String prefix, String extension, boolean required) {
            this.directory = directory;
            this.prefix = prefix;
            this.extension = extension;
            this.required = required;
        }

        public String fileName(String pageId) {
            return prefix + requireValid(pageId) + extension;
        }

        public File file(File presDir, String pageId) {
            return new File(new File(presDir, directory), fileName(pageId));
        }

        /** The page id in a file name of this type, or null if the name is not one. */
        public String pageIdOf(String fileName) {
            if (!fileName.startsWith(prefix) || !fileName.endsWith(extension)) return null;
            String id = fileName.substring(prefix.length(), fileName.length() - extension.length());
            return isValidPageId(id) ? id : null;
        }
    }

    private PageArtifacts() {}

    public static boolean isValidPageId(String id) {
        return id != null && PAGE_ID.matcher(id).matches();
    }

    public static String requireValid(String pageId) {
        if (!isValidPageId(pageId)) {
            throw new IllegalArgumentException("Invalid page id: " + pageId);
        }
        return pageId;
    }
}
