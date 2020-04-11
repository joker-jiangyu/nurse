package nurse.entity.persist;

import java.util.ArrayList;

import nurse.common.DataRowCollection;
import nurse.common.DataTable;

public class ControlBaseTypeDic {
	   public Integer BaseTypeId;
	   public String BaseTypeName;
	   public Integer BaseEquipmentId;
	   public String EnglishName;
	   public Integer BaseLogicCategoryId;
	   public Integer CommandType;
	   public Integer BaseStatusId;
	   public String Description;
	   public String BaseNameExt;
	   public Boolean IsSystem;
	   
	   public static ArrayList<ControlBaseTypeDic> fromDataTable(DataTable dt) {
			ArrayList<ControlBaseTypeDic> ds = new ArrayList<ControlBaseTypeDic>();
			DataRowCollection drs = dt.getRows();
			int rowCount = dt.getRowCount();
			
			for(int i=0;i<rowCount;i++)
			{
				ControlBaseTypeDic c = new ControlBaseTypeDic();	
				c.BaseTypeId = Integer.parseInt(drs.get(i).getValueAsString("BaseTypeId"));
				c.BaseTypeName = (String)drs.get(i).getValue("BaseTypeName");
				c.BaseEquipmentId = (Integer)drs.get(i).getValue("BaseEquipmentId");
				c.EnglishName = (String)drs.get(i).getValue("EnglishName");
				c.BaseLogicCategoryId = (Integer)drs.get(i).getValue("BaseLogicCategoryId");
				c.CommandType = (Integer)drs.get(i).getValue("CommandType");
				c.BaseStatusId = (Integer)drs.get(i).getValue("BaseStatusId");
				c.BaseNameExt = (String)drs.get(i).getValue("BaseNameExt");
				c.IsSystem = (Boolean)drs.get(i).getValue("IsSystem");
				ds.add(c);
			}		
			return ds;
		}
}
