package nurse.utility;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.InetAddress;
import java.net.NetworkInterface;
import java.util.Random;

public class LicenseHelper {
    /** 
     * 获取当前操作系统名称. return 操作系统名称 例如:windows xp,linux 等. 
     */  
    public static String getOSName() {  
        return System.getProperty("os.name").toLowerCase();  
    }  
    
    public static String getMac(){
    	try {
    		String osName = getOSName();
            if (osName.equals("windows 7")) {  
            	return getMACAddress();  
            } else if (osName.startsWith("windows")) {// 本地是windows  
            	return getWindowsMACAddress();  
            } else { // 本地是非windows系统 一般就是unix
            	return getUnixMACAddress(); 
            }
		} catch (Exception e) {
			return "";
		}
    }
  
    /** 
     * 获取unix网卡的mac地址. 非windows的系统默认调用本方法获取. 
     * 如果有特殊系统请继续扩充新的取mac地址方法. 
     * @return mac地址 
     */  
    public static String getUnixMACAddress() {  
        String mac = null;  
        BufferedReader bufferedReader = null;  
        Process process = null;  
        try {  
            // linux下的命令，一般取eth0作为本地主网卡  
            process = Runtime.getRuntime().exec("ifconfig eth0");  
            // 显示信息中包含有mac地址信息  
            bufferedReader = new BufferedReader(new InputStreamReader(  
                    process.getInputStream()));  
            String line = null;  
            int index = -1;  
            while ((line = bufferedReader.readLine()) != null) {
                // 寻找标示字符串[hwaddr]  
                index = line.toLowerCase().indexOf("hwaddr");
                if (index >= 0) {// 找到了  
                    // 取出mac地址并去除2边空格  
                    mac = line.substring(index + "hwaddr".length() + 1).trim();
                    break;  
                }
                // 寻找标示字符串[ether]
                index = line.toLowerCase().indexOf("ether");
                if (index >= 0) {// 找到了
                    // 取出mac地址并去除2边空格
                    mac = line.substring(index + "ether".length() + 1).trim();
                    mac = mac.substring(0,17);
                    break;
                }
            }
        } catch (IOException e) {  
            e.printStackTrace();  
        } finally {  
            try {  
                if (bufferedReader != null) {  
                    bufferedReader.close();  
                }  
            } catch (IOException e1) {  
                e1.printStackTrace();  
            }  
            bufferedReader = null;  
            process = null;  
        }  
        return mac;  
    }  
  
    /** 
     * 获取widnows网卡的mac地址. 
     * @return mac地址 
     */  
    public static String getWindowsMACAddress() {  
        String mac = null;  
        BufferedReader bufferedReader = null;  
        Process process = null;  
        try {  
            // windows下的命令，显示信息中包含有mac地址信息  
            process = Runtime.getRuntime().exec("ipconfig /all");  
            bufferedReader = new BufferedReader(new InputStreamReader(  
                    process.getInputStream()));  
            String line = null;  
            int index = -1;  
            while ((line = bufferedReader.readLine()) != null) {  
                // 寻找标示字符串[physical  
                index = line.toLowerCase().indexOf("physical address");  
                  
                if (index >= 0) {// 找到了  
                    index = line.indexOf(":");// 寻找":"的位置  
                    if (index >= 0) {  
                        // 取出mac地址并去除2边空格  
                        mac = line.substring(index + 1).trim();  
                    }  
                    break;  
                }  
            }  
        } catch (IOException e) {  
            e.printStackTrace();  
        } finally {  
            try {  
                if (bufferedReader != null) {  
                    bufferedReader.close();  
                }  
            } catch (IOException e1) {  
                e1.printStackTrace();  
            }  
            bufferedReader = null;  
            process = null;  
        }  
  
        return mac;  
    }  
  
    /** 
     * windows 7 专用 获取MAC地址 
     * @return windows 7 mac
     */  
    public static String getMACAddress() throws Exception {  
          
        // 获取本地IP对象  
        InetAddress ia = InetAddress.getLocalHost();  
        // 获得网络接口对象（即网卡），并得到mac地址，mac地址存在于一个byte数组中。  
        byte[] mac = NetworkInterface.getByInetAddress(ia).getHardwareAddress();  
  
        // 下面代码是把mac地址拼装成String  
        StringBuffer sb = new StringBuffer();  
  
        for (int i = 0; i < mac.length; i++) {  
            if (i != 0) {  
                sb.append("-");  
            }  
            // mac[i] & 0xFF 是为了把byte转化为正整数  
            String s = Integer.toHexString(mac[i] & 0xFF);  
            sb.append(s.length() == 1 ? 0 + s : s);  
        }  
  
        // 把字符串所有小写字母改为大写成为正规的mac地址并返回  
        return sb.toString().toUpperCase();  
    }  
    
    /** 加密 */
    public static String encode(String param){
    	String encode = Base64Helper.encode(param);
    	StringBuffer sb = new StringBuffer(encode);
    	
    	Random rand = new Random();
        int nextInt = rand.nextInt(encode.length());
        
        encode = sb.insert(nextInt, "&GoodTime;").toString();
        encode = Base64Helper.encode(encode);
    	return encode;
    }
    
    /** 解密 */
    public static String decode(String param){
    	String decode = Base64Helper.decode(param);
    	decode = decode.replace("&GoodTime;","");
    	decode = Base64Helper.decode(decode);
    	return decode;
    }
}
