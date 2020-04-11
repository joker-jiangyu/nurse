package nurse.utility;

import java.io.UnsupportedEncodingException;
import java.util.Base64;

public class Base64Helper {

	public static String decode(String param)
	{
		String res = null;
		
		//获取系统编码  
        String encoding = System.getProperty("file.encoding");
        try {
        	String utfStr = new String(Base64.getDecoder().decode(param), "UTF-8");
        	res = new String(utfStr.getBytes(), encoding);
		} catch (UnsupportedEncodingException e1) {
			e1.printStackTrace();
		}
        return res;
	}
	
    public static String encode(String param) 
    {  
        byte[] b = null;  
        String s = null;  
        try {  
            b = param.getBytes("utf-8");  
        } catch (UnsupportedEncodingException e) {  
            e.printStackTrace();  
        }  
        if (b != null) {  
            s =Base64.getEncoder().encodeToString(b); 
        }  
        return s;  
    } 
	
	

}
