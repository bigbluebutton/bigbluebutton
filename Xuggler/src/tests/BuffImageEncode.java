package tests;

import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;

import javax.imageio.ImageIO;

import com.xuggle.xuggler.ICodec;
import com.xuggle.xuggler.IContainer;
import com.xuggle.xuggler.IPacket;
import com.xuggle.xuggler.IPixelFormat;
import com.xuggle.xuggler.IStream;
import com.xuggle.xuggler.IStreamCoder;
import com.xuggle.xuggler.IVideoPicture;
import com.xuggle.xuggler.video.ConverterFactory;
import com.xuggle.xuggler.video.IConverter;

import util.Capture;

public class BuffImageEncode {
	
	private Capture capture;
	
	public static void main(String[] args){
		//BuffImageEncode test = new BuffImageEncode();
		//BufferedImage image = test.takeScreenShot();
		
		BufferedImage image = null;
		try{
			image = ImageIO.read(new File("strawberry.jpg"));
		} catch(IOException e){
			System.out.println(e.getMessage());
		}
		
		System.out.println(image.getType());
		System.out.println(BufferedImage.TYPE_3BYTE_BGR);
		
		IConverter converter = null;
		try{
			converter = ConverterFactory.createConverter(image, IPixelFormat.Type.BGR24);
		} catch (UnsupportedOperationException e){
			System.out.println(e.getMessage());
			e.printStackTrace();
			System.exit(0);
		}
		
		IVideoPicture picture = converter.toPicture(image, 1000);
		IPacket packet = IPacket.make();
		
		//IContainer container = IContainer.make();
		//IStream stream = container.addNewStream(0);
		
		IStreamCoder streamCoder = IStreamCoder.make(IStreamCoder.Direction.ENCODING);
		streamCoder.setCodec(ICodec.ID.CODEC_ID_H264);
		
		if (streamCoder.encodeVideo(packet, picture, -1) < 0){
			throw new RuntimeException("could not encode");
		}
	}
	
	public BuffImageEncode(){
		capture = new Capture();
	}
	
	public BufferedImage takeScreenShot(){
		return capture.takeSingleSnapshot();
	}
}
