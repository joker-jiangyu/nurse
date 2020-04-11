package nurse.webServer;

import java.util.Base64;
import java.io.BufferedReader;
import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.io.PrintStream;
import java.io.PrintWriter;
import java.net.InetSocketAddress;
import java.net.ServerSocket;
import java.net.Socket;
import java.net.URLEncoder;
import java.util.Date;
import java.util.Enumeration;
import java.util.Vector;
import java.util.Hashtable;
import java.util.Locale;
import java.util.Properties;
import java.util.StringTokenizer;
import java.util.TimeZone;

import java.io.ByteArrayOutputStream;
import java.io.FileOutputStream;


@SuppressWarnings("all")
public class NanoHTTPServer
{
	private String hostname;

	//private static int workers = 12;
	
	private int myTcpPort;
	private final ServerSocket myServerSocket;
	private Thread myThread;
	private File myRootDir;

	/**
	 * Starts a HTTP server to given port.<p>
	 * Throws an IOException if the socket is already in use
	 */
	public NanoHTTPServer( int port, File wwwroot, String hostName ) throws IOException
	{
		myTcpPort = port;
		this.myRootDir = wwwroot;
		this.hostname = hostName;
		myServerSocket = new ServerSocket();
		myServerSocket.bind((hostname != null) ? new InetSocketAddress(hostname, myTcpPort) : new InetSocketAddress(myTcpPort));
		
		myThread = new Thread( new Runnable()
			{
				public void run()
				{
					try
					{
						while( true ){
			                // 等待用户请求  
			                Socket request = myServerSocket.accept();  
			                // 接收客户机连接请求  
			                NanoSession session= new NanoSession(request, myRootDir);  
			                // 生成serverThread的实例  
			                session.start();  
			                // 启动serverThread线程  
							
			                //new HTTPSession( myServerSocket.accept());
						}
					}
					catch ( IOException ioe )
					{}
				}
			});
		myThread.setDaemon( true );
		myThread.start();
	}

	/**
	 * Stops the server.
	 */
	public void stop()
	{
		try
		{
			myServerSocket.close();
			myThread.join();
			/*******************************************************/
			System.out.println("WebServer Stop!");
			/*******************************************************/
		}
		catch ( IOException ioe ) {}
		catch ( InterruptedException e ) {}
	}

}

