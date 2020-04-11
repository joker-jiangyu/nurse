package nurse.entity.persist;

import java.util.ArrayList;

import nurse.common.DataRowCollection;
import nurse.common.DataTable;

public class RtspVideo {
	public Integer Id;
	public String VideoName;
	public String Path;
	
	public static ArrayList<RtspVideo> fromDataTable(DataTable dt) {
		ArrayList<RtspVideo> adls = new ArrayList<RtspVideo>();
		
		DataRowCollection drs = dt.getRows();
		int rowCount = dt.getRowCount();
		for(int i=0;i<rowCount;i++)
		{
			RtspVideo adl = new RtspVideo();
			adl.Id = Integer.parseInt(drs.get(i).getValueAsString("Id"));
			adl.VideoName = drs.get(i).getValueAsString("VideoName");
			adl.Path = drs.get(i).getValueAsString("Path");
			
			adls.add(adl);
		}
		return adls;
	}
}
