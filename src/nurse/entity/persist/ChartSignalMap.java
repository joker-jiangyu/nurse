package nurse.entity.persist;

import nurse.common.DataRowCollection;
import nurse.common.DataTable;

import java.util.ArrayList;

public class ChartSignalMap {
    public int SignalMapId;
    public int ChartMapId;
    public int DeviceId;
    public int SignalId;
    public int BaseTypeId;
    public String Name;

    public static ArrayList<ChartSignalMap> fromDataTable(DataTable dt) {
        ArrayList<ChartSignalMap> signalMaps = new ArrayList<ChartSignalMap>();

        DataRowCollection drs = dt.getRows();
        int rowCount = dt.getRowCount();

        for(int i=0;i<rowCount;i++){
            ChartSignalMap csm = new ChartSignalMap();
            csm.SignalMapId = Integer.parseInt(drs.get(i).getValueAsString("SignalMapId"));
            csm.ChartMapId = Integer.parseInt(drs.get(i).getValueAsString("ChartMapId"));
            csm.DeviceId = Integer.parseInt(drs.get(i).getValueAsString("DeviceId"));
            csm.SignalId = drs.get(i).getValueAsString("SignalId") == null ? -1 : Integer.parseInt(drs.get(i).getValueAsString("SignalId"));
            csm.BaseTypeId = drs.get(i).getValueAsString("BaseTypeId") == null ? -1 : Integer.parseInt(drs.get(i).getValueAsString("BaseTypeId"));
            csm.Name = drs.get(i).getValueAsString("Name");

            signalMaps.add(csm);
        }

        return signalMaps;
    }
}
