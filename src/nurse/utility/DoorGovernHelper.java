package nurse.utility;

import java.lang.reflect.Field;
import java.sql.CallableStatement;
import java.sql.Types;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Set;

import org.apache.log4j.Logger;

import nurse.common.DataRow;
import nurse.common.DataRowCollection;
import nurse.common.DataTable;
import nurse.entity.persist.Door;
import nurse.entity.persist.DoorControlGovern;
import nurse.logic.handlers.ActiveSignalDataHandler;
import nurse.logic.providers.DevControlProvider;
import nurse.logic.providers.RealDataProvider;

/**
 * Door Govern v1.0<br/>
 * 2018/10/11<br/>
 * <br/>
 * 门禁管理帮助类：为了方便管理不同门禁规则而创建的帮助类<br/>
 * 1、卡类型<br/>
 * 2、卡号进制<br/>
 * 3、卡号位数<br/>
 * 5、控制命令的格式<br/>
 * */
public class DoorGovernHelper {
	private static DoorGovernHelper instance = new DoorGovernHelper();
	private static Logger log = Logger.getLogger(DoorGovernHelper.class);
	private static HashMap<String, DoorControlGovern> DoorGovernMap = new HashMap<String, DoorControlGovern>();
	private static HashMap<String, String> PasswordMap = new HashMap<String, String>();
	private static HashMap<String, String> CmdTokenMap = new HashMap<String, String>();
	private static HashMap<String, String> ControlMap = new HashMap<String, String>();
	private static HashMap<String, String> UserMap = new HashMap<String, String>();
	private static HashMap<String, ArrayList<String>> DoorNoMap = new HashMap<String, ArrayList<String>>();
	private static HashMap<String, Door> DoorInfoMap = new HashMap<String, Door>();
	private static String StationId = "";
	private static String MonitorUnitId = "";

	
	public static DoorGovernHelper getInstance(){
		return instance;
	}
	
	private void closeHashMap(){
		DoorGovernMap = new HashMap<String, DoorControlGovern>();
		PasswordMap = new HashMap<String, String>();
		CmdTokenMap = new HashMap<String, String>();
		ControlMap = new HashMap<String, String>();
		UserMap = new HashMap<String, String>();
		DoorNoMap = new HashMap<String, ArrayList<String>>();
		DoorInfoMap = new HashMap<String, Door>();
	}
	
	private void initStationAndMonitorUnit(){
		DatabaseHelper dbHelper = null;
    	try {
    		dbHelper = new DatabaseHelper();
    		String sql = "SELECT StationId,MonitorUnitId FROM TBL_Equipment LIMIT 1;";
    		
			DataTable dt = dbHelper.executeToTable(sql);
			
			if(dt.getRowCount() > 0){
				StationId = dt.getRows().get(0).getValueAsString("StationId");
				MonitorUnitId = dt.getRows().get(0).getValueAsString("MonitorUnitId");
			}
		} catch (Exception e) {
			log.error("Database exception:",e);
		}finally{
			if(dbHelper != null) dbHelper.close();
		}
	}
	
	/** 【配置生效】初始化并解析DoorControlGovern存储到缓存中 */
	public void initDoorControlGovern(){
		closeHashMap();
		
		initStationAndMonitorUnit();
		
		DatabaseHelper dbHelper = null;
		DataTable dt = null;
		try {
			dbHelper = new DatabaseHelper();
			StringBuffer sb = new StringBuffer();
			sb.append("SELECT A.EquipmentId,B.* ");
			sb.append("FROM TBL_Door A ");
			sb.append("LEFT JOIN TBL_DoorControlGovern B ON A.DoorControlId = B.DoorControlId ");
			sb.append("GROUP BY A.EquipmentId;");
			dt = dbHelper.executeToTable(sb.toString());
			
			DataRowCollection drs = dt.getRows();
			for(int i = 0;i < dt.getRowCount(); i ++){
				DataRow dataRow = drs.get(i);
				String EquipmentId = dataRow.getValueAsString("EquipmentId");
				StationId = dataRow.getValueAsString("StationId");
				MonitorUnitId = dataRow.getValueAsString("MonitorUnitId");
				DoorControlGovern dcg = DoorControlGovern.getTemperatures(dataRow);
				if(dcg == null) continue;
				DoorGovernMap.put(EquipmentId, dcg);
			}
		} catch (Exception e) {
			log.error("InitDoorControlGovern Exception:"+e);
		} finally {
			if(dbHelper != null) dbHelper.close();
		}
	}

	
	/** 下发命令 */
	private boolean saveDistributeControl(String equipmentId,String controlId,String cmdToken,String userId,String parameterValues){
		if(ActiveSignalDataHandler.proxy==null) 
			ActiveSignalDataHandler.proxy = new RealDataProvider();
		for(int i=0;i<3;i++){
			ActiveSignalDataHandler.proxy.GetData(8888);
		}
		
		if(StationId == null || StationId.equals("") || 
				MonitorUnitId == null || MonitorUnitId.equals("")){
			initStationAndMonitorUnit();
		}
		
		DatabaseHelper dbHelper = null;
		try{
	        dbHelper = new DatabaseHelper();
			
			CallableStatement stat = dbHelper.prepareProcedure("PBL_SaveDoorControl", "?,?,?,?,?,?,?,?,?,?");
        	stat.setInt(1, Integer.parseInt(StationId));
        	stat.setInt(2, Integer.parseInt(MonitorUnitId));
        	stat.setInt(3, Integer.parseInt(equipmentId));
        	stat.setInt(4, Integer.parseInt(controlId));
        	stat.setString(5, cmdToken);
        	stat.setInt(6, Integer.parseInt(userId));
        	stat.setString(7, parameterValues);
        	stat.setString(8, "");
        	stat.setInt(9, 0);
			stat.registerOutParameter(10,Types.VARCHAR);
        	stat.execute();
			
        	int RetValue = Integer.parseInt(stat.getString(10));
        	switch (RetValue) {
				case 1:
					log.error("StationId OR EquipmentId OR ControlId IS NULL");
					break;
				case 2:
					log.error("Command Already Exists");
					break;
				default:
		            log.info("Send Control OK! SQL:"+String.format(" call PBL_SaveDoorControl(%s,%s,%s,%s,'%s',%s,'%s','',0,@id)",
							StationId,MonitorUnitId,equipmentId,controlId,cmdToken,userId,parameterValues));
		            return true;
			}
            return false;
		} catch (Exception e) {
			log.error("SaveDistributeControl Exception:"+e);
            return false;
		} finally {
			if(dbHelper != null) dbHelper.close();
		}
	}
	
	/** 拆分CmdToken和ParameterValues */
	private String[] getCmdTokenParameterValues(String expression,String control){
		String[] result = new String[]{"",control};//0:CmdToken  1:ParameterValues
		//expression:[DoorPassword],{CmdToken},{DoorNo}
		//control:000000,10,1
		//return {"000000,10","1"}
		String[] exprs = expression.split("\\,");
		String[] conts = control.split("\\,");
		int index = -1;
		for(int i = 0;i < exprs.length;i++){
			if(exprs[i].indexOf("CmdToken") > -1){
				index = i;
				break;
			}
		}
		
		if(index > -1){
			result = new String[]{"",""};
			for(int i = 0;i < exprs.length;i++){
				if(i <= index){
					if(result[0].length() > 0) result[0] += ",";
					result[0] += conts[i];
				}else{
					if(result[1].length() > 0) result[1] += ",";
					result[1] += conts[i];
				}
			}
		}
		return result;
	}
	
	/** 根据基类编号获取CmdToken */
	private String getPasswordByEquipmentId(String equipmentId,String doorNo){
		String key = String.format("%s|%s", equipmentId,doorNo);
		if(PasswordMap.containsKey(key))
			return PasswordMap.get(key);
		
		DatabaseHelper dbHelper = null;
		String password = "";
    	try {
    		dbHelper = new DatabaseHelper();
    		String sql = String.format("SELECT `Password` FROM TBL_Door WHERE EquipmentId = %s AND DoorNo = %s;",
					equipmentId,doorNo);
    		
			DataTable dt = dbHelper.executeToTable(sql);
			
			if(dt.getRowCount() > 0){
				password = dt.getRows().get(0).getValueAsString("Password");
				PasswordMap.put(key, password);
			}
		} catch (Exception e) {
			log.error("Database exception:",e);
		}finally{
			if(dbHelper != null) dbHelper.close();
		}
    	return password;
	}
	
	/** 根据基类编号获取CmdToken */
	public String getCmdTokenByBaseTypeId(String equipmentId,String baseTypeId){
		if(baseTypeId == null || baseTypeId.equals("")) return null;
		String key = String.format("%s|%s", equipmentId,baseTypeId);
		if(CmdTokenMap.containsKey(key))
			return CmdTokenMap.get(key);
		
		DatabaseHelper dbHelper = null;
		String cmdToken = null;
    	try {
    		dbHelper = new DatabaseHelper();
    		StringBuffer sb = new StringBuffer();
    		sb.append("SELECT A.CmdToken FROM TBL_Control A ");
    		sb.append("LEFT JOIN TBL_Equipment B ON A.EquipmentTemplateId = B.EquipmentTemplateId ");
    		sb.append(String.format("WHERE B.EquipmentId = %s AND BaseTypeId = %s;", 
					equipmentId,baseTypeId));
    		
			DataTable dt = dbHelper.executeToTable(sb.toString());
			
			if(dt.getRowCount() > 0){
				cmdToken = dt.getRows().get(0).getValueAsString("CmdToken");
				CmdTokenMap.put(key, cmdToken);
			}
		} catch (Exception e) {
			log.error("Database exception:",e);
		}finally{
			if(dbHelper != null) dbHelper.close();
		}
    	return cmdToken;
	}
	
	/** 根据基类编号获取绑定了基类的控制编号 */
	private String getControlIdByBaseTypeId(String equipmentId,String baseTypeId){
		String key = String.format("%s|%s", equipmentId,baseTypeId);
		if(ControlMap.containsKey(key))
			return ControlMap.get(key);
		
		DatabaseHelper dbHelper = null;
		String controlId = "0";
    	try {
    		dbHelper = new DatabaseHelper();
    		StringBuffer sb = new StringBuffer();
    		sb.append("SELECT ControlId FROM TBL_Control A ");
    		sb.append("LEFT JOIN TBL_Equipment B ON A.EquipmentTemplateId = B.EquipmentTemplateId ");
    		sb.append(String.format("WHERE B.EquipmentId = %s AND A.BaseTypeId = %s;", 
					equipmentId,baseTypeId));
    		
			DataTable dt = dbHelper.executeToTable(sb.toString());
			
			if(dt.getRowCount() > 0){
				controlId = dt.getRows().get(0).getValueAsString("ControlId");
				ControlMap.put(key, controlId);
			}
		} catch (Exception e) {
			log.error("Database exception:",e);
		}finally{
			if(dbHelper != null) dbHelper.close();
		}
    	return controlId;
	}
	
	/** 根据登录名获取用户编号 */
	private String getUserIdByUserName(String loginId){
		String key = String.format("%s", loginId);
		if(UserMap.containsKey(key))
			return UserMap.get(key);
		
		DatabaseHelper dbHelper = null;
		String userId = "";
    	try {
    		dbHelper = new DatabaseHelper();
    		String sql = String.format("SELECT UserId FROM TBL_Account WHERE LogonId = '%s';", loginId);
    		
			DataTable dt = dbHelper.executeToTable(sql);
			
			if(dt.getRowCount() > 0){
				userId = dt.getRows().get(0).getValueAsString("UserId");
				UserMap.put(key, userId);
			}
		} catch (Exception e) {
			log.error("Database exception:",e);
		}finally{
			if(dbHelper != null) dbHelper.close();
		}
    	return userId;
	}

	/** 根据设备编号获取门表的门号集合 **/
	public ArrayList<String> getDoorNoList(String equipmentId){
		String key = String.format("%s", equipmentId);
		if(DoorNoMap.containsKey(key))
			return DoorNoMap.get(key);
		
		DatabaseHelper dbHelper = null;
		ArrayList<String> list = new ArrayList<String>();
    	try {
    		dbHelper = new DatabaseHelper();
    		String sql = String.format("SELECT DoorNo FROM TBL_Door WHERE EquipmentId = %s;", equipmentId);
    		
			DataTable dt = dbHelper.executeToTable(sql);
			
			if(dt.getRowCount() > 0){
				for(int i = 0;i < dt.getRowCount();i++){
					DataRow dataRow = dt.getRows().get(i);
					list.add(dataRow.getValueAsString("DoorNo"));
				}
				DoorNoMap.put(key, list);
			}
		} catch (Exception e) {
			log.error("Database exception:",e);
		}finally{
			if(dbHelper != null) dbHelper.close();
		}
    	return list;
	}
	
	/** 根据门编号获取设备编号和门号 return {EquipmentId,DoorNo} */
	public Door getEquipmenAndDoorByDoorId(String doorId){
		String key = String.format("%s", doorId);
		if(DoorInfoMap.containsKey(key))
			return DoorInfoMap.get(key);
		
		DatabaseHelper dbHelper = null;
		Door door = new Door();
    	try {
    		dbHelper = new DatabaseHelper();
    		String sql = String.format("SELECT * FROM TBL_Door WHERE DoorId = %s;", doorId);
    		
			DataTable dt = dbHelper.executeToTable(sql);
			
			door = Door.fromDataTable(dt).get(0);
			
			DoorInfoMap.put(key, door);
		} catch (Exception e) {
			log.error("Database exception:",e);
		}finally{
			if(dbHelper != null) dbHelper.close();
		}
    	return door;
	}
	
	/** 将十进制转为十六进制 */
	private static String toHexString(int decimal) { 
        String hex = ""; 
        while(decimal != 0) { 
            int hexValue = decimal % 16; 
            hex = toHexChar(hexValue) + hex; 
            decimal = decimal / 16; 
        } 
        return  hex; 
    } 
    //将0~15的十进制数转换成0~F的十六进制数 
    private static char toHexChar(int hexValue) { 
        if(hexValue <= 9 && hexValue >= 0) 
            return (char)(hexValue + '0'); 
        else 
            return (char)(hexValue - 10 + 'A'); 
    }
    
    /** 获取门禁的十六进制时段 */
    private String getDoorHex(String timeGroupId){
		String timeGroup = "C0";
		if(timeGroupId.equals("99999999"))//特权，全时段
			timeGroup = "C0";
		else if(timeGroupId.equals("0"))//星期时限
			timeGroup = "40";
		else{
			if(Integer.parseInt(timeGroupId) <= 15)
				timeGroup = String.format("0%s", toHexString(Integer.parseInt(timeGroupId)));//十六进制
			else
				timeGroup = toHexString(Integer.parseInt(timeGroupId));
		}
		return timeGroup;
    }
    
    /** 将deci进制的param转为十进制 */
    public int getDoorDecimal(String param,int radix){
    	int result = 0;
    	if(param.equals("C0"))
    		result = 99999999;
		else if(param.equals("40"))
			result = 0;
		else
			result = Integer.parseUnsignedInt(param, radix);
    	return result;
    }

    /** 参数替换{} */
    private String parseInputExpression(String expr,String[] values){
    	for(String item : values){
    		String[] v = new String[]{};
    		if(item.indexOf("HEX") > -1){//{HEX(TimeGroupId):15}
    			v = getSplitParamValue(item,":");////0:"{HEX(TimeGroupId)}",1:"15"
    			v[1] = getDoorHex(v[1]);//0F
    		}else{//{CmdToken:10,00000}
        		v = getSplitParamValue(item,":");//0:"{CmdToken}",1:"10,00000"
    		}
    		expr = expr.replaceAll(getReplaceValue(v[0]), v[1]);
    	}
    	return expr;
    }
    
    /** 查库替换[] */
	private String createCmdToken(String expr,String equipmentId,String baseTypeId,String doorNo){
		String reuslt = expr;
		try {
			ArrayList<String> params = getParamBrace(reuslt,"[","]");//[]查库
			//params.addAll(getParamBrace(reuslt,"{","}"));//{}参数
			for(String item : params){
				String value = "";
				if(item.indexOf("DoorPassword") > -1){//[DoorPassword]
					value = getPasswordByEquipmentId(equipmentId, doorNo);
				}else if(item.indexOf("CmdToken") > -1){//[CmdToken]
					value = getCmdTokenByBaseTypeId(equipmentId,baseTypeId);
				}else{
					if(item.indexOf("BT") > -1){//[CmdToken=BT:1001301001]
						int i = item.indexOf("BT:");
						int j = item.lastIndexOf("]");
						String btId = item.substring(i+3,j);
						value = getCmdTokenByBaseTypeId(equipmentId, btId);
					}
				}
				reuslt = reuslt.replaceAll(getReplaceValue(item),value);
			}
		} catch (Exception e) {
			log.error("CreateCmdToken Exception:"+e);
		}
		return reuslt;
	}
    
    /** {CmdToken:10,00000} return {"{CmdToken}","10,00000"} */
    private String[] getSplitParamValue(String param,String part){
    	String first = param.substring(0,1);
    	String last = param.substring(param.length()-1);
    	int index = param.indexOf(part);
    	String k = param.substring(1,index);
    	String val = param.substring(index+1,param.length()-1);
    	String key = String.format("%s%s%s", first,k,last);
    	return new String[]{key,val};
    }
    
    /** [CmdToken=BT:1001308001],[DoorPassword],{Value}<br/> return {"[CmdToken=BT:1001308001]","[DoorPassword]"} */
    private ArrayList<String> getParamBrace(String param, String first, String last){
    	ArrayList<String> result = new ArrayList<String>();
    	String str = param,key = "";
    	int firstIndex = -1,lastIndex = -1;
    	while(str.indexOf(first) > -1 && str.indexOf(last) > -1){
    		firstIndex = str.indexOf(first);
    		lastIndex = str.indexOf(last);
    		key = str.substring(firstIndex,lastIndex+1);
    		result.add(key);
    		str = str.substring(lastIndex+1);
    	}
    	return result;
    }
    
    /** [CmdToken=BT:1001308001] return "\[CmdToken=BT:1001308001\]" */
    private String getReplaceValue(String param){
    	String result = param.replaceAll("\\[", "\\\\[");
    	result = result.replaceAll("\\]", "\\\\]");
    	result = result.replaceAll("\\{", "\\\\{");
    	result = result.replaceAll("\\}", "\\\\}");
    	result = result.replaceAll("\\(", "\\\\(");
    	result = result.replaceAll("\\)", "\\\\)");
    	/*String first = param.substring(0,1);
    	String last = param.substring(param.length()-1);
    	String value = param.substring(1,param.length()-1);
    	String result = String.format("\\%s%s\\%s", first,value,last);*/
    	return result;
    }
    
    public Set<String> getDoorEquipmentIds(){
    	if(DoorGovernMap.size() == 0) initDoorControlGovern();
    	return DoorGovernMap.keySet();
    }
    
	public DoorControlGovern getDoorControlGovern(String EquipmentId){
    	if(DoorGovernMap.size() == 0) initDoorControlGovern();
		return DoorGovernMap.get(EquipmentId);
	}
	
	public boolean isDoorControl(String EquipmentId){
		if(DoorGovernMap == null || DoorGovernMap.size() == 0){
			if(DoorGovernMap == null)log.info("DoorGovernMap Is NULL.");
			else log.info("DoorGovernMap Size 0.");
			initDoorControlGovern();
		}
		if(DoorGovernMap.containsKey(EquipmentId))
		{
			log.info("DeviceId:"+EquipmentId+" Is DoorControl.");
			return true;
		}else{
			log.info("DeviceId:"+EquipmentId+" Not DoorControl.");
			return false;
		}
	}
	
	/** 判断时限的时间编号是否合法 */
	public boolean isTimeGroupNo(String equipmentId,int groupNo){
    	if(DoorGovernMap.size() == 0) initDoorControlGovern();
    	
		if(!DoorGovernMap.containsKey(equipmentId)){
			initDoorControlGovern();
		}
		DoorControlGovern dcg = DoorGovernMap.get(equipmentId);
		
		int endIndex = dcg.TimeGroupNo.indexOf("-");
		int min = Integer.parseInt(dcg.TimeGroupNo.substring(1, endIndex));
		int max = Integer.parseInt(dcg.TimeGroupNo.substring(endIndex+1, dcg.TimeGroupNo.length()-1));
		System.out.println("TimeGroup:"+dcg.TimeGroupNo+" ,Min:"+min+" ,Max:"+max+" ,GroupNo:"+groupNo);
		if(dcg.TimeGroupNo.indexOf("[") > -1){
			if(groupNo >= min && groupNo <= max) return true;
			else return false;
		}else{
			if(groupNo > min && groupNo < max) return true;
			else return false;
		}
	}
	
	/** 返回合法CardCode */
	public String getLegitCard(String equipmentId,String cardCode){
    	if(DoorGovernMap.size() == 0) initDoorControlGovern();
		if(!DoorGovernMap.containsKey(equipmentId)){
			initDoorControlGovern();
		}
		DoorControlGovern dcg = DoorGovernMap.get(equipmentId);
		if(dcg == null) return cardCode;
		
		//判断卡号是否为dcg.CardNumber长度，不足前面加0
		int count = 0;
		if(dcg.CardNumber > cardCode.length()){
			count = dcg.CardNumber - cardCode.length();
			for(int i = 0;i < count; i++){
				cardCode = "0"+cardCode;
			}
			return cardCode.trim();
		}else
			return cardCode.trim();
	}
	
	/** 根据key获取param指定位置的值 如：key:cmdToken param:10,0000,1 return:10 */
	public String getValueByKey(String equipmentId,String ControlType,String param,String key){
		if(!DoorGovernMap.containsKey(equipmentId)){
			initDoorControlGovern();
		}
		DoorControlGovern dcg = DoorGovernMap.get(equipmentId);
		if(dcg == null) return "DoorGovernMap Not Data";
		
		String expression = "";
		Field[] fields = dcg.getClass().getDeclaredFields();
		for(Field fie : fields){
			if(fie.getName().equals(ControlType))
				expression = getFieldValueByName(ControlType,dcg);//{CmdToken},[DoorPassword],{DoorNo}
		}
		if(expression == null || expression.equals("")){
			log.error("ControlType Not Data");
			return "ControlType Not Data";
		}
		
		//expression:[CmdToken],[DoorPassword],{UserId}+{CardCode},{UserRights},{UserPassword},{EndTime},{DoorNo}
		//param:36,000000,1+ABCDEFGH,C0,0000,2020-12-31,1
		//key:DoorNo
		//return:1
		String[] exprs = expression.split("\\,");
		String[] vals = param.split("\\,");
		for(int i = 0;i < exprs.length;i++){
			if(exprs[i].indexOf(key) > -1){
				try {
					if(exprs[i].indexOf("+") > -1){
						String[] exs = exprs[i].split("\\+");
						String[] vs = vals[i].split("\\+");
						for(int j = 0; j < exs.length;j++){
							if(exs[j].indexOf(key) > -1){
								try {
									return vs[j];
								} catch (Exception e) {
									continue;
								}
							}
						}
					}else{
						return vals[i];
					}
				} catch (Exception e) {
					continue;
				}
			}
		}
		return "-1";
	}
	
	/**
	 * 
	 * @param ControlType 控制命令	 <br/>
 	 * RemoteOpenDoor:远程开门<br/>
	 * AccessControlReset:门禁复位格式<br/>
	 * AddCard:增加门禁卡<br/>
	 * DeleteCard:删除门禁卡<br/>
	 * DeleteAllCard:删除所有门禁卡<br/>
	 * ModifyCardSetting:修改门禁卡设置<br/>
	 * AccessTimeSetting:设置准进时间段<br/>
	 * DoorOpenOvertimeSetting:设置开门超时时间<br/>
	 * AccessControlTimingSetting:门禁校时设置<br/>
	 * DoorEncryption:门禁刷卡加密码
	 * @param EquipmentId 接收控制的门禁
	 * @param LogonId 下发控制的用户登录名，如：admin
	 * @param BaseTypeId 当基类为空是，输入CT:控制编号
	 * @param DoorNo 门禁的门号
	 * @param values 参数集
	 * @return
	 */
	public String SendDoorControl(String ControlType,String EquipmentId,String LogonId,String BaseTypeId,String DoorNo,String[] values){
		if(getCmdTokenByBaseTypeId(EquipmentId,BaseTypeId) == null){
			log.error("BaseTypeId Not Null");
			return "BaseTypeId Not Null";
		}
		if(!DoorGovernMap.containsKey(EquipmentId)){
			initDoorControlGovern();
		}
		System.out.println("Door Control BaseTypeId:"+BaseTypeId);
		
		//不在门禁规制表中，否则CmdToken,ParameterValue
		if(DoorGovernMap.size() == 0 || !DoorGovernMap.containsKey(EquipmentId)){
			log.info("1 The Not Door Control Govern.");
			String userId = "-1";
			if(!LogonId.equals("-1")) userId = getUserIdByUserName(LogonId);
			if(DevControlProvider.getInstance().SendControl(Integer.parseInt(EquipmentId), 
					Integer.parseInt(BaseTypeId), DoorNo, userId))
				return "OK";
			else
				return "ERROR";
		}
		
		DoorControlGovern dcg = DoorGovernMap.get(EquipmentId);
		String expression = "";
		Field[] fields = dcg.getClass().getDeclaredFields();
		for(Field fie : fields){
			if(fie.getName().equals(ControlType))
				expression = getFieldValueByName(ControlType,dcg);//{CmdToken},[DoorPassword],{DoorNo}
		}
		if(expression == null || expression.equals("")){
			log.error("ControlType Not Data");
			return "ControlType Not Data";
		}
		System.out.println("Door Control ControlValue:"+expression);
		
		String control = parseInputExpression(expression,values);
		
		control = createCmdToken(control,EquipmentId,BaseTypeId,DoorNo);//10,00000,1

		if(paramCalibr(control)){
			log.info("2 The Not Door Control Govern.");
			String userId = "-1";
			if(!LogonId.equals("-1")) userId = getUserIdByUserName(LogonId);
			if(DevControlProvider.getInstance().SendControl(Integer.parseInt(EquipmentId), 
					Integer.parseInt(BaseTypeId), DoorNo, userId))
				return "OK";
			else
				return "ERROR";
		}
		
		String controlId = "";
		if(BaseTypeId.indexOf("CT:") > -1){//CT:510100321
			controlId = BaseTypeId.substring(BaseTypeId.indexOf("CT:")+3);
		}else
			controlId = getControlIdByBaseTypeId(EquipmentId,BaseTypeId);
		
		String userId = "-1";
		if(!LogonId.equals("-1"))
			userId = getUserIdByUserName(LogonId);
		
		//拆分CmdToken和ParameterValues
		String[] cpvs = getCmdTokenParameterValues(expression, control);
		
		if(saveDistributeControl(EquipmentId,controlId,cpvs[0],userId,cpvs[1]))
			return "OK";
		else
			return "ERROR";
	}
	
	/** 获取对象属性名为filedName的值 */
	private String getFieldValueByName(String fieldName,DoorControlGovern dcg){
		try {
			Field field = dcg.getClass().getDeclaredField(fieldName);
	        Object object = field.get(dcg);
	        return object.toString();
		} catch (Exception e) {
			return "";
		}
	}

	/** 判断参数是否存在没转译和空缺 */
	private boolean paramCalibr(String param){
		//{}、[]参数没有替换
		if(param.indexOf("{") > -1 || param.indexOf("}") > -1 || param.indexOf("[") > -1 || param.indexOf("]") > -1)
			return true;
		//循环判断是否存在空值如：null或者""
		String[] split1 = param.split("\\,");
		if(getCharNumber(param,",") + 1 != split1.length) return true;
		
		for(String s1 : split1){
			if(s1.indexOf("+") > -1){
				String[] split2 = s1.split("\\+");
				if(getCharNumber(s1,"+") + 1 != split2.length) return true;
				
				for(String s2 : split2){
					if(s2.equals("null") || s2.equals("")) return true;
				}
			}else{
				if(s1.equals("null") || s1.equals("")) return true;
			}
		}
		return false;
	}
	
	/** param字符串中ch出现的次数 */
	private int getCharNumber(String param,String ch){
		int index = 0;
		int count = 0;
		while((index = param.indexOf(ch, index)) != -1) {
			count++;
		    index = index + ch.length();
		}
		return count;
	}
}
