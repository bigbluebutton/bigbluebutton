package presentation

import (
	"encoding/xml"
	"errors"
	"fmt"
	"image"
	"image/png"
	"io/fs"
	"log/slog"
	"os"
	"os/exec"
	"path/filepath"
	"strconv"
	"time"

	"github.com/bigbluebutton/bigbluebutton/bbb-core-api/internal/random"
	"golang.org/x/image/draw"
)

const (
	tempThumbName            = "temp-thumb"
	convPDFToSVGTimeout      = 60
	maxNumberOfAttempts      = 3
	forceRasterizeSldes      = false
	pdfFontsTimeout          = 3
	svgResoltionPPI          = 300
	pngWidthRasterizedSlides = 2048
)

type Page struct {
	pres              *UploadedPresentation
	num               int
	path              string
	svgImagesRequired bool
	generatePNGs      bool
	maxSVGTags        int
	maxSVGImageTags   int
}

func (page *Page) convert() error {
	err := page.createThumbnail()
	if err != nil {
		return fmt.Errorf("failed to create thumbnail for page: %w", err)
	}

	err = page.createTextFile()
	if err != nil {
		return fmt.Errorf("failed to create text file for page: %w", err)
	}

	if page.svgImagesRequired {
		err = page.createSvg()
		if err != nil {
			return fmt.Errorf("failed to create svg for page: %w", err)
		}
	}

	// if necessary create pngs
	if page.generatePNGs {

	}

	return nil
}

func (page *Page) createThumbnail() error {
	thumbDir := fmt.Sprintf("%s/thumbnails", filepath.Dir(page.pres.Path))
	err := createDir(thumbDir)
	if err != nil {
		return fmt.Errorf("failed to create thumbnail directory: %w", err)
	}

	file, err := os.Open(page.path)
	if err != nil {
		return fmt.Errorf("failed to open file: %w", err)
	}
	defer file.Close()

	if IsImageFile(page.pres.FileType) {
		img, _, err := image.Decode(file)
		if err != nil {
			return fmt.Errorf("failed to decode image: %w", err)
		}

		thumbnail := image.NewRGBA(image.Rect(0, 0, 150, 150))
		draw.CatmullRom.Scale(thumbnail, thumbnail.Bounds(), img, img.Bounds(), draw.Over, nil)

		out, err := os.Create(fmt.Sprintf("%s/thumb-%d.png", thumbDir, page.num))
		if err != nil {
			return fmt.Errorf("failed to create thumbnail file: %w", err)
		}
		defer out.Close()

		err = png.Encode(out, thumbnail)
		if err != nil {
			return fmt.Errorf("failed to encode thumbnail: %w", err)
		}
	} else {
		cmd := exec.Command("pdftocairo", "-png", "-scale-to", "150", "-cropbox", page.path, fmt.Sprintf("%s/%s-%d", thumbDir, tempThumbName, page.num))
		err := cmd.Run()
		if err != nil {
			return fmt.Errorf("failed to convert PDF to image: %w", err)
		}
	}

	return nil
}

func (page *Page) createTextFile() error {
	textDir := fmt.Sprintf("%s/textfiles", filepath.Dir(page.pres.Path))
	err := createDir(textDir)
	if err != nil {
		return fmt.Errorf("failed to create text file directory: %w", err)
	}

	if IsImageFile(page.pres.FileType) {
		dest, err := os.Create(fmt.Sprintf("%s/slide-1.txt", textDir))
		if err != nil {
			return fmt.Errorf("failed to create text file: %w", err)
		}
		text := "No text could be retrieved for the slide"
		_, err = dest.Write([]byte(text))
		if err != nil {
			return fmt.Errorf("failed to write to text file: %w", err)
		}
	} else {
		dest := fmt.Sprintf("%s/slide-%d.txt", textDir, page.num)
		cmd := exec.Command("pdftotext", "-raw", "-nopgbrk", "-enc", "UTF-8", "-f", strconv.Itoa(page.num), "-l", strconv.Itoa(page.num), page.path, dest)
		err := cmd.Run()
		if err != nil {
			return fmt.Errorf("failed to write page content to file: %w", err)
		}
	}

	return nil
}

func (page *Page) createSvg() error {
	svgDir := fmt.Sprintf("%s/svgs", filepath.Dir(page.pres.Path))
	err := createDir(svgDir)
	if err != nil {
		return fmt.Errorf("failed to create svg directory: %w", err)
	}

	source := page.pres.Path
	dest := ""
	countOfTimeout := 0
	done := false
	rasterizeCurrSlide := forceRasterizeSldes

	if IsImageFile(page.pres.FileType) {
		dest = filepath.Join(svgDir, "slide-1.pdf")
		cmd := exec.Command("timeout", strconv.Itoa(convPDFToSVGTimeout)+"s", "convert", source, "-auto-orient", dest)

		err := cmd.Run()
		if err != nil {
			if exitError, ok := err.(*exec.ExitError); ok && exitError.ExitCode() == 124 {
				return fmt.Errorf("failed to convert image to SVG: command execution (convertImgToSvg) exceeded the %d second timeout for %s page %d", convPDFToSVGTimeout, page.pres.Name, page.num)
			}
			return fmt.Errorf("failed to convert image to SVG for %s page %d: %w", page.pres.Name, page.num, err)
		}
		done = true
		source = dest
	}

	startConv := time.Now()

	for countOfTimeout < maxNumberOfAttempts {
		if done || countOfTimeout >= maxNumberOfAttempts {
			return fmt.Errorf("failed to create SVG: command execution (detectFontType3) exceeded the %ds timeout within %d attempts for %s page %d", pdfFontsTimeout, maxNumberOfAttempts, page.pres.Name, page.num)
		}

		hasFontType3, err := page.hasFontType3()
		if err != nil {
			countOfTimeout++
			continue
		}

		if hasFontType3 {
			rasterizeCurrSlide = true
			break
		}

		countOfTimeout++
	}

	destSVG := filepath.Join(svgDir, fmt.Sprintf("slide-%d.svg", page.num))

	if !rasterizeCurrSlide {
		cmd := createConversionProcess("-svg", page.num, source, destSVG, true)
		err := cmd.Run()
		if err != nil {
			if exitError, ok := err.(*exec.ExitError); ok && exitError.ExitCode() == 124 {
				return fmt.Errorf("failed to create SVG: command execution (convertPdfToSvg) exceeded the %ds timeout for %s page %d", convPDFToSVGTimeout, page.pres.Name, page.num)
			}
			return fmt.Errorf("failed to create SVG: %w", err)
		}
		done = true
	}

	svgSize, err := FileSize(destSVG)
	if err != nil {
		return fmt.Errorf("could not determine size of destination SVG: %w", err)
	}

	totalTags, imageTags, err := countTags(destSVG)
	if err != nil {
		return fmt.Errorf("failed to count the number tags in the destination SVG: %w", err)
	}

	if svgSize == 0 || imageTags > page.maxSVGImageTags || totalTags > page.maxSVGTags || rasterizeCurrSlide {
		if err := os.Remove(destSVG); err != nil {
			slog.Error(fmt.Sprintf("could not delete destination SVG file: %v", err))
		}

		uuid, err := random.NewUUID()
		if err != nil {
			return fmt.Errorf("could not generate UUID for SVG: %w", err)
		}
		tempPNG := filepath.Join(os.TempDir(), fmt.Sprintf("%s-%d.png", uuid, page.num))

		cmd := createConversionProcess("-png", page.num, source, tempPNG, false)
		err = cmd.Run()
		if err != nil {
			if exitError, ok := err.(*exec.ExitError); ok && exitError.ExitCode() == 124 {
				return fmt.Errorf("failed to generate PNG: command execution (convertPdfToPng) exceeded the %ds timeout for %s page %d", convPDFToSVGTimeout, page.pres.Name, page.num)
			}
			return fmt.Errorf("failed to generate PNG: %w", err)
		}

		pngSize, err := FileSize(tempPNG)
		if err != nil {
			return fmt.Errorf("could not determine size of PNG file: %w", err)
		}

		if pngSize > 0 {
			cmd = exec.Command("timeout", strconv.Itoa(convPDFToSVGTimeout)+"s", "convert", tempPNG, destSVG)
			err := cmd.Run()
			if err != nil {
				if exitError, ok := err.(*exec.ExitError); ok && exitError.ExitCode() == 124 {
					return fmt.Errorf("failed to convert PNG to SVG: command execution (convertPngToSvg) exceeded the %ds timeout for %s page %d", convPDFToSVGTimeout, page.pres.Name, page.num)
				}
				return fmt.Errorf("failed to convert PNG to SVG: %w", err)
			}

			cmd = exec.Command("timeout", strconv.Itoa(convPDFToSVGTimeout)+"s", "/bin/sh", "-c", fmt.Sprintf("sed -i '4s|>| xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" version=\"1.2\">|' %s", destSVG))
			err = cmd.Run()
			if err != nil {
				return fmt.Errorf("failed to add SVG namespace: %w", err)
			}
		}

		if err := os.Remove(tempPNG); err != nil {
			slog.Error(fmt.Sprintf("failed to delete temporary PNG file: %v", err))
		}
	}

	slog.Info(fmt.Sprintf("SVG creation for %s page %d completed in %v", page.pres.Name, page.num, time.Since(startConv)))

	if !done {
		return fmt.Errorf("failed to create SVG image for %s page %d", page.pres.Name, page.num)
	}

	return nil
}

func (page *Page) hasFontType3() (bool, error) {
	rawCommand := fmt.Sprintf("pdffonts -f %d -l %d %s | grep -m 1 'Type 3' | wc -l", page.num, page.num, page.pres.Path)
	timeout := strconv.Itoa(pdfFontsTimeout) + "s"
	cmd := exec.Command("timeout", timeout, "/bin/sh", "-c", rawCommand)

	output, err := cmd.Output()
	if err != nil {
		if exitError, ok := err.(*exec.ExitError); ok && exitError.ExitCode() == 124 {
			return false, fmt.Errorf("failed to determine if PDF has font type 3: command execution exceeded the %d secs timeout.\n", pdfFontsTimeout)
		} else {
			return false, fmt.Errorf("failed to detmine if PDF has font type 3: %w", err)
		}
	}

	if string(output) == "1\n" {
		return true, nil
	}
	return false, nil
}

func (page *Page) createPng() error {
	pngDir := fmt.Sprintf("%s/pngs", filepath.Dir(page.pres.Path))
	err := createDir(pngDir)
	if err != nil {
		return fmt.Errorf("failed to create svg directory: %w", err)
	}

	return nil
}

func createDir(dir string) error {
	_, err := os.Stat(dir)
	if errors.Is(err, fs.ErrNotExist) {
		_, err := os.Create(dir)
		if err != nil {
			return fmt.Errorf("could not create directory: %w", err)
		}
	}
	return nil
}

func createConversionProcess(format string, page int, source, dest string, analyze bool) *exec.Cmd {
	rawCommand := fmt.Sprintf("pdftocairo -r %d %s", svgResoltionPPI, format)
	if !analyze {
		rawCommand += " -singlefile"
	}

	// Resize PNG resolution to avoid too large files
	if format == "-png" && pngWidthRasterizedSlides != 0 {
		rawCommand += fmt.Sprintf(" -scale-to-x %d -scale-to-y -1", pngWidthRasterizedSlides)
	}

	rawCommand += fmt.Sprintf(" -q -f %d -l %d %s %s", page, page, source, dest)

	if analyze {
		rawCommand += fmt.Sprintf(" && cat %s | egrep 'data:image/png;base64|<path' | sed 's/  / /g' | cut -d' ' -f 1 | sort | uniq -cw 2", dest)
	}

	return exec.Command("timeout", strconv.Itoa(convPDFToSVGTimeout)+"s", "/bin/sh", "-c", rawCommand)
}

func countTags(svg string) (totalTags int, imageTags int, err error) {
	file, err := os.Open(svg)
	if err != nil {
		return 0, 0, fmt.Errorf("failed to open SVG file: %w", err)
	}
	defer file.Close()

	decoder := xml.NewDecoder(file)

	for {
		token, err := decoder.Token()
		if err != nil {
			if err.Error() == "EOF" {
				break
			}
			return 0, 0, fmt.Errorf("failed to decode SVG file: %w", err)
		}

		switch t := token.(type) {
		case xml.StartElement:
			totalTags++
			if t.Name.Local == "image" {
				imageTags++
			}
		}
	}

	return totalTags, imageTags, nil
}
