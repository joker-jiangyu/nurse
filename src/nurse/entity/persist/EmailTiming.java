package nurse.entity.persist;

import java.util.ArrayList;

import nurse.common.DataRowCollection;
import nurse.common.DataTable;

public class EmailTiming {
	public Integer id;
	public String type;
	public String regularly;
	public String account;
	public String password;
	public String smtpIp;
	public Integer smtpPort; 
	public String description;
	

	public int month;//月
	public int day;//天
	public int week;//周
	public int hour;//时
	public int minute;//分
	public int sec;//秒
	
	public static ArrayList<EmailTiming> fromDataTable(DataTable dt){
		ArrayList<EmailTiming> ets = new ArrayList<EmailTiming>();
		DataRowCollection drs = dt.getRows();
		int rowCount = dt.getRowCount();
		
		for(int i=0;i<rowCount;i++)
		{
			EmailTiming et = new EmailTiming();
			et.id = Integer.parseInt(drs.get(i).getValueAsString("Id"));
			et.type = drs.get(i).getValueAsString("Type");
			et.regularly = drs.get(i).getValueAsString("Regularly");
			et.account = drs.get(i).getValueAsString("Account");
			et.password = drs.get(i).getValueAsString("Password");
			et.smtpIp = drs.get(i).getValueAsString("SmtpIp");
			et.smtpPort = Integer.parseInt(drs.get(i).getValueAsString("SmtpPort"));
			et.description = drs.get(i).getValueAsString("Description");
			
			ets.add(et);
		}		
		return ets;
	} 
}
