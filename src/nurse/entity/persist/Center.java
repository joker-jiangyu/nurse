package nurse.entity.persist;

import java.util.ArrayList;
import java.util.Date;
import nurse.common.DataRowCollection;
import nurse.common.DataTable;

public class Center {

	public Center() {
	}

	public int CenterId;
	public String CenterIP;
	public int CenterPort;
	public String CenterDSIP;
	public boolean Enable;
	public boolean IsNeedSync;
	public Date SyncTime;
	public String Description;
	public String ExtendField1;
	public String ExtendField2;
	
	public int getCenterId() {
		return CenterId;
	}

	public void setCenterId(int CenterId) {
		this.CenterId = CenterId;
	}	
	
	public static ArrayList<Center> fromDataTable(DataTable dt) {
		ArrayList<Center> ds = new ArrayList<Center>();
		DataRowCollection drs = dt.getRows();
		int rowCount = dt.getRowCount();
		
		for(int i=0;i<rowCount;i++)
		{
			Center d = new Center();
			
			d.CenterId = (int) drs.get(i).getValue("CenterId");
			d.CenterIP = (String) drs.get(i).getValue("CenterIP");
			d.CenterPort = (int) drs.get(i).getValue("CenterPort");
			d.CenterDSIP = (String) drs.get(i).getValue("IPAddress");
			d.Enable = (boolean) drs.get(i).getValue("Enable");
			d.IsNeedSync = (boolean) drs.get(i).getValue("IsNeedSync");
			d.SyncTime = (Date) drs.get(i).getValue("SyncTime");
			d.Description = (String) drs.get(i).getValue("Description");
			d.ExtendField1 = (String) drs.get(i).getValue("ExtendField1");
			d.ExtendField2 = (String) drs.get(i).getValue("ExtendField2");

			ds.add(d);
		}		
		return ds;
	}
}
