package presentation

import (
	"encoding/xml"
	"errors"
	"fmt"
	"image"
	"image/jpeg"
	"image/png"
	"io"
	"io/fs"
	"log/slog"
	"os"
	"os/exec"
	"path/filepath"
	"regexp"
	"strconv"
	"time"

	"github.com/bigbluebutton/bigbluebutton/bbb-core-api/internal/random"
	"github.com/nfnt/resize"
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
	convTimeout              = 7
	slideWidth               = 800
	maxImageWidth            = 2048
	maxImageHeight           = 1536
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
		slog.Error(fmt.Sprintf("Could not create thumbnail for page: %v", err))
		thumbDir := filepath.Join(filepath.Dir(page.pres.Path), "thumbnails")
		thumbPath := filepath.Join(thumbDir, fmt.Sprintf("thumb-%d.png", page.num))
		err = createBlank(thumbPath, page.pres.Blank.Thumbnail)
		if err != nil {
			return fmt.Errorf("could not create thumbnail for page: %w", err)
		}
	}

	err = page.createTextFile()
	if err != nil {
		return fmt.Errorf("could not create text file for page: %w", err)
	}

	if page.svgImagesRequired {
		err = page.createSvg()
		if err != nil {
			slog.Error(fmt.Sprintf("Could not create SVG for page: %v", err))
			svgDir := filepath.Join(filepath.Dir(page.pres.Path), "svgs")
			svgPath := filepath.Join(svgDir, fmt.Sprintf("slide-%d.svg", page.num))
			err = createBlank(svgPath, page.pres.Blank.SVG)
			if err != nil {
				return fmt.Errorf("could not create SVG for page: %w", err)
			}
		}
	}

	if page.generatePNGs {
		err = page.createPng()
		if err != nil {
			slog.Error(fmt.Sprintf("Could not create PNG for page: %v", err))
			pngDir := filepath.Join(filepath.Dir(page.pres.Path), "pngs")
			pngPath := filepath.Join(pngDir, fmt.Sprintf("slide-%d.png", page.num))
			err = createBlank(pngPath, page.pres.Blank.PNG)
			if err != nil {
				return fmt.Errorf("could not create PNG for page: %w", err)
			}
		}
	}

	return nil
}

func (page *Page) generateSlide() error {
	err := page.createThumbnail()
	if err != nil {
		slog.Error(fmt.Sprintf("Could not create thumbnail for page: %v", err))
		thumbDir := filepath.Join(filepath.Dir(page.pres.Path), "thumbnails")
		thumbPath := filepath.Join(thumbDir, fmt.Sprintf("thumb-%d.png", page.num))
		err = createBlank(thumbPath, page.pres.Blank.Thumbnail)
		if err != nil {
			return fmt.Errorf("could not create thumbnail for page: %w", err)
		}
	}

	err = page.createTextFile()
	if err != nil {
		return fmt.Errorf("could not create text file for page: %w", err)
	}

	if page.svgImagesRequired {
		err = page.resizeAndCreateSVG()
		if err != nil {
			slog.Error(fmt.Sprintf("Could not create SVG for page: %v", err))
			svgDir := filepath.Join(filepath.Dir(page.pres.Path), "svgs")
			svgPath := filepath.Join(svgDir, fmt.Sprintf("slide-%d.svg", page.num))
			err = createBlank(svgPath, page.pres.Blank.SVG)
			if err != nil {
				return fmt.Errorf("could not create SVG for page: %w", err)
			}
		}
	}

	if page.generatePNGs {
		err = page.createPng()
		if err != nil {
			slog.Error(fmt.Sprintf("Could not create PNG for page: %v", err))
			pngDir := filepath.Join(filepath.Dir(page.pres.Path), "pngs")
			pngPath := filepath.Join(pngDir, fmt.Sprintf("slide-%d.png", page.num))
			err = createBlank(pngPath, page.pres.Blank.PNG)
			if err != nil {
				return fmt.Errorf("could not create PNG for page: %w", err)
			}
		}
	}

	return nil
}

func (page *Page) createThumbnail() error {
	thumbDir := filepath.Join(filepath.Dir(page.pres.Path), "thumbnails")
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
	textDir := filepath.Join(filepath.Dir(page.pres.Path), "textfiles")
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

func (page *Page) resizeAndCreateSVG() error {
	file, err := os.Open(page.path)
	if err != nil {
		return fmt.Errorf("failed to open uploaded file: %w", err)
	}
	defer file.Close()

	img, _, err := image.Decode(file)
	if err != nil {
		return fmt.Errorf("failed to decode image: %w", err)
	}

	if img.Bounds().Dx() > maxImageWidth || img.Bounds().Dy() > maxImageHeight {
		slog.Info("uploaded image exceeds max dimensions allowed, resizing")
		err := page.resizeImage(maxImageWidth, maxImageHeight)
		if err != nil {
			return fmt.Errorf("failed to resize image: %w", err)
		}
	}

	return page.createSvg()
}

func (page *Page) createSvg() error {
	svgDir := filepath.Join(filepath.Dir(page.pres.Path), "svgs")
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
			return false, fmt.Errorf("failed to determine if PDF has font type 3: command execution exceeded the %d secs timeout", pdfFontsTimeout)
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
	pngDir := filepath.Join(filepath.Dir(page.pres.Path), "pngs")
	err := createDir(pngDir)
	if err != nil {
		return fmt.Errorf("failed to create svg directory: %w", err)
	}

	source := page.pres.Path
	var dest string

	if IsImageFile(page.pres.FileType) {
		dest = filepath.Join(pngDir, "slide-1.pdf")
		cmd := exec.Command("timeout", strconv.Itoa(convTimeout)+"s", "convert", source, "-auto-orient", dest)

		err := cmd.Run()
		if err != nil {
			return fmt.Errorf("failed create PNG for page %d of presentation %s: %w", page.num, page.pres.Name, err)
		}

		source = dest
	}

	dest = filepath.Join(pngDir, fmt.Sprintf("temp-png-%d", page.num))
	command := fmt.Sprintf("pdftocairo -png -scale-to %d %s %s", slideWidth, source, dest)

	err = execCommandWithTimeout(command, 10000*time.Millisecond)
	if err != nil {
		return fmt.Errorf("failed to create PNG for page %d of presentation %s: %w", page.num, page.pres.Name, err)
	}

	err = renamePNG(pngDir, page.num)
	if err != nil {
		return fmt.Errorf("failed to rename PNG for page %d of presentation %s: %w", page.num, page.pres.Path, err)
	}

	return nil
}

func (page *Page) resizeImage(maxWidth, maxHeight int) error {
	file, err := os.Open(page.path)
	if err != nil {
		return fmt.Errorf("failed to open file: %w", err)
	}
	defer file.Close()

	img, _, err := image.Decode(file)
	if err != nil {
		return fmt.Errorf("failed to decode image: %w", err)
	}

	resizedImg := resize.Thumbnail(uint(maxWidth), uint(maxHeight), img, resize.Lanczos3)

	out, err := os.Create(page.path)
	if err != nil {
		return fmt.Errorf("failed to create output file: %w", err)
	}
	defer out.Close()

	err = jpeg.Encode(out, resizedImg, nil)
	if err != nil {
		return fmt.Errorf("failed to encode resized image: %w", err)
	}

	return nil
}

func createBlank(path string, blank string) error {
	if _, err := os.Stat(path); os.IsNotExist(err) {
		src, err := os.Open(blank)
		if err != nil {
			return fmt.Errorf("failed to open source blank: %w", err)
		}
		defer src.Close()

		dest, err := os.Create(path)
		if err != nil {
			return fmt.Errorf("failed to create destination file: %w", err)
		}
		defer dest.Close()

		_, err = io.Copy(dest, src)
		if err != nil {
			return fmt.Errorf("failed to copy blank to destination file: %w", err)
		}
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

func execCommandWithTimeout(command string, timeout time.Duration) error {
	cmd := exec.Command("/bin/sh", "-c", command)

	done := make(chan error, 1)
	go func() {
		done <- cmd.Run()
	}()

	select {
	case err := <-done:
		return err
	case <-time.After(timeout):
		if err := cmd.Process.Kill(); err != nil {
			return fmt.Errorf("failed to execute %s: %w", command, err)
		}
		return fmt.Errorf("failed to execute %s", command)
	}
}

func renamePNG(dir string, page int) error {
	files, err := os.ReadDir(dir)
	if err != nil {
		return fmt.Errorf("failed to list directory: %w", err)
	}

	if len(files) > 1 {
		for _, file := range files {
			if !file.IsDir() {
				pattern := regexp.MustCompile(`(.+-png)-([0-9]+)-([0-9]+)(.png)`)
				matcher := pattern.FindStringSubmatch(file.Name())
				if len(matcher) == 4 {
					pageNum, err := strconv.Atoi(matcher[2])
					if err != nil {
						return fmt.Errorf("failed to parse page number: %w", err)
					}

					if pageNum == page {
						newFileName := fmt.Sprintf("slide-%d.png", page)
						oldPath := filepath.Join(dir, file.Name())
						newPath := filepath.Join(dir, newFileName)
						err := os.Rename(oldPath, newPath)
						if err != nil {
							return fmt.Errorf("failed to rename file: %w", err)
						}
					}
				}
			}
		}
	} else if len(files) == 1 {
		oldPath := filepath.Join(dir, files[0].Name())
		newPath := filepath.Join(dir, "slide-1.png")
		err := os.Rename(oldPath, newPath)
		if err != nil {
			return fmt.Errorf("failed to rename file: %w", err)
		}
	}

	return nil
}
