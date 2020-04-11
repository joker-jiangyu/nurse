package nurse.entity.persist;

import org.json.JSONObject;

import nurse.common.DataRowCollection;
import nurse.common.DataTable;
import nurse.utility.LicenseHelper;

public class License {
	public String Mac;
	public String Versions;
	public String ProjectName;
	public String RegistrationDate;
	public String AvailableDate;
	
	public String toString(){
		JSONObject res = new JSONObject();
		res.put("Mac", this.Mac);
		res.put("Versions", this.Versions);
		res.put("ProjectName", this.ProjectName);
		res.put("RegistrationDate", this.RegistrationDate);
		res.put("AvailableDate", this.AvailableDate);
		
		return toString(res);
	}
	
	public static License toLicense(String obj){
		JSONObject json = toJson(obj);
		License lic = new License();
		lic.Mac = json.isNull("Mac")?"":json.getString("Mac");
		lic.Versions = json.isNull("Versions")?"2.1.0":json.getString("Versions");
		lic.ProjectName = json.isNull("ProjectName")?"":json.getString("ProjectName");
		lic.RegistrationDate = json.isNull("RegistrationDate")?"":json.getString("RegistrationDate");
		lic.AvailableDate = json.isNull("AvailableDate")?"":json.getString("AvailableDate");
		
		return lic;
	}
	
	private String toString(JSONObject json){
		return json.toString();
	}
	
	private static JSONObject toJson(String obj){
		JSONObject json = new JSONObject(obj);
		return json;
	}
	
	public static License GetFromDataTable(DataTable dt)
	{
		DataRowCollection drs = dt.getRows();
		int rowCount = dt.getRowCount();
		
		License lic = new License();
		if(rowCount > 0){
			String code = drs.get(0).getValueAsString("LicenseCode");
			if(code != null && !code.equals("")){
				try {
					code = LicenseHelper.decode(code);
				} catch (Exception e) {
					return null;
				}
				lic = License.toLicense(code);
				return lic;
			}
		} 
		return null;
	}
}
