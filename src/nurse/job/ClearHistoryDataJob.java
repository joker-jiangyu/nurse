package nurse.job;


import org.apache.log4j.Logger;

import nurse.utility.DatabaseHelper;

public class ClearHistoryDataJob extends NurseJob{
	private String clearObject;//清理对象，TBL_HistorySignal[1-12]表示TBL_HistorySignal1-TBL_HistorySignal12
	private int storageDays;//保存的数据天数
	private String storageCols;//根据该列判断存储的时间
	
	private static Logger log = Logger.getLogger(ClearHistoryDataJob.class);
	
	public ClearHistoryDataJob(String name,String clearObject,long delay, long period,int storageDays,String storageCols,int status) {
		super(delay, period);
		this.clearObject = clearObject;
		this.storageDays = storageDays;
		this.storageCols = storageCols;
	}
	
	@Override
	public void work(){
		DatabaseHelper dbHelper = null;
		
        try
        {
            dbHelper = new DatabaseHelper();
            String sql = "";
            
            if(this.clearObject.indexOf("[") != -1 && this.clearObject.indexOf("]") != -1){
            	int index1 = this.clearObject.indexOf("[");
            	int index2 = this.clearObject.indexOf("]");
            	int index3 = this.clearObject.indexOf("-");
            	int startNum = Integer.parseInt(this.clearObject.substring(index1+1, index3));
            	int endNum = Integer.parseInt(this.clearObject.substring(index3+1, index2));
            	String table = this.clearObject.substring(0,index1);
            	
            	for(int i = startNum;i <= endNum;i++){
            		sql = String.format("DELETE FROM %s%s where %s < NOW() - INTERVAL %s DAY;",
            				table,i,this.storageCols,this.storageDays);   
                    int number = dbHelper.executeNoQuery(sql);  
                    /****************************************************************/
                    log.info("Clear History Data Size:"+number+" \nSQL:"+sql);
                    /****************************************************************/
            	}
            }else{
            	sql = String.format("DELETE FROM %s where %s < NOW() - INTERVAL %s DAY;",
        				this.clearObject, this.storageCols, this.storageDays);  
            	int number = dbHelper.executeNoQuery(sql);          
                /****************************************************************/
                log.info("Clear History Data Size:"+number+" \nSQL:"+sql);
                /****************************************************************/          
            }
		} catch (Exception e) {
			log.error("fail to clear alarm change table", e);
		} finally {
			if(dbHelper != null) dbHelper.close();
		}
	}
}
