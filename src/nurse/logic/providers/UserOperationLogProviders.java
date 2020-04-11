package nurse.logic.providers;


import java.io.*;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.Base64;

import nurse.entity.persist.DataItem;
import nurse.utility.BasePath;
import org.apache.log4j.Logger;

import nurse.common.DataTable;
import nurse.entity.persist.UserOperationLog;
import nurse.utility.DatabaseHelper;


public class UserOperationLogProviders {

	private static UserOperationLogProviders instance = new UserOperationLogProviders();
	private static Logger log = Logger.getLogger(UserOperationLogProviders.class);
		
	public static UserOperationLogProviders getInstance(){
		return instance;
	}
	
	public ArrayList<UserOperationLog> getUserOperationLog(String startTime, String endTime){
		DatabaseHelper dbHelper = null;
		
        try
        {
            dbHelper = new DatabaseHelper();
            StringBuilder sb= new StringBuilder();
            sb.append("	SELECT A.*,B.OperationName,C.EquipmentName,D.ControlName,E.Meanings,F.EventName ");
            sb.append("	FROM TBL_UserOperationLog A ");
            sb.append("	LEFT JOIN TBL_Operation B ON A.OperationId = B.OperationId ");
            sb.append("	LEFT JOIN TBL_Equipment C ON A.EquipmentId = C.EquipmentId ");
            sb.append("	LEFT JOIN TBL_Control D ON A.ControlId = D.ControlId ");
            sb.append("	LEFT JOIN TBL_ControlMeanings E ON C.EquipmentTemplateId = E.EquipmentTemplateId ");
            sb.append("		AND D.ControlId = E.ControlId AND A.ParameterValues = E.ParameterValue ");
            sb.append("	LEFT JOIN TBL_Event F ON A.EventId = F.EventId ");
            sb.append(String.format("	WHERE A.StartTime >= '%s 00:00:00' AND A.StartTime <= '%s 23:59:59' ", startTime, endTime)); 
            sb.append("	ORDER BY A.StartTime DESC LIMIT 3000;");
            
            DataTable dt = dbHelper.executeToTable(sb.toString());
            return UserOperationLog.fromDataTable(dt);
		} catch (Exception e) {
			log.error("getUserOperationLog Exception:", e);
		} finally {
			if(dbHelper != null) dbHelper.close();
		}
        return new ArrayList<UserOperationLog>();
	}

	public ArrayList<UserOperationLog> getLikeUserOperationLog(int index,int size,String startTime, String endTime,
			String logonId,String ip,String content){
		DatabaseHelper dbHelper = null;
		
        try
        {
            dbHelper = new DatabaseHelper();
            StringBuilder sb= new StringBuilder();
            sb.append("SELECT * FROM ( ");
            sb.append("	SELECT A.*,B.OperationName,C.EquipmentName,D.ControlName,E.Meanings,F.EventName ");
            sb.append("	FROM TBL_UserOperationLog A ");
            sb.append("	LEFT JOIN TBL_Operation B ON A.OperationId = B.OperationId ");
            sb.append("	LEFT JOIN TBL_Equipment C ON A.EquipmentId = C.EquipmentId ");
            sb.append("	LEFT JOIN TBL_Control D ON A.ControlId = D.ControlId ");
            sb.append("	LEFT JOIN TBL_ControlMeanings E ON C.EquipmentTemplateId = E.EquipmentTemplateId ");
            sb.append("		AND D.ControlId = E.ControlId AND A.ParameterValues = E.ParameterValue ");
            sb.append("	LEFT JOIN TBL_Event F ON A.EventId = F.EventId ");
            sb.append(String.format("	WHERE A.StartTime >= '%s 00:00:00' AND A.StartTime <= '%s 23:59:59' ", startTime, endTime));
            sb.append(String.format("	AND LogonId LIKE '%s' ", "%"+logonId+"%"));
            sb.append(String.format("	AND IpAddress LIKE '%s' ", "%"+ip+"%"));
            sb.append(String.format("	AND CONCAT(IFNULL(B.OperationName,''),IFNULL(C.EquipmentName,''),IFNULL(D.ControlName,''),IFNULL(E.Meanings,''),IFNULL(F.EventName,'')) LIKE '%s' ", "%"+content+"%")); 
            sb.append("	ORDER BY A.StartTime DESC LIMIT 3000 ");
            sb.append(String.format(") T LIMIT %s,%s;", index, size));
            
            DataTable dt = dbHelper.executeToTable(sb.toString());
            return UserOperationLog.fromDataTable(dt);
		} catch (Exception e) {
			log.error("getLikeUserOperationLog Exception:", e);
		} finally {
			if(dbHelper != null) dbHelper.close();
		}
        return new ArrayList<UserOperationLog>();
	}
	
	public int getUserOperationLogTotal(String startTime, String endTime,
			String logonId,String ip,String content){
		DatabaseHelper dbHelper = null;
		
        try{
            dbHelper = new DatabaseHelper();
            StringBuilder sb= new StringBuilder();
            sb.append("SELECT COUNT(*) FROM ( ");
            sb.append("	SELECT A.*,B.OperationName,C.EquipmentName,D.ControlName,E.Meanings,F.EventName ");
            sb.append("	FROM TBL_UserOperationLog A ");
            sb.append("	LEFT JOIN TBL_Operation B ON A.OperationId = B.OperationId ");
            sb.append("	LEFT JOIN TBL_Equipment C ON A.EquipmentId = C.EquipmentId ");
            sb.append("	LEFT JOIN TBL_Control D ON A.ControlId = D.ControlId ");
            sb.append("	LEFT JOIN TBL_ControlMeanings E ON C.EquipmentTemplateId = E.EquipmentTemplateId ");
            sb.append("		AND D.ControlId = E.ControlId AND A.ParameterValues = E.ParameterValue ");
            sb.append("	LEFT JOIN TBL_Event F ON A.EventId = F.EventId ");
            sb.append(String.format("	WHERE A.StartTime >= '%s 00:00:00' AND A.StartTime <= '%s 23:59:59' ", startTime, endTime));
            sb.append(String.format("	AND LogonId LIKE '%s' ", "%"+logonId+"%"));
            sb.append(String.format("	AND IpAddress LIKE '%s' ", "%"+ip+"%"));
            sb.append(String.format("	AND CONCAT(IFNULL(B.OperationName,''),IFNULL(C.EquipmentName,''),IFNULL(D.ControlName,''),IFNULL(E.Meanings,''),IFNULL(F.EventName,'')) LIKE '%s' ", "%"+content+"%")); 
            sb.append("	ORDER BY A.StartTime DESC LIMIT 3000 ");
            sb.append(") T;");

            Object res = dbHelper.executeScalar(sb.toString());

			if(res == null){
            	return 0;
			}else{
				return Integer.parseInt(res.toString());
			}
		} catch (Exception e) {
			log.error("getUserOperationLogTotal Exception:", e);
			return 0;
		} finally {
			if(dbHelper != null) dbHelper.close();
		}
	}
	
	/**
	 * 用户操作日志
	 * @param OperationId 1:事件确认;47:登录;48:退出;50:发送控制命令;60:配置更改;75:系统关机;76:系统重启
	 * @param LogonId 登录用户名
	 * @param ApAddress 访问IP
	 * @param EquipmentId 设备编号
	 * @param ControlBaseTypeId 控制编号
	 * @param ParameterValues 控制值
	 * @param SequenceId 事件编号
	 * @param Description
	 * @return
	 */
	public boolean insertUserOperationLog(int OperationId,String LogonId,String ApAddress,String EquipmentId,
			String ControlBaseTypeId,String ParameterValues,String SequenceId,String Description){
		DatabaseHelper dbHelper = null;
		try {
			dbHelper = new DatabaseHelper();

			String sql=String.format(" call PBL_InsertUserOperationLog(%s, '%s', '%s', %s, %s, %s, %s, '%s')",
					OperationId, LogonId, ApAddress, EquipmentId, ControlBaseTypeId, 
					ParameterValues == null ? null : String.format("'%s'", ParameterValues), 
					SequenceId, Description);
            dbHelper.executeNoQuery(sql);
            
			return true;
		} catch (Exception e) {
			log.error("InsertUserOperationLog() failed.", e);
		} finally {
			if(dbHelper != null) dbHelper.close();
		}		
		return false;
	}

	public ArrayList<DataItem> getOperationList(){
		DatabaseHelper dbHelper = null;

		try{
			dbHelper = new DatabaseHelper();
			String sql = "SELECT * FROM TBL_Operation;";

			DataTable dt = dbHelper.executeToTable(sql);

			return UserOperationLog.fromDataItemTable(dt);
		} catch (Exception e) {
			log.error("GetOperationList Exception:", e);
		} finally {
			if(dbHelper != null) dbHelper.close();
		}
		return new ArrayList<DataItem>();
	}

	public String settingLogin(String pageBg, String infoBg, String modalPosition) {
		File file = null;
		File file1 = new File("");
		FileOutputStream out = null;
		FileInputStream in = null;
		FileWriter fw = null;
		try{

			// 登入背景图片
			if(pageBg != "null" && pageBg != null){
				//			String path = BasePath.getWebDirByEnv();

				Path p = null;
				String filename = null;

				String encoding = System.getProperty("file.encoding");

				//String utfStr =URLDecoder.decode(requestParams, "UTF-8");

				filename = new String(pageBg.getBytes(), encoding);
				p = Paths.get(BasePath.getPath(), "web/", filename);

				if (!filename.toLowerCase().contains("upload"))
				{
					return "only upload dir's file can be deleted.";
				}

				String strFilePath = p.toString();
				strFilePath.replace('\\', '/');
				File f = new File(strFilePath);

				File loginBg = new File(file1.getCanonicalPath()+"/web/img/loginbg.jpg");
				loginBg.delete();  //删除原有的背景图片
				out= new FileOutputStream(loginBg);
				in=new FileInputStream(f);

				//将图片复制到 指定路径
				byte[] by=new byte[1];
				while (in.read(by)!=-1) {
					out.write(by);
				}
				//关闭文件流
				try {
					if(in != null){
						in.close();
					}
					if(out != null){
						out.close();
					}
					if(fw != null){
						fw.close();
					}
				} catch (IOException e) {
					e.printStackTrace();
					return "error";
				}


			}

			//登入框背景
			if(infoBg != "null" && infoBg != null){
				Path p = null;
				String filename = null;

				String encoding = System.getProperty("file.encoding");

				filename = new String(infoBg.getBytes(), encoding);
				p = Paths.get(BasePath.getPath(), "web/", filename);

				if (!filename.toLowerCase().contains("upload"))
				{
					return "only upload dir's file can be deleted.";
				}

				String strFilePath = p.toString();
				strFilePath.replace('\\', '/');
				File f = new File(strFilePath);

				File loginInfo = new File(file1.getCanonicalPath()+"/web/img/logininfo.png");
				loginInfo.delete(); //删除原有的背景图片
				out= new FileOutputStream(loginInfo);
				in=new FileInputStream(f);

				//将图片复制到 指定路径
				byte[] by=new byte[1];
				while (in.read(by)!=-1) {
					out.write(by);
				}

				try {
					if(in != null){
						in.close();
					}
					if(out != null){
						out.close();
					}
					if(fw != null){
						fw.close();
					}
				} catch (IOException e) {
					e.printStackTrace();
					return "error";
				}
			}

//			登入框位置
			if(modalPosition != "null" && modalPosition != null){
				file = new File(file1.getCanonicalPath()+"/web/css/settingLogin.css");
				if(file.exists())file.delete();	//如果文件存在则删除重写
				file.createNewFile();
				fw = new FileWriter(file);
				StringBuffer sb = new StringBuffer();
				sb.append(".Body-Background{\n");
				sb.append(" background: url(../img/loginbg.jpg) left top/cover no-repeat !important;\n");
				sb.append("}\n");
				sb.append(".login_pannel{\n");
				sb.append("right: "+ modalPosition +";\n");
				sb.append("}\n");
				sb.append(".Login-Background{\n");
				sb.append("background: url(../img/logininfo.png) no-repeat;\n");
				sb.append("}\n");
				fw.write(sb.toString());
				fw.flush();

				try {
					if(in != null){
						in.close();
					}
					if(out != null){
						out.close();
					}
					if(fw != null){
						fw.close();
					}
				} catch (IOException e) {
					e.printStackTrace();
					return "error";
				}
			}

		}catch (IOException e){
			e.printStackTrace();
			return "error";
		}
		return "success";
	}

}
