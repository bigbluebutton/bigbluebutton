package org.bigbluebutton.deskshare.client;

import org.junit.internal.runners.statements.Fail;
import org.testng.Assert;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;

public class TileManagerTest {
	
	TileManager tm;
	
	@BeforeMethod 
	public void setUp() {
		tm = new TileManager();
		Dimension screen = new Dimension(120, 80);
		Dimension tile = new Dimension(32, 32);
			  
		tm.initialize(screen, tile);		
	}
	
	@Test(groups = { "functest", "checkintest" })
	public void computeNumberOfRowTilesTest() {
	  Assert.assertEquals(3, tm.getRowCount());
	  Assert.assertEquals(4, tm.getColumnCount());
	}

	@Test(groups = { "functest", "checkintest" })
	public void findTileXLocationTest() {  
	  Tile tile_12 = tm.createTile(12);
	  Assert.assertEquals(96, tm.computeTileXLocation(tile_12));
	  Tile tile_1 = tm.createTile(1);
	  Assert.assertEquals(0, tm.computeTileXLocation(tile_1));
	  Tile tile_4 = tm.createTile(4);
	  Assert.assertEquals(96, tm.computeTileXLocation(tile_4));
	  Tile tile_6 = tm.createTile(6);
	  Assert.assertEquals(32, tm.computeTileXLocation(tile_6));
	} 

	@Test(groups = { "functest", "checkintest" })
	public void createTileTest() {
	  Tile tileOne = tm.createTile(12);
	  Assert.assertEquals(16, tileOne.getHeight());
	  Assert.assertEquals(24, tileOne.getWidth());
	}  
	
	/*	
	@Test(groups = { "functest", "checkintest" })
	public void computeTileHeightTest() {  
	  Assert.assertEquals(32, tm.computeTileHeight(1));
	  Assert.assertEquals(16, tm.computeTileHeight(3));
	} 
*/		
}
