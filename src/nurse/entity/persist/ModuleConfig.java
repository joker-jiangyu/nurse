package nurse.entity.persist;

import nurse.common.DataRowCollection;
import nurse.common.DataTable;

import java.util.ArrayList;

public class ModuleConfig {
    public String ConfigId;
    public String ModuleId;
    public String FileType;
    public String ConfigFile;

    public static ArrayList<ModuleConfig> fromDataTable(DataTable dt){
        DataRowCollection drs = dt.getRows();
        int rowCount = dt.getRowCount();
        ArrayList<ModuleConfig> mcs = new ArrayList<ModuleConfig>();
        try {
            for(int i = 0;i < rowCount;i ++) {
                ModuleConfig mc = new ModuleConfig();
                mc.ConfigId = drs.get(i).getValueAsString("ConfigId");
                mc.ModuleId = drs.get(i).getValueAsString("ModuleId");
                mc.FileType = drs.get(i).getValueAsString("FileType");
                mc.ConfigFile = drs.get(i).getValueAsString("ConfigFile");
                mcs.add(mc);
            }
        }catch (Exception ex){}
        return mcs;
    }
}
