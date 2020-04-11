package nurse.logic.providers;


import java.io.*;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

import nurse.entity.persist.*;
import nurse.utility.BasePath;
import nurse.utility.ZipUtils;
import org.apache.log4j.Logger;

import nurse.common.DataTable;
import nurse.utility.DatabaseHelper;
import org.dom4j.Document;
import org.dom4j.DocumentHelper;
import org.dom4j.Element;
import org.dom4j.io.OutputFormat;
import org.dom4j.io.XMLWriter;


public class TemplateProvider {

	private static TemplateProvider instance = new TemplateProvider();
	private static Logger log = Logger.getLogger(EventProvider.class);
	
	public TemplateProvider() {
	}
	
	public static TemplateProvider getInstance(){
		return instance;
	}
	
	public boolean BatchBaseTypeId(int equipmentTemplateId){
		DatabaseHelper dbHelper = null;
		try {
			dbHelper = new DatabaseHelper();
			String sql = String.format(" call PRO_BatchBaseTypeId(%d)",equipmentTemplateId);
			
		    dbHelper.executeNoQuery(sql);
		} catch (Exception e) {
			log.error("Database exception:", e);
			return false;
		}finally{
			if(dbHelper != null) dbHelper.close();
		}
		return true;
	}
	
	public String GetMaxBaseTypeByEquipmentTemplateId(int equipmentTemplateId){
		DatabaseHelper dbHelper = null;
		 try
	        {
	            dbHelper = new DatabaseHelper();
	            StringBuilder sb= new StringBuilder();
	            sb.append(String.format("SELECT EquipmentBaseType FROM TBL_EquipmentTemplate WHERE EquipmentTemplateId=%s;",equipmentTemplateId));
	            DataTable dt = dbHelper.executeToTable(sb.toString());	   
	            String baseType = "";
	            if(dt.getRowCount() > 0){
	            	baseType = dt.getRows().get(0).getValueAsString("EquipmentBaseType");
	            }
	            return baseType;
			} catch (Exception e) {
				log.error("fail to get Commmunication event", e);
			} finally {
				if(dbHelper != null) dbHelper.close();
			}
		return "";
	}
	
	public String SaveSignalMeanings(int equipmentTemplateId,int signalId,ArrayList<SignalMeanings> smList){
		DatabaseHelper dbHelper = null;
		try{
            dbHelper = new DatabaseHelper();
            DeleteSignalMeaningsById(equipmentTemplateId, signalId);
            for(SignalMeanings sm : smList){
            	SignalMeaningsProvider.getInstance().InsertSignalMeanings(equipmentTemplateId, signalId, sm.StateValue, sm.Meanings);
            }
            return "OK";
		} catch (Exception e) {
			log.error("fail to get Commmunication event", e);
			return "ERROR";
		} finally {
			if(dbHelper != null) dbHelper.close();
		}
	}
	
	/**  根据模板编号和信号编号删除信号含义  */
	private boolean DeleteSignalMeaningsById(int equipmentTemplateId,int signalId){
		DatabaseHelper dbHelper = null;
		try{
            dbHelper = new DatabaseHelper();
            String sql = String.format("DELETE FROM TBL_SignalMeanings WHERE EquipmentTemplateId = %s AND SignalId = %s;",
            		equipmentTemplateId,signalId);
            dbHelper.executeNoQuery(sql);
            return true;
		} catch (Exception e) {
			log.error("fail to get Commmunication event", e);
			return false;
		} finally {
			if(dbHelper != null) dbHelper.close();
		}
	}
	
	public String SaveSignal(Signal signal){
		DatabaseHelper dbHelper = null;
		try{
			if(signal.Expression == null) signal.Expression = "";
            if(signal.Unit == null) signal.Unit = "";
            if(signal.SignalCategory == 1){//模拟信号
            	DeleteSignalMeaningsById(signal.EquipmentTemplateId, signal.SignalId);
            }else if(signal.SignalCategory == 2){//开关量
            	signal.Unit = "";
            }
        
            dbHelper = new DatabaseHelper();
            StringBuilder sb=new StringBuilder();
            sb.append("UPDATE TBL_Signal SET Enable = %s, Visible = %s, SignalName = '%s', ");
            sb.append("SignalCategory = %s, SignalType = %s, ChannelNo = %s, ChannelType = %s, Expression = '%s', "); 
            sb.append("DataType = %s,ShowPrecision = %s, Unit = '%s', StoreInterval = %s, AbsValueThreshold = %s, PercentThreshold = %s, ");
            sb.append("ChargeStoreInterVal = %s, ChargeAbsValue = %s, StaticsPeriod = %s, BaseTypeId = %s "); 
            sb.append("WHERE EquipmentTemplateId = %s AND SignalId = %s;");

            String sql = sb.toString();
            sql = String.format(sql, signal.Enable ? 1 : 0,signal.Visible ? 1 : 0, signal.SignalName,
            		signal.SignalCategory,signal.SignalType, signal.ChannelNo, signal.ChannelType, signal.Expression, 
            		signal.DataType == null ? "NULL" : signal.DataType,signal.ShowPrecision, signal.Unit, 
            		signal.StoreInterval == null ? "NULL" : signal.StoreInterval, 
            		signal.AbsValueThreshold == null ? "NULL" : signal.AbsValueThreshold, 
            		signal.PercentThreshold == null ? "NULL" : signal.PercentThreshold,
            		signal.ChargeStoreInterVal == null ? "NULL" : signal.ChargeStoreInterVal,
            		signal.ChargeAbsValue == null ? "NULL" : signal.ChargeAbsValue,
            		signal.StaticsPeriod == null ? "NULL" : signal.StaticsPeriod, 
            		signal.BaseTypeId == null ? "NULL" : signal.BaseTypeId, 
            		signal.EquipmentTemplateId, signal.SignalId);
            
            dbHelper.executeNoQuery(sql);
            
            return "OK";
		} catch (Exception e) {
			log.error("InsertSignal() failed.", e);
			return "ERROR";
		} finally {
			if(dbHelper != null) dbHelper.close();
		}
	}
	
	public String DeleteSignal(int equipmentTemplateId,int signalId){
		DatabaseHelper dbHelper = null;
		try{
            dbHelper = new DatabaseHelper();
            String sql = String.format("DELETE FROM TBL_Signal WHERE EquipmentTemplateId = %s AND SignalId = %s;",
            		equipmentTemplateId,signalId);
            dbHelper.executeNoQuery(sql);
            
            sql = String.format("DELETE FROM TBL_SignalMeanings WHERE EquipmentTemplateId = %s AND SignalId = %s;",
            		equipmentTemplateId,signalId);
            dbHelper.executeNoQuery(sql);
            
            return "TRUE";
		} catch (Exception e) {
			log.error("fail to get Commmunication event", e);
			return "FALSE";
		} finally {
			if(dbHelper != null) dbHelper.close();
		}
	}
	
	public String GetNextSignalId(int equipmentTemplateId,String type){
		DatabaseHelper dbHelper = null;
		try{
            dbHelper = new DatabaseHelper();
            String sql = "";
            if(type.equals("Signal"))
            	sql = String.format("SELECT MAX(SignalId) AS MaxSignalId FROM TBL_Signal WHERE EquipmentTemplateId = %s;",equipmentTemplateId);
            else if(type.equals("Event"))
            	sql = String.format("SELECT MAX(EventId) AS MaxSignalId FROM TBL_Event WHERE EquipmentTemplateId = %s;",equipmentTemplateId);
            else
            	sql = String.format("SELECT MAX(ControlId) AS MaxSignalId FROM TBL_Control WHERE EquipmentTemplateId = %s;",equipmentTemplateId);
            
            DataTable dt = dbHelper.executeToTable(sql);
            int maxId = -3;
            if(dt.getRowCount() > 0){
            	Object obj = dt.getRows().get(0).getValue("MaxSignalId");
            	if(obj != null && !obj.toString().equalsIgnoreCase("null"))
            		maxId = Integer.parseInt(obj.toString());
            }
            if(maxId == -3){
            	sql = String.format("SELECT EquipmentCategory FROM tbl_equipmenttemplate WHERE EquipmentTemplateId = %s;",equipmentTemplateId);
            	dt = dbHelper.executeToTable(sql);
            	int equipmentCategory = 0;
            	if(dt.getRowCount() > 0){
            		equipmentCategory = Integer.parseInt(dt.getRows().get(0).getValueAsString("EquipmentCategory"));
            		maxId = equipmentCategory*10000000+11;
                }
            }else{
            	maxId = ((int)(maxId/10)+1)*10;
            }
            return String.valueOf(maxId);
		} catch (Exception e) {
			log.error("fail to get Commmunication event", e);
			return "";
		} finally {
			if(dbHelper != null) dbHelper.close();
		}
	}
	
	public int GetNextDiaplayIndex(int equipmentTemplateId,String type){
		DatabaseHelper dbHelper = null;
		try{
            dbHelper = new DatabaseHelper();
            String sql = "";
            if(type.equals("Signal"))
            	sql = String.format("SELECT Max(DisplayIndex) AS MaxDiaplayIndex FROM TBL_Signal WHERE EquipmentTemplateId = %s AND SignalId <> -3;",equipmentTemplateId);
            else if(type.equals("Event"))
            	sql = String.format("SELECT Max(DisplayIndex) AS MaxDiaplayIndex FROM TBL_Event WHERE EquipmentTemplateId = %s AND EventId <> -3;",equipmentTemplateId);
            else
            	sql = String.format("SELECT Max(DisplayIndex) AS MaxDiaplayIndex FROM TBL_Control WHERE EquipmentTemplateId = %s",equipmentTemplateId);
            
            DataTable dt = dbHelper.executeToTable(sql);
            int maxId = 0;
            if(dt.getRowCount() > 0){
            	Object obj = dt.getRows().get(0).getValue("MaxDiaplayIndex");
            	if(obj != null && !obj.toString().equalsIgnoreCase("null"))
            		maxId = Integer.parseInt(obj.toString());
            }
            
            return ++maxId;
		} catch (Exception e) {
			log.error("fail to get Commmunication event", e);
			return 999;
		} finally {
			if(dbHelper != null) dbHelper.close();
		}
	}
	
	public String SaveEventCondition(int equipmentTemplateId,int eventId,ArrayList<EventCondition> list){
		DatabaseHelper dbHelper = null;
		try{
            dbHelper = new DatabaseHelper();
            DeleteEventConditionById(equipmentTemplateId, eventId);
            for(EventCondition ec : list){
            	EventConditionProvider.getInstance().InsertEventCondition(ec.EventConditionId, 
            			ec.EquipmentTemplateId, ec.EventId, ec.StartOperation, ec.StartCompareValue, 
            			ec.StartDelay, ec.EndOperation, ec.EndCompareValue, ec.EndDelay, ec.Frequency, 
            			ec.FrequencyThreshold, ec.Meanings, ec.EquipmentState, ec.BaseTypeId, ec.EventSeverity, 
            			ec.StandardName);
            }
            return "OK";
		} catch (Exception e) {
			log.error("fail to get Commmunication event", e);
			return "ERROR";
		} finally {
			if(dbHelper != null) dbHelper.close();
		}
	}

	private boolean DeleteEventConditionById(int equipmentTemplateId,int eventId){
		DatabaseHelper dbHelper = null;
		try{
            dbHelper = new DatabaseHelper();
            String sql = String.format("DELETE FROM TBL_EventCondition WHERE EquipmentTemplateId = %s AND EventId = %s;",
            		equipmentTemplateId,eventId);
            dbHelper.executeNoQuery(sql);
            return true;
		} catch (Exception e) {
			log.error("fail to get Commmunication event", e);
			return false;
		} finally {
			if(dbHelper != null) dbHelper.close();
		}
	}

	public String BatchModifyEventCondition(int templateId, HashMap<Integer,Double> maps){
		DatabaseHelper dbHelper = null;
		try {
			dbHelper = new DatabaseHelper();
			String sql = "";
			for (Integer key : maps.keySet()){
				Double value = maps.get(key);
				sql = String.format("UPDATE TBL_EventCondition SET StartCompareValue = '%s' WHERE EquipmentTemplateId = %d AND EventId = %d;",value,templateId,key);
				dbHelper.executeNoQuery(sql);
			}
			return "OK";
		} catch (Exception e) {
			log.error("BatchModifyEventCondition() failed.", e);
			return "ERROR";
		} finally {
			if(dbHelper != null) dbHelper.close();
		}
	}

	public String SaveEvent(Event event){
		DatabaseHelper dbHelper = null;
		try {
			dbHelper = new DatabaseHelper();
			StringBuffer sql = new StringBuffer();
			sql.append("UPDATE TBL_Event ");
			sql.append("SET EventName = '%s',StartType = %s,EndType = %s,StartExpression = '%s',");
			sql.append("EventCategory = %s,SignalId = %s,`Enable` = %s,Visible = %s ");
			sql.append("WHERE EquipmentTemplateId = %s AND EventId = %s;");
			dbHelper.executeNoQuery(String.format(sql.toString(), 
					event.EventName,event.StartType,event.EndType,event.StartExpression,
					event.EventCategory,event.SignalId == null ? "NULL" : event.SignalId,event.Enable ? 1 : 0,event.Visible ? 1 : 0,
					event.EquipmentTemplateId,event.EventId));
			return "OK";
		} catch (Exception e) {
			log.error("InsertSignal() failed.", e);
			return "ERROR";
		} finally {
			if(dbHelper != null) dbHelper.close();
		}
	}
	
	public String DeleteEvent(int equipmentTemplateId,int eventId){
		DatabaseHelper dbHelper = null;
		try{
            dbHelper = new DatabaseHelper();
            String sql = String.format("DELETE FROM TBL_Event WHERE EquipmentTemplateId = %s AND EventId = %s;",
            		equipmentTemplateId,eventId);
            dbHelper.executeNoQuery(sql);
            
            sql = String.format("DELETE FROM TBL_EventCondition WHERE EquipmentTemplateId = %s AND EventId = %s;",
            		equipmentTemplateId,eventId);
            dbHelper.executeNoQuery(sql);
            
            return "TRUE";
		} catch (Exception e) {
			log.error("fail to get Commmunication event", e);
			return "FALSE";
		} finally {
			if(dbHelper != null) dbHelper.close();
		}
	}
	
	public String SaveControlMeanings(int equipmentTemplateId,int controlId,ArrayList<ControlMeanings> smList){
		DatabaseHelper dbHelper = null;
		try{
            dbHelper = new DatabaseHelper();
            DeleteControlMeaningsById(equipmentTemplateId, controlId);
            for(ControlMeanings cm : smList){
            	ControlMeaningsProvider.getInstance().InsertControlMeanings(equipmentTemplateId, controlId, cm.ParameterValue, cm.Meanings);
            }
            return "OK";
		} catch (Exception e) {
			log.error("fail to get Commmunication event", e);
			return "ERROR";
		} finally {
			if(dbHelper != null) dbHelper.close();
		}
	}
	/**  根据模板编号和信号编号删除信号含义  */
	private boolean DeleteControlMeaningsById(int equipmentTemplateId,int controlId){
		DatabaseHelper dbHelper = null;
		try{
            dbHelper = new DatabaseHelper();
            String sql = String.format("DELETE FROM TBL_ControlMeanings WHERE EquipmentTemplateId = %s AND ControlId = %s;",
            		equipmentTemplateId,controlId);
            dbHelper.executeNoQuery(sql);
            return true;
		} catch (Exception e) {
			log.error("fail to get Commmunication event", e);
			return false;
		} finally {
			if(dbHelper != null) dbHelper.close();
		}
	}
	
	public String SaveControl(Control con){
		DatabaseHelper dbHelper = null;
		try {
			dbHelper = new DatabaseHelper();
			StringBuffer sql = new StringBuffer();
			sql.append("UPDATE TBL_Control ");
			sql.append("SET ControlName = '%s',ControlCategory = %s,CmdToken = '%s',ControlSeverity = %s,");
			sql.append("SignalId = %s,TimeOut = %s,Retry = %s,`Enable` = %s,Visible = %s,CommandType = %s,");
			sql.append("ControlType = %s,DataType = %s,`MaxValue` = %s,MinValue = %s,BaseTypeId = %s ");
			sql.append("WHERE EquipmentTemplateId = %s AND ControlId = %s;");
			dbHelper.executeNoQuery(String.format(sql.toString(), 
					con.ControlName,con.ControlCategory,con.CmdToken,con.ControlSeverity,
					con.SignalId,con.TimeOut,con.Retry,con.Enable ? 1 : 0,con.Visible ? 1: 0,con.CommandType,
					con.ControlType,con.DataType,con.MaxValue,con.MinValue,con.BaseTypeId == null ? "NULL" : con.BaseTypeId,
					con.EquipmentTemplateId,con.ControlId));
			return "OK";
		} catch (Exception e) {
			log.error("InsertSignal() failed.", e);
			return "ERROR";
		} finally {
			if(dbHelper != null) dbHelper.close();
		}
	}
	
	public String DeleteControl(int equipmentTemplateId,int controlId){
		DatabaseHelper dbHelper = null;
		try{
            dbHelper = new DatabaseHelper();
            String sql = String.format("DELETE FROM TBL_Control WHERE EquipmentTemplateId = %s AND ControlId = %s;",
            		equipmentTemplateId,controlId);
            dbHelper.executeNoQuery(sql);
            
            sql = String.format("DELETE FROM TBL_ControlMeanings WHERE EquipmentTemplateId = %s AND ControlId = %s;",
            		equipmentTemplateId,controlId);
            dbHelper.executeNoQuery(sql);
            
            return "TRUE";
		} catch (Exception e) {
			log.error("fail to get Commmunication event", e);
			return "FALSE";
		} finally {
			if(dbHelper != null) dbHelper.close();
		}
	}
	
	public String GetMaxChanneNo(int equipmentTemplateId){
		DatabaseHelper dbHelper = null;
		 try
	        {
	            dbHelper = new DatabaseHelper();
	            StringBuilder sb= new StringBuilder();
	            sb.append(String.format("SELECT Max(ChannelNo) AS MaxNo FROM tbl_signal WHERE EquipmentTemplateId = %s;",equipmentTemplateId));
	            DataTable dt = dbHelper.executeToTable(sb.toString());	   
	            String MaxNo = "";
	            if(dt.getRowCount() > 0){
	            	MaxNo = dt.getRows().get(0).getValueAsString("MaxNo");
	            }
	            return MaxNo;
			} catch (Exception e) {
				log.error("fail to get Commmunication event", e);
			} finally {
				if(dbHelper != null) dbHelper.close();
			}
		return "";
	}

	public ArrayList<EquipmentBaseType> GetEquipmentBaseType() {
		DatabaseHelper dbHelper = null;
		 try
	        {
	            dbHelper = new DatabaseHelper();
	            StringBuilder sb= new StringBuilder();
	            sb.append(String.format("SELECT * from TBL_EquipmentBaseType;"));
	            DataTable dt = dbHelper.executeToTable(sb.toString());	
	            return EquipmentBaseType.fromDataTable(dt);
			} catch (Exception e) {
				log.error("GetEquipmentBaseType Exception:", e);
			} finally {
				if(dbHelper != null) dbHelper.close();
			}
		return new ArrayList<EquipmentBaseType>();
	}

	public boolean SaveEquipmentTemplate(EquipmentTemplate e) {
		DatabaseHelper dbHelper = null;
		try {
			dbHelper = new DatabaseHelper();
			StringBuffer sql = new StringBuffer();
			sql.append("UPDATE tbl_EquipmentTemplate ");
			sql.append("SET EquipmentCategory = %s,EquipmentTemplateName = '%s',EquipmentBaseType = %s,Vendor ='%s',Property = '%s' ");
			sql.append("WHERE EquipmentTemplateId = %s ;");
			String sb = String.format(sql.toString(), 
					e.EquipmentCategory,e.EquipmentTemplateName,
					e.EquipmentBaseType,e.Vendor,e.Property,e.EquipmentTemplateId);
			dbHelper.executeNoQuery(sb);
			return true;
		} catch (Exception e1) {
			log.error("SaveEquipmentTemplate Exception:", e1);
			return false;
		} finally {
			if(dbHelper != null) dbHelper.close();
		}
	}
	
	public String GetEquipmentBaseTypeById(String id){
		DatabaseHelper dbHelper = null;
		 try
	        {
	            dbHelper = new DatabaseHelper();
	            StringBuilder sb= new StringBuilder();
	            sb.append(String.format("SELECT EquipmentBaseType FROM TBL_EquipmentTemplate WHERE EquipmentTemplateId = %s;",id));
	            DataTable dt = dbHelper.executeToTable(sb.toString());	
	            if(dt.getRowCount() > 0)
	            	return dt.getRows().get(0).getValueAsString("EquipmentBaseType");
			} catch (Exception e) {
				log.error("GetEquipmentBaseType Exception:", e);
			} finally {
				if(dbHelper != null) dbHelper.close();
			}
		return "undefined";
	}
	
	public ArrayList<BaseTypeDic> GetBaseDicByBaseType(String type,String baseType) {
		DatabaseHelper dbHelper = null;
		 try
	        {
	            dbHelper = new DatabaseHelper();
	            StringBuilder sb= new StringBuilder();
	            sb.append(String.format("SELECT * from TBL_%s WHERE BaseEquipmentId=%s;",type,baseType));
	            DataTable dt = dbHelper.executeToTable(sb.toString());	
	            return BaseTypeDic.fromDataTable(dt);
			} catch (Exception e) {
				log.error("GetEquipmentBaseType Exception:", e);
			} finally {
				if(dbHelper != null) dbHelper.close();
			}
		return new ArrayList<BaseTypeDic>();
	}

	public String InsertBaseType(String type,int equipmentBaseType, int baseTypeId, int startNum, int endNum) {
		DatabaseHelper dbHelper = null;
		String sql="";
		try {
			dbHelper = new DatabaseHelper();
			
			//type:TBL_SignalBaseDic|TBL_EventBaseDic|TBL_CommandBaseDic
			sql = String.format("SELECT * from %s where BaseTypeId=%s AND BaseEquipmentId =%s; ",type,baseTypeId,equipmentBaseType);
			
            DataTable dt = dbHelper.executeToTable(sql);
            if(type.equals("TBL_SignalBaseDic")){
                ArrayList<BaseTypeDic> dics = BaseTypeDic.fromDataTable(dt);
                
                if(endNum == -1){//新增一个
                	InsertBaseTypeDic(dics.get(0), startNum);
                }else{//新增一批
                	for(int i = startNum;i <= endNum;i++){
                		InsertBaseTypeDic(dics.get(0), i);
                	}
                }
            }else if(type.equals("TBL_EventBaseDic")){
                ArrayList<EventBaseTypeDic> dics = EventBaseTypeDic.fromDataTable(dt);
                
                if(endNum == -1){//新增一个
                	InsertEventBaseTypeDic(dics.get(0), startNum);
                }else{//新增一批
                	for(int i = startNum;i <= endNum;i++){
                		InsertEventBaseTypeDic(dics.get(0), i);
                	}
                }
            }else{
            	ArrayList<ControlBaseTypeDic> dics = ControlBaseTypeDic.fromDataTable(dt);
                
                if(endNum == -1){//新增一个
                	InsertControlBaseTypeDic(dics.get(0), startNum);
                }else{//新增一批
                	for(int i = startNum;i <= endNum;i++){
                		InsertControlBaseTypeDic(dics.get(0), i);
                	}
                }
            }
		} catch (Exception e) {
			log.error("InsertBaseType Exception", e);
			return "ERROR";
		}finally{
			if(dbHelper != null) dbHelper.close();
		}
		return "OK";
	}
	
	public boolean InsertBaseTypeDic(BaseTypeDic dic,int no) {
		DatabaseHelper dbHelper = null;
		String sql="";
		try {
			dbHelper = new DatabaseHelper();
			
			//101026001 => 101026 * 100 => 101026000 + no 
			dic.BaseTypeId = ((int)(dic.BaseTypeId/100))*100 + no;
			dic.BaseTypeName = dic.BaseNameExt.replace("{0}", String.valueOf(no));
			dic.IsSystem = false;

			sql = String.format("INSERT INTO TBL_SignalBaseDic VALUES(%s,'%s',%s,'%s',%s,%s,%s,%s,NULL,NULL,NULL,NULL,NULL,NULL,%s,NULL,NULL,NULL,NULL,%s,%s,NULL,NULL,'%s',%s);",
					dic.BaseTypeId,dic.BaseTypeName,dic.BaseEquipmentId,dic.EnglishName,
					dic.BaseLogicCategoryId,dic.StoreInterval,dic.AbsValueThreshold,dic.PercentThreshold,
					dic.UnitId,dic.BaseShowPrecision,dic.BaseStatPeriod,dic.BaseNameExt,dic.IsSystem?"1":"0");			
	
            dbHelper.executeNoQuery(sql);
		} catch (Exception e) {
			log.error("InsertBaseType Exception", e);
		}finally{
			if(dbHelper != null) dbHelper.close();
		}
		return true;
	}

	public boolean InsertEventBaseTypeDic(EventBaseTypeDic dic,int no) {
		DatabaseHelper dbHelper = null;
		String sql="";
		try {
			dbHelper = new DatabaseHelper();
			
			//101026001 => 101026 * 100 => 101026000 + no 
			dic.BaseTypeId = ((int)(dic.BaseTypeId/100))*100 + no;
			dic.BaseTypeName = dic.BaseNameExt.replace("{0}", String.valueOf(no));
			dic.IsSystem = false;
			
			sql = String.format("INSERT INTO TBL_EventBaseDic VALUES(%s,'%s',%s,'%s',%s,NULL,%s,%s,NULL,NULL,NULL,NULL,NULL,NULL,'%s','%s',%s);",
				dic.BaseTypeId,dic.BaseTypeName,dic.BaseEquipmentId,dic.EnglishName,
				dic.EventSeverityId,dic.BaseLogicCategoryId,dic.StartDelay,dic.Description,
				dic.BaseNameExt,dic.IsSystem?"1":"0");
	
            dbHelper.executeNoQuery(sql);
		} catch (Exception e) {
			log.error("InsertEventBaseTypeDic Exception", e);
		}finally{
			if(dbHelper != null) dbHelper.close();
		}
		return true;
	}

	public boolean InsertControlBaseTypeDic(ControlBaseTypeDic dic,int no) {
		DatabaseHelper dbHelper = null;
		String sql="";
		try {
			dbHelper = new DatabaseHelper();
			
			//101026001 => 101026 * 100 => 101026000 + no 
			dic.BaseTypeId = ((int)(dic.BaseTypeId/100))*100 + no;
			dic.BaseTypeName = dic.BaseNameExt.replace("{0}", String.valueOf(no));
			dic.IsSystem = false;
			
			sql = String.format("INSERT INTO TBL_CommandBaseDic VALUES(%s,'%s',%s,'%s',%s,%s,%s,NULL,NULL,NULL,'%s','%s',%s);",
					dic.BaseTypeId,dic.BaseTypeName,dic.BaseEquipmentId,dic.EnglishName,
					dic.BaseLogicCategoryId,dic.CommandType,dic.BaseStatusId,
					dic.Description,dic.BaseNameExt,dic.IsSystem?"1":"0");
	
            dbHelper.executeNoQuery(sql);
		} catch (Exception e) {
			log.error("InsertControlBaseTypeDic Exception", e);
		}finally{
			if(dbHelper != null) dbHelper.close();
		}
		return true;
	}
	
	public boolean DeleteBaseDic(String type,int baseTypeId){
		DatabaseHelper dbHelper = null;
		String sql = "";
		try {
			dbHelper = new DatabaseHelper();
			//Type:SignalBaseDic|EventBaseDic|CommandBaseDic
			sql = String.format("DELETE FROM TBL_%s WHERE BaseTypeId = %s;",type,baseTypeId);

            dbHelper.executeNoQuery(sql);
		} catch (Exception e) {
			log.error("DeleteSignalBaseDic Exception", e);
			return false;
		}finally{
			if(dbHelper != null) dbHelper.close();
		}
		return true;
	}

	public String shieldEnableEvent(String equipmentTemplateId,String eventId,int enable){
		DatabaseHelper dbHelper = null;
		String sql = "";
		try {
			dbHelper = new DatabaseHelper();

			if(eventId == null || eventId.equals(""))
				sql = String.format("UPDATE TBL_Event SET `Enable` = %s WHERE EquipmentTemplateId = %s;",enable,equipmentTemplateId);
			else
				sql = String.format("UPDATE TBL_Event SET `Enable` = %s WHERE EquipmentTemplateId = %s AND EventId = %s;",enable,equipmentTemplateId,eventId);

			dbHelper.executeNoQuery(sql);
		} catch (Exception e) {
			log.error("ShieldEnableEvent Exception", e);
			return "Error";
		}finally{
			if(dbHelper != null) dbHelper.close();
		}
		return "Succeed";
	}

	//region 导出协议
	/** 导出协议 */
	public String exportProtocol(String templateId){
		try{
			//一、根据设备模板编号查询EquipmentTemplate、Sampler、Signal、Event、Control
			int equipmentTemplateId = Integer.parseInt(templateId);
			//	获取设备模板
			ArrayList<EquipmentTemplate> templates = EquipmentTemplateProvider.getInstance().GetEquipmentTemplate(equipmentTemplateId);
			if(templates.size() <= 0) return "EquipmentTemplateIdError";
			EquipmentTemplate template = templates.get(0);
            //-------------------------------------------
            System.out.println("EquipmentTemplate EquipmentTemplateId:"+template.EquipmentTemplateId+", EquipmentTemplateName:"+template.EquipmentTemplateName);
            //-------------------------------------------
			//	获取信号列表
			ArrayList<Signal> signals = SignalProvider.getInstance().GetSignalsById(equipmentTemplateId);
			ArrayList<SignalMeanings> signalMeanings = SignalMeaningsProvider.getInstance().GetSignalMeaningsById(equipmentTemplateId);
            //-------------------------------------------
            System.out.println("Signal Size:"+signals.size()+", SignalMeanings Size:"+signalMeanings.size());
            //-------------------------------------------
			//	获取事件列表
			ArrayList<Event> events = EventProvider.getInstance().GetEventById(equipmentTemplateId);
			ArrayList<EventCondition> eventConditions = EventConditionProvider.getInstance().GetEventConditionById(equipmentTemplateId);
            //-------------------------------------------
            System.out.println("Event Size:"+events.size()+", EventCondition Size:"+eventConditions.size());
            //-------------------------------------------
			//	获取控制列表
			ArrayList<Control> controls = ControlProvider.getInstance().GetControlsById(equipmentTemplateId);
			ArrayList<ControlMeanings> controlMeanings = ControlMeaningsProvider.getInstance().GetControlMeaningsById(equipmentTemplateId);
            //-------------------------------------------
            System.out.println("Control Size:"+controls.size()+", ControlMeanings Size:"+controlMeanings.size());
            //-------------------------------------------
			//	获取采集器
			DataTable dataTable = SamplerProvider.getInstance().GetSamplersByEquipTemplate(equipmentTemplateId);
			ArrayList<Sampler> samplers = Sampler.fromDataTable(dataTable);
			if(samplers.size() <= 0) return "ProtocolCodeError";
			Sampler sampler = samplers.get(0);
            //-------------------------------------------
            System.out.println("Sampler SamplerName:"+sampler.SamplerName+", DllPath:"+sampler.DllPath);
            //-------------------------------------------

			//二、生成Element对象
			Document document = DocumentHelper.createDocument();
			//	生成设备模板Element对象
			Element root = document.addElement("EquipmentTemplates");
			root.addAttribute("Name","设备模板列表");
			Element templateEmt = root.addElement("EquipmentTemplate");
			parseEquipmentTemplate(templateEmt,template);
			//	生成信号列表Element对象
			Element signalsEmt = templateEmt.addElement("Signals");
			signalsEmt.addAttribute("Name","模板信号");
			parseSignals(signalsEmt,signals,signalMeanings);
			//	生成事件列表Element对象
			Element eventsEmt = templateEmt.addElement("Events");
			eventsEmt.addAttribute("Name","模板事件");
			parseEvents(eventsEmt,events,eventConditions);
			//	生成控制列表Element对象
			Element controlsEmt = templateEmt.addElement("Controls");
			controlsEmt.addAttribute("Name","模板控制");
			parseControls(controlsEmt,controls,controlMeanings);
			//	生成采集器Element对象
			Element samplersEmt = root.addElement("Samplers");
			Element samplerEmt = samplersEmt.addElement("Sampler");
			parseSampler(samplerEmt,sampler);

			//三、生成XML文件
			//  设置生成xml的格式 设置编码格式
			OutputFormat format = OutputFormat.createPrettyPrint();
			format.setEncoding("UTF-8");//UTF-8
			//获取协议包名称
			int index = sampler.DllPath.indexOf(".");
			String protocolName = sampler.DllPath.substring(0,index);
			//	判断文件夹是否存在
            String path = join(BasePath.getWebDirByEnv("/web/upload/"+protocolName));
            File pathFile = new File(path);
            if(pathFile.exists())
				ZipUtils.delFolder(path);//删除源文件夹
            pathFile.mkdirs();

			//  生成xml文件
			String filePath = join(path+"/"+protocolName+".xml");
			File file = new File(filePath);
			file.createNewFile();

			XMLWriter writer = new XMLWriter(new FileOutputStream(file), format);
            writer.write(document);
            writer.close();

			//四、将so复制到path目录里
			copyDllFile(sampler.DllPath,path);

			//五、打包.ZIP 返回.zip包名
			//	判断压缩包是否存在
			String zipPath = join(path+".zip");
			File zipFile = new File(zipPath);
			if(zipFile.exists())
				zipFile.delete();
			ZipUtils.toZip4j(zipPath,path);
			return String.format("%s.zip",protocolName);
		}catch (Exception ex){
			log.error("ExportProtocol Exception:",ex);
			return "Error";
		}
	}

	//region 生成Element对象
	//给设备模板属性赋值
	private void parseEquipmentTemplate(Element et,EquipmentTemplate template){
		et.addAttribute("EquipmentTemplateId",valueOfString(template.EquipmentTemplateId));
		et.addAttribute("ParentTemplateId",valueOfString(template.ParentTemplateId));
		et.addAttribute("EquipmentTemplateName",template.EquipmentTemplateName);
		et.addAttribute("ProtocolCode",template.ProtocolCode);
		et.addAttribute("EquipmentCategory",valueOfString(template.EquipmentCategory));
		et.addAttribute("EquipmentType",valueOfString(template.EquipmentType));
		et.addAttribute("Memo",template.Memo);
		et.addAttribute("Property",template.Property);
		et.addAttribute("Decription",template.Description);
		et.addAttribute("EquipmentStyle",template.EquipmentStyle);
		et.addAttribute("Unit",template.Unit);
		et.addAttribute("Vendor",template.Vendor);
		et.addAttribute("EquipmentBaseType",valueOfString(template.EquipmentBaseType));
		et.addAttribute("StationCategory",valueOfString(template.StationCategory));
	}
	//生成信号列表Element对象集合
	private void parseSignals(Element et,ArrayList<Signal> signals,ArrayList<SignalMeanings> meanings){
		for(Signal signal : signals){
			Element signalEmt = et.addElement("Signal");

			signalEmt.addAttribute("SignalId",valueOfString(signal.SignalId));
			signalEmt.addAttribute("SignalName",signal.SignalName);
			signalEmt.addAttribute("SignalCategory",valueOfString(signal.SignalCategory));
			signalEmt.addAttribute("SignalType",valueOfString(signal.SignalType));
			signalEmt.addAttribute("ChannelNo",valueOfString(signal.ChannelNo));
			signalEmt.addAttribute("ChannelType",valueOfString(signal.ChannelType));
			signalEmt.addAttribute("Expression",signal.Expression);
			signalEmt.addAttribute("DataType",valueOfString(signal.DataType));
			signalEmt.addAttribute("ShowPrecision",signal.ShowPrecision);
			signalEmt.addAttribute("Unit",signal.Unit);
			signalEmt.addAttribute("StoreInterval",valueOfString(signal.StoreInterval));
			signalEmt.addAttribute("AbsValueThreshold",valueOfString(signal.AbsValueThreshold));
			signalEmt.addAttribute("PercentThreshold",valueOfString(signal.PercentThreshold));
			signalEmt.addAttribute("StaticsPeriod",valueOfString(signal.StaticsPeriod));
			signalEmt.addAttribute("Enable",valueOfString(signal.Enable));
			signalEmt.addAttribute("Visible",valueOfString(signal.Visible));
			signalEmt.addAttribute("Discription",signal.Description);//错别字
			signalEmt.addAttribute("BaseTypeId",valueOfString(signal.BaseTypeId));
			signalEmt.addAttribute("ChargeStoreInterVal",valueOfString(signal.ChargeStoreInterVal));
			signalEmt.addAttribute("ChargeAbsValue",valueOfString(signal.ChargeAbsValue));
			signalEmt.addAttribute("DisplayIndex",valueOfString(signal.DisplayIndex));
			signalEmt.addAttribute("MDBSignalId",valueOfString(signal.MDBSignalId));
			signalEmt.addAttribute("ModuleNo",valueOfString(signal.ModuleNo));
			signalEmt.addAttribute("SignalProperty","27");
			if(signal.SignalCategory == 2)
				signalEmt.addAttribute("SignalMeanings",getSignalMeanings(meanings,signal.SignalId));
			else
				signalEmt.addAttribute("SignalMeanings","");
		}
	}
	//	根据信号编号获取信号含义
	private String getSignalMeanings(ArrayList<SignalMeanings> meanings,int signalId){
		ArrayList<SignalMeanings> list = new ArrayList<SignalMeanings>();

		for (SignalMeanings meaning : meanings){
			if(meaning.SignalId == signalId)
				list.add(meaning);
		}

		String result = "";
		for (SignalMeanings meaning : list){
			if(result.length() == 0)
				result = String.format("%s:%s",meaning.StateValue,meaning.Meanings);
			else
				result += String.format(";%s:%s",meaning.StateValue,meaning.Meanings);
		}
		return result;
	}
	//生成事件列表Element对象集合
	private void parseEvents(Element et,ArrayList<Event> events,ArrayList<EventCondition> conditions){
		for (Event event : events){
			Element eventEmt = et.addElement("Event");

			eventEmt.addAttribute("EventId",valueOfString(event.EventId));
			eventEmt.addAttribute("EventName",event.EventName);
			eventEmt.addAttribute("EventCategory",valueOfString(event.EventCategory));
			eventEmt.addAttribute("StartType",valueOfString(event.StartType));
			eventEmt.addAttribute("EndType",valueOfString(event.EndType));
			eventEmt.addAttribute("StartExpression",event.StartExpression);
			eventEmt.addAttribute("SuppressExpression",event.SuppressExpression);
			eventEmt.addAttribute("SignalId",valueOfString(event.SignalId));
			eventEmt.addAttribute("Enable",valueOfString(event.Enable));
			eventEmt.addAttribute("Visible",valueOfString(event.Visible));
			eventEmt.addAttribute("Description",event.Description);
			eventEmt.addAttribute("DisplayIndex",valueOfString(event.DisplayIndex));
			eventEmt.addAttribute("ModuleNo",valueOfString(event.ModuleNo));

			Element conditionsEmt = eventEmt.addElement("Conditions");
			parseEventConditions(conditionsEmt,conditions,event.EventId);
		}
	}
	private void parseEventConditions(Element et,ArrayList<EventCondition> conditions,int eventId){
		for (EventCondition condition : conditions){
			if(condition.EventId == eventId){
				Element eventCondition = et.addElement("EventCondition");

				eventCondition.addAttribute("EventConditionId",valueOfString(condition.EventConditionId));
				eventCondition.addAttribute("EventSeverity",valueOfString(condition.EventSeverity));
				eventCondition.addAttribute("StartOperation",condition.StartOperation);
				eventCondition.addAttribute("StartCompareValue",valueOfString(condition.StartCompareValue));
				eventCondition.addAttribute("StartDelay",valueOfString(condition.StartDelay));
				eventCondition.addAttribute("EndOperation",condition.EndOperation);
				eventCondition.addAttribute("EndCompareValue",valueOfString(condition.EndCompareValue));
				eventCondition.addAttribute("EndDelay",valueOfString(condition.EndDelay));
				eventCondition.addAttribute("Frequency",valueOfString(condition.Frequency));
				eventCondition.addAttribute("FrequencyThreshold",valueOfString(condition.FrequencyThreshold));
				eventCondition.addAttribute("Meanings",condition.Meanings);
				eventCondition.addAttribute("EquipmentState",valueOfString(condition.EquipmentState));
				eventCondition.addAttribute("BaseTypeId",valueOfString(condition.BaseTypeId));
				eventCondition.addAttribute("StandardName",valueOfString(condition.StandardName));
			}
		}
	}
	//生成控制列表Element对象集合
	private void parseControls(Element et,ArrayList<Control> controls,ArrayList<ControlMeanings> meanings){
		for (Control control : controls){
			Element controlEmt = et.addElement("Control");

			controlEmt.addAttribute("ControlId",valueOfString(control.ControlId));
			controlEmt.addAttribute("ControlName",control.ControlName);
			controlEmt.addAttribute("ControlCategory",valueOfString(control.ControlCategory));
			controlEmt.addAttribute("CmdToken",control.CmdToken);
			controlEmt.addAttribute("BaseTypeId",valueOfString(control.BaseTypeId));
			controlEmt.addAttribute("ControlSeverity",valueOfString(control.ControlSeverity));
			controlEmt.addAttribute("SignalId",valueOfString(control.SignalId));
			controlEmt.addAttribute("TimeOut",valueOfString(control.TimeOut));
			controlEmt.addAttribute("Retry",valueOfString(control.Retry));
			controlEmt.addAttribute("Description",control.Description);
			controlEmt.addAttribute("Enable",valueOfString(control.Enable));
			controlEmt.addAttribute("Visible",valueOfString(control.Visible));
			controlEmt.addAttribute("DisplayIndex",valueOfString(control.DisplayIndex));
			controlEmt.addAttribute("CommandType",valueOfString(control.CommandType));
			controlEmt.addAttribute("ControlType",valueOfString(control.ControlType));
			controlEmt.addAttribute("DataType",valueOfString(control.DataType));
			controlEmt.addAttribute("MaxValue",valueOfString(control.MaxValue));
			controlEmt.addAttribute("MinValue",valueOfString(control.MinValue));
			controlEmt.addAttribute("DefaultValue",valueOfString(control.DefaultValue));
			controlEmt.addAttribute("ModuleNo",valueOfString(control.ModuleNo));

			if(control.ControlCategory == 2)
				controlEmt.addAttribute("ControlMeanings",getControlMeanings(meanings,control.ControlId));
			else
				controlEmt.addAttribute("ControlMeanings","");
		}
	}
	private String getControlMeanings(ArrayList<ControlMeanings> meanings,int controlId){
		ArrayList<ControlMeanings> list = new ArrayList<ControlMeanings>();

		for (ControlMeanings meaning : meanings){
			if(meaning.ControlId == controlId)
				list.add(meaning);
		}

		String result = "";
		for (ControlMeanings meaning : list){
			if(result.length() == 0)
				result = String.format("%s:%s",meaning.ParameterValue,meaning.Meanings);
			else
				result += String.format(";%s:%s",meaning.ParameterValue,meaning.Meanings);
		}
		return result;
	}
	//生成采集器Element对象
	private void parseSampler(Element et,Sampler sampler){
		et.addAttribute("SamplerId",valueOfString(sampler.SamplerId));
		et.addAttribute("SamplerName",sampler.SamplerName);
		et.addAttribute("SamplerType",valueOfString(sampler.SamplerType));
		et.addAttribute("ProtocolCode",sampler.ProtocolCode);
		et.addAttribute("DllCode",sampler.DLLCode);
		et.addAttribute("DLLVersion",sampler.DLLVersion);
		et.addAttribute("ProtocolFilePath",sampler.ProtocolFilePath);
		et.addAttribute("DLLFilePath",sampler.DLLFilePath);
		et.addAttribute("DllPath",sampler.DllPath);
		et.addAttribute("Setting",sampler.Setting);
		et.addAttribute("Description",sampler.Description);
	}
	//endregion

	//复制so库到备份中
	private boolean copyDllFile(String dllPath,String aimPath){
		try {
			String soPath = "/home/app/samp/SO/";

			int index = dllPath.lastIndexOf(".");
			String dllFile = dllPath.substring(0,index);
			ArrayList<String> fileList = new ArrayList<String>();
			fileList.add(dllFile+".so");

			ConfigureMoldProvider.getInstance().copyFiles(soPath,fileList,aimPath);
			return true;
		}catch (Exception e){
			log.error("copyDllFile Exception:",e);
			return false;
		}
	}

	private String valueOfString(Object obj){
		try{
			if(obj == null)
				return "";
			return String.valueOf(obj);
		}catch (Exception ex){
			return "";
		}
	}
	//join path
	public String join(String... params) {
		List< String > list = new ArrayList < String > ();
		for (String str: params) {
			if (str != null && str.trim().length() > 0) {
				list.add(str.trim());
			}
		}
		if (list.size() == 0) {
			return ".";
		}
		String prefix = list.get(0);
		String suffix = list.get(list.size() - 1);
		boolean ss = prefix.startsWith("/");
		boolean es = suffix.endsWith("/");
		StringBuilder sb = new StringBuilder();
		for (String str: list) {
			sb.append(str).append("/");
		}
		String[] pathItems = sb.toString().split("[/|\\\\]");
		list.clear();
		for (String str: pathItems) {
			if (str.trim().length() > 0) {
				list.add(str);
			}
		}
		List < String > bufs = new ArrayList < > ();
		if (ss) {
			bufs.add(0, "/");
		}
		for (String str: list) {
			switch (str) {
				case ".":
					break;
				case "..":
					if (bufs.size() < 2) {
						if (ss) {
							bufs.set(0, "/");
						} else {
							bufs.set(0, ".");
						}
					} else {
						bufs.remove(bufs.size() - 1);
					}
					break;
				default:
					bufs.add(str);
					break;
			}
		}
		if (es) {
			bufs.add("/");
		}
		sb = new StringBuilder();
		for (String str: bufs) {
			sb.append(str);
			if (!"/".equals(str)) {
				sb.append("/");
			}
		}
		sb.deleteCharAt(sb.length() - 1);
		return sb.toString();
	}
	//endregion
}
