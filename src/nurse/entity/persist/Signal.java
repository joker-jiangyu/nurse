package nurse.entity.persist;

import java.util.ArrayList;

import nurse.common.DataRowCollection;
import nurse.common.DataTable;

public class Signal {

	public Signal() {
	}

	public int EquipmentTemplateId;
	public int SignalId;
	public int SignalCategory;
	public int SignalType;
	public int ChannelNo;
	public int ChannelType;
	public Integer DataType;
	public Integer StaticsPeriod;
	public int DisplayIndex;
	public Integer MDBSignalId;
	public int ModuleNo;
	public Integer BaseTypeId;
	
	public boolean Enable;
	public boolean Visible;
	
	public String Description;
	public String SignalName;
	public String Expression;
	public String ShowPrecision;
	public String Unit;
	
	
	public Float StoreInterval;
	public Float AbsValueThreshold;
	public Float PercentThreshold;
	public Float ChargeStoreInterVal;
	public Float ChargeAbsValue;
	
	public int getSignalId() {
		return SignalId;
	}

	public void setSignalId(int SignalId) {
		this.SignalId = SignalId;
	}	
	
	public static ArrayList<Signal> fromDataTable(DataTable dt) {
		ArrayList<Signal> ds = new ArrayList<Signal>();
		DataRowCollection drs = dt.getRows();
		int rowCount = dt.getRowCount();
		
		for(int i=0;i<rowCount;i++)
		{
			Signal d = new Signal();
			
			d.EquipmentTemplateId = (int) drs.get(i).getValue("EquipmentTemplateId");
			d.SignalId = (int) drs.get(i).getValue("SignalId");
			d.SignalCategory = (int) drs.get(i).getValue("SignalCategory");
			d.SignalType = (int) drs.get(i).getValue("SignalType");
			d.ChannelNo = (int) drs.get(i).getValue("ChannelNo");
			d.ChannelType = (int) drs.get(i).getValue("ChannelType");
			d.DataType = (Integer) drs.get(i).getValue("DataType");
			d.StaticsPeriod = (Integer) drs.get(i).getValue("StaticsPeriod");
			d.DisplayIndex = (int) drs.get(i).getValue("DisplayIndex");
			d.MDBSignalId = (Integer) drs.get(i).getValue("MDBSignalId");
			d.ModuleNo = (int) drs.get(i).getValue("ModuleNo");
			d.Enable = (boolean) drs.get(i).getValue("Enable");
			d.Visible = (boolean) drs.get(i).getValue("Visible");
			d.Description = (String) drs.get(i).getValue("Description");
			d.SignalName = (String) drs.get(i).getValue("SignalName");
			d.Expression = (String) drs.get(i).getValue("Expression");
			d.ShowPrecision = (String) drs.get(i).getValue("ShowPrecision");
			d.Unit = (String) drs.get(i).getValue("Unit");
			d.StoreInterval = (Float) drs.get(i).getValue("StoreInterval");
			d.AbsValueThreshold = (Float) drs.get(i).getValue("AbsValueThreshold");
			d.PercentThreshold = (Float) drs.get(i).getValue("PercentThreshold");
			d.ChargeStoreInterVal = (Float) drs.get(i).getValue("ChargeStoreInterVal");
			d.ChargeAbsValue = (Float) drs.get(i).getValue("ChargeAbsValue");
			
			d.BaseTypeId = parseInteger(drs.get(i).getValueAsString("BaseTypeId"));
			
			ds.add(d);
		}		
		return ds;
	}
	
	private static Integer parseInteger(String obj){
		try {
			return Integer.parseInt(obj);
		} catch (Exception e) {
			return null;
		}
	}
}
