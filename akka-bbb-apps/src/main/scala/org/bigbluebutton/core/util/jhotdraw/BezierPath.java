/*
 * @(#)BezierPath.java
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
import java.io.Serializable;
import java.util.*;

/**
 * BezierPath allows the construction of paths consisting of straight lines,
 * quadratic curves and cubic curves.
 * <p>
 * A BezierPath is defined by its nodes. Each node has three control points:
 * C0, C1, C2. A mask defines which control points are in use. At a node, 
 * the path passes through C0. C1 controls the curve going towards C0. C2
 * controls the curve going away from C0.
 *
 * @author Werner Randelshofer
 * @version $Id$
 */
public class BezierPath extends ArrayList<BezierPath.Node>
        implements Shape, Serializable, Cloneable {
    private static final long serialVersionUID=1L;

    /** Constant for having only control point C0 in effect. C0 is the point
     * through whitch the curve passes. */
    public static final int C0_MASK = 0;
    /** Constant for having control point C1 in effect (in addition
     * to C0). C1 controls the curve going towards C0.
     * */
    public static final int C1_MASK = 1;
    /** Constant for having control point C2 in effect (in addition to C0).
     * C2 controls the curve going away from C0.
     */
    public static final int C2_MASK = 2;
    /** Constant for having control points C1 and C2 in effect (in addition to C0). */
    public static final int C1C2_MASK = C1_MASK | C2_MASK;
    /**
     * We cache a Path2D.Double instance to speed up Shape operations.
     */
    private transient Path2D.Double generalPath;
    /**
     * We cache a Rectangle2D.Double instance to speed up getBounds operations.
     */
    private transient Rectangle2D.Double bounds;
    /**
     * We cache the index of the outermost node to speed up method indexOfOutermostNode();
     */
    private int outer = -1;
    /**
     * If this value is set to true, closes the bezier path.
     */
    private boolean isClosed;
    /**
     * The winding rule for filling the bezier path.
     */
    private int windingRule = Path2D.Double.WIND_EVEN_ODD;

    /**
     * Defines a vertex (node) of the bezier path.
     * <p>
     * A vertex consists of three control points: C0, C1 and C2.
     * <ul>
     * <li>The bezier path always passes through C0.</li>
     * <li>C1 is used to control the curve towards C0.
     * </li>
     * <li>C2 is used to control the curve going away from C0.</li>
     * </ul>
     */
    public static class Node implements Cloneable, Serializable {
    private static final long serialVersionUID=1L;

        /**
         * This mask is used to describe which control points in addition to
         * C0 are in effect.
         */
        public int mask = 0;
        /** Control point x coordinates. */
        public double[] x = new double[3];
        /** Control point y coordinates. */
        public double[] y = new double[3];
        /** This is a hint for editing tools. If this is set to true,
         * the editing tools shall keep all control points on the same
         * line.
         */
        public boolean keepColinear = true;

        public Node() {
        }

        public Node(Node that) {
            setTo(that);
        }

        public void setTo(Node that) {
            this.mask = that.mask;
            this.keepColinear = that.keepColinear;
            System.arraycopy(that.x, 0, this.x, 0, 3);
            System.arraycopy(that.y, 0, this.y, 0, 3);
        }

        public Node(Point2D.Double c0) {
            this.mask = 0;
            x[0] = c0.x;
            y[0] = c0.y;
            x[1] = c0.x;
            y[1] = c0.y;
            x[2] = c0.x;
            y[2] = c0.y;
        }

        public Node(int mask, Point2D.Double c0, Point2D.Double c1, Point2D.Double c2) {
            this.mask = mask;
            x[0] = c0.x;
            y[0] = c0.y;
            x[1] = c1.x;
            y[1] = c1.y;
            x[2] = c2.x;
            y[2] = c2.y;
        }

        public Node(double x0, double y0) {
            this.mask = 0;
            x[0] = x0;
            y[0] = y0;
            x[1] = x0;
            y[1] = y0;
            x[2] = x0;
            y[2] = y0;
        }

        public Node(int mask, double x0, double y0, double x1, double y1, double x2, double y2) {
            this.mask = mask;
            x[0] = x0;
            y[0] = y0;
            x[1] = x1;
            y[1] = y1;
            x[2] = x2;
            y[2] = y2;
        }

        public int getMask() {
            return mask;
        }

        public void setMask(int newValue) {
            mask = newValue;
        }

        public void setControlPoint(int index, Point2D.Double p) {
            x[index] = p.x;
            y[index] = p.y;
        }

        public Point2D.Double getControlPoint(int index) {
            return new Point2D.Double(x[index], y[index]);
        }

        public void moveTo(Point2D.Double p) {
            moveBy(p.x - x[0], p.y - y[0]);
        }

        public void moveTo(double x, double y) {
            moveBy(x - this.x[0], y - this.y[0]);
        }

        public void moveBy(double dx, double dy) {
            for (int i = 0; i < 3; i++) {
                x[i] += dx;
                y[i] += dy;
            }
        }

    @Override
        public Object clone() {
            try {
                Node that = (Node) super.clone();
                that.x = this.x.clone();
                that.y = this.y.clone();
                return that;
            } catch (CloneNotSupportedException e) {
                InternalError error = new InternalError();
                error.initCause(e);
                throw error;
            }
        }

    @Override
        public String toString() {
            StringBuilder buf = new StringBuilder();
            buf.append(super.toString());
            buf.append('[');
            for (int i = 0; i < 3; i++) {
                if (i != 0) {
                    if ((mask & i) == i) {
                        buf.append(',');
                    } else {
                        continue;
                    }
                }

                buf.append('x');
                buf.append(i);
                buf.append('=');
                buf.append(x[i]);
                buf.append(",y");
                buf.append(i);
                buf.append('=');
                buf.append(y[i]);
            }
            buf.append(']');
            return buf.toString();
        }

    @Override
        public int hashCode() {
            return (mask & 0x3) << 29
                    | (Arrays.hashCode(x) & 0x3fff0000)
                    | (Arrays.hashCode(y) & 0xffff);
        }

    @Override
        public boolean equals(Object o) {
            if (o instanceof BezierPath.Node) {
                BezierPath.Node that = (BezierPath.Node) o;
                return that.mask == this.mask
                        && Arrays.equals(that.x, this.x)
                        && Arrays.equals(that.y, this.y);
            }
            return false;
        }
    }

    /** Creates a new instance. */
    public BezierPath() {
    }

    /**
     * Adds a node to the path.
     * <p>
     * This is a convenience method for adding a node with a single control
     * point C0 to the path.
     */
    public void add(Point2D.Double c0) {
        add(new Node(0, c0, c0, c0));
    }

    /**
     * Adds a node to the path.
     * <p>
     * This is a convenience method for adding a node with a single control
     * point C0 to the path.
     */
    public void add(double x, double y) {
        add(new Node(0, x, y, x, y, x, y));
    }

    /**
     * Adds a node to the path.
     * <p>
     * This is a convenience method for adding a node with three control points
     * C0, C1 and C2, and a mask.
     *
     * @param ctrlMask An or-combination of C0_MASK,C1_MASK and C2_MASK.
     * @param c0 The coordinates of the C0 control point.
     * @param c1 The coordinates of the C1 control point.
     * @param c2 The coordinates of the C2 control point.
     */
    public void add(int ctrlMask, Point2D.Double c0, Point2D.Double c1, Point2D.Double c2) {
        add(new Node(ctrlMask, c0, c1, c2));
    }

    /**
     * Adds a set of nodes to the path.
     * <p>
     * Convenience method for adding multiple nodes with a single control point
     * C0.
     */
    public void addPolyline(Collection<Point2D.Double> points) {
        for (Point2D.Double c0 : points) {
            add(new Node(0, c0, c0, c0));
        }
    }

    /**
     * Convenience method for changing a single control point of a node.
     *
     * @param nodeIndex The index of the node.
     * @param ctrlIndex Either C0_MASK, C1_MASK or C2_MASK.
     * @param p The control point. The coordinates will be cloned.
     */
    public void set(int nodeIndex, int ctrlIndex, Point2D.Double p) {
        Node c = get(nodeIndex);
        c.x[ctrlIndex] = p.x;
        c.y[ctrlIndex] = p.y;
    }

    /**
     * Convenience method for getting a single control point of a node.
     *
     * @param nodeIndex The index of the node.
     * @param ctrlIndex Either C0_MASK, C1_MASK or C2_MASK.
     * @return Returns a clone of the control point.
     */
    public Point2D.Double get(int nodeIndex, int ctrlIndex) {
        Node c = get(nodeIndex);
        return new Point2D.Double(
                c.x[ctrlIndex],
                c.y[ctrlIndex]);
    }

    /**
     * This must be called after the BezierPath has been changed.
     */
    public void invalidatePath() {
        generalPath = null;
        bounds = null;
        outer = -1;
    }

    /**
     * Recomputes the BezierPath, if it is invalid.
     */
    public void validatePath() {
        if (generalPath == null) {
            generalPath = toGeneralPath();
        }
    }

    /** Converts the BezierPath into a Path2D.Double. */
    public Path2D.Double toGeneralPath() {
        Path2D.Double gp = new Path2D.Double();
        gp.setWindingRule(windingRule);
        if (size() == 0) {
            gp.moveTo(0, 0);
            gp.lineTo(0, 0 + 1);
        } else if (size() == 1) {
            Node current = get(0);
            gp.moveTo(current.x[0], current.y[0]);
            gp.lineTo(current.x[0], current.y[0] + 1);
        } else {
            Node previous;
            Node current;

            previous = current = get(0);
            gp.moveTo(current.x[0], current.y[0]);
            for (int i = 1, n = size(); i < n; i++) {
                previous = current;
                current = get(i);

                if ((previous.mask & C2_MASK) == 0) {
                    if ((current.mask & C1_MASK) == 0) {
                        gp.lineTo(
                                current.x[0], current.y[0]);
                    } else {
                        gp.quadTo(
                                current.x[1], current.y[1],
                                current.x[0], current.y[0]);
                    }
                } else {
                    if ((current.mask & C1_MASK) == 0) {
                        gp.quadTo(
                                previous.x[2], previous.y[2],
                                current.x[0], current.y[0]);
                    } else {
                        gp.curveTo(
                                previous.x[2], previous.y[2],
                                current.x[1], current.y[1],
                                current.x[0], current.y[0]);
                    }
                }
            }
            if (isClosed) {
                if (size() > 1) {
                    previous = get(size() - 1);
                    current = get(0);

                    if ((previous.mask & C2_MASK) == 0) {
                        if ((current.mask & C1_MASK) == 0) {
                            gp.lineTo(
                                    current.x[0], current.y[0]);
                        } else {
                            gp.quadTo(
                                    current.x[1], current.y[1],
                                    current.x[0], current.y[0]);
                        }
                    } else {
                        if ((current.mask & C1_MASK) == 0) {
                            gp.quadTo(
                                    previous.x[2], previous.y[2],
                                    current.x[0], current.y[0]);
                        } else {
                            gp.curveTo(
                                    previous.x[2], previous.y[2],
                                    current.x[1], current.y[1],
                                    current.x[0], current.y[0]);
                        }
                    }
                }
                gp.closePath();
            }
        }
        return gp;
    }

        /** Converts the BezierPath into a raw set of coordinates to draw anywhere */
    public PathData toRawPath() {
        ArrayList<Integer> commands = new ArrayList<Integer>();
        ArrayList<Double> coords = new ArrayList<Double>();
        if (size() > 0) {
            Node previous;
            Node current;

            previous = current = get(0);
            commands.add(PathCommands.MOVE_TO);
            coords.add(current.x[0]);
            coords.add(current.y[0]);
            for (int i = 1, n = size(); i < n; i++) {
                previous = current;
                current = get(i);

                if ((previous.mask & C2_MASK) == 0) {
                    if ((current.mask & C1_MASK) == 0) {
                        commands.add(PathCommands.LINE_TO);
                        coords.add(current.x[0]);
                        coords.add(current.y[0]);
                    } else {
                        commands.add(PathCommands.Q_CURVE_TO);
                        coords.add(current.x[1]);
                        coords.add(current.y[1]);
                        coords.add(current.x[0]);
                        coords.add(current.y[0]);
                    }
                } else {
                    if ((current.mask & C1_MASK) == 0) {
                        commands.add(PathCommands.Q_CURVE_TO);
                        coords.add(previous.x[2]);
                        coords.add(previous.y[2]);
                        coords.add(current.x[0]);
                        coords.add(current.y[0]);
                    } else {
                        commands.add(PathCommands.C_CURVE_TO);
                        coords.add(previous.x[2]);
                        coords.add(previous.y[2]);
                        coords.add(current.x[1]);
                        coords.add(current.y[1]);
                        coords.add(current.x[0]);
                        coords.add(current.y[0]);
                    }
                }
            }
            if (isClosed) {
                if (size() > 1) {
                    previous = get(size() - 1);
                    current = get(0);

                    if ((previous.mask & C2_MASK) == 0) {
                        if ((current.mask & C1_MASK) == 0) {
                            commands.add(PathCommands.LINE_TO);
                            coords.add(current.x[0]);
                            coords.add(current.y[0]);
                        } else {
                            commands.add(PathCommands.Q_CURVE_TO);
                            coords.add(current.x[1]);
                            coords.add(current.y[1]);
                            coords.add(current.x[0]);
                            coords.add(current.y[0]);
                        }
                    } else {
                        if ((current.mask & C1_MASK) == 0) {
                            commands.add(PathCommands.Q_CURVE_TO);
                            coords.add(previous.x[2]);
                            coords.add(previous.y[2]);
                            coords.add(current.x[0]);
                            coords.add(current.y[0]);
                        } else {
                            commands.add(PathCommands.C_CURVE_TO);
                            coords.add(previous.x[2]);
                            coords.add(previous.y[2]);
                            coords.add(current.x[1]);
                            coords.add(current.y[1]);
                            coords.add(current.x[0]);
                            coords.add(current.y[0]);
                        }
                    }
                }
            }
        }
        
        PathData pd = new PathData(commands, coords); 
        return pd;
    }
    
    @Override
    public boolean contains(Point2D p) {
        validatePath();
        return generalPath.contains(p);
    }

    ;

    /**
     * Returns true, if the outline of this bezier path contains the specified
     * point.
     *
     * @param p The point to be tested.
     * @param tolerance The tolerance for the test.
     */
    public boolean outlineContains(Point2D.Double p, double tolerance) {
        return Shapes.outlineContains(this, p, tolerance);
    }

    @Override
    public boolean intersects(Rectangle2D r) {
        validatePath();
        return generalPath.intersects(r);
    }

    @Override
    public PathIterator getPathIterator(AffineTransform at) {
        return new BezierPathIterator(this, at);
    }

    @Override
    public PathIterator getPathIterator(AffineTransform at, double flatness) {
        return new FlatteningPathIterator(new BezierPathIterator(this, at), flatness);
    }

    @Override
    public boolean contains(Rectangle2D r) {
        validatePath();
        return generalPath.contains(r);
    }

    @Override
    public boolean intersects(double x, double y, double w, double h) {
        validatePath();
        return generalPath.intersects(x, y, w, h);
    }

    @Override
    public Rectangle2D.Double getBounds2D() {
        if (bounds == null) {
            double x1, y1, x2, y2;
            int size = size();
            if (size == 0) {
                x1 = y1 = x2 = y2 = 0.0f;
            } else {
                double x, y;

                // handle first node
                Node node = get(0);
                y1 = y2 = node.y[0];
                x1 = x2 = node.x[0];
                if (isClosed && (node.mask & C1_MASK) != 0) {
                    y = node.y[1];
                    x = node.x[1];
                    if (x < x1) {
                        x1 = x;
                    }
                    if (y < y1) {
                        y1 = y;
                    }
                    if (x > x2) {
                        x2 = x;
                    }
                    if (y > y2) {
                        y2 = y;
                    }
                }
                if ((node.mask & C2_MASK) != 0) {
                    y = node.y[2];
                    x = node.x[2];
                    if (x < x1) {
                        x1 = x;
                    }
                    if (y < y1) {
                        y1 = y;
                    }
                    if (x > x2) {
                        x2 = x;
                    }
                    if (y > y2) {
                        y2 = y;
                    }
                }
                // handle last node
                node = get(size - 1);
                y = node.y[0];
                x = node.x[0];
                if (x < x1) {
                    x1 = x;
                }
                if (y < y1) {
                    y1 = y;
                }
                if (x > x2) {
                    x2 = x;
                }
                if (y > y2) {
                    y2 = y;
                }
                if ((node.mask & C1_MASK) != 0) {
                    y = node.y[1];
                    x = node.x[1];
                    if (x < x1) {
                        x1 = x;
                    }
                    if (y < y1) {
                        y1 = y;
                    }
                    if (x > x2) {
                        x2 = x;
                    }
                    if (y > y2) {
                        y2 = y;
                    }
                }
                if (isClosed && (node.mask & C2_MASK) != 0) {
                    y = node.y[2];
                    x = node.x[2];
                    if (x < x1) {
                        x1 = x;
                    }
                    if (y < y1) {
                        y1 = y;
                    }
                    if (x > x2) {
                        x2 = x;
                    }
                    if (y > y2) {
                        y2 = y;
                    }
                }

                // handle all other nodes
                for (int i = 1, n = size - 1; i < n; i++) {
                    node = get(i);
                    y = node.y[0];
                    x = node.x[0];
                    if (x < x1) {
                        x1 = x;
                    }
                    if (y < y1) {
                        y1 = y;
                    }
                    if (x > x2) {
                        x2 = x;
                    }
                    if (y > y2) {
                        y2 = y;
                    }
                    if ((node.mask & C1_MASK) != 0) {
                        y = node.y[1];
                        x = node.x[1];
                        if (x < x1) {
                            x1 = x;
                        }
                        if (y < y1) {
                            y1 = y;
                        }
                        if (x > x2) {
                            x2 = x;
                        }
                        if (y > y2) {
                            y2 = y;
                        }
                    }
                    if ((node.mask & C2_MASK) != 0) {
                        y = node.y[2];
                        x = node.x[2];
                        if (x < x1) {
                            x1 = x;
                        }
                        if (y < y1) {
                            y1 = y;
                        }
                        if (x > x2) {
                            x2 = x;
                        }
                        if (y > y2) {
                            y2 = y;
                        }
                    }
                }
            }
            bounds = new Rectangle2D.Double(x1, y1, x2 - x1, y2 - y1);
        }
        return (Rectangle2D.Double) bounds.clone();
    }

    @Override
    public Rectangle getBounds() {
        return getBounds2D().getBounds();
    }

    @Override
    public boolean contains(double x, double y, double w, double h) {
        validatePath();
        return generalPath.contains(x, y, w, h);
    }

    @Override
    public boolean contains(double x, double y) {
        validatePath();
        return generalPath.contains(x, y);
    }

    public void setClosed(boolean newValue) {
        if (isClosed != newValue) {
            isClosed = newValue;
            invalidatePath();
        }
    }

    public boolean isClosed() {
        return isClosed;
    }

    /** Creates a deep copy of the BezierPath. */
    @Override
    public BezierPath clone() {
        BezierPath that = (BezierPath) super.clone();
        for (int i = 0, n = this.size(); i < n; i++) {
            that.set(i, (Node) this.get(i).clone());
        }
        return that;
    }

    /**
     * Transforms the BezierPath.
     * @param tx the transformation.
     */
    public void transform(AffineTransform tx) {
        Point2D.Double p = new Point2D.Double();
        for (Node cp : this) {
            for (int i = 0; i < 3; i++) {
                p.x = cp.x[i];
                p.y = cp.y[i];
                tx.transform(p, p);
                cp.x[i] = p.x;
                cp.y[i] = p.y;
            }
        }
        invalidatePath();
    }

    /**
     * Sets all values of this bezier path to that bezier path, so that this
     * path becomes identical to that path.
     */
    public void setTo(BezierPath that) {
        while (that.size() < size()) {
            remove(size() - 1);
        }
        for (int i = 0, n = size(); i < n; i++) {
            get(i).setTo(that.get(i));
        }
        while (size() < that.size()) {
            add((Node) that.get(size()).clone());
        }
    }

    /**
     * Returns the point at the center of the bezier path.
     */
    public Point2D.Double getCenter() {
        double sx = 0;
        double sy = 0;
        for (Node p : this) {
            sx += p.x[0];
            sy += p.y[0];
        }

        int n = size();
        return new Point2D.Double(sx / n, sy / n);
    }

    /**
     * Returns a point on the edge of the bezier path which crosses the line
     * from the center of the bezier path to the specified point.
     * If no edge crosses the line, the nearest C0 control point is returned.
     */
    public Point2D.Double chop(Point2D.Double p) {
        return Geom.chop(this, p);
    }

    /**
     * Return the index of the node that is the furthest away from the center
     **/
    public int indexOfOutermostNode() {
        if (outer == -1) {
            Point2D.Double ctr = getCenter();
            outer = 0;
            double dist = 0;

            for (int i = 0, n = size(); i < n; i++) {
                Node cp = get(i);
                double d = Geom.length2(ctr.x, ctr.y,
                        cp.x[0],
                        cp.y[0]);
                if (d > dist) {
                    dist = d;
                    outer = i;
                }
            }
        }
        return outer;
    }

    /**
     * Returns a relative point on the path.
     * Where 0 is the start point of the path and 1 is the end point of the
     * path.
     *
     * @param relative a value between 0 and 1.
     */
    public Point2D.Double getPointOnPath(double relative, double flatness) {
        // This method works only for straight lines
        if (size() == 0) {
            return null;
        } else if (size() == 1) {
            return get(0).getControlPoint(0);
        }
        if (relative <= 0) {
            return get(0).getControlPoint(0);
        } else if (relative >= 1) {
            return get(size() - 1).getControlPoint(0);
        }
        validatePath();

        // Compute the relative point on the path
        double len = getLengthOfPath(flatness);
        double relativeLen = len * relative;
        double pos = 0;
        double[] coords = new double[6];
        PathIterator i = generalPath.getPathIterator(new AffineTransform(), flatness);
        double prevX = coords[0];
        double prevY = coords[1];
        i.next();
        for (; !i.isDone(); i.next()) {
            i.currentSegment(coords);
            double segLen = Geom.length(prevX, prevY, coords[0], coords[1]);
            if (pos + segLen >= relativeLen) {
                //if (true) return new Point2D.Double(coords[0], coords[1]);
                // Compute the relative Point2D.Double on the line
                /*
                return new Point2D.Double(
                prevX * pos / len + coords[0] * (pos + segLen) / len,
                prevY * pos / len + coords[1] * (pos + segLen) / len
                );*/
                double factor = (relativeLen - pos) / segLen;

                return new Point2D.Double(
                        prevX * (1 - factor) + coords[0] * factor,
                        prevY * (1 - factor) + coords[1] * factor);
            }
            pos += segLen;
            prevX = coords[0];
            prevY = coords[1];
        }
        throw new InternalError("We should never get here");
    }

    /**
     * Returns the length of the path.
     *
     * @param flatness the flatness used to approximate the length.
     */
    public double getLengthOfPath(double flatness) {
        double len = 0;
        PathIterator i = generalPath.getPathIterator(new AffineTransform(), flatness);
        double[] coords = new double[6];
        double prevX = coords[0];
        double prevY = coords[1];
        i.next();
        for (; !i.isDone(); i.next()) {
            i.currentSegment(coords);
            len += Geom.length(prevX, prevY, coords[0], coords[1]);
            prevX = coords[0];
            prevY = coords[1];
        }
        return len;
    }

    /**
     * Returns the relative position of the specified point on the path.
     *
     * @param flatness the flatness used to approximate the length.
     *
     * @return relative position on path, this is a number between 0 and 1.
     * Returns -1, if the point is not on the path.
     */
    public double getRelativePositionOnPath(Point2D.Double find, double flatness) {
        // XXX - This method works only for straight lines!
        double len = getLengthOfPath(flatness);
        double relativeLen = 0d;
        Node v1, v2;
        BezierPath tempPath = new BezierPath();
        Node t1, t2;
        tempPath.add(t1 = new Node());
        tempPath.add(t2 = new Node());

        for (int i = 0, n = size() - 1; i < n; i++) {
            v1 = get(i);
            v2 = get(i + 1);
            if (v1.mask == 0 && v2.mask == 0) {
                if (Geom.lineContainsPoint(v1.x[0], v1.y[0], v2.x[0], v2.y[0], find.x, find.y, flatness)) {
                    relativeLen += Geom.length(v1.x[0], v1.y[0], find.x, find.y);
                    return relativeLen / len;
                } else {
                    relativeLen += Geom.length(v1.x[0], v1.y[0], v2.x[0], v2.y[0]);
                }
            } else {
                t1.setTo(v1);
                t2.setTo(v2);
                tempPath.invalidatePath();
                if (tempPath.outlineContains(find, flatness)) {
                    relativeLen += Geom.length(v1.x[0], v1.y[0], find.x, find.y);
                    return relativeLen / len;
                } else {
                    relativeLen += Geom.length(v1.x[0], v1.y[0], v2.x[0], v2.y[0]);
                }
            }
        }
        if (isClosed && size() > 1) {
            v1 = get(size() - 1);
            v2 = get(0);
            if (v1.mask == 0 && v2.mask == 0) {
                if (Geom.lineContainsPoint(v1.x[0], v1.y[0], v2.x[0], v2.y[0], find.x, find.y, flatness)) {
                    relativeLen += Geom.length(v1.x[0], v1.y[0], find.x, find.y);
                    return relativeLen / len;
                }
            } else {
                t1.setTo(v1);
                t2.setTo(v2);
                tempPath.invalidatePath();
                if (tempPath.outlineContains(find, flatness)) {
                    relativeLen += Geom.length(v1.x[0], v1.y[0], find.x, find.y);
                    return relativeLen / len;
                }
            }
        }
        return -1;
    }

    /**
     * Gets the segment of the polyline that is hit by
     * the given Point2D.Double.
     * @return the index of the segment or -1 if no segment was hit.
     */
    public int findSegment(Point2D.Double find, double tolerance) {
        // XXX - This works only for straight lines!
        Node v1, v2;
        BezierPath tempPath = new BezierPath();
        Node t1, t2;
        tempPath.add(t1 = new Node());
        tempPath.add(t2 = new Node());

        for (int i = 0, n = size() - 1; i < n; i++) {
            v1 = get(i);
            v2 = get(i + 1);
            if (v1.mask == 0 && v2.mask == 0) {
                if (Geom.lineContainsPoint(v1.x[0], v1.y[0], v2.x[0], v2.y[0], find.x, find.y, tolerance)) {
                    return i;
                }
            } else {
                t1.setTo(v1);
                t2.setTo(v2);
                tempPath.invalidatePath();
                if (tempPath.outlineContains(find, tolerance)) {
                    return i;
                }
            }
        }
        if (isClosed && size() > 1) {
            v1 = get(size() - 1);
            v2 = get(0);
            if (v1.mask == 0 && v2.mask == 0) {
                if (Geom.lineContainsPoint(v1.x[0], v1.y[0], v2.x[0], v2.y[0], find.x, find.y, tolerance)) {
                    return size() - 1;
                }
            } else {
                t1.setTo(v1);
                t2.setTo(v2);
                tempPath.invalidatePath();
                if (tempPath.outlineContains(find, tolerance)) {
                    return size() - 1;
                }
            }
        }
        return -1;
    }

    /**
     * Joins two segments into one if the given Point2D.Double hits a node
     * of the bezier path.
     * @return the index of the joined segment or -1 if no segment was joined.
     */
    public int joinSegments(Point2D.Double join, double tolerance) {
        for (int i = 0; i < size(); i++) {
            Node p = get(i);
            if (Geom.length(p.x[0], p.y[0], join.x, join.y) < tolerance) {
                remove(i);
                return i;
            }
        }
        return -1;
    }

    /**
     * Splits the segment at the given Point2D.Double if a segment was hit.
     * @return the index of the segment or -1 if no segment was hit.
     */
    public int splitSegment(Point2D.Double split, double tolerance) {
        int i = findSegment(split, tolerance);
        int nextI = (i + 1) % size();
        if (i != -1) {
            if ((get(i).mask & C2_MASK) == C2_MASK
                    && (get(nextI).mask & C1_MASK) == 0) {
                // quadto
                add(i + 1, new Node(C2_MASK, split, split, split));
            } else if ((get(i).mask & C2_MASK) == 0
                    && (get(nextI).mask & C1_MASK) == C1_MASK) {
                // quadto
                add(i + 1, new Node(C1_MASK, split, split, split));
            } else if ((get(i).mask & C2_MASK) == C2_MASK
                    && (get(nextI).mask & C1_MASK) == C1_MASK) {
                // cubicto
                add(i + 1, new Node(C1_MASK | C2_MASK, split, split, split));
            } else {
                // lineto
                add(i + 1, new Node(split));
            }
        }
        return i + 1;
    }

    /**
     * Adds the first node to the bezier path.
     * <p>
     * This is a convenience method for adding the first node with a single
     * control point C0 to the bezier path.
     */
    public void moveTo(double x1, double y1) {
        if (size() != 0) {
            throw new IllegalPathStateException("moveTo only allowed when empty");
        }
        Node node = new Node(x1, y1);
        node.keepColinear = false;
        add(node);
    }

    /**
     * Adds a (at least) linear 'curve' to the bezier path.
     * <p>
     * If the previous node has no C2 control point the line will be straight
     * (linear), otherwise the line will be quadratic.
     * <p>
     * This is a convenience method for adding a node with a single control
     * point C0.
     * <p>
     * The bezier path must already have at least one node.
     */
    public void lineTo(double x1, double y1) {
        if (size() == 0) {
            throw new IllegalPathStateException("lineTo only allowed when not empty");
        }
        get(size() - 1).keepColinear = false;
        add(new Node(x1, y1));
    }

    /**
     * Adds a (at least) quadratic curve to the bezier path.
     * <p>
     * If the previous node has no C2 control point the line will be quadratic
     * otherwise the line will be cubic.
     * <p>
     * This is a convenience method for adding a node with control point C0 and
     * C1 (incoming curve) to the bezier path.
     * <p>
     * The bezier path must already have at least one node.
     */
    public void quadTo(double x1, double y1,
            double x2, double y2) {
        if (size() == 0) {
            throw new IllegalPathStateException("quadTo only allowed when not empty");
        }

        add(new Node(C1_MASK, x2, y2, x1, y1, x2, y2));
    }

    /**
     * Adds a cubic curve to the bezier path.
     * <p>
     * This is a convenience method for adding a node with control point C0 and
     * C1 (incoming curve) to the bezier path, and also specifying the control
     * point C2 (outgoing curve) of the previous node.
     * <p>
     * The bezier path must already have at least one node.
     */
    public void curveTo(double x1, double y1,
            double x2, double y2,
            double x3, double y3) {
        if (size() == 0) {
            throw new IllegalPathStateException("curveTo only allowed when not empty");
        }
        Node lastPoint = get(size() - 1);

        lastPoint.mask |= C2_MASK;
        lastPoint.x[2] = x1;
        lastPoint.y[2] = y1;

        if ((lastPoint.mask & C1C2_MASK) == C1C2_MASK) {
            lastPoint.keepColinear = Math.abs(
                    Geom.angle(lastPoint.x[0], lastPoint.y[0],
                    lastPoint.x[1], lastPoint.y[1])
                    - Geom.angle(lastPoint.x[2], lastPoint.y[2],
                    lastPoint.x[0], lastPoint.y[0])) < 0.001;
        }

        add(new Node(C1_MASK, x3, y3, x2, y2, x3, y3));
    }

    /**
     * Adds an elliptical arc, defined by two radii, an angle from the
     * x-axis, a flag to choose the large arc or not, a flag to
     * indicate if we increase or decrease the angles and the final
     * point of the arc.
     * <p>
     * As specified in http://www.w3.org/TR/SVG/paths.html#PathDataEllipticalArcCommands
     * <p>
     * The implementation of this method has been derived from
     * Apache Batik class org.apache.batik.ext.awt.geom.ExtendedGeneralPath#computArc
     *
     * @param rx the x radius of the ellipse
     * @param ry the y radius of the ellipse
     *
     * @param xAxisRotation the angle from the x-axis of the current
     * coordinate system to the x-axis of the ellipse in degrees.
     *
     * @param largeArcFlag the large arc flag. If true the arc
     * spanning less than or equal to 180 degrees is chosen, otherwise
     * the arc spanning greater than 180 degrees is chosen
     *
     * @param sweepFlag the sweep flag. If true the line joining
     * center to arc sweeps through decreasing angles otherwise it
     * sweeps through increasing angles
     *
     * @param x the absolute x coordinate of the final point of the arc.
     * @param y the absolute y coordinate of the final point of the arc.
     */
    public void arcTo(double rx, double ry,
            double xAxisRotation,
            boolean largeArcFlag, boolean sweepFlag,
            double x, double y) {


        // Ensure radii are valid
        if (rx == 0 || ry == 0) {
            lineTo(x, y);
            return;
        }

        // Get the current (x, y) coordinates of the path
        Node lastPoint = get(size() - 1);
        double x0 = ((lastPoint.mask & C2_MASK) == C2_MASK) ? lastPoint.x[2] : lastPoint.x[0];
        double y0 = ((lastPoint.mask & C2_MASK) == C2_MASK) ? lastPoint.y[2] : lastPoint.y[0];

        if (x0 == x && y0 == y) {
            // If the endpoints (x, y) and (x0, y0) are identical, then this
            // is equivalent to omitting the elliptical arc segment entirely.
            return;
        }

        // Compute the half distance between the current and the final point
        double dx2 = (x0 - x) / 2d;
        double dy2 = (y0 - y) / 2d;
        // Convert angle from degrees to radians
        double angle = Math.toRadians(xAxisRotation);
        double cosAngle = Math.cos(angle);
        double sinAngle = Math.sin(angle);

        //
        // Step 1 : Compute (x1, y1)
        //
        double x1 = (cosAngle * dx2 + sinAngle * dy2);
        double y1 = (-sinAngle * dx2 + cosAngle * dy2);
        // Ensure radii are large enough
        rx = Math.abs(rx);
        ry = Math.abs(ry);
        double Prx = rx * rx;
        double Pry = ry * ry;
        double Px1 = x1 * x1;
        double Py1 = y1 * y1;
        // check that radii are large enough
        double radiiCheck = Px1 / Prx + Py1 / Pry;
        if (radiiCheck > 1) {
            rx = Math.sqrt(radiiCheck) * rx;
            ry = Math.sqrt(radiiCheck) * ry;
            Prx = rx * rx;
            Pry = ry * ry;
        }

        //
        // Step 2 : Compute (cx1, cy1)
        //
        double sign = (largeArcFlag == sweepFlag) ? -1 : 1;
        double sq = ((Prx * Pry) - (Prx * Py1) - (Pry * Px1)) / ((Prx * Py1) + (Pry * Px1));
        sq = (sq < 0) ? 0 : sq;
        double coef = (sign * Math.sqrt(sq));
        double cx1 = coef * ((rx * y1) / ry);
        double cy1 = coef * -((ry * x1) / rx);

        //
        // Step 3 : Compute (cx, cy) from (cx1, cy1)
        //
        double sx2 = (x0 + x) / 2.0;
        double sy2 = (y0 + y) / 2.0;
        double cx = sx2 + (cosAngle * cx1 - sinAngle * cy1);
        double cy = sy2 + (sinAngle * cx1 + cosAngle * cy1);

        //
        // Step 4 : Compute the angleStart (angle1) and the angleExtent (dangle)
        //
        double ux = (x1 - cx1) / rx;
        double uy = (y1 - cy1) / ry;
        double vx = (-x1 - cx1) / rx;
        double vy = (-y1 - cy1) / ry;
        double p, n;

        // Compute the angle start
        n = Math.sqrt((ux * ux) + (uy * uy));
        p = ux; // (1 * ux) + (0 * uy)
        sign = (uy < 0) ? -1d : 1d;
        double angleStart = Math.toDegrees(sign * Math.acos(p / n));

        // Compute the angle extent
        n = Math.sqrt((ux * ux + uy * uy) * (vx * vx + vy * vy));
        p = ux * vx + uy * vy;
        sign = (ux * vy - uy * vx < 0) ? -1d : 1d;
        double angleExtent = Math.toDegrees(sign * Math.acos(p / n));
        if (!sweepFlag && angleExtent > 0) {
            angleExtent -= 360f;
        } else if (sweepFlag && angleExtent < 0) {
            angleExtent += 360f;
        }
        angleExtent %= 360f;
        angleStart %= 360f;

        //
        // We can now build the resulting Arc2D in double precision
        //
        Arc2D.Double arc = new Arc2D.Double(
                cx - rx, cy - ry,
                rx * 2d, ry * 2d,
                -angleStart, -angleExtent,
                Arc2D.OPEN);

        // Create a path iterator of the rotated arc
        PathIterator i = arc.getPathIterator(
                AffineTransform.getRotateInstance(
                angle, arc.getCenterX(), arc.getCenterY()));

        // Add the segments to the bezier path
        double[] coords = new double[6];
        i.next(); // skip first moveto
        while (!i.isDone()) {
            int type = i.currentSegment(coords);
            switch (type) {
                case PathIterator.SEG_CLOSE:
                    // ignore
                    break;
                case PathIterator.SEG_CUBICTO:
                    curveTo(coords[0], coords[1], coords[2], coords[3], coords[4], coords[5]);
                    break;
                case PathIterator.SEG_LINETO:
                    lineTo(coords[0], coords[1]);
                    break;
                case PathIterator.SEG_MOVETO:
                    // ignore
                    break;
                case PathIterator.SEG_QUADTO:
                    quadTo(coords[0], coords[1], coords[2], coords[3]);
                    break;
            }
            i.next();
        }
    }

    /**
     * Creates a polygon/polyline array of the bezier path which only includes
     * the C0 control points of the bezier nodes.
     * <p>
     * If the bezier path is closed, the array describes a polygon.
     * If the bezier path is open, the array describes a polyline.
     * <p>
     * @return Point array.
     */
    public Point2D.Double[] toPolygonArray() {
        Point2D.Double[] points = new Point2D.Double[size()];
        for (int i = 0, n = size(); i < n; i++) {
            points[i] = new Point2D.Double(get(i).x[0], get(i).y[0]);
        }
        return points;
    }

    /**
     * Sets winding rule for filling the bezier path.
     * @param newValue Must be Path2D.Double.WIND_EVEN_ODD or Path2D.Double.WIND_NON_ZERO.
     */
    public void setWindingRule(int newValue) {
        if (newValue != windingRule) {
            invalidatePath();
            this.windingRule = newValue;
        }
    }

    /**
     * Gets winding rule for filling the bezier path.
     * @return Path2D.Double.WIND_EVEN_ODD or Path2D.Double.WIND_NON_ZERO.
     */
    public int getWindingRule() {
        return windingRule;
    }
}
