package nurse.logic.providers;

import java.sql.CallableStatement;
import java.util.ArrayList;

import org.apache.log4j.Logger;

import nurse.common.DataTable;
import nurse.entity.persist.AisleDeviceLocation;
import nurse.entity.persist.RtspVideo;
import nurse.utility.DatabaseHelper;

public class RtspVideoProviders {
	private static RtspVideoProviders instance = new RtspVideoProviders();
	private static Logger log = Logger.getLogger(RtspVideoProviders.class);

	public static RtspVideoProviders getInstance() {
		return instance;
	}

	
	public ArrayList<RtspVideo> getRtspVideo(){
		DatabaseHelper dbHelper = null;
		ArrayList<RtspVideo> list = new ArrayList<RtspVideo>();
        try
        {
            dbHelper = new DatabaseHelper();
            StringBuilder sb= new StringBuilder();
            sb.append("SELECT * FROM TBL_RtspVideo;");
            
            DataTable dt = dbHelper.executeToTable(sb.toString());
            
            list = RtspVideo.fromDataTable(dt);
		} catch (Exception e) {
			log.error("GetRtspVideo() failed.", e);
		} finally {
			if(dbHelper != null)dbHelper.close();
		}
        return list;
	}
	
	public AisleDeviceLocation setRtspVideo(String[] split){
		// req => 'rtspVideo'|Rows|Cols|Software.Id|Software.FilePath
		DatabaseHelper dbHelper = null;
		
		if(split.length < 5) return null;
		try {
			dbHelper = new DatabaseHelper();
			String id = split[0];
			String deviceType = split[1];
			String tableName = "TBL_RtspVideo";
			String rows = split[2];
			String cols = split[3];
			String rtspVideoId = (split[4].equals("") || split[4].equals("undefined"))  ? "-1" : split[4];
			String filePath = split[5];
			String videoName = split[6];
			
			CallableStatement stat = dbHelper.prepareProcedure("PRO_InitRtspVideo","?,?,?");
			stat.setInt(1, Integer.parseInt(rtspVideoId));
            stat.setString(2, videoName);
            stat.setString(3, filePath);
            
            DataTable dt = dbHelper.executeQuery(stat);
			
			if(dt.getRowCount() > 0){
				String tableId = dt.getRows().get(0).getValueAsString(0);
				if(tableId == null) return null;
				AisleDeviceLocation adl = new AisleDeviceLocation();
				adl.Id = (id.equals("") || id.equals("undefined"))?-1:Integer.parseInt(id);
				adl.TableId = Integer.parseInt(tableId);
				adl.TableName = tableName;
				adl.DeviceType = deviceType;
				adl.TableRow = Integer.parseInt(rows);
				adl.TableCol = Integer.parseInt(cols);
	            
				return adl;
			}else
				return null;
		} catch (Exception e) {
			log.error("SetRtspVideo() failed.", e);
		} finally {
			if(dbHelper != null)dbHelper.close();
		}
		return null;
	}
}
