package org.asteriskjava.util;

import java.util.*;

/**
 * Some static utility methods to imitate Asterisk specific logic.
 * <p/>
 * See Asterisk's <code>util.c</code>.
 * <p/>
 * Client code is not supposed to use this class.
 *
 * @author srt
 * @version $Id: AstUtil.java 1300 2009-04-30 00:28:00Z srt $
 */
public class AstUtil
{
    private static final Set<String> TRUE_LITERALS;
    private static final Set<String> NULL_LITERALS;

    static
    {
        TRUE_LITERALS = new HashSet<String>(20);
        TRUE_LITERALS.add("yes");
        TRUE_LITERALS.add("true");
        TRUE_LITERALS.add("y");
        TRUE_LITERALS.add("t");
        TRUE_LITERALS.add("1");
        TRUE_LITERALS.add("on");
        TRUE_LITERALS.add("enabled");

        NULL_LITERALS = new HashSet<String>(20);
        NULL_LITERALS.add("<unknown>");
        NULL_LITERALS.add("unknown");
        NULL_LITERALS.add("none"); // VarSet event in pbx.c
        NULL_LITERALS.add("<none>");
        NULL_LITERALS.add("-none-"); // IPaddress in PeerEntryEvent 
        NULL_LITERALS.add("(none)");
        NULL_LITERALS.add("<not set>");
        NULL_LITERALS.add("(not set)");
        NULL_LITERALS.add("<no name>");
        NULL_LITERALS.add("n/a"); // channel in AgentsEvent
        NULL_LITERALS.add("<null>");
        NULL_LITERALS.add("(null)"); // appData in ListDialplanEvent
    }

    private AstUtil()
    {
        //hide constructor
    }

    /**
     * Checks if a String represents <code>true</code> or <code>false</code>
     * according to Asterisk's logic.
     * <p/>
     * The original implementation is <code>util.c</code> is as follows:
     * <p/>
     * <pre>
     *     int ast_true(const char *s)
     *     {
     *         if (!s || ast_strlen_zero(s))
     *             return 0;
     * <p/>
     *         if (!strcasecmp(s, &quot;yes&quot;) ||
     *             !strcasecmp(s, &quot;true&quot;) ||
     *             !strcasecmp(s, &quot;y&quot;) ||
     *             !strcasecmp(s, &quot;t&quot;) ||
     *             !strcasecmp(s, &quot;1&quot;) ||
     *             !strcasecmp(s, &quot;on&quot;))
     *             return -1;
     * <p/>
     *         return 0;
     *     }
     * </pre>
     * <p/>
     * To support the dnd property of
     * {@link org.asteriskjava.manager.event.ZapShowChannelsEvent} this method
     * also consideres the string "Enabled" as true.
     *
     * @param o the Object (usually a String) to check for <code>true</code>.
     * @return <code>true</code> if s represents <code>true</code>,
     *         <code>false</code> otherwise.
     */
    public static boolean isTrue(Object o)
    {
        if (o == null)
        {
            return false;
        }

        if (o instanceof Boolean)
        {
            return (Boolean) o;
        }

        final String s;
        if (o instanceof String)
        {
            s = (String) o;
        }
        else
        {
            s = o.toString();
        }
        return TRUE_LITERALS.contains(s.toLowerCase(Locale.US));
    }

    /**
     * Parses a string for caller id information.
     * <p/>
     * The caller id string should be in the form <code>"Some Name" &lt;1234&gt;</code>.
     * <p/>
     * This resembles <code>ast_callerid_parse</code> in
     * <code>callerid.c</code> but strips any whitespace.
     *
     * @param s the string to parse
     * @return a String[] with name (index 0) and number (index 1)
     */
    public static String[] parseCallerId(String s)
    {
        final String[] result = new String[2];
        final int lbPosition;
        final int rbPosition;
        String name;
        String number;

        if (s == null)
        {
            return result;
        }

        lbPosition = s.lastIndexOf('<');
        rbPosition = s.lastIndexOf('>');

        // no opening and closing brace? use value as CallerId name
        if (lbPosition < 0 || rbPosition < 0)
        {
            name = s.trim();
            if (name.length() == 0)
            {
                name = null;
            }
            result[0] = name;
            return result;
        }
        else
        {
            number = s.substring(lbPosition + 1, rbPosition).trim();
            if (number.length() == 0)
            {
                number = null;
            }
        }

        name = s.substring(0, lbPosition).trim();
        if (name.startsWith("\"") && name.endsWith("\"") && name.length() > 1)
        {
            name = name.substring(1, name.length() - 1).trim();
        }
        if (name.length() == 0)
        {
            name = null;
        }

        result[0] = name;
        result[1] = number;
        return result;
    }

    /**
     * Checks if the value of s was <code>null</code> in Asterisk.
     * <p/>
     * This method is useful as Asterisk likes to replace <code>null</code>
     * values with different string values like "unknown", "&lt;unknown&gt;"
     * or "&lt;null&gt;".
     * <p/>
     * To find such replacements search for <code>S_OR</code> in Asterisk's
     * source code. You will find things like
     * <pre>
     * S_OR(chan-&gt;cid.cid_num, "&lt;unknown&gt;")
     * fdprintf(fd, "agi_callerid: %s\n", S_OR(chan-&gt;cid.cid_num, "unknown"));
     * </pre>
     * and more...
     *
     * @param s the string to test, may be <code>null</code>. If s is not a string
     *          the only test that is performed is a check for <code>null</code>.
     * @return <code>true</code> if the s was <code>null</code> in Asterisk;
     *         <code>false</code> otherwise.
     */
    public static boolean isNull(Object s)
    {
        if (s == null)
        {
            return true;
        }

        if (!(s instanceof String))
        {
            return false;
        }

        return NULL_LITERALS.contains(((String) s).toLowerCase(Locale.US));
    }
}
