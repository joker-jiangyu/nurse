package nurse.entity.persist;

import nurse.common.DataRowCollection;
import nurse.common.DataTable;

import java.util.ArrayList;

public class OtherModule {
    public String ModuleId;
    public String Name;
    public String LogFile;
    public String LogCmd;
    public String Encode;
    public String UploadPath;
    public ArrayList<ModuleConfig> Configs;

    public static ArrayList<OtherModule> fromDataTable(DataTable dt,ArrayList<ModuleConfig> mcs){
        DataRowCollection drs = dt.getRows();
        int rowCount = dt.getRowCount();
        ArrayList<OtherModule> oms = new ArrayList<OtherModule>();
        try {
            for(int i = 0;i < rowCount;i ++) {
                OtherModule om = new OtherModule();
                om.ModuleId = drs.get(i).getValueAsString("ModuleId");
                om.Name = drs.get(i).getValueAsString("Name");
                om.LogFile = drs.get(i).getValueAsString("LogFile");
                om.LogCmd = drs.get(i).getValueAsString("LogCmd");
                om.Encode = drs.get(i).getValueAsString("Encode");
                om.UploadPath = drs.get(i).getValueAsString("UploadPath");
                om.Configs = getConfigs(mcs,om.ModuleId);
                oms.add(om);
            }
        }catch (Exception ex){}
        return oms;
    }

    private static ArrayList<ModuleConfig> getConfigs(ArrayList<ModuleConfig> mcs, String ModuleId){
        if(mcs == null || mcs.size() == 0) return new ArrayList<ModuleConfig>();
        ArrayList<ModuleConfig> list = new ArrayList<ModuleConfig>();
        for (ModuleConfig mc : mcs){
            if(mc.ModuleId.equals(ModuleId))
                list.add(mc);
        }
        return list;
    }

    public static OtherModule getObjectByName(ArrayList<OtherModule> logFiles, String Name){
        for (OtherModule om : logFiles){
            if(om.Name.equals(Name)){
                return om;
            }
        }
        return null;
    }
}
