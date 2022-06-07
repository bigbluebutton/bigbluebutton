/*
 * @(#)Shapes.java
 *
 * Full JHotDraw project information can be found here https://sourceforge.net/projects/jhotdraw/
 * 
 * Copyright (c) 1996-2010 The authors and contributors of JHotDraw.
 * You may not use, copy or modify this file, except in compliance with the 
 * accompanying license terms.
 *
 * These release is distributed under LGPL.
 
 * The original version of JHotDraw is copyright 1996, 1997 by IFA Informatik 
 * and Erich Gamma.
 *
 * It is hereby granted that this software can be used, copied, modified, and 
 * distributed without fee provided that this copyright noticeappears in all copies.
 */

package org.bigbluebutton.core.util.jhotdraw;

import java.awt.*;
import java.awt.geom.*;

/**
 * Shapes.
 *
 * @author Werner Randelshofer
 * @version $Id$
 */
public class Shapes {

    /** Creates a new instance. */
    private Shapes() {
    }

    /**
     * Returns true, if the outline of this bezier path contains the specified
     * point.
     *
     * @param p The point to be tested.
     * @param tolerance The tolerance for the test.
     */
    public static boolean outlineContains(Shape shape, Point2D.Double p, double tolerance) {
        double[] coords = new double[6];
        double prevX = 0, prevY = 0;
        double moveX = 0, moveY = 0;
        for (PathIterator i = new FlatteningPathIterator(shape.getPathIterator(new AffineTransform(), tolerance), tolerance); !i.isDone(); i.next()) {
            switch (i.currentSegment(coords)) {
                case PathIterator.SEG_CLOSE:
                    if (Geom.lineContainsPoint(
                            prevX, prevY, moveX, moveY,
                            p.x, p.y, tolerance)) {
                        return true;
                    }
                    break;
                case PathIterator.SEG_CUBICTO:
                    break;
                case PathIterator.SEG_LINETO:
                    if (Geom.lineContainsPoint(
                            prevX, prevY, coords[0], coords[1],
                            p.x, p.y, tolerance)) {
                        return true;
                    }
                    break;
                case PathIterator.SEG_MOVETO:
                    moveX = coords[0];
                    moveY = coords[1];
                    break;
                case PathIterator.SEG_QUADTO:
                    break;
                default:
                    break;
            }
            prevX = coords[0];
            prevY = coords[1];
        }
        return false;
    }
}
