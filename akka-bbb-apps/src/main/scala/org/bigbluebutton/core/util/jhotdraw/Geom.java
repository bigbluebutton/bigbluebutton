/*
 * @(#)Geom.java
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
import static java.lang.Math.*;

/**
 * Some geometric utilities.
 *
 * @version $Id$
 */
public class Geom {

    private Geom() {
    } // never instantiated

    /**
     * Tests if a point is on a line.
     */
    public static boolean lineContainsPoint(int x1, int y1,
            int x2, int y2,
            int px, int py) {
        return lineContainsPoint(x1, y1, x2, y2, px, py, 3d);
    }

    /**
     * Tests if a point is on a line.
     * <p>changed Werner Randelshofer 2003-11-26
     */
    public static boolean lineContainsPoint(int x1, int y1,
            int x2, int y2,
            int px, int py, double tolerance) {

        Rectangle r = new Rectangle(new Point(x1, y1));
        r.add(x2, y2);
        r.grow(max(2, (int) ceil(tolerance)), max(2, (int) ceil(tolerance)));
        if (!r.contains(px, py)) {
            return false;
        }

        double a, b, x, y;

        if (x1 == x2) {
            return (abs(px - x1) <= tolerance);
        }
        if (y1 == y2) {
            return (abs(py - y1) <= tolerance);
        }

        a = (double) (y1 - y2) / (double) (x1 - x2);
        b = (double) y1 - a * (double) x1;
        x = (py - b) / a;
        y = a * px + b;

        return (min(abs(x - px), abs(y - py)) <= tolerance);
    }

    /**
     * Tests if a point is on a line.
     * <p>changed Werner Randelshofer 2003-11-26
     */
    public static boolean lineContainsPoint(double x1, double y1,
            double x2, double y2,
            double px, double py, double tolerance) {

        Rectangle2D.Double r = new Rectangle2D.Double(x1, y1, 0, 0);
        r.add(x2, y2);
        double grow = max(2, (int) ceil(tolerance));
        r.x -= grow;
        r.y -= grow;
        r.width += grow * 2;
        r.height += grow * 2;
        if (!r.contains(px, py)) {
            return false;
        }

        double a, b, x, y;

        if (x1 == x2) {
            return (abs(px - x1) <= tolerance);
        }
        if (y1 == y2) {
            return (abs(py - y1) <= tolerance);
        }

        a = (y1 - y2) / (x1 - x2);
        b = y1 - a * x1;
        x = (py - b) / a;
        y = a * px + b;

        return (min(abs(x - px), abs(y - py)) <= tolerance);
    }
    /** The bitmask that indicates that a point lies above the rectangle. */
    public static final int OUT_TOP = Rectangle2D.OUT_TOP;
    /** The bitmask that indicates that a point lies below the rectangle. */
    public static final int OUT_BOTTOM = Rectangle2D.OUT_BOTTOM;
    /** The bitmask that indicates that a point lies to the left of the rectangle. */
    public static final int OUT_LEFT = Rectangle2D.OUT_LEFT;
    /** The bitmask that indicates that a point lies to the right of the rectangle. */
    public static final int OUT_RIGHT = Rectangle2D.OUT_RIGHT;

    /**
     * Returns the direction OUT_TOP, OUT_BOTTOM, OUT_LEFT, OUT_RIGHT from
     * one point to another one.
     */
    public static int direction(int x1, int y1, int x2, int y2) {
        int direction = 0;
        int vx = x2 - x1;
        int vy = y2 - y1;

        if (vy < vx && vx > -vy) {
            direction = OUT_RIGHT;
        } else if (vy > vx && vy > -vx) {
            direction = OUT_TOP;
        } else if (vx < vy && vx < -vy) {
            direction = OUT_LEFT;
        } else {
            direction = OUT_BOTTOM;
        }
        return direction;
    }

    /**
     * Returns the direction OUT_TOP, OUT_BOTTOM, OUT_LEFT, OUT_RIGHT from
     * one point to another one.
     */
    public static int direction(double x1, double y1, double x2, double y2) {
        int direction = 0;
        double vx = x2 - x1;
        double vy = y2 - y1;

        if (vy < vx && vx > -vy) {
            direction = OUT_RIGHT;
        } else if (vy > vx && vy > -vx) {
            direction = OUT_TOP;
        } else if (vx < vy && vx < -vy) {
            direction = OUT_LEFT;
        } else {
            direction = OUT_BOTTOM;
        }
        return direction;
    }

    /**
     * This method computes a binary OR of the appropriate mask values
     * indicating, for each side of Rectangle r1, whether or not the
     * Rectangle r2 is on the same side of the edge as the rest
     * of this Rectangle.
     *
     *
     *
     *
     *
     *
     *
     *
     * @return the logical OR of all appropriate out codes OUT_RIGHT, OUT_LEFT, OUT_BOTTOM,
     * OUT_TOP.
     */
    public static int outcode(Rectangle r1, Rectangle r2) {
        int outcode = 0;

        if (r2.x > r1.x + r1.width) {
            outcode = OUT_RIGHT;
        } else if (r2.x + r2.width < r1.x) {
            outcode = OUT_LEFT;
        }

        if (r2.y > r1.y + r1.height) {
            outcode |= OUT_BOTTOM;
        } else if (r2.y + r2.height < r1.y) {
            outcode |= OUT_TOP;
        }

        return outcode;
    }

    /**
     * This method computes a binary OR of the appropriate mask values
     * indicating, for each side of Rectangle r1, whether or not the
     * Rectangle r2 is on the same side of the edge as the rest
     * of this Rectangle.
     *
     *
     *
     *
     *
     *
     *
     *
     * @return the logical OR of all appropriate out codes OUT_RIGHT, OUT_LEFT, OUT_BOTTOM,
     * OUT_TOP.
     */
    public static int outcode(Rectangle2D.Double r1, Rectangle2D.Double r2) {
        int outcode = 0;

        if (r2.x > r1.x + r1.width) {
            outcode = OUT_RIGHT;
        } else if (r2.x + r2.width < r1.x) {
            outcode = OUT_LEFT;
        }

        if (r2.y > r1.y + r1.height) {
            outcode |= OUT_BOTTOM;
        } else if (r2.y + r2.height < r1.y) {
            outcode |= OUT_TOP;
        }

        return outcode;
    }

    public static Point south(Rectangle r) {
        return new Point(r.x + r.width / 2, r.y + r.height);
    }

    public static Point2D.Double south(Rectangle2D.Double r) {
        return new Point2D.Double(r.x + r.width / 2, r.y + r.height);
    }

    public static Point center(Rectangle r) {
        return new Point(r.x + r.width / 2, r.y + r.height / 2);
    }

    public static Point2D.Double center(Rectangle2D.Double r) {
        return new Point2D.Double(r.x + r.width / 2, r.y + r.height / 2);
    }

    /**
     * Returns a point on the edge of the shape which crosses the line
     * from the center of the shape to the specified point.
     * If no edge crosses of the shape crosses the line, the nearest control
     * point of the shape is returned.
     */
    public static Point2D.Double chop(Shape shape, Point2D.Double p) {
        Rectangle2D bounds = shape.getBounds2D();
        Point2D.Double ctr = new Point2D.Double(bounds.getCenterX(), bounds.getCenterY());

        // Chopped point
        double cx = -1;
        double cy = -1;
        double len = Double.MAX_VALUE;

        // Try for points along edge
        PathIterator i = shape.getPathIterator(new AffineTransform(), 1);
        double[] coords = new double[6];
        double prevX = coords[0];
        double prevY = coords[1];
        double moveToX = prevX;
        double moveToY = prevY;
        i.next();
        for (; !i.isDone(); i.next()) {
            switch (i.currentSegment(coords)) {
                case PathIterator.SEG_MOVETO:
                    moveToX = coords[0];
                    moveToY = coords[1];
                    break;
                case PathIterator.SEG_CLOSE:
                    coords[0] = moveToX;
                    coords[1] = moveToY;
                    break;
            }
            Point2D.Double chop = Geom.intersect(
                    prevX, prevY,
                    coords[0], coords[1],
                    p.x, p.y,
                    ctr.x, ctr.y);

            if (chop != null) {
                double cl = Geom.length2(chop.x, chop.y, p.x, p.y);
                if (cl < len) {
                    len = cl;
                    cx = chop.x;
                    cy = chop.y;
                }
            }

            prevX = coords[0];
            prevY = coords[1];
        }

        /*
        if (isClosed() && size() > 1) {
        Node first = get(0);
        Node last = get(size() - 1);
        Point2D.Double chop = Geom.intersect(
        first.x[0], first.y[0],
        last.x[0], last.y[0],
        p.x, p.y,
        ctr.x, ctr.y
        );
        if (chop != null) {
        double cl = Geom.length2(chop.x, chop.y, p.x, p.y);
        if (cl < len) {
        len = cl;
        cx = chop.x;
        cy = chop.y;
        }
        }
        }*/


        // if none found, pick closest vertex
        if (len == Double.MAX_VALUE) {
            i = shape.getPathIterator(new AffineTransform(), 1);
            for (; !i.isDone(); i.next()) {
                i.currentSegment(coords);

                double l = Geom.length2(ctr.x, ctr.y, coords[0], coords[1]);
                if (l < len) {
                    len = l;
                    cx = coords[0];
                    cy = coords[1];
                }
            }
        }
        return new Point2D.Double(cx, cy);
    }

    public static Point west(Rectangle r) {
        return new Point(r.x, r.y + r.height / 2);
    }

    public static Point2D.Double west(Rectangle2D.Double r) {
        return new Point2D.Double(r.x, r.y + r.height / 2);
    }

    public static Point east(Rectangle r) {
        return new Point(r.x + r.width, r.y + r.height / 2);
    }

    public static Point2D.Double east(Rectangle2D.Double r) {
        return new Point2D.Double(r.x + r.width, r.y + r.height / 2);
    }

    public static Point north(Rectangle r) {
        return new Point(r.x + r.width / 2, r.y);
    }

    public static Point2D.Double north(Rectangle2D.Double r) {
        return new Point2D.Double(r.x + r.width / 2, r.y);
    }

    /**
     * Constains a value to the given range.
     * @return the constrained value
     */
    public static int range(int min, int max, int value) {
        if (value < min) {
            value = min;
        }
        if (value > max) {
            value = max;
        }
        return value;
    }

    /**
     * Constains a value to the given range.
     * @return the constrained value
     */
    public static double range(double min, double max, double value) {
        if (value < min) {
            value = min;
        }
        if (value > max) {
            value = max;
        }
        return value;
    }

    /**
     * Gets the square distance between two points.
     */
    public static long length2(int x1, int y1, int x2, int y2) {
        return (x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1);
    }

    /**
     * Gets the distance between to points
     */
    public static long length(int x1, int y1, int x2, int y2) {
        return (long) sqrt(length2(x1, y1, x2, y2));
    }

    /**
     * Gets the square distance between two points.
     */
    public static double length2(double x1, double y1, double x2, double y2) {
        return (x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1);
    }

    /**
     * Gets the distance between to points
     */
    public static double length(double x1, double y1, double x2, double y2) {
        return sqrt(length2(x1, y1, x2, y2));
    }

    /**
     * Gets the distance between to points
     */
    public static double length(Point2D.Double p1, Point2D.Double p2) {
        return sqrt(length2(p1.x, p1.y, p2.x, p2.y));
    }

    /**
     * Caps the line defined by p1 and p2 by the number of units
     * specified by radius.
     * @return A new end point for the line.
     */
    public static Point2D.Double cap(Point2D.Double p1, Point2D.Double p2, double radius) {
        double angle = PI / 2 - atan2(p2.x - p1.x, p2.y - p1.y);
        Point2D.Double p3 = new Point2D.Double(
                p2.x + radius * cos(angle),
                p2.y + radius * sin(angle));
        return p3;
    }

    /**
     * Gets the angle of a point relative to a rectangle.
     */
    public static double pointToAngle(Rectangle r, Point p) {
        int px = p.x - (r.x + r.width / 2);
        int py = p.y - (r.y + r.height / 2);
        return atan2(py * r.width, px * r.height);
    }

    /**
     * Gets the angle of a point relative to a rectangle.
     */
    public static double pointToAngle(Rectangle2D.Double r, Point2D.Double p) {
        double px = p.x - (r.x + r.width / 2);
        double py = p.y - (r.y + r.height / 2);
        return atan2(py * r.width, px * r.height);
    }

    /**
     * Gets the angle of the specified line.
     */
    public static double angle(double x1, double y1, double x2, double y2) {
        return atan2(y2 - y1, x2 - x1);
    }

    /**
     * Gets the point on a rectangle that corresponds to the given angle.
     */
    public static Point angleToPoint(Rectangle r, double angle) {
        double si = sin(angle);
        double co = cos(angle);
        double e = 0.0001;

        int x = 0, y = 0;
        if (abs(si) > e) {
            x = (int) ((1.0 + co / abs(si)) / 2.0 * r.width);
            x = range(0, r.width, x);
        } else if (co >= 0.0) {
            x = r.width;
        }
        if (abs(co) > e) {
            y = (int) ((1.0 + si / abs(co)) / 2.0 * r.height);
            y = range(0, r.height, y);
        } else if (si >= 0.0) {
            y = r.height;
        }
        return new Point(r.x + x, r.y + y);
    }

    /**
     * Gets the point on a rectangle that corresponds to the given angle.
     */
    public static Point2D.Double angleToPoint(Rectangle2D.Double r, double angle) {
        double si = sin(angle);
        double co = cos(angle);
        double e = 0.0001;

        double x = 0, y = 0;
        if (abs(si) > e) {
            x = (1.0 + co / abs(si)) / 2.0 * r.width;
            x = range(0, r.width, x);
        } else if (co >= 0.0) {
            x = r.width;
        }
        if (abs(co) > e) {
            y = (1.0 + si / abs(co)) / 2.0 * r.height;
            y = range(0, r.height, y);
        } else if (si >= 0.0) {
            y = r.height;
        }
        return new Point2D.Double(r.x + x, r.y + y);
    }

    /**
     * Converts a polar to a point
     */
    public static Point polarToPoint(double angle, double fx, double fy) {
        double si = sin(angle);
        double co = cos(angle);
        return new Point((int) (fx * co + 0.5), (int) (fy * si + 0.5));
    }

    /**
     * Converts a polar to a point
     */
    public static Point2D.Double polarToPoint2D(double angle, double fx, double fy) {
        double si = sin(angle);
        double co = cos(angle);
        return new Point2D.Double(fx * co + 0.5, fy * si + 0.5);
    }

    /**
     * Gets the point on an oval that corresponds to the given angle.
     */
    public static Point ovalAngleToPoint(Rectangle r, double angle) {
        Point center = Geom.center(r);
        Point p = Geom.polarToPoint(angle, r.width / 2, r.height / 2);
        return new Point(center.x + p.x, center.y + p.y);
    }

    /**
     * Gets the point on an oval that corresponds to the given angle.
     */
    public static Point2D.Double ovalAngleToPoint(Rectangle2D.Double r, double angle) {
        Point2D.Double center = Geom.center(r);
        Point2D.Double p = Geom.polarToPoint2D(angle, r.width / 2, r.height / 2);
        return new Point2D.Double(center.x + p.x, center.y + p.y);
    }

    /**
     * Standard line intersection algorithm
     * Return the point of intersection if it exists, else null.
     **/
    public static Point intersect(int xa, // line 1 point 1 x
            // from Doug Lea's PolygonFigure
            int ya, // line 1 point 1 y
            int xb, // line 1 point 2 x
            int yb, // line 1 point 2 y
            int xc, // line 2 point 1 x
            int yc, // line 2 point 1 y
            int xd, // line 2 point 2 x
            int yd) { // line 2 point 2 y

        // source: http://vision.dai.ed.ac.uk/andrewfg/c-g-a-faq.html
        // eq: for lines AB and CD
        //     (YA-YC)(XD-XC)-(XA-XC)(YD-YC)
        // r = -----------------------------  (eqn 1)
        //     (XB-XA)(YD-YC)-(YB-YA)(XD-XC)
        //
        //     (YA-YC)(XB-XA)-(XA-XC)(YB-YA)
        // s = -----------------------------  (eqn 2)
        //     (XB-XA)(YD-YC)-(YB-YA)(XD-XC)
        //  XI = XA + r(XB-XA)
        //  YI = YA + r(YB-YA)

        double denom = ((xb - xa) * (yd - yc) - (yb - ya) * (xd - xc));

        double rnum = ((ya - yc) * (xd - xc) - (xa - xc) * (yd - yc));

        if (denom == 0.0) { // parallel
            if (rnum == 0.0) { // coincident; pick one end of first line
                if ((xa < xb && (xb < xc || xb < xd))
                        || (xa > xb && (xb > xc || xb > xd))) {
                    return new Point(xb, yb);
                } else {
                    return new Point(xa, ya);
                }
            } else {
                return null;
            }
        }

        double r = rnum / denom;
        double snum = ((ya - yc) * (xb - xa) - (xa - xc) * (yb - ya));
        double s = snum / denom;

        if (0.0 <= r && r <= 1.0 && 0.0 <= s && s <= 1.0) {
            int px = (int) (xa + (xb - xa) * r);
            int py = (int) (ya + (yb - ya) * r);
            return new Point(px, py);
        } else {
            return null;
        }
    }

    /**
     * Standard line intersection algorithm
     * Return the point of intersection if it exists, else null
     **/
    // from Doug Lea's PolygonFigure
    public static Point2D.Double intersect(double xa, // line 1 point 1 x
            double ya, // line 1 point 1 y
            double xb, // line 1 point 2 x
            double yb, // line 1 point 2 y
            double xc, // line 2 point 1 x
            double yc, // line 2 point 1 y
            double xd, // line 2 point 2 x
            double yd) { // line 2 point 2 y

        // source: http://vision.dai.ed.ac.uk/andrewfg/c-g-a-faq.html
        // eq: for lines AB and CD
        //     (YA-YC)(XD-XC)-(XA-XC)(YD-YC)
        // r = -----------------------------  (eqn 1)
        //     (XB-XA)(YD-YC)-(YB-YA)(XD-XC)
        //
        //     (YA-YC)(XB-XA)-(XA-XC)(YB-YA)
        // s = -----------------------------  (eqn 2)
        //     (XB-XA)(YD-YC)-(YB-YA)(XD-XC)
        //  XI = XA + r(XB-XA)
        //  YI = YA + r(YB-YA)

        double denom = ((xb - xa) * (yd - yc) - (yb - ya) * (xd - xc));

        double rnum = ((ya - yc) * (xd - xc) - (xa - xc) * (yd - yc));

        if (denom == 0.0) { // parallel
            if (rnum == 0.0) { // coincident; pick one end of first line
                if ((xa < xb && (xb < xc || xb < xd))
                        || (xa > xb && (xb > xc || xb > xd))) {
                    return new Point2D.Double(xb, yb);
                } else {
                    return new Point2D.Double(xa, ya);
                }
            } else {
                return null;
            }
        }

        double r = rnum / denom;
        double snum = ((ya - yc) * (xb - xa) - (xa - xc) * (yb - ya));
        double s = snum / denom;

        if (0.0 <= r && r <= 1.0 && 0.0 <= s && s <= 1.0) {
            double px = xa + (xb - xa) * r;
            double py = ya + (yb - ya) * r;
            return new Point2D.Double(px, py);
        } else {
            return null;
        }
    }

    public static Point2D.Double intersect(
            double xa, // line 1 point 1 x
            double ya, // line 1 point 1 y
            double xb, // line 1 point 2 x
            double yb, // line 1 point 2 y
            double xc, // line 2 point 1 x
            double yc, // line 2 point 1 y
            double xd, // line 2 point 2 x
            double yd,
            double limit) { // line 2 point 2 y

        // source: http://vision.dai.ed.ac.uk/andrewfg/c-g-a-faq.html
        // eq: for lines AB and CD
        //     (YA-YC)(XD-XC)-(XA-XC)(YD-YC)
        // r = -----------------------------  (eqn 1)
        //     (XB-XA)(YD-YC)-(YB-YA)(XD-XC)
        //
        //     (YA-YC)(XB-XA)-(XA-XC)(YB-YA)
        // s = -----------------------------  (eqn 2)
        //     (XB-XA)(YD-YC)-(YB-YA)(XD-XC)
        //  XI = XA + r(XB-XA)
        //  YI = YA + r(YB-YA)

        double denom = ((xb - xa) * (yd - yc) - (yb - ya) * (xd - xc));

        double rnum = ((ya - yc) * (xd - xc) - (xa - xc) * (yd - yc));

        if (denom == 0.0) { // parallel
            if (rnum == 0.0) { // coincident; pick one end of first line
                if ((xa < xb && (xb < xc || xb < xd))
                        || (xa > xb && (xb > xc || xb > xd))) {
                    return new Point2D.Double(xb, yb);
                } else {
                    return new Point2D.Double(xa, ya);
                }
            } else {
                return null;
            }
        }

        double r = rnum / denom;
        double snum = ((ya - yc) * (xb - xa) - (xa - xc) * (yb - ya));
        double s = snum / denom;

        if (0.0 <= r && r <= 1.0 && 0.0 <= s && s <= 1.0) {
            double px = xa + (xb - xa) * r;
            double py = ya + (yb - ya) * r;
            return new Point2D.Double(px, py);
        } else {
            double px = xa + (xb - xa) * r;
            double py = ya + (yb - ya) * r;

            if (length(xa, ya, px, py) <= limit
                    || length(xb, yb, px, py) <= limit
                    || length(xc, yc, px, py) <= limit
                    || length(xd, yd, px, py) <= limit) {
                return new Point2D.Double(px, py);
            }

            return null;
        }
    }

    /**
     * compute distance of point from line segment, or
     * Double.MAX_VALUE if perpendicular projection is outside segment; or
     * If pts on line are same, return distance from point
     **/
    // from Doug Lea's PolygonFigure
    public static double distanceFromLine(int xa, int ya,
            int xb, int yb,
            int xc, int yc) {


        // source:http://vision.dai.ed.ac.uk/andrewfg/c-g-a-faq.html#q7
        //Let the point be C (XC,YC) and the line be AB (XA,YA) to (XB,YB).
        //The length of the
        //      line segment AB is L:
        //
        //                    ___________________
        //                   |        2         2
        //              L = \| (XB-XA) + (YB-YA)
        //and
        //
        //                  (YA-YC)(YA-YB)-(XA-XC)(XB-XA)
        //              r = -----------------------------
        //                              L**2
        //
        //                  (YA-YC)(XB-XA)-(XA-XC)(YB-YA)
        //              s = -----------------------------
        //                              L**2
        //
        //      Let I be the point of perpendicular projection of C onto AB, the
        //
        //              XI=XA+r(XB-XA)
        //              YI=YA+r(YB-YA)
        //
        //      Distance from A to I = r*L
        //      Distance from C to I = s*L
        //
        //      If r < 0 I is on backward extension of AB
        //      If r>1 I is on ahead extension of AB
        //      If 0<=r<=1 I is on AB
        //
        //      If s < 0 C is left of AB (you can just check the numerator)
        //      If s>0 C is right of AB
        //      If s=0 C is on AB

        int xdiff = xb - xa;
        int ydiff = yb - ya;
        long l2 = xdiff * xdiff + ydiff * ydiff;

        if (l2 == 0) {
            return Geom.length(xa, ya, xc, yc);
        }

        double rnum = (ya - yc) * (ya - yb) - (xa - xc) * (xb - xa);
        double r = rnum / l2;

        if (r < 0.0 || r > 1.0) {
            return Double.MAX_VALUE;
        }

        double xi = xa + r * xdiff;
        double yi = ya + r * ydiff;
        double xd = xc - xi;
        double yd = yc - yi;
        return sqrt(xd * xd + yd * yd);

        /*
        for directional version, instead use
        double snum =  (ya-yc) * (xb-xa) - (xa-xc) * (yb-ya);
        double s = snum / l2;

        double l = sqrt((double)l2);
        return = s * l;
         */
    }

    /**
     * Resizes the <code>Rectangle2D.Double</code> both horizontally and vertically.
     * <p>
     * This method modifies the <code>Rectangle2D.Double</code> so that it is
     * <code>h</code> units larger on both the left and right side,
     * and <code>v</code> units larger at both the top and bottom.
     * <p>
     * The new <code>Rectangle2D.Double</code> has (<code>x&nbsp;-&nbsp;h</code>,
     * <code>y&nbsp;-&nbsp;v</code>) as its top-left corner, a
     * width of
     * <code>width</code>&nbsp;<code>+</code>&nbsp;<code>2h</code>,
     * and a height of
     * <code>height</code>&nbsp;<code>+</code>&nbsp;<code>2v</code>.
     * <p>
     * If negative values are supplied for <code>h</code> and
     * <code>v</code>, the size of the <code>Rectangle2D.Double</code>
     * decreases accordingly.
     * The <code>grow</code> method does not check whether the resulting
     * values of <code>width</code> and <code>height</code> are
     * non-negative.
     * @param h the horizontal expansion
     * @param v the vertical expansion
     */
    public static void grow(Rectangle2D.Double r, double h, double v) {
        r.x -= h;
        r.y -= v;
        r.width += h * 2d;
        r.height += v * 2d;
    }

    /**
     * Returns true, if rectangle 1 contains rectangle 2.
     * <p>
     * This method is similar to Rectangle2D.contains, but also returns true,
     * when rectangle1 contains rectangle2 and either or both of them
     * are empty.
     *
     * @param r1 Rectangle 1.
     * @param r2 Rectangle 2.
     * @return true if r1 contains r2.
     */
    public static boolean contains(Rectangle2D.Double r1, Rectangle2D.Double r2) {
        return (r2.x >= r1.x
                && r2.y >= r1.y
                && (r2.x + max(0, r2.width)) <= r1.x + max(0, r1.width)
                && (r2.y + max(0, r2.height)) <= r1.y + max(0, r1.height));
    }

    /**
     * Returns true, if rectangle 1 contains rectangle 2.
     * <p>
     * This method is similar to Rectangle2D.contains, but also returns true,
     * when rectangle1 contains rectangle2 and either or both of them
     * are empty.
     *
     * @param r1 Rectangle 1.
     * @param r2 Rectangle 2.
     * @return true if r1 contains r2.
     */
    public static boolean contains(Rectangle2D r1, Rectangle2D r2) {
        return (r2.getX()) >= r1.getX()
                && r2.getY() >= r1.getY()
                && (r2.getX() + max(0, r2.getWidth())) <= r1.getX() + max(0, r1.getWidth())
                && (r2.getY() + max(0, r2.getHeight())) <= r1.getY() + max(0, r1.getHeight());
    }
}

