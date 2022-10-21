package org.bigbluebutton.util;

import lombok.Data;

@Data
public class Pair<A, B> {

    A firstItem;
    B secondItem;

    public Pair(A firstItem, B secondItem) {}
}
