package nurse.entity.persist;

import java.util.ArrayList;

import nurse.common.DataRowCollection;
import nurse.common.DataTable;

public class EventBaseTypeDic {
	   public Integer BaseTypeId;
	   public String BaseTypeName;
	   public Integer BaseEquipmentId;
	   public String EnglishName;
	   public Integer  EventSeverityId;
	   public Integer BaseLogicCategoryId;
	   public Integer StartDelay;
	   public String Description;
	   public String BaseNameExt;
	   public Boolean IsSystem;
	   
	   public static ArrayList<EventBaseTypeDic> fromDataTable(DataTable dt) {
			ArrayList<EventBaseTypeDic> ds = new ArrayList<EventBaseTypeDic>();
			DataRowCollection drs = dt.getRows();
			int rowCount = dt.getRowCount();
			
			for(int i=0;i<rowCount;i++)
			{
				EventBaseTypeDic b = new EventBaseTypeDic();	
				b.BaseTypeId = Integer.parseInt(drs.get(i).getValueAsString("BaseTypeId"));
				b.BaseTypeName = (String)drs.get(i).getValue("BaseTypeName");
				b.BaseEquipmentId = (Integer)drs.get(i).getValue("BaseEquipmentId");
				b.EnglishName = (String)drs.get(i).getValue("EnglishName");
				b.EventSeverityId = (Integer)drs.get(i).getValue("EventSeverityId");
				b.BaseLogicCategoryId = (Integer)drs.get(i).getValue("BaseLogicCategoryId");
				b.StartDelay = (Integer)drs.get(i).getValue("StartDelay");
				b.Description = (String)drs.get(i).getValue("Description");
				b.BaseNameExt = (String)drs.get(i).getValue("BaseNameExt");
				b.IsSystem = (Boolean)drs.get(i).getValue("IsSystem");
				ds.add(b);
			}		
			return ds;
		}
}
