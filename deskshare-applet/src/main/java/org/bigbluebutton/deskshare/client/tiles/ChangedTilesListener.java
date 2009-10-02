package org.bigbluebutton.deskshare.client.tiles;

import java.io.ByteArrayOutputStream;

public interface ChangedTilesListener {

	public void onChangedTiles(ByteArrayOutputStream pixelData, boolean isKeyFrame);
}
