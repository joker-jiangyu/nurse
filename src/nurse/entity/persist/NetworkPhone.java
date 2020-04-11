package nurse.entity.persist;

import java.util.ArrayList;

import nurse.common.DataRowCollection;
import nurse.common.DataTable;

public class NetworkPhone {
	public Integer npId;
	public String npIp;
	public Integer npPort;
	public String type;
	public String encoding;
	public String textFormat;
	public String timeType;
	public String timeRegularly;
	public boolean enable;
	public String description;
	
	public int day;//天
	public int week;//周
	public int hour;//时
	public int minute;//分
	
	
	public static ArrayList<NetworkPhone> fromDataTable(DataTable dt) {
		ArrayList<NetworkPhone> nps = new ArrayList<NetworkPhone>();
		
		DataRowCollection drs = dt.getRows();
		int rowCount = dt.getRowCount();
		for(int i=0;i<rowCount;i++)
		{
			NetworkPhone np = new NetworkPhone();
			np.npId = Integer.parseInt(drs.get(i).getValueAsString("NPId"));
			np.npIp = drs.get(i).getValueAsString("NPIP");;
			np.npPort = Integer.parseInt(drs.get(i).getValueAsString("NPPort"));
			np.type = drs.get(i).getValueAsString("Type");
			np.encoding = drs.get(i).getValueAsString("Encoding");
			np.textFormat = drs.get(i).getValueAsString("TextFormat");
			np.timeType = drs.get(i).getValueAsString("TimeType");
			np.timeRegularly = drs.get(i).getValueAsString("TimeRegularly");
			np.enable = (boolean)drs.get(i).getValue("Enable");
			np.description = drs.get(i).getValueAsString("Description");
			
			np.getEmailTiming();
			
			nps.add(np);
		}
		
		return nps;
	}
	
	public void getEmailTiming(){
		if(this.timeType == null || this.timeType.equals("real")) return;
		
		if(this.timeType.equals("day")){
			String[] split = this.timeRegularly.split(":");
			this.hour = Integer.parseInt(split[0]);
			this.minute = Integer.parseInt(split[1]);
		}else{
			String[] split = this.timeRegularly.split(" ");
			String[] split2 = split[1].split(":");
			if(this.timeType.equals("week"))
				this.week = Integer.parseInt(split[0]);
			else
				this.day = Integer.parseInt(split[0]);
			this.hour = Integer.parseInt(split2[0]);
			this.minute = Integer.parseInt(split2[1]);
		}
	}
}
