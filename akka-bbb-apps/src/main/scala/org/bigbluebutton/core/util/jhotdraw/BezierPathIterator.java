/*
 * @(#)BezierPathIterator.java
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

import java.awt.geom.*;

/**
 * This class represents the iterator for a BezierPath.
 * It can be used to retrieve all of the elements in a BezierPath.
 * The {@link BezierPath#getPathIterator}
 *  method is used to create a
 * BezierPathIterator for a particular BezierPath.
 * The iterator can be used to iterator the path only once.
 * Subsequent iterations require a new iterator.
 *
 * @author Werner Randelshofer
 * @version $Id$
 */
public class BezierPathIterator implements PathIterator {
    /**
     * Index of the next node.
     */
    private int index   = 0;
    /**
     * The bezier path.
     */
    private BezierPath path;
    /**
     * The transformation.
     */
    private AffineTransform affine;
    
    /** ?? */
    private static final int curvesize[] = {2, 2, 4, 6, 0};
    
    /**
     * Constructs an iterator given a BezierPath.
     * @see BezierPath#getPathIterator
     */
    public BezierPathIterator(BezierPath path) {
        this(path, null);
    }
    
    /**
     * Constructs an iterator given a BezierPath and an optional
     * AffineTransform.
     * @see BezierPath#getPathIterator
     */
    public BezierPathIterator(BezierPath path, AffineTransform at) {
        this.path = path;
        this.affine = at;
    }
    
    /**
     * Return the winding rule for determining the interior of the
     * path.
     * @see PathIterator#WIND_EVEN_ODD
     * @see PathIterator#WIND_NON_ZERO
     */
    @Override
    public int getWindingRule() {
        return path.getWindingRule();
    }
    
    /**
     * Tests if there are more points to read.
     * @return true if there are more points to read
     */
    @Override
    public boolean isDone() {
        return (index >= path.size() + (path.isClosed() ? 2 : 0));
    }
    
    /**
     * Moves the iterator to the next segment of the path forwards
     * along the primary direction of traversal as long as there are
     * more points in that direction.
     */
    @Override
    public void next() {
        if (! isDone()) {
            index++;
        }
    }
    
    /**
     * Returns the coordinates and type of the current path segment in
     * the iteration.
     * The return value is the path segment type:
     * SEG_MOVETO, SEG_LINETO, SEG_QUADTO, SEG_CUBICTO, or SEG_CLOSE.
     * A float array of length 6 must be passed in and may be used to
     * store the coordinates of the point(s).
     * Each point is stored as a pair of float x,y coordinates.
     * SEG_MOVETO and SEG_LINETO types will return one point,
     * SEG_QUADTO will return two points,
     * SEG_CUBICTO will return 3 points
     * and SEG_CLOSE will not return any points.
     * @see PathIterator#SEG_MOVETO
     * @see PathIterator#SEG_LINETO
     * @see PathIterator#SEG_QUADTO
     * @see PathIterator#SEG_CUBICTO
     * @see PathIterator#SEG_CLOSE
     */
    @Override
    public int currentSegment(float[] coords) {
        int numCoords = 0;
        int type = 0;
        if (index == path.size()) {
            // We only get here for closed paths
            if (path.size() > 1) {
                BezierPath.Node previous = path.get(path.size() - 1);
                BezierPath.Node current = path.get(0);
                
                if ((previous.mask & BezierPath.C2_MASK) == 0) {
                    if ((current.mask & BezierPath.C1_MASK) == 0) {
                        numCoords = 1;
                        type = SEG_LINETO;
                        coords[0] = (float) current.x[0];
                        coords[1] = (float) current.y[0];
                    } else {
                        numCoords = 2;
                        type = SEG_QUADTO;
                        coords[0] = (float) current.x[1];
                        coords[1] = (float) current.y[1];
                        coords[2] = (float) current.x[0];
                        coords[3] = (float) current.y[0];
                    }
                } else {
                    if ((current.mask & BezierPath.C1_MASK) == 0) {
                        numCoords = 2;
                        type = SEG_QUADTO;
                        coords[0] = (float) previous.x[2];
                        coords[1] = (float) previous.y[2];
                        coords[2] = (float) current.x[0];
                        coords[3] = (float) current.y[0];
                    } else {
                        numCoords = 3;
                        type = SEG_CUBICTO;
                        coords[0] = (float) previous.x[2];
                        coords[1] = (float) previous.y[2];
                        coords[2] = (float) current.x[1];
                        coords[3] = (float) current.y[1];
                        coords[4] = (float) current.x[0];
                        coords[5] = (float) current.y[0];
                    }
                }
            }
        } else if (index > path.size()) {
            // We only get here for closed paths
            return SEG_CLOSE;
        } else if (index == 0) {
            BezierPath.Node current = path.get(index);
            coords[0] = (float) current.x[0];
            coords[1] = (float) current.y[0];
            numCoords = 1;
            type = SEG_MOVETO;
            
        } else if (index < path.size()) {
            BezierPath.Node current = path.get(index);
            BezierPath.Node previous = path.get(index - 1);
            
            if ((previous.mask & BezierPath.C2_MASK) == 0) {
                if ((current.mask & BezierPath.C1_MASK) == 0) {
                    numCoords = 1;
                    type = SEG_LINETO;
                    coords[0] = (float) current.x[0];
                    coords[1] = (float) current.y[0];
                    
                } else {
                    numCoords = 2;
                    type = SEG_QUADTO;
                    coords[0] = (float) current.x[1];
                    coords[1] = (float) current.y[1];
                    coords[2] = (float) current.x[0];
                    coords[3] = (float) current.y[0];
                }
            } else {
                if ((current.mask & BezierPath.C1_MASK) == 0) {
                    numCoords = 2;
                    type = SEG_QUADTO;
                    coords[0] = (float) previous.x[2];
                    coords[1] = (float) previous.y[2];
                    coords[2] = (float) current.x[0];
                    coords[3] = (float) current.y[0];
                } else {
                    numCoords = 3;
                    type = SEG_CUBICTO;
                    coords[0] = (float) previous.x[2];
                    coords[1] = (float) previous.y[2];
                    coords[2] = (float) current.x[1];
                    coords[3] = (float) current.y[1];
                    coords[4] = (float) current.x[0];
                    coords[5] = (float) current.y[0];
                }
            }
        }
        
        
        if (affine != null) {
            affine.transform(coords, 0, coords, 0, numCoords);
        }
        return type;
    }
    
    /**
     * Returns the coordinates and type of the current path segment in
     * the iteration.
     * The return value is the path segment type:
     * SEG_MOVETO, SEG_LINETO, SEG_QUADTO, SEG_CUBICTO, or SEG_CLOSE.
     * A double array of length 6 must be passed in and may be used to
     * store the coordinates of the point(s).
     * Each point is stored as a pair of double x,y coordinates.
     * SEG_MOVETO and SEG_LINETO types will return one point,
     * SEG_QUADTO will return two points,
     * SEG_CUBICTO will return 3 points
     * and SEG_CLOSE will not return any points.
     * @see PathIterator#SEG_MOVETO
     * @see PathIterator#SEG_LINETO
     * @see PathIterator#SEG_QUADTO
     * @see PathIterator#SEG_CUBICTO
     * @see PathIterator#SEG_CLOSE
     */
    @Override
    public int currentSegment(double[] coords) {
        int numCoords = 0;
        int type = 0;
        if (index == path.size()) {
            // We only get here for closed paths
            if (path.size() > 1) {
                BezierPath.Node previous = path.get(path.size() - 1);
                BezierPath.Node current = path.get(0);
                
                if ((previous.mask & BezierPath.C2_MASK) == 0) {
                    if ((current.mask & BezierPath.C1_MASK) == 0) {
                        numCoords = 1;
                        type = SEG_LINETO;
                        coords[0] = current.x[0];
                        coords[1] = current.y[0];
                    } else {
                        numCoords = 2;
                        type = SEG_QUADTO;
                        coords[0] = current.x[1];
                        coords[1] = current.y[1];
                        coords[2] = current.x[0];
                        coords[3] = current.y[0];
                    }
                } else {
                    if ((current.mask & BezierPath.C1_MASK) == 0) {
                        numCoords = 2;
                        type = SEG_QUADTO;
                        coords[0] = previous.x[2];
                        coords[1] = previous.y[2];
                        coords[2] = current.x[0];
                        coords[3] = current.y[0];
                    } else {
                        numCoords = 3;
                        type = SEG_CUBICTO;
                        coords[0] = previous.x[2];
                        coords[1] = previous.y[2];
                        coords[2] = current.x[1];
                        coords[3] = current.y[1];
                        coords[4] = current.x[0];
                        coords[5] = current.y[0];
                    }
                }
            }
        } else if (index > path.size()) {
            // We only get here for closed paths
            return SEG_CLOSE;
        } else if (index == 0) {
            BezierPath.Node current = path.get(index);
            coords[0] = current.x[0];
            coords[1] = current.y[0];
            numCoords = 1;
            type = SEG_MOVETO;
            
        } else if (index < path.size()) {
            BezierPath.Node current = path.get(index);
            BezierPath.Node previous = path.get(index - 1);
            
            if ((previous.mask & BezierPath.C2_MASK) == 0) {
                if ((current.mask & BezierPath.C1_MASK) == 0) {
                    numCoords = 1;
                    type = SEG_LINETO;
                    coords[0] = current.x[0];
                    coords[1] = current.y[0];
                    
                } else {
                    numCoords = 2;
                    type = SEG_QUADTO;
                    coords[0] = current.x[1];
                    coords[1] = current.y[1];
                    coords[2] = current.x[0];
                    coords[3] = current.y[0];
                }
            } else {
                if ((current.mask & BezierPath.C1_MASK) == 0) {
                    numCoords = 2;
                    type = SEG_QUADTO;
                    coords[0] = previous.x[2];
                    coords[1] = previous.y[2];
                    coords[2] = current.x[0];
                    coords[3] = current.y[0];
                } else {
                    numCoords = 3;
                    type = SEG_CUBICTO;
                    coords[0] = previous.x[2];
                    coords[1] = previous.y[2];
                    coords[2] = current.x[1];
                    coords[3] = current.y[1];
                    coords[4] = current.x[0];
                    coords[5] = current.y[0];
                }
            }
        }
        
        
        if (affine != null) {
            affine.transform(coords, 0, coords, 0, numCoords);
        } else {
            System.arraycopy(coords, 0, coords, 0, numCoords);
        }
        return type;
    }
}
