package nurse.logic.providers;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.io.UnsupportedEncodingException;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Date;
import java.util.Properties;

import org.apache.log4j.Logger;

import nurse.NurseApp;
import nurse.common.DataTable;
import nurse.entity.persist.License;
import nurse.utility.BasePath;
import nurse.utility.DatabaseHelper;
import nurse.utility.LicenseHelper;

public class LicenseProvider {

	private static Logger log = Logger.getLogger(LicenseProvider.class);
	private License license = null;
	private long nowTime = 0;
	private static SimpleDateFormat format = new SimpleDateFormat("yyyy-MM-dd"); 

	private static String os = null;//保存当前系统类型
	static{
		Properties prop = System.getProperties();
		os = prop.getProperty("os.name");
	}

	private static LicenseProvider instance = new LicenseProvider();
	public static LicenseProvider getInstance() {
		return instance;
	}
	
	public void factory(){
		try {
			long nowTime = format.parse((String) format.format(new Date())).getTime();
			
			if(nowTime == 0 || nowTime > this.nowTime){
				loadLicenseInfo();//一天执行一次
				this.nowTime = nowTime;
			}
			
		} catch (Exception e) {
			log.error("factory Exception:"+e);
		}
	}
	
	/**
	 * 加载TBL_License表的数据，并解析保存的缓存中
	 */
	private void loadLicenseInfo(){
		DatabaseHelper dbHelper = null;
		try {
            dbHelper = new DatabaseHelper();
            String sql = "SELECT * FROM TBL_License;";       
                        
            DataTable dt = dbHelper.executeToTable(sql);
            
            if(dt.getRowCount() > 0){
            	this.license = License.GetFromDataTable(dt);
            	log.info("License Select Reg Date:"+this.license.RegistrationDate+" ,Ava Date:"+this.license.AvailableDate);
            }else{
            	insertLicense();
            }
		} catch (Exception e) {
			log.error("LoadLicenseInfo Exception:",e);
		} finally {
			if(dbHelper != null) dbHelper.close();
		}
	}
	
	/**
	 * 根据当前时间和Mac生成License
	 * @return
	 */
	private boolean insertLicense(){
		DatabaseHelper dbHelper = null;
    	try {
            dbHelper = new DatabaseHelper();
    		String sql = "SELECT * FROM LIC_StartTime;";
    		DataTable dt = dbHelper.executeToTable(sql);
        	if(dt.getRowCount() > 0){
        		License lic = new License();
        		lic.Mac = LicenseHelper.getMac();
        		String updDate = dt.getRows().get(0).getValueAsString("UpdateDate");
        		updDate = format.format(format.parse(updDate));
        		if(updDate.indexOf("1970-") == -1){
            		String nowDate = format.format(new Date());
            		if(!nowDate.equals(updDate)){
            			sql = "DELETE FROM TBL_License;";
                		dbHelper.executeNoQuery(sql);
            			this.license = null;
                		log.error("License ERROR:Rule Breaking!");
            			return false;
            		}
            	}else{
            		sql = "UPDATE LIC_StartTime SET UpdateDate = SYSDATE();";
            		dbHelper.executeNoQuery(sql);
            		updDate = format.format(new Date());
            	}
        		lic.RegistrationDate = updDate;
        		lic.Versions = NurseApp.class.getPackage().getImplementationVersion();
        		
        		String code = lic.toString();
        		String encode = LicenseHelper.encode(code);
        		sql = String.format("INSERT INTO TBL_License VALUES('%s')", encode);
        		dbHelper.executeNoQuery(sql);

        		log.info("License Insert Reg Date:"+lic.RegistrationDate);
        		
        		this.license = lic;
            	return true;
        	}else{
        		this.license = null;
        		log.error("License ERROR:Rule Breaking!");
            	return false;
        	}
		} catch (Exception e) {
			log.error("insertLicense Exception:",e);
        	return false;
		} finally {
			if(dbHelper != null) dbHelper.close();
		}
	}
	
	public String checkoutLicense(){
		try {
			//判断/home/utils/factor_stat是否存在
			if(isFactorStatFileExist())
				return "{\"IsShow\":\"false\",\"Remain\":\"999\"}";
			
			if(this.license != null){
				return getRemain();
			}else{
				this.nowTime = format.parse((String) format.format(new Date())).getTime();
				loadLicenseInfo();
				return getRemain();
			}
		} catch (Exception e) {
			log.error("CheckoutLicense Exception:",e);
			return "{\"IsShow\":\"true\",\"Remain\":\"0\"}";
		}
	}
	
	private String getRemain(){
		if(!os.equals("Linux") && !os.equals("linux")){
			return "{\"IsShow\":\"false\",\"Remain\":\"999\"}";
		}
		String result = "{\"IsShow\":\"%s\",\"Remain\":\"%s\"}";
		try {
			if(this.license == null)
				return String.format(result, "true","0");
			//试用期
			if(this.license.AvailableDate == null || this.license.AvailableDate.equals("")){
				Date regDate = format.parse(this.license.RegistrationDate);
				Date nowDate = format.parse(format.format(new Date()));
				int days = differentDays(regDate , nowDate);
				if(days >= 0 && days <= 45)
					result = String.format(result, "true",String.valueOf((45 - days)));
				else
					result = String.format(result, "true","0");
			}else{//注册后
				try {
					String mac = LicenseHelper.getMac();
					if(this.license.Mac.equals(mac)){
						//有效期不为空，并为正确的时间格式，定义为永久期限
						format.parse(this.license.AvailableDate);
						result = String.format(result, "false","999");
					}else{
						result = String.format(result, "true","0");
						log.error("License DataBaseMac:"+this.license.Mac+" != LocalMac:"+mac+" Incorrect!");
					}
				} catch (Exception e) {
					result = String.format(result, "true","0");
				}
			}
		} catch (Exception e) {
			log.error("GetRemain Exception:",e);
		}
		return result;
	}
	
	/**
	 * 两个时间之差
	 * @param date1
	 * @param date2
	 * @return date2 - date1
	 */
    public static int differentDays(Date date1,Date date2)
    {
        Calendar cal1 = Calendar.getInstance();
        cal1.setTime(date1);
        
        Calendar cal2 = Calendar.getInstance();
        cal2.setTime(date2);
        int day1= cal1.get(Calendar.DAY_OF_YEAR);
        int day2 = cal2.get(Calendar.DAY_OF_YEAR);
        
        int year1 = cal1.get(Calendar.YEAR);
        int year2 = cal2.get(Calendar.YEAR);
        if(year1 != year2){//不同年
            int timeDistance = 0 ;
            for(int i = year1 ; i < year2 ; i ++){
                if(i%4==0 && i%100!=0 || i%400==0){    //闰年            
                    timeDistance += 366;
                }else{    //不是闰年
                    timeDistance += 365;
                }
            }
            return timeDistance + (day2-day1) ;
        }else{//同一年
            return day2 - day1;
        }
    }

	public boolean generateInfoFile(){
		try {
            String content = createLicenseCode();
            
            //如果文件夹不存在则创建
            File wodnloadFile = new File(BasePath.getWebDirByEnv("web/upload/"));
        	if (!wodnloadFile.exists() && !wodnloadFile.isDirectory()){        
        		wodnloadFile.mkdirs();// 创建多级目录 
        	}
        	
            String path = BasePath.getWebDirByEnv("web/upload/NurseInfo.key");
			saveFile(content,path);
			return true;
		} catch (Exception e) {
			log.error("GenerateInfoFile Exception:",e);
			return false;
		}
    }
	
	//生成本机LicenseCode
	private String createLicenseCode(){
    	try {
    		License lic = new License();
    		lic.Mac = LicenseHelper.getMac();
    		lic.RegistrationDate = format.format(new Date());
    		lic.Versions = NurseApp.class.getPackage().getImplementationVersion();
    		
    		String code = lic.toString();
    		String encode = LicenseHelper.encode(code);

        	return encode;
		} catch (Exception e) {
			log.error("CreateLicenseCode Exception:",e);
        	return "";
		}
	}
    
    public boolean uploadLicenseFile(String path){
		DatabaseHelper dbHelper = null;
    	try {
            dbHelper = new DatabaseHelper();
            // 删除数据库原来的License
            String sql = "DELETE FROM TBL_License;";
            dbHelper.executeNoQuery(sql);
            
			path = BasePath.getPath().replace('\\', '/')+"/web/"+path;
			
			String decode = LoadDecodeFile(path);
            sql = String.format("INSERT INTO TBL_License VALUES('%s');", decode);
            dbHelper.executeNoQuery(sql);
            
        	loadLicenseInfo();
        	return true;
		} catch (Exception e) {
			log.error("UploadLicenseFile Exception:",e);
			return false;
		}
    } 
    
    /**
     * 读取文件内容
     * @param path
     * @return
     */
	public String LoadDecodeFile(String path){
        String encoding = "UTF-8";  
        File file = new File(path);  
        Long filelength = file.length();  
        byte[] filecontent = new byte[filelength.intValue()];  
        try {  
            FileInputStream in = new FileInputStream(file);  
            in.read(filecontent);  
            in.close();  
        } catch (FileNotFoundException e) {  
            e.printStackTrace();  
        } catch (IOException e) {  
            e.printStackTrace();  
        }  
        try {  
            return new String(filecontent, encoding);
        } catch (UnsupportedEncodingException e) {  
            System.err.println("The OS does not support " + encoding);  
            e.printStackTrace();  
            return "";  
        } 
	}
	
	/**
	 * 生成文件
	 * @param content 内容
	 * @param path 文件路径
	 */
	private void saveFile(String content,String path){
		OutputStream os = null;
		try {
			
			File file = new File(path);
			//2、选择输出流,以追加形式(在原有内容上追加) 写出文件 必须为true 否则为覆盖
            os = new FileOutputStream(file,false);    
            
            //和上一句功能一样，BufferedInputStream是增强流，加上之后能提高输出效率，建议
            String string = content;
            byte[] data = string.getBytes();    //将字符串转换为字节数组,方便下面写入

            os.write(data, 0, data.length);    //3、写入文件
            os.flush();    //将存储在管道中的数据强制刷新出去
            log.info("Save File:"+file.getPath());
		} catch (Exception e) {
			if (os != null) {
                try {
                    os.close();
                } catch (IOException ioe) {
                	ioe.printStackTrace();
                	log.error("Failed To Close Output Stream!");
                }
            }
		}
	}

	/** 判断/home/utils/factor_stat文件是否存在 */
	public boolean isFactorStatFileExist(){
		if(!os.equals("Linux") && !os.equals("linux")){
			return false;
		}
		
		File file = new File("/home/utils/factor_stat");
		return file.exists();
	}
	
	/** 校时触发，删除FactorStat文件，生成最新的NurseInfo */
	public void initLicense(String date){
		//试用期45天
		if(isFactorStatFileExist()){
			DatabaseHelper dbHelper = null;
			try {
				dbHelper = new DatabaseHelper();
				//LIC_StartTime.UpdateDate 初始为当前时间
				String sql = String.format("UPDATE LIC_StartTime SET UpdateDate = '%s';", date);
        		dbHelper.executeNoQuery(sql);
        		
        		//TBL_License.LicenseCode 生成本机的Code
                sql = "DELETE FROM TBL_License;";
                dbHelper.executeNoQuery(sql);
                sql = String.format("INSERT INTO TBL_License VALUES('%s');", getLocalLicenseCode(date));
                dbHelper.executeNoQuery(sql);
                
                //删除/home/utils/factor_stat
                //File file = new File("/home/utils/factor_stat");
            	//file.delete();
			} catch (Exception e) {
				log.error("initLicense Exception:"+e);
			} finally {
				if(dbHelper != null) dbHelper.close();
			}
		}
	}
	
	/** 获取本机的LicenseCode */
	private String getLocalLicenseCode(String date){
		try {
			License lic = new License();
			lic.Mac = LicenseHelper.getMac();
			lic.RegistrationDate = format.format(format.parse(date));
			lic.Versions = NurseApp.class.getPackage().getImplementationVersion();
			this.license = lic;
			String code = lic.toString();
			String encode = LicenseHelper.encode(code);
			return encode;
		} catch (Exception e) {
			log.error("getLocalLicenseCode Exception:"+e);
		}
		return null;
	}
}
