package nurse.entity.persist;

import java.util.ArrayList;
import java.util.List;

import org.json.JSONArray;
import org.json.JSONObject;

import nurse.common.DataRow;
import nurse.common.DataRowCollection;
import nurse.common.DataTable;

public class Mdc {
	  public String id						   ;// ID
	  public String name				   ;// MDC名称，可考虑在告警的标题处显示
	  public String line1PhaseACurrentDeviceId;// 1路A相电流设备ID
	  public String line1PhaseACurrentSignalId;// 1路A相电流信号ID
	  public String line1PhaseAVoltageDeviceId;// 1路A相电压设备ID
	  public String line1PhaseAVoltageSignalId;// 1路A相电压信号ID
	  public String line1PhaseBCurrentDeviceId;// 1路B相电流设备ID
	  public String line1PhaseBCurrentSignalId;// 1路B相电流信号ID
	  public String line1PhaseBVoltageDeviceId;// 1路B相电压设备ID
	  public String line1PhaseBVoltageSignalId;// 1路B相电压信号ID
	  public String line1PhaseCCurrentDeviceId;// 1路C相电流设备ID
	  public String line1PhaseCCurrentSignalId;// 1路C相电流信号ID
	  public String line1PhaseCVoltageDeviceId;// 1路C相电压设备ID
	  public String line1PhaseCVoltageSignalId;// 1路C相电压信号ID
	  public String line2PhaseACurrentDeviceId;// 2路A相电流设备ID
	  public String line2PhaseACurrentSignalId;// 2路A相电流信号ID
	  public String line2PhaseAVoltageDeviceId;// 2路A相电压设备ID
	  public String line2PhaseAVoltageSignalId;// 2路A相电压信号ID
	  public String line2PhaseBCurrentDeviceId;// 2路B相电流设备ID
	  public String line2PhaseBCurrentSignalId;// 2路B相电流信号ID
	  public String line2PhaseBVoltageDeviceId;// 2路B相电压设备ID
	  public String line2PhaseBVoltageSignalId;// 2路B相电压信号ID
	  public String line2PhaseCCurrentDeviceId;// 2路C相电流设备ID
	  public String line2PhaseCCurrentSignalId;// 2路C相电流信号ID
	  public String line2PhaseCVoltageDeviceId;// 2路C相电压设备ID
	  public String line2PhaseCVoltageSignalId;// 2路C相电压信号ID
	  public String powerConsumptionDeviceId  ;//耗电量设备ID
	  public String powerConsumptionSignalId  ;//耗电量信号ID
	  public String description			   ;// 备注，暂未用
	  public double power;

	  public int lineNumber;//配电主电路数
	  public int cabinetNumber;//机柜总数
	  public int cabinetUHeight;//机柜U高
	  public int type;//微模块类型  单柜：0，单排：1，双排：2
	  
	  public static ArrayList<Mdc> fromCabinetSignalListData(DataTable dt){
		  ArrayList<Mdc> mdcs = new ArrayList<Mdc>();
			DataRowCollection drs = dt.getRows();
			int rowCount = dt.getRowCount();
			
			for(int i=0;i<rowCount;i++)
			{
				DataRow dataRow = drs.get(i);
				Mdc mdc = new Mdc();
				
				mdc.id = dataRow.getValueAsString("Id");
				mdc.name = dataRow.getValueAsString("Name");
				
				mdc.line1PhaseACurrentDeviceId = dataRow.getValueAsString("Line1PhaseACurrentDeviceId");
				mdc.line1PhaseACurrentSignalId = dataRow.getValueAsString("Line1PhaseACurrentSignalId");
				mdc.line1PhaseAVoltageDeviceId = dataRow.getValueAsString("Line1PhaseAVoltageDeviceId");
				mdc.line1PhaseAVoltageSignalId = dataRow.getValueAsString("Line1PhaseAVoltageSignalId");
				mdc.line1PhaseBCurrentDeviceId = dataRow.getValueAsString("Line1PhaseBCurrentDeviceId");
				mdc.line1PhaseBCurrentSignalId = dataRow.getValueAsString("Line1PhaseBCurrentSignalId");
				mdc.line1PhaseBVoltageDeviceId = dataRow.getValueAsString("Line1PhaseBVoltageDeviceId");
				mdc.line1PhaseBVoltageSignalId = dataRow.getValueAsString("Line1PhaseBVoltageSignalId");
				mdc.line1PhaseCCurrentDeviceId = dataRow.getValueAsString("Line1PhaseCCurrentDeviceId");
				mdc.line1PhaseCCurrentSignalId = dataRow.getValueAsString("Line1PhaseCCurrentSignalId");
				mdc.line1PhaseCVoltageDeviceId = dataRow.getValueAsString("Line1PhaseCVoltageDeviceId");
				mdc.line1PhaseCVoltageSignalId = dataRow.getValueAsString("Line1PhaseCVoltageSignalId");
				mdc.line2PhaseACurrentDeviceId = dataRow.getValueAsString("Line2PhaseACurrentDeviceId");
				mdc.line2PhaseACurrentSignalId = dataRow.getValueAsString("Line2PhaseACurrentSignalId");
				mdc.line2PhaseAVoltageDeviceId = dataRow.getValueAsString("Line2PhaseAVoltageDeviceId");
				mdc.line2PhaseAVoltageSignalId = dataRow.getValueAsString("Line2PhaseAVoltageSignalId");
				mdc.line2PhaseBCurrentDeviceId = dataRow.getValueAsString("Line2PhaseBCurrentDeviceId");
				mdc.line2PhaseBCurrentSignalId = dataRow.getValueAsString("Line2PhaseBCurrentSignalId");
				mdc.line2PhaseBVoltageDeviceId = dataRow.getValueAsString("Line2PhaseBVoltageDeviceId");
				mdc.line2PhaseBVoltageSignalId = dataRow.getValueAsString("Line2PhaseBVoltageSignalId");
				mdc.line2PhaseCCurrentDeviceId = dataRow.getValueAsString("Line2PhaseCCurrentDeviceId");
				mdc.line2PhaseCCurrentSignalId = dataRow.getValueAsString("Line2PhaseCCurrentSignalId");
				mdc.line2PhaseCVoltageDeviceId = dataRow.getValueAsString("Line2PhaseCVoltageDeviceId");
				mdc.line2PhaseCVoltageSignalId = dataRow.getValueAsString("Line2PhaseCVoltageSignalId");
				                                                         
				mdcs.add(mdc);
			}
			return mdcs;
	  }
	  
		public static List<Mdc> getJsonListCabinet(String jsonParams) throws Exception{
			List<Mdc> list = new ArrayList<Mdc>();
			JSONArray array = new JSONArray(jsonParams);
			for(int i = 0;i<array.length();i++){
				JSONObject param = new JSONObject(array.get(i).toString());
				Mdc mdc = new Mdc();
				
				mdc.id = param.getString("id");
				mdc.name = param.getString("name");
				
				mdc.line1PhaseACurrentDeviceId = param.getString("line1PhaseACurrentDeviceId");
				mdc.line1PhaseACurrentSignalId = param.getString("line1PhaseACurrentSignalId");
				mdc.line1PhaseAVoltageDeviceId = param.getString("line1PhaseAVoltageDeviceId");
				mdc.line1PhaseAVoltageSignalId = param.getString("line1PhaseAVoltageSignalId");
				mdc.line1PhaseBCurrentDeviceId = param.getString("line1PhaseBCurrentDeviceId");
				mdc.line1PhaseBCurrentSignalId = param.getString("line1PhaseBCurrentSignalId");
				mdc.line1PhaseBVoltageDeviceId = param.getString("line1PhaseBVoltageDeviceId");
				mdc.line1PhaseBVoltageSignalId = param.getString("line1PhaseBVoltageSignalId");
				mdc.line1PhaseCCurrentDeviceId = param.getString("line1PhaseCCurrentDeviceId");
				mdc.line1PhaseCCurrentSignalId = param.getString("line1PhaseCCurrentSignalId");
				mdc.line1PhaseCVoltageDeviceId = param.getString("line1PhaseCVoltageDeviceId");
				mdc.line1PhaseCVoltageSignalId = param.getString("line1PhaseCVoltageSignalId");
				mdc.line2PhaseACurrentDeviceId = param.getString("line2PhaseACurrentDeviceId");
				mdc.line2PhaseACurrentSignalId = param.getString("line2PhaseACurrentSignalId");
				mdc.line2PhaseAVoltageDeviceId = param.getString("line2PhaseAVoltageDeviceId");
				mdc.line2PhaseAVoltageSignalId = param.getString("line2PhaseAVoltageSignalId");
				mdc.line2PhaseBCurrentDeviceId = param.getString("line2PhaseBCurrentDeviceId");
				mdc.line2PhaseBCurrentSignalId = param.getString("line2PhaseBCurrentSignalId");
				mdc.line2PhaseBVoltageDeviceId = param.getString("line2PhaseBVoltageDeviceId");
				mdc.line2PhaseBVoltageSignalId = param.getString("line2PhaseBVoltageSignalId");
				mdc.line2PhaseCCurrentDeviceId = param.getString("line2PhaseCCurrentDeviceId");
				mdc.line2PhaseCCurrentSignalId = param.getString("line2PhaseCCurrentSignalId");
				mdc.line2PhaseCVoltageDeviceId = param.getString("line2PhaseCVoltageDeviceId");
				mdc.line2PhaseCVoltageSignalId = param.getString("line2PhaseCVoltageSignalId");
				
				mdc.powerConsumptionDeviceId = param.getString("powerConsumptionDeviceId");
				mdc.powerConsumptionSignalId = param.getString("powerConsumptionSignalId");
				mdc.description = param.getString("description");
				list.add(mdc);
			}
			return list;
		}
		public static ArrayList<Mdc> fromCabinetSignalListDatas(DataTable dt){
			    ArrayList<Mdc> mdcs = new ArrayList<Mdc>();
				DataRowCollection drs = dt.getRows();
				int rowCount = dt.getRowCount();
				
				for(int i=0;i<rowCount;i++)
				{
					DataRow dataRow = drs.get(i);
					Mdc mdc = new Mdc();
					
					mdc.id = dataRow.getValueAsString("Id");
					mdc.name = dataRow.getValueAsString("Name");
					
					mdc.line1PhaseACurrentDeviceId = dataRow.getValueAsString("Line1PhaseACurrentDeviceId");
					mdc.line1PhaseACurrentSignalId = dataRow.getValueAsString("Line1PhaseACurrentSignalId");
					mdc.line1PhaseAVoltageDeviceId = dataRow.getValueAsString("Line1PhaseAVoltageDeviceId");
					mdc.line1PhaseAVoltageSignalId = dataRow.getValueAsString("Line1PhaseAVoltageSignalId");
					mdc.line1PhaseBCurrentDeviceId = dataRow.getValueAsString("Line1PhaseBCurrentDeviceId");
					mdc.line1PhaseBCurrentSignalId = dataRow.getValueAsString("Line1PhaseBCurrentSignalId");
					mdc.line1PhaseBVoltageDeviceId = dataRow.getValueAsString("Line1PhaseBVoltageDeviceId");
					mdc.line1PhaseBVoltageSignalId = dataRow.getValueAsString("Line1PhaseBVoltageSignalId");
					mdc.line1PhaseCCurrentDeviceId = dataRow.getValueAsString("Line1PhaseCCurrentDeviceId");
					mdc.line1PhaseCCurrentSignalId = dataRow.getValueAsString("Line1PhaseCCurrentSignalId");
					mdc.line1PhaseCVoltageDeviceId = dataRow.getValueAsString("Line1PhaseCVoltageDeviceId");
					mdc.line1PhaseCVoltageSignalId = dataRow.getValueAsString("Line1PhaseCVoltageSignalId");
					mdc.line2PhaseACurrentDeviceId = dataRow.getValueAsString("Line2PhaseACurrentDeviceId");
					mdc.line2PhaseACurrentSignalId = dataRow.getValueAsString("Line2PhaseACurrentSignalId");
					mdc.line2PhaseAVoltageDeviceId = dataRow.getValueAsString("Line2PhaseAVoltageDeviceId");
					mdc.line2PhaseAVoltageSignalId = dataRow.getValueAsString("Line2PhaseAVoltageSignalId");
					mdc.line2PhaseBCurrentDeviceId = dataRow.getValueAsString("Line2PhaseBCurrentDeviceId");
					mdc.line2PhaseBCurrentSignalId = dataRow.getValueAsString("Line2PhaseBCurrentSignalId");
					mdc.line2PhaseBVoltageDeviceId = dataRow.getValueAsString("Line2PhaseBVoltageDeviceId");
					mdc.line2PhaseBVoltageSignalId = dataRow.getValueAsString("Line2PhaseBVoltageSignalId");
					mdc.line2PhaseCCurrentDeviceId = dataRow.getValueAsString("Line2PhaseCCurrentDeviceId");
					mdc.line2PhaseCCurrentSignalId = dataRow.getValueAsString("Line2PhaseCCurrentSignalId");
					mdc.line2PhaseCVoltageDeviceId = dataRow.getValueAsString("Line2PhaseCVoltageDeviceId");
					mdc.line2PhaseCVoltageSignalId = dataRow.getValueAsString("Line2PhaseCVoltageSignalId");
					
					mdc.powerConsumptionDeviceId = dataRow.getValueAsString("PowerConsumptionDeviceId");
					mdc.powerConsumptionSignalId = dataRow.getValueAsString("PowerConsumptionSignalId");
					mdc.description = dataRow.getValueAsString("Description");
					          
					mdc.cabinetNumber = dataRow.getValueAsString("CabinetNumber") == null ? 24 : 
						Integer.parseInt(dataRow.getValueAsString("CabinetNumber"));
					mdc.cabinetUHeight = dataRow.getValueAsString("CabinetUHeight") == null ? 42 : 
						Integer.parseInt(dataRow.getValueAsString("CabinetUHeight"));
					
					mdc.type = dataRow.getValueAsString("Type") == null ? 2 :
						Integer.parseInt(dataRow.getValueAsString("Type"));
					
					//计算主电路数
					int sum = 0;
					for(int j = 0;j < 3;j ++){//Line2PhaseA|B|C
						String a = "Line2PhaseA";
						if(j == 1) a = "Line2PhaseB";
						if(j == 2) a = "Line2PhaseC";
						for(int x = 0;x < 2;x ++){//Current|Voltage
							String b = (x == 0) ? "Current" : "Voltage";
							for(int y = 0;y < 2;y ++){//DeviceId|SignalId
								String c = (y == 0) ? "DeviceId" : "SignalId";
								String str = String.format("%s%s%s", a,b,c);
								if(dataRow.getValue(str) != null && !dataRow.getValue(str).equals("")){
									sum ++;
								}
							}
						}
					}
					if(sum < 12) mdc.lineNumber = 1;
					else mdc.lineNumber = 2;
					
					mdcs.add(mdc);
				}
				return mdcs;
		  }
}                                            
