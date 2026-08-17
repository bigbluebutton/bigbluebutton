package org.bigbluebutton.api.domain;

import java.util.Locale;

public final class SharedNotesEditor {
    public static final String ETHERPAD = "etherpad";
    public static final String BLOCK_NOTE = "blockNote";
    public static final String VALID_PATTERN = "(?i)^(etherpad|blockNote)?$";

    private SharedNotesEditor() {}

    public static String canonicalize(String value) {
        if (value == null) return null;

        return switch (value.toLowerCase(Locale.ROOT)) {
            case ETHERPAD -> ETHERPAD;
            case "blocknote" -> BLOCK_NOTE;
            default -> null;
        };
    }
}
