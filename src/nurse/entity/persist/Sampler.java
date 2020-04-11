package nurse.entity.persist;

import nurse.common.DataRowCollection;
import nurse.common.DataTable;

import java.util.ArrayList;

public class Sampler {

	public Sampler() {
	}

	public int SamplerId;
	public int SamplerType;	
	
	public String SamplerName;
	public String ProtocolCode;
	public String DLLCode;
	public String DLLVersion;
	public String ProtocolFilePath;
	public String DLLFilePath;
	public String DllPath;
	public String Setting;
	public String Description;
	public String SoCode;
	public String SoPath;
	
	public int getSamplerId() {
		return SamplerId;
	}

	public void setSamplerId(int SamplerId) {
		this.SamplerId = SamplerId;
	}

	public static ArrayList<Sampler> fromDataTable(DataTable dt) {
		ArrayList<Sampler> ds = new ArrayList<Sampler>();
		DataRowCollection drs = dt.getRows();
		int rowCount = dt.getRowCount();

		for(int i=0;i<rowCount;i++){
			Sampler sampler = new Sampler();

			sampler.SamplerId = (int) drs.get(i).getValue("SamplerId");
			sampler.SamplerName = (String) drs.get(i).getValue("SamplerName");
			sampler.SamplerType = (int) drs.get(i).getValue("SamplerType");
			sampler.ProtocolCode = (String) drs.get(i).getValue("ProtocolCode");
			sampler.DLLCode = (String) drs.get(i).getValue("DLLCode");
			sampler.DLLVersion = (String) drs.get(i).getValue("DLLVersion");
			sampler.ProtocolFilePath = (String) drs.get(i).getValue("ProtocolFilePath");
			sampler.DLLFilePath = (String) drs.get(i).getValue("DLLFilePath");
			sampler.DllPath = (String) drs.get(i).getValue("DllPath");
			sampler.Setting = (String) drs.get(i).getValue("Setting");
			sampler.Description = (String) drs.get(i).getValue("Description");
			sampler.SoCode = (String) drs.get(i).getValue("SoCode");
			sampler.SoPath = (String) drs.get(i).getValue("SoPath");

			ds.add(sampler);
		}
		return ds;
	}
}
