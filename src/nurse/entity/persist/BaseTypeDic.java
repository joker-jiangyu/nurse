package nurse.entity.persist;

import java.util.ArrayList;

import nurse.common.DataRowCollection;
import nurse.common.DataTable;

public class BaseTypeDic {
	   public Integer BaseTypeId;
	   public String BaseTypeName;
	   public Integer BaseEquipmentId;
	   public String EnglishName;
	   public Integer BaseLogicCategoryId;
	   public Integer StoreInterval;
	   public Float AbsValueThreshold;
	   public Float PercentThreshold;
	   public Integer UnitId;
	   public String BaseShowPrecision;
	   public Integer BaseStatPeriod;
	   public String BaseNameExt;
	   public Boolean IsSystem;
	   
	   public static ArrayList<BaseTypeDic> fromDataTable(DataTable dt) {
			ArrayList<BaseTypeDic> ds = new ArrayList<BaseTypeDic>();
			DataRowCollection drs = dt.getRows();
			int rowCount = dt.getRowCount();
			
			for(int i=0;i<rowCount;i++)
			{
				BaseTypeDic b = new BaseTypeDic();	
				b.BaseTypeId = Integer.parseInt(drs.get(i).getValueAsString("BaseTypeId"));
				b.BaseTypeName = (String)drs.get(i).getValue("BaseTypeName");
				b.BaseEquipmentId = (Integer)drs.get(i).getValue("BaseEquipmentId");
				b.EnglishName = (String)drs.get(i).getValue("EnglishName");
				b.BaseLogicCategoryId = (Integer)drs.get(i).getValue("BaseLogicCategoryId");
				b.StoreInterval = (Integer)drs.get(i).getValue("StoreInterval");
				b.AbsValueThreshold = (Float)drs.get(i).getValue("AbsValueThreshold");
				b.PercentThreshold = (Float)drs.get(i).getValue("PercentThreshold");
				b.UnitId = (Integer)drs.get(i).getValue("UnitId");
				b.BaseShowPrecision = (String)drs.get(i).getValue("BaseShowPrecision");
				b.BaseStatPeriod = (Integer)drs.get(i).getValue("BaseStatPeriod");
				b.BaseNameExt = (String)drs.get(i).getValue("BaseNameExt");
				b.IsSystem = (Boolean)drs.get(i).getValue("IsSystem");
				ds.add(b);
			}		
			return ds;
		}
}
