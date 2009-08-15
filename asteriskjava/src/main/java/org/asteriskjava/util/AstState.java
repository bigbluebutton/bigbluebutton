package org.asteriskjava.util;

import java.util.Map;
import java.util.HashMap;
import java.util.Collections;
import java.util.regex.Pattern;
import java.util.regex.Matcher;

/**
 * Utility methods related to channel state handling in Asterisk's <code>channel.c</code>.
 *
 * @since 1.0.0
 */
public class AstState
{
    /* from include/asterisk/channel.h */

    /**
     * Channel is down and available.
     */
    public static final int AST_STATE_DOWN = 0;

    /**
     * Channel is down, but reserved.
     */
    public static final int AST_STATE_RSRVD = 1;

    /**
     * Channel is off hook.
     */
    public static final int AST_STATE_OFFHOOK = 2;

    /**
     * Digits (or equivalent) have been dialed.
     */
    public static final int AST_STATE_DIALING = 3;

    /**
     * Line is ringing.
     */
    public static final int AST_STATE_RING = 4;

    /**
     * Remote end is ringing.
     */
    public static final int AST_STATE_RINGING = 5;

    /**
     * Line is up.
     */
    public static final int AST_STATE_UP = 6;

    /**
     * Line is busy.
     */
    public static final int AST_STATE_BUSY = 7;

    /**
     * Digits (or equivalent) have been dialed while offhook.
     */
    public static final int AST_STATE_DIALING_OFFHOOK = 8;

    /**
     * Channel has detected an incoming call and is waiting for ring.
     */
    public static final int AST_STATE_PRERING = 9;

    private static final Map<String, Integer> inverseStateMap;

    static
    {
        final Map<String, Integer> tmpInverseStateMap = new HashMap<String, Integer>();

        tmpInverseStateMap.put("Down", AST_STATE_DOWN);
        tmpInverseStateMap.put("Rsrvd", AST_STATE_RSRVD);
        tmpInverseStateMap.put("OffHook", AST_STATE_OFFHOOK);
        tmpInverseStateMap.put("Dialing", AST_STATE_DIALING);
        tmpInverseStateMap.put("Ring", AST_STATE_RING);
        tmpInverseStateMap.put("Ringing", AST_STATE_RINGING);
        tmpInverseStateMap.put("Up", AST_STATE_UP);
        tmpInverseStateMap.put("Busy", AST_STATE_BUSY);
        tmpInverseStateMap.put("Dialing Offhook", AST_STATE_DIALING_OFFHOOK);
        tmpInverseStateMap.put("Pre-ring", AST_STATE_PRERING);

        inverseStateMap = Collections.unmodifiableMap(tmpInverseStateMap);
    }

    private static final Pattern UNKNOWN_STATE_PATTERN = Pattern.compile("^Unknown \\((\\d+)\\)$");

    private AstState()
    {

    }

    /**
     * This is the inverse to <code>ast_state2str</code> in <code>channel.c</code>.
     *
     * @param str state as a descriptive text.
     * @return numeric state.
     */
    public static Integer str2state(String str)
    {
        Integer state;

        if (str == null)
        {
            return null;
        }

        state = inverseStateMap.get(str);

        if (state == null)
        {
            Matcher matcher = UNKNOWN_STATE_PATTERN.matcher(str);
            if (matcher.matches())
            {
                try
                {
                    state = Integer.valueOf(matcher.group(1));
                }
                catch (NumberFormatException e)
                {
                    // should not happen as the pattern requires \d+ for the state.
                    throw new IllegalArgumentException("Unable to convert state '" + str + "' to integer representation", e);
                }
            }
        }

        return state;
    }
}
