package org.bigbluebutton.presentation.imp;

import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;

import javax.imageio.ImageIO;

/**
 * Tells whether two renders of the same PDF page show noticeably different content.
 *
 * Used to find the slides poppler's cairo backend renders incorrectly (issue #23953): the page
 * is rendered at low resolution with both the cairo (pdftocairo) and the splash (pdftoppm)
 * backend and the results are compared. The two backends never agree pixel by pixel
 * (antialiasing, hairline width, image resampling), so both renders are averaged down to a
 * coarse luminance grid and only a clear difference spread over several cells counts.
 */
public class SlideRenderComparator {
    // Both renders are averaged down to a GRID_SIZE x GRID_SIZE grid
    static final int GRID_SIZE = 16;
    // Luminance difference (0-255) from which a grid cell counts as different
    static final int CELL_DIFF_THRESHOLD = 48;
    // Number of different cells from which the renders count as different (3 cells is ~1% of the page)
    static final int MIN_DIFFERENT_CELLS = 3;

    public static boolean differ(File first, File second) throws IOException {
        BufferedImage firstImage = ImageIO.read(first);
        BufferedImage secondImage = ImageIO.read(second);
        if (firstImage == null || secondImage == null) {
            throw new IOException("Unable to decode " + (firstImage == null ? first : second));
        }
        return differ(firstImage, secondImage);
    }

    public static boolean differ(BufferedImage first, BufferedImage second) {
        int[] firstGrid = luminanceGrid(first);
        int[] secondGrid = luminanceGrid(second);

        int differentCells = 0;
        for (int i = 0; i < firstGrid.length; i++) {
            if (Math.abs(firstGrid[i] - secondGrid[i]) >= CELL_DIFF_THRESHOLD) {
                differentCells++;
            }
        }
        return differentCells >= MIN_DIFFERENT_CELLS;
    }

    // Mean luminance of each grid cell, with transparent pixels composited over white (as the client does).
    // The two renders can differ by a pixel in size, which is why each one is mapped to the grid on its own.
    private static int[] luminanceGrid(BufferedImage image) {
        int width = image.getWidth();
        int height = image.getHeight();
        long[] sums = new long[GRID_SIZE * GRID_SIZE];
        int[] counts = new int[GRID_SIZE * GRID_SIZE];

        for (int y = 0; y < height; y++) {
            int row = y * GRID_SIZE / height;
            for (int x = 0; x < width; x++) {
                int argb = image.getRGB(x, y);
                int alpha = (argb >>> 24) & 0xff;
                int luminance = (299 * ((argb >> 16) & 0xff) + 587 * ((argb >> 8) & 0xff) + 114 * (argb & 0xff)) / 1000;
                int cell = row * GRID_SIZE + x * GRID_SIZE / width;
                sums[cell] += (luminance * alpha + 255 * (255 - alpha)) / 255;
                counts[cell]++;
            }
        }

        int[] grid = new int[GRID_SIZE * GRID_SIZE];
        for (int i = 0; i < grid.length; i++) {
            // A render smaller than the grid leaves cells without pixels, treat them as blank
            grid[i] = counts[i] == 0 ? 255 : (int) (sums[i] / counts[i]);
        }
        return grid;
    }
}
