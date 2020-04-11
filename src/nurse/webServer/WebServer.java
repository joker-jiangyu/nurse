package nurse.webServer;

import java.io.File;
import java.io.IOException;
import java.util.Properties;

import org.apache.log4j.Logger;

import nurse.PublicVar;

public class WebServer extends NanoHTTPServer 
{
	private static Logger log = Logger.getLogger(WebServer.class);
	/**
	 * Some HTTP response status codes
	 */

	public WebServer( int port, File wwwroot, String host ) throws IOException
	{
		super(port, wwwroot, host);	
	}	
	
//	@Override
//	public Response serve( String uri, String method, Properties header, Properties parms, Properties files )
//	{
//		
//		if (!(method.toUpperCase().equals("POST") && (uri.equalsIgnoreCase("/data")))) 
//		{
//			log.debug( method + " '" + uri + "' " );
//			return serveFile( uri, header, PublicVar.WebRoot, true );
//		}
//		
//		String request = parms.getProperty("data");
//		
//		log.debug("DATA ASK: " + request);
//
//		String msg = RestFacade.getInstance().Call(request);
//		
//		log.debug("DATA RETURN: " + msg);
//		
//		return new NanoHTTPServer.Response( HTTP_OK, "text/plain", msg );
//	}

}
