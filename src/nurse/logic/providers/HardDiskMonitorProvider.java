package nurse.logic.providers;


import nurse.entity.persist.IntervalClearData;
import nurse.utility.DatabaseHelper;
import org.apache.log4j.Logger;

import java.util.ArrayList;
import java.util.List;

public class HardDiskMonitorProvider implements Runnable {
    private static Logger log = Logger.getLogger(HardDiskMonitorProvider.class);
    private volatile boolean exit = true;
    private static float triggerValue = -1;

    private static HardDiskMonitorProvider instance = new HardDiskMonitorProvider();
    public static HardDiskMonitorProvider getInstance() {
        return instance;
    }

    public void start(int equipmentId,float triggerValue){
        boolean b = verifyDiagnostic(equipmentId);
        if(!b) return;
        this.triggerValue = triggerValue;

        if(this.exit == true){
            this.exit = false;
            Thread thread = new Thread(getInstance());
            thread.start();
        }
    }

    /** 判断是否是自诊断设备 */
    private boolean verifyDiagnostic(int equipmentId){
        DatabaseHelper dbHelper = null;
        Object res = null;

        try{
            dbHelper = new DatabaseHelper();
            StringBuilder sb= new StringBuilder();
            sb.append("SELECT COUNT(*) FROM TBL_Equipment A ");
            sb.append("LEFT JOIN TSL_SamplerUnit B ON A.SamplerUnitId = B.SamplerUnitId ");
            sb.append("LEFT JOIN TSL_Port C ON B.PortId = C.PortId ");
            sb.append(String.format("WHERE C.Setting = 'comm_host_dev.so' AND A.EquipmentId = %d;",equipmentId));

            res = dbHelper.executeScalar(sb.toString());
            log.info("VerifyDiagnostic Count:"+res.toString()+", SQL:"+sb.toString());/** DeBug ************************************************************/
            if(res != null){
                if(Integer.parseInt(res.toString()) > 0)
                    return true;
            }
        } catch (Exception e) {
            log.error("fail to read all centers", e);
        } finally {
            if(dbHelper != null) dbHelper.close();
        }

        return false;
    }

    @Override
    public void run() {
        try {
            startClear();
            this.exit = true;
            this.triggerValue = -1;
        } catch (Exception e) {
            log.error("DataMonitorJob Exception:"+e);
        }
    }

    /** 开始清理 */
    private void startClear(){
        log.info("Hard Disk Start!----------------------------------");
        clearLogFile();
        if(this.triggerValue >= 85){
            clearDataByNumber();
        }else if(this.triggerValue >= 75){
            clearDataByDate();
        }
        log.info("Hard Disk End!----------------------------------");
    }

    /** 清理系统文件 */
    private void clearLogFile(){
        try{
            //sudo /home/utils/system_clean.sh
            String[] cmd = new String[]{"/bin/sh", "-c",
                    "sudo /home/utils/system_clean.sh"};
            String result = SystemSettingProvider.getInstance().getSystemData(cmd);
            log.info("Cmd:"+cmd[2]+", Result:"+result);/** DeBug ************************************************************/
        }catch (Exception e){
            log.error("ClearLogFile Exception:",e);
        }
    }

    /** 根据配置时间清理历史数据 */
    private void clearDataByDate(){
        try{
            ArrayList<IntervalClearData> icds = HistoryDataClearProviders.getInstance().getAllIntervalClearData();
            for(IntervalClearData icd : icds){
                clearHistoryDataByDays(icd.clearObject, icd.storageCols, icd.storageDays);
            }
        }catch (Exception e){
            log.error("ClearDataByDate Exception:",e);
        }
    }

    private void clearHistoryDataByDays(String clearObject,String storageCols,int storageDays){
        DatabaseHelper dbHelper = null;
        try
        {
            dbHelper = new DatabaseHelper();
            String sql = "";

            List<String> tableNames = splitTableName(clearObject);

            for (String tableName : tableNames){
                sql = String.format("DELETE FROM %s where %s < NOW() - INTERVAL %s DAY;",
                        tableName, storageCols, storageDays);
                int number = dbHelper.executeNoQuery(sql);
                log.info("HardDisk Clear Data Size:"+number+" SQL:"+sql);/** DeBug **************************************************************/
            }
        } catch (Exception e) {
            log.error("ClearHistoryData Exception:", e);
        } finally {
            if(dbHelper != null) dbHelper.close();
        }
    }

    /** 根据数量清理历史数据 */
    private void clearDataByNumber(){
        try{
            ArrayList<IntervalClearData> icds = HistoryDataClearProviders.getInstance().getAllIntervalClearData();
            for(IntervalClearData icd : icds){
                clearHistoryDataByDouble(icd.clearObject, icd.storageCols,0.1);
            }
        }catch (Exception e){
            log.error("ClearDataByNumber Exception:",e);
        }
    }

    private void clearHistoryDataByDouble(String clearObject,String storageCols, double percent){
        DatabaseHelper dbHelper = null;
        try
        {
            dbHelper = new DatabaseHelper();
            String sql = "";

            List<String> tableNames = splitTableName(clearObject);

            for (String tableName : tableNames){
                sql = String.format("SELECT COUNT(*) FROM %s;",tableName);
                Object res = dbHelper.executeScalar(sql);
                //总条数
                if(res == null) continue;
                int total = Integer.parseInt(res.toString());
                if(total <= 0) continue;
                //log.info("Total Count:"+total+" SQL:"+sql);/** DeBug **************************************************************/

                //删除的条数
                int count = (int)(total * percent);
                if(count <= 0) continue;

                sql = String.format("DELETE FROM %s ORDER BY %s LIMIT %d;",tableName, storageCols, count);
                dbHelper.executeNoQuery(sql);
                log.info("HardDisk Clear Data SQL:"+sql);/** DeBug **************************************************************/
            }
        } catch (Exception e) {
            log.error("ClearHistoryData Exception:", e);
        } finally {
            if(dbHelper != null) dbHelper.close();
        }
    }

    // 拆分TBL_IntervalClearData.ClearObject的列名为表名集合
    private List<String> splitTableName(String str){
        List<String> list = new ArrayList<String>();
        if(str.indexOf("[") != -1 && str.indexOf("]") != -1){// ClearObject = TBL_HistorySignal[1-12]
            int index1 = str.indexOf("[");
            int index2 = str.indexOf("]");
            int index3 = str.indexOf("-");
            int startNum = Integer.parseInt(str.substring(index1+1, index3));// startNum = 1
            int endNum = Integer.parseInt(str.substring(index3+1, index2));// endNum = 12
            String table = str.substring(0,index1);// table = TBL_HistorySignal

            for(int i = startNum;i <= endNum;i++){
                list.add(String.format("%s%d",table,i));// table = TBL_HistorySignal1
            }
        }else{// ClearObject = TBL_HistoryEvent
            list.add(str);
        }
        return list;
    }
}
