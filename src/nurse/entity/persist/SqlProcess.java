package nurse.entity.persist;

import java.util.ArrayList;

import nurse.common.DataRowCollection;
import nurse.common.DataTable;

public class SqlProcess {
	
	public long id;
	public String user;
	public String command;
	public int time;
	public String state;
	public String info;
	
	public static ArrayList<SqlProcess> fromDataTable(DataTable dt) {
		ArrayList<SqlProcess> ds = new ArrayList<SqlProcess>();
		DataRowCollection drs = dt.getRows();
		int rowCount = dt.getRowCount();
		
		for(int i=0;i<rowCount;i++)
		{
			SqlProcess sp = new SqlProcess();
			
			sp.id = (long)drs.get(i).getValue("Id");
			sp.user = drs.get(i).getValueAsString("User");
			sp.command = drs.get(i).getValueAsString("Command");
			sp.time = (int)drs.get(i).getValue("Time");
			sp.state = drs.get(i).getValueAsString("State");
			sp.info = drs.get(i).getValueAsString("Info");
			
			ds.add(sp);
		}		
		return ds;
	}
}
