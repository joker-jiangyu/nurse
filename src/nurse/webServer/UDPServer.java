package nurse.webServer;

import nurse.utility.MainConfigHelper;

import java.io.IOException;
import java.net.DatagramPacket;
import java.net.DatagramSocket;
import java.net.InetAddress;

public class UDPServer{
	public DatagramSocket  server;
	public InetAddress destAddr;
	public int destPort;
	byte[] recvBuf;
	
	public void send(String sendStr)throws IOException{
        byte[] sendBuf;
        sendBuf = sendStr.getBytes();
        if(sendBuf == null)
        	return;
        DatagramPacket sendPacket = new DatagramPacket(sendBuf , sendBuf.length , destAddr , destPort );
        if(server != null && sendPacket != null)
        {
        server.send(sendPacket);
        }
	}
	
	public void open(int listenPort)throws IOException{
		destAddr = InetAddress.getByName(MainConfigHelper.getConfig().udpMonitorIp);//“127.0.0.1”
		server = new DatagramSocket(listenPort);
		recvBuf = new byte[1024*64];
	}
	
    public DatagramPacket receive()throws IOException{
    	if(recvBuf == null)
    		return null;
        DatagramPacket recvPacket = new DatagramPacket(recvBuf , recvBuf.length);
        if(server != null)
        {
        server.receive(recvPacket);
        }
        
        //String recvStr = new String(recvPacket.getData() , 0 , recvPacket.getLength());
        //System.out.println("recv:" + recvStr);
        //destPort = recvPacket.getPort();
        //destAddr = recvPacket.getAddress();
        return recvPacket;
    }
    
    public void close()throws IOException{
    	server.close();
	}
}