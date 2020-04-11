package nurse.entity.persist;

import java.util.ArrayList;

import nurse.common.DataRowCollection;
import nurse.common.DataTable;

public class Account {
	public Integer userId;
	public String userName;
	public String logonId;
	public String password;
	public Boolean enable;
	public String maxError;
	public Boolean locked;
	public String validTime;
	public String desciption;
	public Boolean isRemote;
	public String centerId;
	
	public Boolean isAdmin;
	
	public static ArrayList<Account> fromDataTable(DataTable dt) {
		ArrayList<Account> acc = new ArrayList<Account>();
		DataRowCollection drs = dt.getRows();
		int rowCount = dt.getRowCount();
		
		for(int i=0;i<rowCount;i++)
		{
			Account a = new Account();
			
			a.userId = Integer.parseInt(drs.get(i).getValueAsString("UserId"));
			a.userName = drs.get(i).getValueAsString("UserName");
			a.logonId = drs.get(i).getValueAsString("LogonId");
			a.password = drs.get(i).getValueAsString("Password");
			a.enable = Boolean.parseBoolean(drs.get(i).getValueAsString("Enable"));
			a.maxError = drs.get(i).getValueAsString("MaxError");
			a.locked = Boolean.parseBoolean(drs.get(i).getValueAsString("Locked"));
			a.validTime = drs.get(i).getValueAsString("ValidTime");
			a.desciption = drs.get(i).getValueAsString("Eesciption");
			a.isRemote = Boolean.parseBoolean(drs.get(i).getValueAsString("IsRemote"));
			a.centerId = drs.get(i).getValueAsString("CenterId");
			
			String roleId = drs.get(i).getValueAsString("RoleId");
			if(roleId.equals("-1")) a.isAdmin = true;
			else a.isAdmin = false;
			
			acc.add(a);
		}
		return acc;
	}

	public static Integer isExist(DataTable dt) {
		DataRowCollection dataRows = dt.getRows();
		Integer num = -1;
		if(dt.getRowCount() > 0){
			num = Integer.parseInt(dataRows.get(0).getValueAsString("num"));
		}
		return num;
	}

	public static Integer findMaxError(DataTable dt) {
		DataRowCollection dataRows = dt.getRows();
		String num = null;
		if(dt.getRowCount() > 0){
			num = dataRows.get(0).getValueAsString("MaxError");
			if(num == null){
				return 0;
			}else{
				return Integer.parseInt(num);
			}

		}

		return 0;
	}

	public static String getTheMostMaxError(DataTable dt) {
		DataRowCollection dataRows = dt.getRows();
		String maxError = null;
		if(dt.getRowCount() > 0){
			maxError = dataRows.get(0).getValueAsString("MaxError");
		}
		return maxError;
	}
}
