package nurse.job;

import java.util.ArrayList;

import org.apache.log4j.Logger;

import nurse.common.DataTable;
import nurse.entity.persist.SqlProcess;
import nurse.utility.DatabaseHelper;

public class KillConnectionJob extends NurseJob{
	private static Logger log = Logger.getLogger(KillConnectionJob.class);
	public KillConnectionJob(long delay, long period) {
		super(delay, period);
	}

	@Override
	public void work(){
		DatabaseHelper dbHelper = null;
		
        try
        {
            dbHelper = new DatabaseHelper();
            String sql = "show PROCESSLIST";
            DataTable dt = dbHelper.executeToTable(sql);
            ArrayList<SqlProcess> ls = SqlProcess.fromDataTable(dt);
            
            killProcesses(ls);
            
		} catch (Exception e) {
			log.error("fail to kill process", e);
		} finally {
			if(dbHelper != null) dbHelper.close();
		}
	}

	private void killProcesses(ArrayList<SqlProcess> ls) {	

		for(SqlProcess sp: ls){
			if ((sp.state != null && sp.state.equalsIgnoreCase("Locked")) || sp.time >= 600){
				if (sp.command != null && !sp.command.equalsIgnoreCase("Sleep"))
					doKill(sp.id, sp.state, sp.info);
			}
		}
	}

	private void doKill(long id,String state, String info) {
	DatabaseHelper dbHelper = null;
		
        try
        {
            dbHelper = new DatabaseHelper();
            String sql = "kill " + String.valueOf(id);
            dbHelper.executeNoQuery(sql);
            
            log.warn("kill process " + String.valueOf(id) + "\t" + state + "\t" + info);
            
		} catch (Exception e) {
			log.error("fail to kill process " + String.valueOf(id), e);
		} finally {
			if(dbHelper != null) dbHelper.close();
		}
	}

}
