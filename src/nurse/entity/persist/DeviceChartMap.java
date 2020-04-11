package nurse.entity.persist;

import nurse.common.DataRowCollection;
import nurse.common.DataTable;

import java.util.ArrayList;

public class DeviceChartMap {
    public int ChartMapId;
    public int DeviceId;
    public String ChartType;
    public String Title;
    public String Y1Name;
    public String Y2Name;
    public String XName;
    public String Max;
    public String Min;

    public String Series;//数据
    public String Data;//X轴列

    public static ArrayList<DeviceChartMap> fromDataTable(DataTable dt) {
        ArrayList<DeviceChartMap> chartMaps = new ArrayList<DeviceChartMap>();

        DataRowCollection drs = dt.getRows();
        int rowCount = dt.getRowCount();

        for(int i=0;i<rowCount;i++){
            DeviceChartMap dcm = new DeviceChartMap();
            dcm.ChartMapId = Integer.parseInt(drs.get(i).getValueAsString("ChartMapId"));
            dcm.DeviceId = Integer.parseInt(drs.get(i).getValueAsString("DeviceId"));
            dcm.ChartType = drs.get(i).getValueAsString("ChartType");
            dcm.Title = drs.get(i).getValueAsString("Title");
            dcm.Y1Name = drs.get(i).getValueAsString("Y1Name");
            dcm.Y2Name = drs.get(i).getValueAsString("Y2Name");
            dcm.XName = drs.get(i).getValueAsString("XName");
            dcm.Max = drs.get(i).getValueAsString("Max");
            dcm.Min = drs.get(i).getValueAsString("Min");

            chartMaps.add(dcm);
        }

        return chartMaps;
    }
}
