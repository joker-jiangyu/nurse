package nurse.logic.providers;

import java.util.ArrayList;

import org.apache.log4j.Logger;

import nurse.common.DataTable;
import nurse.entity.persist.SignalMeanings;
import nurse.utility.DatabaseHelper;

public class SignalMeaningsProvider {

	private static SignalMeaningsProvider instance = new SignalMeaningsProvider();
	private static Logger log = Logger.getLogger(SignalMeaningsProvider.class);
	
	public SignalMeaningsProvider() {
	}
	
	public static SignalMeaningsProvider getInstance(){
		return instance;
	}

	public ArrayList<SignalMeanings> getAllSignalMeanings() {
		DatabaseHelper dbHelper = null;
		try
	        {
	            dbHelper = new DatabaseHelper();
	            StringBuilder sb= new StringBuilder();
	            sb.append("select * from tbl_signalmeanings");
	            DataTable dt = dbHelper.executeToTable(sb.toString());
	            
	            return SignalMeanings.fromDataTable(dt);
			} catch (Exception e) {
				log.error("fail to read all sig meanings", e);
			} finally {
				if(dbHelper != null) dbHelper.close();
			}
			
			return null;				
	}
	
	public boolean InsertSignalMeanings(int EquipmentTemplateId, int SignalId, short StateValue, String Meanings) {

		DatabaseHelper dbHelper = null;
		try
	        {
	            dbHelper = new DatabaseHelper();
	            StringBuilder sb=new StringBuilder();
	            sb.append("INSERT INTO TBL_SignalMeanings");
	            sb.append("(EquipmentTemplateId, SignalId, StateValue, Meanings)");
	            sb.append(" VALUES (%d, %d, %d, '%s')");

	            String sql = sb.toString();
	            sql = String.format(sql, EquipmentTemplateId, SignalId, StateValue, Meanings);
	            
	            dbHelper.executeNoQuery(sql);
	            
	            return true;
			} catch (Exception e) {
				log.error("InsertSignalMeanings() failed.", e);
			} finally {
				if(dbHelper != null) dbHelper.close();
			}
			
			return false;
				
	}

	public ArrayList<SignalMeanings> GetSignalMeaningsById(int equipmentTemplateId){
		DatabaseHelper dbHelper = null;
		ArrayList<SignalMeanings> list = new ArrayList<SignalMeanings>();
		 try
	        {
	            dbHelper = new DatabaseHelper();
	            StringBuilder sb= new StringBuilder();
	            sb.append(String.format("SELECT * FROM TBL_SignalMeanings WHERE EquipmentTemplateId=%s;",equipmentTemplateId));
	            DataTable dt = dbHelper.executeToTable(sb.toString());	            
	            list = SignalMeanings.fromDataTable(dt);
			} catch (Exception e) {
				log.error("fail to get Commmunication event", e);
			} finally {
				if(dbHelper != null) dbHelper.close();
			}
		return list;
	}
	
	/**
	 * 根据设备编号与信号编号获取信号含义
	 * @param equipmentId 设备编号
	 * @param signalId 信号编号
	 * @return
	 */
	public ArrayList<SignalMeanings> GetSignalMeaningsByDIdSId(String equipmentId,String signalId){
		DatabaseHelper dbh = null;
		ArrayList<SignalMeanings> list = new ArrayList<SignalMeanings>();
		try {
			dbh = new DatabaseHelper();
			StringBuffer sb = new StringBuffer();
			sb.append("SELECT A.* FROM TBL_SignalMeanings A ");
			sb.append("LEFT JOIN TBL_Signal B ON A.EquipmentTemplateId = B.EquipmentTemplateId ");
			sb.append("	AND A.SignalId = B.SignalId ");
			sb.append("LEFT JOIN TBL_Equipment C ON A.EquipmentTemplateId = C.EquipmentTemplateId ");
			sb.append(String.format("WHERE C.EquipmentId = %s AND B.SignalId = %s;", equipmentId,signalId));
			DataTable dt = dbh.executeToTable(sb.toString());
			list = SignalMeanings.fromDataTable(dt);
		} catch (Exception e) {
			log.error("not data GetSignalMeaningsByDIdSId");
		}finally{
			dbh.close();
		}
		return list;
	}
}
