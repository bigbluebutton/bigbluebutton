package org.bigbluebutton.presentation.imp;

import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.Callable;
import java.util.concurrent.CompletionService;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.ExecutorCompletionService;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;

import org.bigbluebutton.presentation.ConversionProgressNotifier;
import org.bigbluebutton.presentation.GeneratedSlidesInfoHelper;
import org.bigbluebutton.presentation.PageConverter;
import org.bigbluebutton.presentation.Slide;
import org.bigbluebutton.presentation.ThumbnailCreator;
import org.bigbluebutton.presentation.UploadedPresentation;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class PdfToSwfSlidesGenerationService {
	private static Logger log = LoggerFactory.getLogger(PdfToSwfSlidesGenerationService.class);
	
	private ExecutorService executor;
	private CompletionService<Slide> completionService;
	
	private ConversionProgressNotifier notifier;
	private GeneratedSlidesInfoHelper generatedSlidesInfoHelper;
	private PageCounterService counterService;
	private PageConverter pdfToSwfConverter;
	private PdfPageToImageConversionService imageConvertService;
	private ThumbnailCreator thumbnailCreator;
	private long MAX_CONVERSION_TIME = 5*60*1000;
	private String BLANK_SLIDE;
	
	public PdfToSwfSlidesGenerationService() {
		int numThreads = Runtime.getRuntime().availableProcessors();
		executor = Executors.newFixedThreadPool(numThreads);
		completionService = new ExecutorCompletionService<Slide>(executor);
	}
	
	public void generateSlides(UploadedPresentation pres) {
		log.debug("Generating slides");		
		System.out.println("Generating slides");
		counterService.determineNumberOfPages(pres);
		log.debug("Determined number of pages " + pres.getNumberOfPages());
		System.out.println("Determined number of pages " + pres.getNumberOfPages());
		if (pres.getNumberOfPages() > 0) {
			convertPdfToSwf(pres);
		}
		
		log.debug("Creating thumbnails.");
		System.out.println("Creating thumbnails.");
		sendCreatingThumbnailsUpdateMessage(pres);
		createThumbnails(pres);
		
		sendConversionCompletedMessage(pres);
	}
	
	private void createThumbnails(UploadedPresentation pres) {
		thumbnailCreator.createThumbnails(pres.getUploadedFile(), pres.getNumberOfPages());
	}
	
	private void convertPdfToSwf(UploadedPresentation pres) {
		System.out.println("convertPdfToSwf");
		int numPages = pres.getNumberOfPages();				
		Slide[] slides = setupSlides(pres, numPages);
		generateSlides(slides);		
		handleSlideGenerationResult(pres, slides);		
	}
	
	private void handleSlideGenerationResult(UploadedPresentation pres, Slide[] slides) {
		System.out.println("handleSlideGenerationResult");
		long endTime = System.currentTimeMillis() + MAX_CONVERSION_TIME;
		int slideGenerated = 0;
		
		for (int t = 0; t < slides.length; t++) {
			Future<Slide> future = null;
			Slide slide = null;
			try {
				long timeLeft = endTime - System.currentTimeMillis();
				future = completionService.take();
				slide = future.get(timeLeft, TimeUnit.MILLISECONDS);
				System.out.println("handleSlideGenerationResult " + slide.getPageNumber());
			} catch (InterruptedException e) {
				log.error("InterruptedException while creating slide " + pres.getName());
			} catch (ExecutionException e) {
				log.error("ExecutionException while creating slide " + pres.getName());
			} catch (TimeoutException e) {
				log.error("TimeoutException while converting " + pres.getName());				
			} finally {
				if ((slide != null) && (! slide.isDone())){
					log.warn("Creating blank slide for " + slide.getPageNumber());
					future.cancel(true);
					slide.generateBlankSlide();
				}
			}
			slideGenerated++;	
			sendConversionUpdateMessage(slideGenerated++, pres);
		}
	}
	
	private Slide[] setupSlides(UploadedPresentation pres, int numPages) {
		Slide[] slides = new Slide[numPages];
		
		for (int page = 1; page <= numPages; page++) {		
			Slide slide = new Slide(pres, page);
			slide.setBlankSlide(BLANK_SLIDE);
			slide.setPageConverter(pdfToSwfConverter);
			slide.setPdfPageToImageConversionService(imageConvertService);
			
			// Array index is zero-based
			slides[page-1] = slide;
		}
		
		return slides;
	}
	
	private void generateSlides(Slide[] slides) {
		for (int i = 0; i < slides.length; i++) {
			System.out.println("generateSlides " + i);
			final Slide slide = slides[i];
			completionService.submit(new Callable<Slide>() {
				public Slide call() {
					return slide.createSlide();
				}
			});
		}
	}
	
	private void notifyProgressListener(Map<String, Object> msg) {		
		if (notifier != null) notifier.sendConversionProgress(msg);	
	}

	private void sendConversionUpdateMessage(int slidesCompleted, UploadedPresentation pres) {
		Map<String, Object> msg = new HashMap<String, Object>();
		msg.put("conference", pres.getConference());
		msg.put("room", pres.getRoom());
		msg.put("returnCode", "CONVERT");
		msg.put("presentationName", pres.getName());
		msg.put("totalSlides", new Integer(pres.getNumberOfPages()));
		msg.put("slidesCompleted", new Integer(slidesCompleted));
		notifyProgressListener(msg);
	}
	
	private void sendCreatingThumbnailsUpdateMessage(UploadedPresentation pres) {
		Map<String, Object> msg = new HashMap<String, Object>();
		msg.put("conference", pres.getConference());
		msg.put("room", pres.getRoom());
		msg.put("returnCode", "THUMBNAILS");
		msg.put("presentationName", pres.getName());
		
		notifyProgressListener(msg);			
	}
	
	private void sendConversionCompletedMessage(UploadedPresentation pres) {	
		if (generatedSlidesInfoHelper == null) {
			log.error("GeneratedSlidesInfoHelper was not set. Could not notify interested listeners.");
			return;
		}
		String xml = generatedSlidesInfoHelper.generateUploadedPresentationInfo(pres);
		
		Map<String, Object> msg = new HashMap<String, Object>();
		msg.put("conference", pres.getConference());
		msg.put("room", pres.getRoom());
		msg.put("returnCode", "SUCCESS");
		msg.put("presentationName", pres.getName());
		msg.put("message", xml);
		notifyProgressListener(msg);	
	}
	
	
	public void setCounterService(PageCounterService counterService) {
		this.counterService = counterService;
	}
	
	public void setPageConverter(PageConverter converter) {
		this.pdfToSwfConverter = converter;
	}
	
	public void setPdfPageToImageConversionService(PdfPageToImageConversionService service) {
		this.imageConvertService = service;
	}
	
	public void setBlankSlide(String blankSlide) {
		this.BLANK_SLIDE = blankSlide;
	}
	
	public void setThumbnailCreator(ThumbnailCreator thumbnailCreator) {
		this.thumbnailCreator = thumbnailCreator;
	}
	
	public void setMaxConversionTime(int minutes) {
		MAX_CONVERSION_TIME = minutes * 60 * 1000;
	}
	
	public void setConversionProgressNotifier(ConversionProgressNotifier notifier) {
		this.notifier = notifier;
	}
	
	public void setGeneratedSlidesInfoHelper(GeneratedSlidesInfoHelper helper) {
		generatedSlidesInfoHelper = helper;
	}
}
