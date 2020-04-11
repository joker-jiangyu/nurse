package nurse.entity.persist;

import java.util.ArrayList;
import java.util.Collections;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import nurse.common.DataRowCollection;
import nurse.common.DataTable;
import nurse.utility.JsonHelper;

public class ConfigureMold implements Comparable<ConfigureMold>{
	public Integer configId;
	public String configName;
	public String fontChart;
	public String configUrl;
	public String equipmentId;
	public Integer displayIndex;
	public boolean displayType;
	public String parentId;
	public boolean visible;
	public String description;
	
	public String parts;
	public String deviceId;
	public String baseTypeId;
	public String equipmentBaseType;
	
	public static ArrayList<ConfigureMold> fromDataTable(DataTable dt) {
		ArrayList<ConfigureMold> cms = new ArrayList<ConfigureMold>();
		DataRowCollection drs = dt.getRows();
		int rowCount = dt.getRowCount();
		
		for(int i=0;i<rowCount;i++)
		{
			ConfigureMold cm = new ConfigureMold();
			cm.configId = Integer.parseInt(drs.get(i).getValueAsString("ConfigId"));
			cm.configName = drs.get(i).getValueAsString("ConfigName");
			if(drs.get(i).getValueAsString("EquipmentName") != null)
				cm.configName = drs.get(i).getValueAsString("EquipmentName");
			cm.fontChart = drs.get(i).getValueAsString("FontChart");
			cm.configUrl = drs.get(i).getValueAsString("ConfigUrl");
			cm.equipmentId = drs.get(i).getValueAsString("EquipmentId");
			cm.deviceId = drs.get(i).getValueAsString("EquipmentId");
			cm.displayIndex = Integer.parseInt(drs.get(i).getValueAsString("DisplayIndex"));
			cm.displayType = Boolean.parseBoolean(drs.get(i).getValueAsString("DisplayType"));
			cm.parentId = drs.get(i).getValueAsString("ParentId");
			cm.visible = Boolean.parseBoolean(drs.get(i).getValueAsString("Visible"));
			cm.description = drs.get(i).getValueAsString("Description");
			cm.baseTypeId = getDeviceBaseType(cm.configUrl);
			cm.equipmentBaseType = drs.get(i).getValueAsString("EquipmentBaseType");

			if(cm.deviceId == null || cm.deviceId.equals("")){
				cm.deviceId = getJsonFileName(cm.configUrl);
			}
			cms.add(cm);
		}		
		return cms;
	}
	
	public static ArrayList<ConfigureMold> fromParentDataTable(DataTable dt,ArrayList<ConfigureMold> parts){
		ArrayList<ConfigureMold> cms = new ArrayList<ConfigureMold>();
		DataRowCollection drs = dt.getRows();
		int rowCount = dt.getRowCount();
		
		for(int i=0;i<rowCount;i++)
		{
			ConfigureMold cm = new ConfigureMold();
			cm.configId = Integer.parseInt(drs.get(i).getValueAsString("ConfigId"));
			cm.configName = drs.get(i).getValueAsString("ConfigName");
			cm.fontChart = drs.get(i).getValueAsString("FontChart");
			cm.configUrl = drs.get(i).getValueAsString("ConfigUrl");
			cm.equipmentId = drs.get(i).getValueAsString("EquipmentId");
			cm.deviceId = drs.get(i).getValueAsString("EquipmentId");
			cm.displayIndex = Integer.parseInt(drs.get(i).getValueAsString("DisplayIndex"));
			cm.displayType = Boolean.parseBoolean(drs.get(i).getValueAsString("DisplayType"));
			cm.parentId = drs.get(i).getValueAsString("ParentId");
			cm.visible = Boolean.parseBoolean(drs.get(i).getValueAsString("Visible"));
			cm.description = drs.get(i).getValueAsString("Description");
			
			ArrayList<ConfigureMold> list = new ArrayList<ConfigureMold>();
			for (ConfigureMold c : parts) {
				if(String.valueOf(cm.configId).equals(c.parentId))
					list.add(c);
			}
			Collections.sort(list);
			if(list.size() > 0)
				cm.parts = JsonHelper.ListjsonArray(list).toString();
			
			cms.add(cm);
		}		
		return cms;
	}

	public static ArrayList<ConfigureMold> fromPartDataTable(DataTable dt) {
		ArrayList<ConfigureMold> cms = new ArrayList<ConfigureMold>();
		DataRowCollection drs = dt.getRows();
		int rowCount = dt.getRowCount();
		
		for(int i=0;i<rowCount;i++)
		{
			ConfigureMold cm = new ConfigureMold();
			cm.configName = drs.get(i).getValueAsString("EquipmentName");
			cm.equipmentId = drs.get(i).getValueAsString("EquipmentId");

			String visible = drs.get(i).getValueAsString("Visible");
			if(visible != null && visible.equals("true"))
				cm.visible = true;
			else
				cm.visible = false;

			if(!cm.isExist(cms))
				cms.add(cm);
		}		
		return cms;
	}
	
	@Override
	public int compareTo(ConfigureMold o) {
		try{
			if(this.displayIndex > o.displayIndex)
				return 1;
			else if(this.displayIndex == o.displayIndex)
				return 0;
			else 
				return -1;
		}catch (Exception e) {
			return -1;
		}
	}

	private static String getJsonFileName(String configUrl){
		if(configUrl != null && configUrl.indexOf("diagram") != -1){
			String regEx="[^0-9]";
			Pattern p = Pattern.compile(regEx);
			Matcher m = p.matcher(configUrl);
			return m.replaceAll("").trim();
		}
		return "";
	}

	private static String getDeviceBaseType(String configUrl){
		if(configUrl != null && configUrl.indexOf("diagram") != -1){
			String regEx="[^0-9]";
			Pattern p = Pattern.compile(regEx);
			Matcher m = p.matcher(configUrl);

			String result = m.replaceAll("").trim();
			if(configUrl.indexOf(result+".table") > -1)
				return result+".table";
			else
				return result;
		}
		return "";
	}

	private boolean isExist(ArrayList<ConfigureMold> configs){
		try {
			for (ConfigureMold cm : configs){
				if(this.equipmentId.equals(cm.equipmentId) && this.configName.equals(cm.configName))
					return true;
			}
			return false;
		}catch (Exception ex){
			return false;
		}
	}
}
