package org.red5.server.webapp.echo;

import org.red5.io.amf3.IDataInput;
import org.red5.io.amf3.IDataOutput;
import org.red5.io.amf3.IExternalizable;

public class ExternalizableClass implements IExternalizable {

	private boolean[] a = new boolean[2];
	private byte[] b = new byte[5];
	private double c;
	private float d;
	private int[] e = new int[3];
	private String[] f = new String[2];
	private Object ob;
	private short[] g = new short[3];
	private long[] h = new long[2];
	private String i;
	private String j;
	
	public void readExternal(IDataInput input) {
		a[0] = input.readBoolean();
		a[1] = input.readBoolean();
		b[0] = input.readByte();
		b[1] = input.readByte();
		b[2] = input.readByte();
		b[3] = input.readByte();
		b[4] = input.readByte();
		// TODO: input.readBytes
		c = input.readDouble();
		d = input.readFloat();
		e[0] = input.readInt();
		e[1] = input.readInt();
		e[2] = input.readInt();
		f[0] = input.readMultiByte(7, "iso-8859-1");
		f[1] = input.readMultiByte(14, "utf-8");
		ob = input.readObject();
		g[0] = input.readShort();
		g[1] = input.readShort();
		g[2] = input.readShort();
		h[0] = input.readUnsignedInt();
		h[1] = input.readUnsignedInt();
		i = input.readUTF();
		j = input.readUTFBytes(12);
	}

	public void writeExternal(IDataOutput output) {
		output.writeBoolean(a[0]);
		output.writeBoolean(a[1]);
		output.writeByte(b[0]);
		output.writeByte(b[1]);
		output.writeByte(b[2]);
		output.writeByte(b[3]);
		output.writeByte(b[4]);
		output.writeDouble(c);
		output.writeFloat(d);
		output.writeInt(e[0]);
		output.writeInt(e[1]);
		output.writeInt(e[2]);
		output.writeMultiByte(f[0], "iso-8859-1");
		output.writeMultiByte(f[1], "utf-8");
		output.writeObject(ob);
		output.writeShort(g[0]);
		output.writeShort(g[1]);
		output.writeShort(g[2]);
		output.writeUnsignedInt(h[0]);
		output.writeUnsignedInt(h[1]);
		output.writeUTF(i);
		output.writeUTFBytes(j);
	}

}
