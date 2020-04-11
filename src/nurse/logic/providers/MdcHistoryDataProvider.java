package nurse.logic.providers;

import nurse.common.DataRowCollection;
import nurse.common.DataTable;
import nurse.entity.persist.ActiveAlarm;
import nurse.entity.persist.ChartSignalMap;
import nurse.entity.persist.DeviceChartMap;
import nurse.entity.persist.HistorySignal;
import nurse.logic.handlers.MdcHistoryDataHandler;
import nurse.utility.DatabaseHelper;
import nurse.utility.JsonHelper;
import org.apache.log4j.Logger;
import org.json.JSONArray;
import org.json.JSONObject;

import java.sql.CallableStatement;
import java.sql.Types;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.List;

public class MdcHistoryDataProvider {
    private static MdcHistoryDataProvider instance = new MdcHistoryDataProvider();
    private static Logger log = Logger.getLogger(MdcHistoryDataProvider.class);

    public static MdcHistoryDataProvider getInstance() {
        return instance;
    }

    public List<DeviceChartMap> getMdcChartMap(String deviceId){
        DatabaseHelper dbHelper = null;
        try {
            dbHelper = new DatabaseHelper();

            String sql = String.format("SELECT * FROM MDC_DeviceChartMap WHERE DeviceId = %s;",deviceId);

            DataTable dt = dbHelper.executeToTable(sql);
            ArrayList<DeviceChartMap> chartMaps = DeviceChartMap.fromDataTable(dt);

            if(chartMaps.size() > 0){
                for(DeviceChartMap dcm : chartMaps){
                    sql = String.format("SELECT * FROM MDC_ChartSignalMap WHERE ChartMapId = %s;",dcm.ChartMapId);

                    dt = dbHelper.executeToTable(sql);
                    ArrayList<ChartSignalMap> signalMaps = ChartSignalMap.fromDataTable(dt);
                    dcm.Series = JsonHelper.ListjsonArray(signalMaps).toString();
                }
                return chartMaps;
            }
        } catch (Exception e) {
            log.error("getMdcChartMap Exception:", e);
        }finally{
            if(dbHelper != null) dbHelper.close();
        }
        return new ArrayList<DeviceChartMap>();
    }

    public String initDeviceChartMap(DeviceChartMap dcm){
        DatabaseHelper dbHelper = null;
        try{
            dbHelper = new DatabaseHelper();

            CallableStatement stat = dbHelper.prepareProcedure("PRO_InitDeviceChartMap", "?,?,?,?,?,?,?,?,?");
            stat.setInt(1, dcm.ChartMapId);
            stat.setInt(2, dcm.DeviceId);
            stat.setString(3, dcm.ChartType);
            stat.setString(4, dcm.Title);
            stat.setString(5, dcm.Y1Name);
            stat.setString(6, dcm.Y2Name);
            stat.setString(7, dcm.XName);
            stat.setString(8, dcm.Max);
            stat.setString(9, dcm.Min);

            DataTable dt = dbHelper.executeQuery(stat);
            if(dt.getRows().size() > 0){
                Object chartMapId = dt.getRows().get(0).getValue(0);
                return "OK|"+chartMapId;
            }
            return "NoResultError";
        }catch (Exception ex){
            log.error("initDeviceChartMap Exception:",ex);
            return "DatabaseError";
        }finally{
            if(dbHelper != null) dbHelper.close();
        }
    }

    public String removeDeviceChartMap(String chartMapId){
        DatabaseHelper dbHelper = null;
        try {
            dbHelper = new DatabaseHelper();

            String sql = String.format("DELETE FROM MDC_DeviceChartMap WHERE ChartMapId = %s;",chartMapId);

            dbHelper.executeNoQuery(sql);

            return "OK";
        } catch (Exception e) {
            log.error("removeDeviceChartMap Exception:", e);
            return "DatabaseError";
        }finally{
            if(dbHelper != null) dbHelper.close();
        }
    }


    public String initChartSignalMap(int chartMapId,List<ChartSignalMap> csms){
        DatabaseHelper dbHelper = null;
        try{
            dbHelper = new DatabaseHelper();

            String sql = String.format("DELETE FROM MDC_ChartSignalMap WHERE ChartMapId = %d;",chartMapId);
            dbHelper.executeNoQuery(sql);

            for(ChartSignalMap csm : csms){
                sql = String.format(" call PRO_InitChartSignalMap(%d, %d, %d, '%s')",
                        csm.ChartMapId,csm.DeviceId,csm.BaseTypeId,csm.Name);
                dbHelper.executeNoQuery(sql);
            }
            return "OK";
        }catch (Exception ex){
            log.error("initChartSignalMap Exception:",ex);
            return "DatabaseError";
        }finally{
            if(dbHelper != null) dbHelper.close();
        }
    }


    public ArrayList<DeviceChartMap> getHistorySignalByDevice(int deviceId,int days){
        ArrayList<DeviceChartMap> dcms = new ArrayList<DeviceChartMap>();
        DatabaseHelper dbHelper = null;
        try {
            dbHelper = new DatabaseHelper();

            String sql = String.format("SELECT * FROM MDC_DeviceChartMap WHERE DeviceId = %d;",deviceId);
            DataTable dt = dbHelper.executeToTable(sql);

            ArrayList<DeviceChartMap> list = DeviceChartMap.fromDataTable(dt);
            for(DeviceChartMap l : list){
                sql = String.format("SELECT * FROM MDC_ChartSignalMap WHERE ChartMapId = %s;",l.ChartMapId);
                dt = dbHelper.executeToTable(sql);
                ArrayList<ChartSignalMap> csms = ChartSignalMap.fromDataTable(dt);

                dcms.add(createCharts(l,csms,days));
            }

            return dcms;
        } catch (Exception e) {
            log.error("GetHistorySignalByDevice Exception:", e);
        } finally{
            if(dbHelper != null)dbHelper.close();
        }
        return  null;
    }

    private DeviceChartMap createCharts(DeviceChartMap dcm,ArrayList<ChartSignalMap> csms, int days){
        DatabaseHelper dbHelper = null;
        try {
            dbHelper = new DatabaseHelper();

            //X轴显示的刻度
            DataTable contextDt = null;
            int count = 0;
            //曲线值
            JSONArray seriesArray = new JSONArray();
            for(ChartSignalMap csm : csms){
                String sql = builQuerySql(days,csm.DeviceId,csm.BaseTypeId);
                DataTable dt = dbHelper.executeToTable(sql);

                if(dt.getRowCount() > count){
                    count = dt.getRowCount();
                    contextDt = dt;
                }

                //曲线值
                String seriesData = parseSeries(csm.Name,dt);
                seriesArray.put(seriesData);
            }

            dcm.Series = seriesArray.toString();
            String contextData = parseSeries(null,contextDt);
            dcm.Data = contextData;

        } catch (Exception e) {
            log.error("CreateCharts Exception:", e);
        } finally{
            if(dbHelper != null)dbHelper.close();
        }
        return dcm;
    }

    private String builQuerySql(int day,int deviceId,int baseTypeId){
        Calendar calStart = Calendar.getInstance();
        calStart.setTime(new Date());
        calStart.set(Calendar.DATE, calStart.get(Calendar.DATE) - day);

        Calendar calEnd = Calendar.getInstance();
        calEnd.setTime(new Date());

        int startMonth = calStart.get(Calendar.MONTH)+1;
        int endMonth = calEnd.get(Calendar.MONTH)+1;//当前月份
        int difMonth = endMonth - startMonth; //月份差
        int difYear = calEnd.get(Calendar.YEAR) - calStart.get(Calendar.YEAR);//年份差
        //年份不为零是，月份加上年份的12倍数
        if(difYear!=0)
            difMonth = 12 * difYear + endMonth - startMonth;
        int month = endMonth;

        StringBuffer sb = new StringBuffer();
        for(int i = 0 ; i <= difMonth; i ++){
            if(sb.length() > 0)
                sb.append(" UNION ");

            sb.append(String.format("(SELECT FloatValue,SampleTime FROM TBL_Historysignal%d ",month));
            sb.append(String.format("WHERE EquipmentId = %d AND BaseTypeId = %d AND SampleTime > NOW() - INTERVAL %d DAY ",deviceId,baseTypeId,day));
            sb.append(" ORDER BY SampleTime DESC LIMIT 300) ");

            month --;
            if(month <= 0)
                month = 12;
        }

        return sb.toString();
    }

    // return Series => {"Name":"","Data":[]} ||  Data => []
    private String parseSeries(String name,DataTable dt){
        if(dt == null){
            if(name != null)
                return "{\"Name\":\"\",\"Data\":[]}";
            else
                return "[]";
        }
        DataRowCollection drs = dt.getRows();
        int rowCount = dt.getRowCount();

        JSONArray data = new JSONArray();
        for(int i = 0;i < rowCount; i++){
            if(name != null)
                data.put(drs.get(i).getValueAsString("FloatValue"));
            else
                data.put(drs.get(i).getValueAsString("SampleTime"));
        }

        String cfg = "";
        if(name != null) {
            JSONObject obj = new JSONObject();
            obj.put("Name",name);
            obj.put("Data",data.toString());
            cfg = obj.toString();
        }else
            cfg = data.toString();

        return cfg;
    }
}
