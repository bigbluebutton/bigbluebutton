package org.bigbluebutton.api.domain;

import java.util.Set;

public class GuestPolicy {
    public static final String ALWAYS_ACCEPT = "ALWAYS_ACCEPT";
    public static final String ALWAYS_DENY = "ALWAYS_DENY";
    public static final String ASK_MODERATOR = "ASK_MODERATOR";

    public static final Set<String> POLICIES = Set.of(ALWAYS_ACCEPT, ALWAYS_DENY, ASK_MODERATOR);

    public static final String ALLOW = "ALLOW";
    public static final String DENY = "DENY";
    public static final String WAIT = "WAIT";

    public static boolean isValid(String policy) {
        return policy != null && POLICIES.contains(policy);
    }
}
