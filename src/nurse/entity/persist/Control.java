package nurse.entity.persist;

import java.util.ArrayList;

import nurse.common.DataRowCollection;
import nurse.common.DataTable;

public class Control {

	public Control() {
	}

	public int EquipmentTemplateId;
	public int ControlId;
	public int ControlCategory;
	public Integer BaseTypeId;
	public int ControlSeverity;
	public Integer SignalId;
	public Integer Retry;
	public boolean Enable;
	public boolean Visible;
	public int DisplayIndex;
	public int CommandType;
	public Integer ControlType;
	public Integer DataType;
	public int ModuleNo;
	
	public Float TimeOut;
	public Float MaxValue;
	public Float MinValue;
	public Float DefaultValue;
	
	public String ControlName;
	public String CmdToken;
	public String Description;
	
	public int getControlId() {
		return ControlId;
	}

	public void setControlId(int ControlId) {
		this.ControlId = ControlId;
	}	
	
	public static ArrayList<Control> fromDataTable(DataTable dt) {
		ArrayList<Control> ds = new ArrayList<Control>();
		DataRowCollection drs = dt.getRows();
		int rowCount = dt.getRowCount();
		
		for(int i=0;i<rowCount;i++)
		{
			Control c = new Control();	
			c.EquipmentTemplateId = (int)drs.get(i).getValue("EquipmentTemplateId");
			c.ControlId = (int)drs.get(i).getValue("ControlId");
			c.ControlName = (String)drs.get(i).getValue("ControlName");
			c.ControlCategory = (int)drs.get(i).getValue("ControlCategory");
			c.BaseTypeId = parseInteger(drs.get(i).getValueAsString("BaseTypeId"));
			c.ControlSeverity = (int)drs.get(i).getValue("ControlSeverity");
			c.SignalId = (Integer)drs.get(i).getValue("SignalId");
			c.Retry = (Integer)drs.get(i).getValue("Retry");
			c.Enable = (boolean)drs.get(i).getValue("Enable");
			c.Visible = (boolean)drs.get(i).getValue("Visible");
			c.DisplayIndex = (int)drs.get(i).getValue("DisplayIndex");
			c.CommandType = (int)drs.get(i).getValue("CommandType");
			c.ControlType = (Integer)drs.get(i).getValue("ControlType");
			c.DataType = (Integer)drs.get(i).getValue("DataType");
			c.ModuleNo = (int )drs.get(i).getValue("ModuleNo");

			c.TimeOut = (Float)drs.get(i).getValue("TimeOut");
			c.MaxValue = (Float)drs.get(i).getValue("MaxValue");
			c.MinValue = (Float)drs.get(i).getValue("MinValue");
			c.DefaultValue = (Float)drs.get(i).getValue("DefaultValue");
 
			c.ControlName = (String)drs.get(i).getValue("ControlName");
			c.CmdToken = (String)drs.get(i).getValue("CmdToken");
			c.Description = (String)drs.get(i).getValue("Description");
			
			ds.add(c);
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
