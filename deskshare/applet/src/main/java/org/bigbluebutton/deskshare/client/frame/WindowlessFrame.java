/*
 * BigBlueButton - http://www.bigbluebutton.org
 * 
 * Copyright (c) 2008-2010 by respective authors (see below). All rights reserved.
 * 
 * BigBlueButton is free software; you can redistribute it and/or modify it under the 
 * terms of the GNU Lesser General Public License as published by the Free Software 
 * Foundation; either version 3 of the License, or (at your option) any later 
 * version. 
 * 
 * BigBlueButton is distributed in the hope that it will be useful, but WITHOUT ANY 
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A 
 * PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
 * 
 * You should have received a copy of the GNU Lesser General Public License along 
 * with BigBlueButton; if not, If not, see <http://www.gnu.org/licenses/>.
 *
 * @author Jeremy Thomerson <jthomerson@genericconf.com>
 * $Id: $
 */

package org.bigbluebutton.deskshare.client.frame;

import java.awt.BasicStroke;
import java.awt.Color;
import java.awt.Component;
import java.awt.Cursor;
import java.awt.Dimension;
import java.awt.Frame;
import java.awt.GradientPaint;
import java.awt.Graphics;
import java.awt.Graphics2D;
import java.awt.GraphicsDevice;
import java.awt.GraphicsEnvironment;
import java.awt.Insets;
import java.awt.Point;
import java.awt.Rectangle;
import java.awt.Toolkit;
import java.awt.Window;
import java.awt.event.MouseAdapter;
import java.awt.event.MouseEvent;
import java.io.Serializable;
import java.util.concurrent.atomic.AtomicBoolean;

import javax.swing.JFrame;
import javax.swing.JOptionPane;
import javax.swing.JPanel;

class WindowlessFrame implements Serializable {
	private static final long serialVersionUID = 1L;

	private CaptureRegionListener captureRegionListener;
	private MouseAdapter resizingAdapter;
	private MouseAdapter movingAdapter;
	
	private static interface PropertyChanger {
		void changeOn(Component component);
	}
	
	private static interface LocationAndSizeUpdateable {
		void updateLocationAndSize();
	}
	
	private static interface OffsetLocator {
		int getLeftOffset();
		int getTopOffset();
	}

	private static class StaticOffsetLocator implements OffsetLocator {
		private final int mLeftOffset;
		private final int mTopOffset;

		public StaticOffsetLocator(int left, int top) {
			mLeftOffset = left;
			mTopOffset = top;
		}

		@Override
		public int getLeftOffset() {
			return mLeftOffset;
		}

		@Override
		public int getTopOffset() {
			return mTopOffset;
		}
	}

	private static final PropertyChanger REPAINTER = new PropertyChanger() {
		@Override
		public void changeOn(Component component) {
			if (component instanceof LocationAndSizeUpdateable) {
				((LocationAndSizeUpdateable) component).updateLocationAndSize();
			}
			component.repaint();
		}
	};
	
	
	// properties that change during use
	private Point mTopLeft = new Point();
	private Dimension mOverallSize = new Dimension();

	// properties initialized during construction
	private BasicStroke mBorderStroke = new BasicStroke(5, BasicStroke.CAP_ROUND, BasicStroke.JOIN_ROUND, 0, new float[] { 12, 12 }, 0);
	private final BasicStroke borderSolidStroke = new BasicStroke(5, BasicStroke.CAP_ROUND, BasicStroke.JOIN_ROUND, 0);
	
	private GradientPaint mGradient = new GradientPaint(0.0f, 0.0f, Color.red, 1.0f, 1.0f, Color.white, true);
	private final GradientPaint blueGradient = new GradientPaint(0.0f, 0.0f, Color.blue, 1.0f, 1.0f, Color.blue, true);
	private final GradientPaint redGradient = new GradientPaint(0.0f, 0.0f, Color.red, 1.0f, 1.0f, Color.white, true);
	
	private final int mBorderWidth;
	private final JFrame mWindowFrame;
	private final BarFrame mTopBorder;
	private final BarFrame mRightBorder;
	private final BarFrame mBottomBorder;
	private final BarFrame mLeftBorder;
	private ToolbarFrame mToolbarFrame;

	private class ToolbarFrame extends Window implements LocationAndSizeUpdateable {
		private static final long serialVersionUID = 1L;

		private final OffsetLocator mOffsetLocator;
		
		public ToolbarFrame(JFrame frame, OffsetLocator ol, JPanel content) {
			super(frame);
			super.setAlwaysOnTop(true);
			frame.setAlwaysOnTop(true);
			mOffsetLocator = ol;
			//setUndecorated(true);
			add(content);
			pack();
		}

		public void updateLocationAndSize() {
			setLocation(getLocation());
		}
		
		@Override
		public Point getLocation() {
			return new Point(mTopLeft.x + mOffsetLocator.getLeftOffset(), mTopLeft.y + mOffsetLocator.getTopOffset());
		}
	}
	
	private class WindowlessFrameMovingMouseListener extends MouseAdapter {
		
		private AtomicBoolean mMoving = new AtomicBoolean(false);
		
		private Point mActionOffset = null;

		@Override
		public void mouseDragged(MouseEvent e) {
			/*
			 * <REALWAT>
			 * Comment old source code
			 */
			/*
			final int changeInX = e.getLocationOnScreen().x - mActionOffset.x - mTopLeft.x;
			final int changeInY = e.getLocationOnScreen().y - mActionOffset.y - mTopLeft.y;
			*/
			/*
			 * </REALWAT>
			 */
			/*
			 * <REALWAT>
			 * Handling edge detection of the desktop sharing to resolve issue 647 
			 */
			int changeInX = e.getLocationOnScreen().x - mActionOffset.x - mTopLeft.x;
			int changeInY = e.getLocationOnScreen().y - mActionOffset.y - mTopLeft.y;
			Toolkit tk 	= Toolkit.getDefaultToolkit();
			Dimension d = tk.getScreenSize();
			if (mTopLeft.x < 1 && changeInX < 0) {
				mTopLeft.x = 0;
				changeInX = 0;
			}
			if (mTopLeft.y < 1 && changeInY < 0) {
				mTopLeft.y = 0;
				changeInY = 0;
			}
			if (mTopLeft.x + mOverallSize.width > (d.width-6) && changeInX > 0) {
				mTopLeft.x = d.width - mOverallSize.width-5;
				changeInX = 0;
			}
			if (mTopLeft.y + mOverallSize.height > (d.height-6) && changeInY > 0) {
				mTopLeft.y = d.height - mOverallSize.height-5;
				changeInY = 0;
			}
			/*
			 * </REALWAT>
			 */
			if (mMoving.get() && !e.isConsumed()) {
				WindowlessFrame.this.setLocation(changeInX + mTopLeft.x, changeInY + mTopLeft.y);
			}
		}
		
		@Override
		public void mousePressed(MouseEvent e) {
			final Point mouse = e.getLocationOnScreen();
			mActionOffset = new Point(mouse.x - mTopLeft.x, mouse.y - mTopLeft.y);
			mMoving.set(true);
			e.getComponent().setCursor(Cursor.getPredefinedCursor(Cursor.MOVE_CURSOR));
		}
		
		@Override
		public void mouseReleased(MouseEvent e) {
			mMoving.set(false);
			mActionOffset = null;
			e.getComponent().setCursor(Cursor.getDefaultCursor());
		}

	}
	
	private class WindowlessFrameResizingMouseListener extends MouseAdapter {
		/*
		 * <REALWAT>
		 * Enlarge resize area of the desktop sharing frame:
		 * - update CORNER_SIZE value from 15 to 150
	 */
		private static final int CORNER_SIZE = 150;
		/*
		 * </REALWAT>
		 */
		private AtomicBoolean mResizing = new AtomicBoolean(false);
		
		private Point mActionOffset = null;
		private Dimension mOriginalSize = null;
		private Corner mCorner;

		@Override
		public void mouseDragged(MouseEvent e) {
			final int changeInX = e.getLocationOnScreen().x - mActionOffset.x - mTopLeft.x;
			final int changeInY = e.getLocationOnScreen().y - mActionOffset.y - mTopLeft.y;
			//<REALWAT>
			Toolkit tk = Toolkit.getDefaultToolkit();
			Dimension d = tk.getScreenSize();
			//</REALWAT>
			if (mResizing.get()) {
				int newH = mOriginalSize.height;
				int newW = mOriginalSize.width;
				if (Corner.SOUTHEAST == mCorner) {
					/*
					 * <REALWAT>
					 * Handling when resizing the desktop sharing frame: 
					 * - The border-right can not drag pass through the border-left
					 * - The border-bottom can not drag pass through the border-top
					 */
					if (e.getLocationOnScreen().x < mTopLeft.x+5) {
						newW = 5;
					} else {
						newW += changeInX;				
					}
					if (e.getLocationOnScreen().y < mTopLeft.y+5) {
						newH = 5;
					} else {
						newH += changeInY;
					}
					/*
					 * </REALWAT>
					 */
					/* 
					 * <REALWAT>
					 * Comment old source code
					 */
					/*
					newH += changeInY;
					newW += changeInX;
					*/
					/*
					 * </REALWAT>
					 */
				} else if (mCorner == Corner.NORTHEAST) {
					mTopLeft.y = mTopLeft.y + changeInY;
					newH = mOverallSize.height + -changeInY;
					newW += changeInX;
				} else if (mCorner == Corner.NORTHWEST) {
					mTopLeft.y = mTopLeft.y + changeInY;
					newH = mOverallSize.height + -changeInY;
					mTopLeft.x = mTopLeft.x + changeInX;
					newW = mOverallSize.width + -changeInX;
				} else if (mCorner == Corner.SOUTHWEST) {
					newH += changeInY;
					mTopLeft.x = mTopLeft.x + changeInX;
					newW = mOverallSize.width + -changeInX;
				}
				//System.out.println("orig size: " + mOriginalSize + ", newH: " + newH + ", newW: " + newW + ", X: " + changeInX + ", Y: " + changeInY);
				/*
				 * <REALWAT>
				 * Handling when resizing the desktop sharing frame: 
				 * - Detect the edge of the desktop sharing frame to 
				 * 	 prevent resizing frame out of screen
				 */
				if (newH + mTopLeft.y > d.height-5){
					newH = d.height - mTopLeft.y-5;
				}
				if (newW + mTopLeft.x > d.width-5){
					newW = d.width - mTopLeft.x-5;
				}
				/*
				 * </REALWAT>
				 */
				WindowlessFrame.this.setSize(newH, newW);
				e.consume();
			}
		}
		
		@Override
		public void mousePressed(MouseEvent e) {
			final Point mouse = e.getLocationOnScreen();
			mActionOffset = new Point(mouse.x - mTopLeft.x, mouse.y - mTopLeft.y);
			mOriginalSize = new Dimension(mOverallSize);
			mCorner = nearCorner(mouse);
			if (mCorner != null) {
				mResizing.set(true);
			}
		}
		
		@Override
		public void mouseReleased(MouseEvent e) {
			mResizing.set(false);
			mActionOffset = null;
			mOriginalSize = null;
			mCorner = null;
		}

		private Corner nearCorner(Point mouse) {
			if (isNearBottomRightCorner(mouse)) {
				return Corner.SOUTHEAST;
			} 
			/*
			 * <REALWAT>
			 * Comment old source code:
			 * - Remove checking 3 corner when the mouse pointer move over.
			 */
			/*  else if (isNearTopRightCorner(mouse)) {
				return Corner.NORTHEAST;
			} else if (isNearTopLeftCorner(mouse)) {
				return Corner.NORTHWEST;
			} else if (isNearBottomLeftCorner(mouse)) {
				return Corner.SOUTHWEST;
			}
			*/
			/*
			 * </REALWAT>
			 */
			return null;
		}

		private boolean isNearBottomRightCorner(Point mouse) {
			int xToBotLeft = Math.abs(mTopLeft.x + (int) mOverallSize.getWidth() - mouse.x);
			int yToBotLeft = Math.abs(mTopLeft.y + (int) mOverallSize.getHeight() - mouse.y);
			return xToBotLeft < CORNER_SIZE && yToBotLeft < CORNER_SIZE;
		}

		/*
		 * <REALWAT>
		 * Comment old source code:
		 * - Removing 3 function that detect the mouse pointer when
		 *   move over 3 corner of the desktop sharing frame.
		 */
		 /* private boolean isNearTopRightCorner(Point mouse) {
			int xToTopRight = Math.abs(mTopLeft.x + (int) mOverallSize.getWidth() - mouse.x);
			int yToTopRight = Math.abs(mTopLeft.y - mouse.y);
			return xToTopRight < CORNER_SIZE && yToTopRight < CORNER_SIZE;
		}

		private boolean isNearBottomLeftCorner(Point mouse) {
			int xToBottomLeft = Math.abs(mTopLeft.x - mouse.x);
			int yToBottomLeft = Math.abs(mTopLeft.y + (int) mOverallSize.getHeight() - mouse.y);
			return xToBottomLeft < CORNER_SIZE && yToBottomLeft < CORNER_SIZE;
		}

		private boolean isNearTopLeftCorner(Point mouse) {
			int xToTopLeft = Math.abs(mTopLeft.x - mouse.x);
			int yToTopLeft = Math.abs(mTopLeft.y - mouse.y);
			return xToTopLeft < CORNER_SIZE && yToTopLeft < CORNER_SIZE;
		}
		*/
		/*
		 * </REALWAT>
		 */

		@Override
		public void mouseMoved(MouseEvent e) {
			final Point mouse = e.getLocationOnScreen();
			/*
			 * <REALWAT>
			 * Comment old source code:
			 * - Remove the (drag resize) mouse icon when moving mouse pointer
			 *   over the 3 corner of the desktop sharing frame.
			 */ 
			/*
			if (isNearTopLeftCorner(mouse)) {
				e.getComponent().setCursor(Cursor.getPredefinedCursor(Cursor.NW_RESIZE_CURSOR));
			} else if (isNearBottomLeftCorner(mouse)) {
				e.getComponent().setCursor(Cursor.getPredefinedCursor(Cursor.SW_RESIZE_CURSOR));
			} else if (isNearTopRightCorner(mouse)) {
				e.getComponent().setCursor(Cursor.getPredefinedCursor(Cursor.NE_RESIZE_CURSOR));
			} else 
			*/
			/*</REALWAT>
			 * 
			 */
			if (isNearBottomRightCorner(mouse)) {
				e.getComponent().setCursor(Cursor.getPredefinedCursor(Cursor.SE_RESIZE_CURSOR));
			} else {
				e.getComponent().setCursor(Cursor.getDefaultCursor());
			}
		}
	}
	
	private class BarFrame extends Window implements LocationAndSizeUpdateable {
		private static final long serialVersionUID = 1L;

		private final OffsetLocator mOffsetLocator;
		
		public BarFrame(Frame frame, OffsetLocator offsetLocator) {
			super(frame);
			mOffsetLocator = offsetLocator;
			//setUndecorated(true);
		}

		@Override
		public void paint(Graphics g) {
			if (shouldPaintRectangle()) {
				Graphics2D g2 = (Graphics2D) g;
				g2.setStroke(mBorderStroke);
				g2.setPaint(mGradient);
				g2.drawRect(0, 0, getWidth(), getHeight());
			} else {
				super.paint(g);
			}
		}

		protected boolean shouldPaintRectangle() {
			return true;
		}

		public void updateLocationAndSize() {
			setSize(getWidth(), getHeight());
			setLocation(getLocation());
		}
		
		@Override
		public Point getLocation() {
			return new Point(mTopLeft.x + mOffsetLocator.getLeftOffset(), mTopLeft.y + mOffsetLocator.getTopOffset());
		}
		
		@Override
		public int getHeight() {
			return mBorderWidth;
		}
		
		@Override
		public int getWidth() {
			return mOverallSize.width;
		}
	}
	
	private class HorizontalBarFrame extends BarFrame {
		private static final long serialVersionUID = 1L;
		
		public HorizontalBarFrame(JFrame frame, OffsetLocator offsetLocator) {
			super(frame, offsetLocator);
			super.setAlwaysOnTop(true);
		}
	}
	
	private class VerticalBarFrame extends BarFrame {
		private static final long serialVersionUID = 1L;
		
		public VerticalBarFrame(JFrame frame, OffsetLocator offsetLocator) {
			super(frame, offsetLocator);
			super.setAlwaysOnTop(true);
		}
		
		@Override
		public int getWidth() {
			return mBorderWidth;
		}
		
		@Override
		public int getHeight() {
			return mOverallSize.height;
		}
	}
	
	public WindowlessFrame(int borderWidth) {
		mBorderWidth = borderWidth;

		mWindowFrame = new JFrame("Windowless Frame");
		//mWindowFrame.setAlwaysOnTop(true);
		
		mTopBorder = new HorizontalBarFrame(mWindowFrame, new StaticOffsetLocator(0, 0));
		mBottomBorder = new HorizontalBarFrame(mWindowFrame, new OffsetLocator() {
			
			@Override
			public int getTopOffset() {
				return mOverallSize.height;
			}
			
			@Override
			public int getLeftOffset() {
				return 0;
			}
		});
		
		mRightBorder = new VerticalBarFrame(mWindowFrame, new OffsetLocator() {
			
			@Override
			public int getTopOffset() {
				return 0;
			}
			
			@Override
			public int getLeftOffset() {
				return mOverallSize.width;
			}
		});
		mLeftBorder = new VerticalBarFrame(mWindowFrame, new StaticOffsetLocator(0, 0));
		
		movingAdapter = createMovingMouseListener();
		resizingAdapter = createResizingMouseListener();
		changeBarFrames(new PropertyChanger() {
			@Override
			public void changeOn(Component component) {
				component.addMouseListener(resizingAdapter);
				component.addMouseMotionListener(resizingAdapter);
				component.addMouseListener(movingAdapter);
				component.addMouseMotionListener(movingAdapter);
			}
		}, false);	
	}
		
	public final MouseAdapter createMovingMouseListener() {
		return new WindowlessFrameMovingMouseListener();
	}

	public final MouseAdapter createResizingMouseListener() {
		return new WindowlessFrameResizingMouseListener();
	}

	public void setToolbar(JPanel toolbar) {
		final OffsetLocator toolbarOffsetLocator = new OffsetLocator() {
			@Override
			public int getTopOffset() {
				return mOverallSize.height + mBorderWidth;
			}
			
			@Override
			public int getLeftOffset() {
				return 0;
			}
		};
		mToolbarFrame = new ToolbarFrame(mWindowFrame, toolbarOffsetLocator, toolbar);
	}
	
	public final void setSize(int height, int width) {
		setHeight(height);
		setWidth(width);
		repaint();
	}

	public final void setWidth(int width) {
		mOverallSize.width = width;
	}
	
	public final void setHeight(int height) {
		mOverallSize.height = height;
	}
	
	public final void setLocation(int x, int y) {
		mTopLeft.x = x;
		mTopLeft.y = y;
		repaint();
		
		if (captureRegionListener != null) {
			Rectangle rect  = getFramedRectangle();
			captureRegionListener.onCaptureRegionMoved(rect.x, rect.y);
		}
	}
	
	public final int getX(){
		return mTopLeft.x;
	}
	
	public final int getY(){
		return mTopLeft.y;
	}
	
	public final int getWidth(){
		return mOverallSize.width - mBorderWidth;
	}
	
	public final int getHeight(){
		return mOverallSize.height - mBorderWidth;
	}
	
	public final void centerOnScreen() {
        Toolkit kit = mLeftBorder.getToolkit();
        GraphicsEnvironment ge = GraphicsEnvironment.getLocalGraphicsEnvironment();
        GraphicsDevice[] gs = ge.getScreenDevices();
        Insets in = kit.getScreenInsets(gs[0].getDefaultConfiguration());
        
        Dimension d = kit.getScreenSize();
        int maxWidth = (d.width - in.left - in.right);
        int maxHeight = (d.height - in.top - in.bottom);
        setLocation((int) (maxWidth - mOverallSize.width) / 2, (int) (maxHeight - mOverallSize.height) / 2);
	}
	
	public final Rectangle getFramedRectangle() {
		return new Rectangle(mTopLeft.x + mBorderWidth, mTopLeft.y + mBorderWidth, mOverallSize.width - mBorderWidth, mOverallSize.height - mBorderWidth);
	}

	public final void setVisible(final boolean b) {
		changeAll(new PropertyChanger() {
			@Override
			public void changeOn(Component component) {
				component.setVisible(b);
			}
		}, true);
	}
	
	private void changeBarFrames(PropertyChanger pc, boolean repaint) {
		pc.changeOn(mTopBorder);
		pc.changeOn(mRightBorder);
		pc.changeOn(mBottomBorder);
		pc.changeOn(mLeftBorder);
		if (repaint) {
			repaint();
		}
	}

	private void changeAll(PropertyChanger pc, boolean repaint) {
		if (mToolbarFrame != null) pc.changeOn(mToolbarFrame);
		changeBarFrames(pc, repaint);
	}

	public final void repaint() {
		changeAll(REPAINTER, false);
	}

	public void changeBorderToBlue() {
		mBorderStroke = borderSolidStroke;
		mGradient = blueGradient;
		repaint();
	}
	
	public void changeBorderToRed() {
		mGradient = redGradient;
		repaint();
	}
	
	public static void main(String[] args) {
		final WindowlessFrame wf = new WindowlessFrame(5);
		wf.setHeight(300);
		wf.setWidth(600);
		wf.setLocation(100, 200);
		wf.setVisible(true);
	}
	
	public void setCaptureRegionListener(CaptureRegionListener listener){
		this.captureRegionListener = listener;
	}
	
	public void removeResizeListeners() {
		mRightBorder.removeMouseListener(resizingAdapter);
		mRightBorder.removeMouseMotionListener(resizingAdapter);
		mLeftBorder.removeMouseListener(resizingAdapter);
		mLeftBorder.removeMouseMotionListener(resizingAdapter);
		mTopBorder.removeMouseListener(resizingAdapter);
		mTopBorder.removeMouseMotionListener(resizingAdapter);
		mBottomBorder.removeMouseListener(resizingAdapter);
		mBottomBorder.removeMouseMotionListener(resizingAdapter);
		repaint();
		
		System.out.println("Removing listeners......................");
		mToolbarFrame.setVisible(false);
	}

	public void addResizeListeners() {
		System.out.println("Adding listeners......................");
		mWindowFrame.add(mToolbarFrame);
	}
}
