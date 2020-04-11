package nurse.webServer;

import java.io.DataInputStream;
import java.io.DataOutputStream;
import java.net.ServerSocket;
import java.net.Socket;
import java.util.Date;
import java.util.HashMap;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.FutureTask;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;

import org.apache.log4j.Logger;

import nurse.entity.persist.CollectRackData;



public class RackServer extends Thread {
	
	private static Logger log = Logger.getLogger(RackServer.class);

	private ServerSocket serverSocket = null;
	private Socket socket = null;
    
	public RackServer(){}
	
    public CollectRackData RecvData(int port){
    	try {
    		if(this.serverSocket == null)
    			this.serverSocket = new ServerSocket(port);

			this.serverSocket.setSoTimeout(15*1000);
			
			this.socket = this.serverSocket.accept();
			if(this.socket != null)
				return Recv();
		} catch (Exception e) {
			log.error("Open Port:"+port+" Exception:Accept timed out!");
			return null;
		}finally{
			Close();
		}
		return null;
    }

    /** 监听客户端并返回数据   return:命令码|数据 */
    public synchronized CollectRackData Recv(){
        try (DataInputStream dis = new DataInputStream(this.socket.getInputStream())){
            byte[] bytes = new byte[1024]; // 假设发送的字节数不超过 1024 个
            int size = dis.read(bytes); // size 是读取到的字节数
            //接收
            String hex = bytesToHex(bytes, size);
            //log.info("1 "+this.socket.getInetAddress()+":"+this.socket.getPort()+" 接收 "+hex.split(" ").length+" Byte\n Hex:" + hex);
            
            return new CollectRackData(recvGetKey(hex), hex);
        }catch (Exception e){  
        	log.error("RackServer RecvData Exception:",e);
        	return null;
        }
    }
    
    /** 向客户端发送内容，并接收返回数据 */
    public synchronized String Send(String command){
    	try(DataOutputStream dos = new DataOutputStream(this.socket.getOutputStream())){
    		//发送
            String hex2 = command;//"FE FE 00 08 A9 2A 3D 95 22 20 70 00";
            String key2 = recvGetKey(hex2);
            byte[] bytes2 = hexToBytes(hex2);
            dos.write(bytes2);
            dos.flush();
            System.out.println("\n2 "+this.socket.getInetAddress()+":"+this.socket.getPort()+" 发送 "+hex2.split(" ").length+" Byte\n Hex:" + hex2);

    		DataInputStream dis = new DataInputStream(this.socket.getInputStream());
            byte[] bytes = new byte[1024]; // 假设发送的字节数不超过 1024 个
            int size = dis.read(bytes); // size 是读取到的字节数
            
            //接收
            String hex = bytesToHex(bytes, size);
            System.out.println("2 接收 "+hex.split(" ").length+" Byte\n Hex:" + hex);

            //接收的值不正确，再次接收一次
            String key = recvGetKey(hex);
            if(!key2.equals(key)){
            	hex = Send(command);
            }
            
            return hex;
		} catch (Exception e) {
        	log.error("RackServer Send Exception:",e);
        	return "FF";
		} finally{
        	Close();
        }
    }
    
    
    
    private void Close(){
    	try {
    		if(this.socket != null) this.socket.close();
            if(this.serverSocket != null) this.serverSocket.close();
		} catch (Exception e) {
        	log.error("Close Server Exception:",e);
		}
    } 
    
    
    private String recvGetKey(String hex){
    	try {
			return hex.substring(12,14);
		} catch (Exception e) {
			return "FF";
		}
    }
    
	
	/** 将二进制byte[]转为十六进制 */
	private static String bytesToHex(byte[] bytes, int end) {
        StringBuilder hexBuilder = new StringBuilder(2 * (end - 0));
        for (int i = 0; i < end; i++) {
            hexBuilder.append(Character.forDigit((bytes[i] & 0xF0) >> 4, 16)); // 转化高四位
            hexBuilder.append(Character.forDigit((bytes[i] & 0x0F), 16)); // 转化低四位
            hexBuilder.append(' '); // 加一个空格将每个字节分隔开
        }
        return hexBuilder.toString().toUpperCase();
    }
	
	/** 将十六进制转为二进制byte[]*/
	private static byte[] hexToBytes(String hexStr) {
	    if (hexStr.length() < 1)return null;
	    hexStr = hexStr.replaceAll(" ", "");
        byte[] result = new byte[hexStr.length() / 2];
        for (int i = 0; i < hexStr.length() / 2; i++) {
            int high = Integer.parseInt(hexStr.substring(i * 2, i * 2 + 1), 16);
            int low = Integer.parseInt(hexStr.substring(i * 2 + 1, i * 2 + 2), 16);
            result[i] = (byte) (high * 16 + low);
        }
        return result;
	}


	

}