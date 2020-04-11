package nurse.job;

import nurse.logic.providers.SystemSettingProvider;
import nurse.utility.MainConfigHelper;
import org.apache.log4j.Logger;

public class CheckMySQLJob extends NurseJob {
    private static Logger log = Logger.getLogger(CheckMySQLJob.class);
    public CheckMySQLJob(long delay, long period) {
        super(delay, period);
    }

    public void work(){
        checkMySQL();
    }

    private void checkMySQL(){
        //./usr/local/mysql/bin/mysqlcheck --auto-repair --databases nurse -o -uroot -pGoodTime142536
        try{
            String mySql = MainConfigHelper.getConfig().mySql;

            int index = mySql.lastIndexOf("|");
            String pwd = mySql.substring(index+1);
            mySql = mySql.substring(0,index);

            index = mySql.lastIndexOf("|");
            String user = mySql.substring(index+1);

            String link = String.format("/usr/local/mysql/bin/mysqlcheck --auto-repair --databases nurse -o -u%s -p%s",user,pwd);

            String[] cmd_date = new String[]{"/bin/sh", "-c",link};
            SystemSettingProvider.getInstance().getSystemDataList(cmd_date);
        }catch (Exception e){
            log.error("CheckMySQLJob Exception:",e);
        }
    }
}
