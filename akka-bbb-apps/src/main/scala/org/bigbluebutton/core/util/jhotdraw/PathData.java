package org.bigbluebutton.core.util.jhotdraw;

import java.util.ArrayList;

public class PathData {
  public ArrayList<Integer> commands;
  public ArrayList<Double> coords;
  public ArrayList<Float> points;
  
  public PathData(ArrayList<Integer> commands, ArrayList<Double> coords) {
    this.commands = commands;
    this.coords = coords;
  }
}