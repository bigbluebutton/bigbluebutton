package org.bigbluebutton.presentation.imp;

import java.io.File;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.util.ArrayList;
import java.util.List;

/**
 * A one-page PDF of width x height points, all white. It is written as text: ASCII only, integers written
 * without locale formatting, no date and no id, so the same size always gives the same bytes. The page is
 * converted like any uploaded PDF page.
 */
public final class BlankPagePdf {

    private BlankPagePdf() {}

    public static byte[] bytes(int width, int height) {
        if (width <= 0 || height <= 0) {
            throw new IllegalArgumentException("Invalid page size " + width + "x" + height);
        }
        String w = Integer.toString(width);
        String h = Integer.toString(height);
        String content = "1 g 0 0 " + w + " " + h + " re f\n";

        List<String> objects = new ArrayList<>();
        objects.add("<< /Type /Catalog /Pages 2 0 R >>");
        objects.add("<< /Type /Pages /Kids [3 0 R] /Count 1 >>");
        objects.add("<< /Type /Page /Parent 2 0 R /MediaBox [0 0 " + w + " " + h + "] /Contents 4 0 R /Resources << >> >>");
        objects.add("<< /Length " + content.length() + " >>\nstream\n" + content + "endstream");

        StringBuilder pdf = new StringBuilder("%PDF-1.4\n");
        List<Integer> offsets = new ArrayList<>();
        for (int i = 0; i < objects.size(); i++) {
            offsets.add(pdf.length());
            pdf.append(i + 1).append(" 0 obj\n").append(objects.get(i)).append("\nendobj\n");
        }
        int xref = pdf.length();
        pdf.append("xref\n0 ").append(objects.size() + 1).append("\n0000000000 65535 f \n");
        for (int offset : offsets) {
            pdf.append(String.format(java.util.Locale.ROOT, "%010d 00000 n \n", offset));
        }
        pdf.append("trailer\n<< /Size ").append(objects.size() + 1).append(" /Root 1 0 R >>\nstartxref\n")
                .append(xref).append("\n%%EOF\n");
        return pdf.toString().getBytes(StandardCharsets.US_ASCII);
    }

    public static void write(int width, int height, File file) throws IOException {
        Files.write(file.toPath(), bytes(width, height));
    }
}
