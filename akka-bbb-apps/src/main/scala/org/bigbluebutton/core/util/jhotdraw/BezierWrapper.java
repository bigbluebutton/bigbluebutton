package org.bigbluebutton.core.util.jhotdraw;

import java.awt.geom.Point2D;
import java.util.ArrayList;
import java.util.List;

public class BezierWrapper {
  
  private BezierWrapper() {}
  
  public static PathData lineSimplifyAndCurve(List<Float> points, int oWidth, int oHeight) {
    ArrayList<Point2D.Double> startingLine = new ArrayList<Point2D.Double>();
    //denormalize and turn into point2d
    for (int i=0; i<points.size(); i+=2) {
      startingLine.add(new Point2D.Double(denormalize(points.get(i), oWidth),denormalize(points.get(i+1), oHeight)));
    }
    
    //fit it
    BezierPath endPath = Bezier.fitBezierPath(startingLine, 1d);
    
    //get raw path
    PathData rawPath = endPath.toRawPath();
    
    // normalize
    ArrayList<Float> rtnPoints  = new ArrayList<Float>();
    ArrayList<Double> coords = rawPath.coords;
    for (int i=0; i<coords.size(); i+=2) {
      rtnPoints.add(normalize(coords.get(i), oWidth));
      rtnPoints.add(normalize(coords.get(i+1), oHeight));
    }
    
    // return
    rawPath.points = rtnPoints;
    return rawPath;
  }
  
  private static Double denormalize(Float val, int max) {
    return ((double) val)/100d*max;
  }
  
  private static Float normalize(Double val, int max) {
    return ((Double)(val/max*100)).floatValue();
  }
  
}