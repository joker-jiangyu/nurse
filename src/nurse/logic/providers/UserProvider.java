package nurse.logic.providers;

import nurse.common.DataTable;
import nurse.entity.persist.Account;
import nurse.entity.persist.UserOperationLog;
import nurse.logic.handlers.DataHandlerBase;
import nurse.utility.DatabaseHelper;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import org.apache.log4j.Logger;

import javax.xml.crypto.Data;

public class UserProvider {

	public UserProvider() {
		
	}
	
	private static UserProvider instance = new UserProvider();
	private static Logger log = Logger.getLogger(UserProvider.class);
	
	public static UserProvider getInstance(){
		return instance;
	}

	public boolean IsUser(String username,String password) {
		DatabaseHelper dbHelper = null;
		try{
			dbHelper = new DatabaseHelper();
			String sql = String.format("select * from tbl_account where logonId='%s' and Password='%s'", username,password);
			DataTable dt = dbHelper.executeToTable(sql);
			if(dt.getRowCount()==0) return false;

			return true;
		} catch (Exception e) {
			log.error("Verify user permissions.", e);
		} finally {
			if(dbHelper != null)dbHelper.close();
		}
		return false;
	}
	
	
	public boolean UpdatePassword(String username, String newpwd){
		
		DatabaseHelper dbHelper = null;
		try
	        {
	          dbHelper = new DatabaseHelper();
	          String sql = String.format("update tbl_account set Password='%s' where LogonId='%s'", newpwd,username);
	          dbHelper.executeNoQuery(sql);
	          return true;
			} catch (Exception e) {
				log.error("Update user password.", e);
			} finally {
				if(dbHelper != null)dbHelper.close();
			}
			
			return false;
	 
	}
	
	public boolean getIsRemote(String userName){
		DatabaseHelper dbHelper = null;
		try{
			dbHelper = new DatabaseHelper();
		    String sql = String.format("select IsRemote from tbl_account where logonId='%s';", userName);
		    DataTable dt = dbHelper.executeToTable(sql);
		    if(dt.getRowCount() > 0){
		    	Boolean isRemote = Boolean.parseBoolean(dt.getRows().get(0).getValueAsString("IsRemote"));
		    	if(isRemote == null || isRemote == false) return false;
		    }
		           	           
		    return true;
		} catch (Exception e) {
			log.error("GetIsRemote Exception.", e);
			return false;
		} finally {
			if(dbHelper != null)dbHelper.close();
		}
	}
	
	public boolean getIsAdmin(String userName){
		DatabaseHelper dbHelper = null;
		try{
			dbHelper = new DatabaseHelper();
		    String sql = String.format("SELECT B.RoleId FROM TBL_Account A LEFT JOIN TBL_UserRoleMap B ON A.UserId = B.UserId WHERE A.LogonId = '%s';", userName);
		    DataTable dt = dbHelper.executeToTable(sql);
		    if(dt.getRowCount() > 0){
		    	String roledId = dt.getRows().get(0).getValueAsString("RoleId");
		    	if(roledId.equals("-1")) return true;
		    	else return false;
		    }
		           	           
		    return false;
		} catch (Exception e) {
			log.error("GetIsRemote Exception.", e);
			return false;
		} finally {
			if(dbHelper != null)dbHelper.close();
		}
	}
	
	public List<Account> getAllAccout(){
		DatabaseHelper dbHelper = null;
		ArrayList<Account> accounts = new ArrayList<Account>();
		try {
			dbHelper = new DatabaseHelper();
			String sql = "SELECT A.*,B.RoleId FROM TBL_Account A LEFT JOIN TBL_UserRoleMap B ON A.UserId = B.UserId;";
			DataTable dt = dbHelper.executeToTable(sql);
			accounts = Account.fromDataTable(dt);
		} catch (Exception e) {
			log.error("getAllAccout exception:", e);
		} finally {
			if(dbHelper != null)dbHelper.close();
		}
		return accounts;
	}
	
	public boolean updateAccount(Account acc){
		DatabaseHelper dbHelper = null;
		try{
          dbHelper = new DatabaseHelper();
          StringBuffer sb = new StringBuffer();
          sb.append(String.format("UPDATE TBL_Account SET UserName = '%s',LogonId = '%s',ValidTime = %s,IsRemote = %s",
				  acc.userName,acc.logonId,acc.validTime.length() == 0 ? "NULL" : String.format("'%s'",acc.validTime),acc.isAdmin == true ? 1 : 0));
          if(acc.password != null)
          	sb.append(String.format(",Password = '%s'",acc.password));
          sb.append(String.format(" WHERE UserId = %s;",acc.userId));
			/********************************************************/
			System.out.println("1 "+sb.toString());
			/********************************************************/
          dbHelper.executeNoQuery(sb.toString());
          
          String roleId = "0";
          if(acc.isAdmin == true)
        	  roleId = "-1";
          String sql = String.format("UPDATE TBL_UserRoleMap SET RoleId = %s WHERE UserId = %s;", roleId, acc.userId);
			/********************************************************/
			System.out.println("2 "+sql);
			/********************************************************/
          dbHelper.executeNoQuery(sql);
          
          return true;
		} catch (Exception e) {
			log.error("updateAccount Exception.", e);
		} finally {
			if (dbHelper != null)dbHelper.close();
		}
		return false;
	}
	
	public boolean insertAccount(Account acc){
		DatabaseHelper dbHelper = null;
		try{
          dbHelper = new DatabaseHelper();
          String sql = "SELECT MAX(UserId) AS 'MaxUserId' FROM TBL_Account;";
          DataTable dt = dbHelper.executeToTable(sql);
          
          int maxUserId = 0; 
          if(dt.getRowCount() > 0)
        	  maxUserId = Integer.parseInt(dt.getRows().get(0).getValueAsString("MaxUserId")) + 1;
          
          String roleId = "0";
          if(acc.isAdmin == true)
        	  roleId = "-1";
          //角色关系表
          sql = String.format("INSERT INTO TBL_UserRoleMap VALUES(%s,%s);",maxUserId,roleId);
			/********************************************************/
			System.out.println("1 "+sql);
			/********************************************************/
          dbHelper.executeNoQuery(sql);
          
          //账号表
          sql = String.format("INSERT INTO TBL_Account(UserId,UserName,LogonId,`Password`,ValidTime,IsRemote,CenterId) VALUES(%s,'%s','%s','%s',%s,%s,null);",
        		  maxUserId,acc.userName,acc.logonId,acc.password,acc.validTime.length() == 0 ? "NULL" : String.format("'%s'",acc.validTime),acc.isAdmin == true ? 1 : 0);
			/********************************************************/
			System.out.println("2 "+sql);
			/********************************************************/
          dbHelper.executeNoQuery(sql);
          return true;
		} catch (Exception e) {
			log.error("insertAccount Exception.", e);
		} finally {
			if(dbHelper != null)dbHelper.close();
		}
		return false;
	}
	
	public boolean deleteAccount(String userId){
		DatabaseHelper dbHelper = null;
		try{
          	dbHelper = new DatabaseHelper();

          	String sql = String.format("SELECT * FROM TBL_Account WHERE UserId = %s;",userId);;
			DataTable dt = dbHelper.executeToTable(sql);
			String loginId = "";
			if(dt.getRowCount() > 0)
				loginId = dt.getRows().get(0).getValueAsString("LogonId");

			//账户表
          	sql = String.format("DELETE FROM TBL_Account WHERE UserId = %s;",userId);
          	dbHelper.executeNoQuery(sql);
          
          	//角色关系表
          	sql = String.format("DELETE FROM TBL_UserRoleMap WHERE UserId = %s;",userId);
          	dbHelper.executeNoQuery(sql);

			//用户操作表记录
			if(loginId.length() > 0){
				sql = String.format("DELETE FROM TBL_UserOperationLog WHERE LogonId = '%s';",loginId);
				dbHelper.executeNoQuery(sql);
			}
          return true;
		} catch (Exception e) {
			log.error("deleteAccount Exception.", e);
		} finally {
			if(dbHelper != null)dbHelper.close();
		}
		return false;
	}

	// 判断是否超时
	public boolean judgeTimeout(String loginId){
		DatabaseHelper dbHelper = null;
		try {
			dbHelper = new DatabaseHelper();
			String sql = String.format("SELECT * FROM TBL_Account WHERE (ValidTime IS NULL OR ValidTime > SYSDATE()) AND LogonId = '%s';",loginId);
			DataTable dt = dbHelper.executeToTable(sql);

			if(dt.getRows().size() > 0)
				return true;
			else
				return  false;
		} catch (Exception e) {
			log.error("judgeTimeout exception:", e);
			return  false;
		} finally {
			if(dbHelper != null) dbHelper.close();
		}
	}

	//获取登录失败次数
	public int getFailureCount(String loginId){
		return 0;
	}

	//添加失败次数
	public boolean addFailureCount(String loginId){
		return true;
	}

	//获取上次登录时间
	public UserOperationLog getLastLoginTime(String loginId){
		DatabaseHelper dbHelper = null;
		UserOperationLog userOper = null;
		try {
			dbHelper = new DatabaseHelper();
			String sql = String.format("SELECT * FROM TBL_UserOperationLog WHERE LogonId = '%s' AND OperationId = 47 ORDER BY Id DESC LIMIT 0,1;",loginId);
			DataTable dt = dbHelper.executeToTable(sql);

			ArrayList<UserOperationLog> list = UserOperationLog.fromDataTable(dt);
			if(list.size() > 0)
			userOper = list.get(0);
		} catch (Exception e) {
			log.error("getLastLoginTime exception:", e);
		} finally {
			if(dbHelper != null) dbHelper.close();
		}
		return userOper;
	}

	public boolean isExist(String s) {
		DatabaseHelper dbHelper = null;
		Account account = null;
		try{
			dbHelper = new DatabaseHelper();
			account = new Account();
			String sql = String.format("SELECT count(0) num FROM TBL_Account WHERE LogonId = '%s' ;",s);
			DataTable dt = dbHelper.executeToTable(sql);
			int num = Account.isExist(dt);
			if(num > 0){
				return true;
			}
		}catch (Exception e){
			log.error("getLastLoginTime exception:", e);
		}finally {
			if(dbHelper != null) dbHelper.close();
		}

		return false;
	}

	/**
	 * maxError +1
	 * @param s
	 * @return
	 */
	public Integer incrMaxError(String s) {
		DatabaseHelper dbHelper = null;
		Account account = null;
		try{
			dbHelper = new DatabaseHelper();
			account = new Account();
			String sql = String.format("select maxError From tbl_account WHERE LogonId = '%s' ;",s);
			DataTable dt = dbHelper.executeToTable(sql);
			//获取该用户的 错误 次数
			Integer num = Account.findMaxError(dt);
			if(num == null)
				num = 0;
			Integer time = null;
			num = num+1;
			if(num == 10){
				//获取当前时间
				Date time1 = new Date();
				//日期格式
				SimpleDateFormat formatter = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
				//日期
				String validTime = formatter.format(time1);
				sql = String.format("update tbl_account set validTime = '%s' , MaxError = null where LogonId = '%s';",validTime,s);
				//更新sql语句， validTime 设置为当前时间
				int a = dbHelper.executeNoQuery(sql);
				System.out.println(a);

				return num;
			}
			sql = String.format("update tbl_account set MaxError = '%s' where LogonId = '%s';",num,s);
			//更新sql语句， validTime 设置为当前时间
			dbHelper.executeNoQuery(sql);
			return num;
		}catch (Exception e){
			log.error("getLastLoginTime exception:", e);
		}finally {
			if(dbHelper != null) dbHelper.close();
		}
		return null;
	}

	/**
	 * 获取当前用户中MaxError最大值
	 * @return
	 */
	public String getTheMostMaxError() {
		DatabaseHelper dbHelper = null;
		String maxError = null;
		try{
			dbHelper = new DatabaseHelper();
			String sql = "select Max(MaxError) MaxError from tbl_account";
			DataTable dt = dbHelper.executeToTable(sql);
			maxError = Account.getTheMostMaxError(dt);
		}catch (Exception e){
			log.error("getLastLoginTime exception:", e);
		}finally {
			if(dbHelper != null) dbHelper.close();
		}
		return maxError;
	}

	/**
	 * 	重置 maxError
	 */
	public void resetMaxError() {
		DatabaseHelper dbHelper = null;
		try{
			dbHelper = new DatabaseHelper();
			String sql = "update tbl_account set MaxError = NULL";	//全部用户 的 maxError 都设为null
			dbHelper.executeNoQuery(sql);
		}catch (Exception e){
			log.error("getLastLoginTime exception:", e);
		}finally {
			if(dbHelper != null) dbHelper.close();
		}
	}
}
