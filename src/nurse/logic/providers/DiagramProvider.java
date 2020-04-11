package nurse.logic.providers;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.BufferedWriter; 
import java.io.OutputStreamWriter;
import java.text.DecimalFormat;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Date;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;


import java.io.FileOutputStream;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import nurse.entity.persist.OtherModule;
import nurse.entity.view.DiagramPart;
import nurse.utility.ControlAdaptiveHelper;
import nurse.utility.MainConfigHelper;
import org.apache.log4j.Logger;

import nurse.NurseApp;
import nurse.entity.persist.ActiveSignal;
import nurse.entity.persist.ChartHistorySignal;
import nurse.entity.persist.Puerecord;
import nurse.entity.trasfer.PartData;
import nurse.operation.NumericalCalculator;
import nurse.utility.Base64Helper;
import nurse.utility.BasePath;
import org.json.JSONArray;
import org.json.JSONObject;

public class DiagramProvider {

	private static DiagramProvider instance = new DiagramProvider();
	private static Logger log = Logger.getLogger(NurseApp.class);
	private static HashMap<String,HashMap<String, ActiveSignal>> exprMap = new HashMap<String,HashMap<String, ActiveSignal>>();
	private static HashMap<String,String> partIdAndDataMap = new HashMap<String,String>();
	private static HashMap<String,List<PartData>> partDataMap = new HashMap<String,List<PartData>>();
	private static HashMap<String,List<ActiveSignal>> lineChartMap = new HashMap<String,List<ActiveSignal>>();

	public DiagramProvider() {
	}

	public static DiagramProvider getInstance() {
		return instance;
	}

	private String getFile(String name) {

		String filePath = BasePath.getDirByEnv("diagrams/" + name + ".json");
		
		log.debug("diagrams File:" + filePath);
	
		File f = new File(filePath);

		int index = name.indexOf("templates");
		if (!f.exists()){
			if(index != -1){
				filePath = BasePath.getDirByEnv("diagrams/templates/9999.json");
				f = new File(filePath);
			}else
				return null;
		}
		String fileContent = "";

		try {
			FileInputStream fis = new FileInputStream(f);
			InputStreamReader isr = new InputStreamReader(fis, "UTF-8");
			BufferedReader br = new BufferedReader(isr);

			String line = null;
			while ((line = br.readLine()) != null) {
				fileContent += line;
				fileContent += "\r\n";
			}

			br.close();
		} catch (Exception e) {
			e.printStackTrace();
		}

		return fileContent;
	}

	public String getDiagramInstance(String typeId) {
		/*if(MainConfigHelper.getConfig().loginPage.equals("IView"))
			return getFile("iView/instances/" + typeId);
		else*/
			return getFile("instances/" + typeId);
	}

	public String getDiagramTemplate(String typeId) {
		if(MainConfigHelper.getConfig().loginPage.equals("IView"))
			return getFile("iView/templates/" + typeId);
		else
			return getFile("templates/" + typeId);
	}

	public void saveInstanceFile(String fileName, String content) {		
		//log.info("-------------start save diagram- convert to base 64-------------");
		content =content+":base64";
		//log.info(content);
		String encoding = "utf-8";

		String path = "diagrams/instances/";
		/*if(MainConfigHelper.getConfig().loginPage.equals("IView"))
			path = "diagrams/iView/instances/";*/

		File file = new File(BasePath.getDirByEnv(path));
		if(!file.exists())
			file.mkdirs();
		String filePath = BasePath.getDirByEnv(path  + fileName );
		
		File f = new File(filePath); 
		
		if (f.exists()) f.delete();
		
		try { 
	        
	        f.createNewFile();  
	        BufferedWriter writer = new BufferedWriter(new OutputStreamWriter(new FileOutputStream(filePath), encoding));  
	        writer.write(content);  
	        writer.close();  
	        
	    } catch (IOException e) {  
	        e.printStackTrace();  
	    }		
	}
	

	
	public PartData getVirtualSignalPartData(String params){
		PartData pds = new PartData();
		
		if(params.equals("undefined")) return pds;
		String[] tokens = params.split("\\$");
		if(tokens.length == 1) return pds;
		String partId = tokens[0];
		String expr = tokens[1].substring(tokens[1].indexOf(":")+1);
		String expr2 = Base64Helper.decode(expr);
		HashMap<String,ActiveSignal> m = new HashMap<String,ActiveSignal>();
		loopExpression(expr2,m);
		HashMap<String,ActiveSignal> map = m;
		exprMap.put(partId, map);

		pds.partId = partId;
		pds.description = expr;

		return pds;
	}
	
	private void loopExpression(String expr,HashMap<String,ActiveSignal> map){
		String str = expr,key = "";
		while(true){
			ActiveSignal as = new ActiveSignal();
			int indexStart = str.indexOf("[");
			int indexEnd = str.indexOf("]");
			try {
				String[] split = null;
				if(str.indexOf("-") != -1) {
					//split = str.substring(indexStart + 1, indexEnd).split("\\-");
					String exper = str.substring(indexStart + 1, indexEnd);
					int index = exper.indexOf("-");
					split = new String[2];
					split[0] = exper.substring(0,index);
					split[1] = exper.substring(index+1);
				}else if(str.indexOf(",") != -1)
					split = str.substring(indexStart+1, indexEnd).split("\\,");
				else{
                    map.put(key, as);
                    break;
                }

				as.deviceId = Integer.parseInt(split[0]);
				as.signalId = Integer.parseInt(split[1]);
				
				key = str.substring(indexStart, indexEnd+1);
				
				str = str.substring(str.indexOf("]")+1);
			} catch (Exception e) {
				log.error("loopExpression Exception:",e);
				break;
			}
			map.put(key, as);
			if(str.indexOf("[") == -1) break;
		}
	}
	
	public void getVirtualSignalCountValue(PartData pd){
		if(!exprMap.containsKey(pd.partId)){
			pd.currentValue = "---";
			pd.alarmSeverity = "-255";
			return;
		}
        try {
			pd.currentValue = getExpressionString(pd,pd.partId,Base64Helper.decode(pd.description));
        } catch (Exception t) {
			pd.currentValue = "---";
			pd.alarmSeverity = "-255";
    		return;
        } 
	}

	public List<PartData> historySignalPartDatas(String params){
		List<PartData> pds = new ArrayList<PartData>();
		
		if(params.equals("undefined")) return pds;
		if(partDataMap.containsKey(params))
			return partDataMap.get(params);
		
		String[] tokens = params.split("\\$");
		if(tokens.length == 1) return pds;
		String partId = tokens[0];
		//DataType|Days&BS:BaseTypeId|DI:DeviceId&BS:BaseTypeId|DI:DeviceId
		String[] expr = tokens[1].split("\\&");
		
		if(expr.length == 1){//Pue
			PartData pd = new PartData();
			pd.partId = partId;
			pd.description = expr[0];
			pds.add(pd);
		}
		for(int i = 1;i < expr.length;i++){
			pds.addAll(getPartDatas(partId,expr[i],expr[0]));
		}
		partDataMap.put(params, pds);
		return pds;
	}
	
	private List<PartData> getPartDatas(String partId,String expr,String description){
		List<PartData> pds = new ArrayList<PartData>();
		String[] es = expr.split("\\|");
		String deviceId = getStringByName(expr,"DI");
		for(int i = 0;i < es.length; i++){
			if(es[i].indexOf("DI") > -1) continue;
			PartData pd = new PartData();
			int index = es[i].indexOf(":")+1;
			pd.partId = partId;
			pd.deviceId = deviceId;
			pd.baseTypeId = es[i].substring(index);
			pd.description = description;
			pds.add(pd);
		}
		return pds;
	}

	public String getHistorySignalCountValue(PartData pd){
		try {
			//DataType(1:Signal 2:Pue)|Days|HsDataType(avg/max/min)
			String[] desc = pd.description.split("\\|");
			if(desc[0].equals("1")){
				ArrayList<ChartHistorySignal> hss = CacheHistorySignalProvider.getInstance()
					.getHistorySignalsByDay(Integer.parseInt(pd.deviceId), Integer.parseInt(pd.baseTypeId), Integer.parseInt(desc[1]));

				if(desc.length > 2)
					return getSignalCountValue(hss,pd,desc[2]);
				else
					return getSignalCountValue(hss,pd,"avg");
			}else{
				ArrayList<Puerecord> prs = CacheHistorySignalProvider.getInstance().getAllPueRecordsByDay(Integer.parseInt(desc[1]));

				return getPueCountValue(prs);
			}
		} catch (Exception e) {
			return "{\"dates\":[],\"datas\":[]}";
		}
	}
	
	private String getSignalCountValue(ArrayList<ChartHistorySignal> hss,PartData pd,String type){
		try {
			String result = "{\"dates\":[%s],\"datas\":[%s]}";
			String dates = "";
			String datas = "";
			pd.signalName = hss.get(0).signalName;
			pd.deviceName = hss.get(0).deviceName;
			SimpleDateFormat format = new SimpleDateFormat("MM-dd"); 
			for(int i = 0;i < hss.size();i++){
				if(i > 0){
					dates += ",";
					datas += ",";
				}
				String date = format.format(hss.get(i).sampleTime);
				dates += "\""+date+"\"";
				//判断数据类型
				if(type.equals("max"))
					datas += "\""+hss.get(i).maxFloatValue+"\"";
				else if(type.equals("min"))
					datas += "\""+hss.get(i).minFloatValue+"\"";
				else
					datas += "\""+hss.get(i).avgFloatValue+"\"";
			}
			result = String.format(result, dates,datas);
			return result;
		} catch (Exception e) {
			return "{\"dates\":[],\"datas\":[],\"unit\":\"\"}";
		}
	}
	
	public String getPueCountValue(ArrayList<Puerecord> prs){
		try {
			String result = "{\"dates\":[%s],\"datas\":[%s]}";
			String dates = "";
			String datas = "";
			for(int i = 0;i < prs.size();i++){
				if(i > 0){
					dates += ",";
					datas += ",";
				}
				dates += "\""+prs.get(i).id+"\"";
				datas += "\""+prs.get(i).pue+"\"";
			}
			result = String.format(result, dates,datas);
			return result;
		} catch (Exception e) {
			return "{\"dates\":[],\"datas\":[]}";
		}
	}
	
	public String descriptionUpdateData(PartData pd){
		if(pd.description == null) return "";
		try {
			if(pd.description.indexOf("piechart") != -1){
				//实时图表；2:PUE 3:MDC功率 4:MDC空间总占比 5:IT负载 6:其他占比
				return getActiveChartsData(pd);
			}
		} catch (Exception e) {
			log.error("descriptionUpdateData Exception:",e);
		}
		return "";
	}
	
	private String getActiveChartsData(PartData pd){
		try {
			String[] descs = pd.description.split("\\|");
			int num = Integer.parseInt(descs[1]);
			switch(num){
			case 2://2:PUE 
				return ActiveSignalProvider.getInstance().getActivePueChartsData();
			case 3://3:MDC功率 
				return ActiveSignalProvider.getInstance().getActivePowerChartsData();
			case 4://4:MDC空间总占比 
				return ActiveSignalProvider.getInstance().getMdcSpaceChartsData();
			case 5://5:IT负载 
				return ActiveSignalProvider.getInstance().getItLoadChartsData();
			case 6://6:其他占比  piechart|6|expr1:&expr2:
				return getOtherChartsData(pd.partId,descs[2]);
			default:
				return "";
			}
		} catch (Exception e) {
			log.error("getActivePieChartData Exception:", e);
		}
		return "";
	}
	
	public void saveActiveSignalMap(String partId,String expression){
		// expr => expr1:加密&expr2:加密
		try {
			String[] exprs = expression.split("\\&");
			
			HashMap<String,ActiveSignal> map = new HashMap<String,ActiveSignal>();
			for(String exp : exprs){
				String e = Base64Helper.decode(exp.substring(exp.indexOf(":")+1));
				loopExpression(e,map);
			}

			if(map != null && map.size() != 0)
				exprMap.put(partId,map);
		} catch (Exception e) {
			log.error("saveActiveSignalMap Exception:"+e);
		}
	}

	public String getOtherChartsData(String partId,String expression){
		if(!exprMap.containsKey(partId)) return "{\"other\":1,\"usage\":0,\"value\":0}";
		try {
			String[] exprs = expression.split("\\&");

			String e1 = Base64Helper.decode(exprs[0].substring(exprs[0].indexOf(":")+1));
			String e2 = Base64Helper.decode(exprs[1].substring(exprs[1].indexOf(":")+1));

			double result1 = Double.parseDouble(getExpressionString(null,partId,e1));
			if(e2.equals("undefined") || e2.equals("")){//仪表盘
				return String.format("{\"value\":\"%s\"}", result1);
			}else{//饼图
				double total = Double.parseDouble(getExpressionString(null,partId,e2));
				
				double result2 = 0;
				if(result1 > 0)
					result2 = (result1/ total) * 100;
				
				if(result2 > 100)
					result2 = 100;
				
				String other = new DecimalFormat("0.00").format(100 - result2);
				String usage = new DecimalFormat("0.00").format(result2);

				return String.format("{\"other\":\"%s\",\"usage\":\"%s\",\"value\":\"%s\"}", other,usage,result1);
			}
		} catch (Exception e) {
			log.error("getOtherChartsData Exception:"+e);
		}
		return "{\"other\":1,\"usage\":0,\"value\":0}";
	}
	
	private String getExpressionString(PartData pd,String partId,String expression){
		String result = "0";
		if(!exprMap.containsKey(partId)) return result;
		String exper = expression;
		try {
			HashMap<String,ActiveSignal> map = exprMap.get(partId);
			Iterator<String> keys = map.keySet().iterator();
			
			while(keys.hasNext()){
				String key = keys.next();
				if(key == null || key.equals("")) continue;
				ActiveSignal signal = map.get(key);
				ActiveSignal as = ConfigCache.getInstance().getActiveSignal(signal.deviceId, signal.signalId);
				if(pd != null) pd.alarmSeverity = String.valueOf(as.getAlarmSeverity(signal.deviceId));

				if (as.showPrecision != null)
					exper = exper.replace(key, String.valueOf(new DecimalFormat(as.showPrecision).format(as.getFloatValue())));
				else
					exper = exper.replace(key, String.valueOf(new DecimalFormat("0.00").format(as.getFloatValue())));
			}

			//正则保护表达式
			exper = getRegularResult(exper);
			
			String fun = "";
			if(exper.indexOf("int") != -1){
				fun = "int";
				exper = exper.replaceAll("int", ""); 
			}else if(exper.indexOf("dou") != -1) {
                fun = "dou";
                exper = exper.replaceAll("dou", "");
            }

			//log.info("NumericalCalculator.cal:"+exper);//----------------------------------------
			//运算函数
            double cal = 0;
            try{
                cal = NumericalCalculator.cal(exper);
            }catch (Exception ex){
                System.out.println("DiagramProvider Error Expression:"+exper);
                cal = 0;
            }

			//根据函数计算数据 int()整型   Dou()浮点型
			if(fun.equals("int"))
				result = new DecimalFormat("0").format(cal);
            else if(fun.equals("dou"))
                result = new DecimalFormat("0.00").format(cal);
			else
				result = new DecimalFormat("0.0").format(cal);

			return result;
		} catch (Exception e) {
			log.error("getExpressionString Expression:"+exper+" Exception:",e);
			return "0";
		}
	}

	private static final String REGEX = "\\[\\d*\\-[-]?\\d*\\]";
	//判断exper是否包含[\d*-\d*]，包含返回0，否则返回exper
	private String getRegularResult(String exper){
		try{
			Pattern p = Pattern.compile(REGEX);
			Matcher m = p.matcher(exper);
			String result = m.replaceAll("0").trim();
			return result;
		}catch (Exception ex){
			return "0";
		}
	}
	
	private String getStringByName(String str,String name){
		String result = "";
		try {
			String[] strs = str.split("\\|");
			for(String s : strs){
				if(s.indexOf(name) > -1)
					result = s.substring(s.lastIndexOf(name+":")+(name.length()+1));
			}
			return result;
		} catch (Exception e) {
			return "";
		}
	}
	
	public List<PartData> lineChartPartDatas(String params){
		List<PartData> pds = new ArrayList<PartData>();
		
		if(params.equals("undefined")) return pds;
		/*if(partDataMap.containsKey(params))
			return partDataMap.get(params);*/
		
		try {
			String[] tokens = params.split("\\$");
			if(tokens.length == 1) return pds;
			//partId$line|30&BS:xxx|DI:xxx&BS:xxx|DI:xxx
			String partId = tokens[0];
			// 优化缓存 根据partId缓存数据
			if(partIdAndDataMap.containsKey(partId)){
				if(partIdAndDataMap.get(partId).equals(params)){
					return partDataMap.get(partId);
				}
			}
			partIdAndDataMap.put(partId,params);

			String[] split = tokens[1].split("\\&");
			for(int i = 1;i < split.length;i++){
				if(split[i].indexOf("DI") == -1 || split[i].indexOf("BS") == -1) continue;
				PartData pd = new PartData();
				pd.partId = partId;
				pd.deviceId = getStringByName(split[i],"DI");
				pd.baseTypeId = getStringByName(split[i],"BS");
				pd.description = split[0];
				pds.add(pd);
			}
			partDataMap.put(partId, pds);
			return pds;
		} catch (Exception e) {
			return pds;
		}
	}
	
	public List<PartData> tableChartPartDatas(String params){
		List<PartData> pds = new ArrayList<PartData>();
		
		if(params.equals("undefined")) return pds;
		if(partDataMap.containsKey(params))
			return partDataMap.get(params);
		try {
			String[] tokens = params.split("\\$");
			if(tokens.length == 1) return pds;
			//partId$DeviceId.BaseTypeId|DeviceId.BaseTypeId|...
			String partId = tokens[0];
			String[] split = tokens[1].split("\\|");
			
			for(int i = 0;i < split.length;i++){
				if(split[i].indexOf(".") == -1) continue;
				String[] dbs = split[i].split("\\.");
				PartData pd = new PartData();
				pd.partId = partId;
				pd.deviceId = dbs[0];
				pd.baseTypeId = dbs[1];
				pds.add(pd);
			}
			partDataMap.put(params, pds);
			return pds;
		} catch (Exception e) {
			log.error("TableChartPartDatas Exception:",e);
			return pds;
		}
	}
	
	public void updatePartDataLineChart(PartData pd){
		try {
			ActiveSignal as = getActiveSignal(ConfigCache.getInstance().getActiveBaseTypeSignal(Integer.parseInt(pd.deviceId),Integer.parseInt(pd.baseTypeId)));
			if (as == null) return;
			
			pd.deviceName = as.deviceName;
			pd.baseTypeName = as.baseTypeName;
			pd.unit = as.unit;
			pd.alarmSeverity = String.valueOf(as.getAlarmSeverity(Integer.parseInt(pd.deviceId)));
			//pd.currentValue = "{date:[%s],data:[%s]}";
			
			//Key:DeviceId|BaseTypeId Value:ActiveSignal
			String key = String.format("%s|%s", pd.deviceId,pd.baseTypeId);
			List<ActiveSignal> list = new ArrayList<>();
			if(lineChartMap.containsKey(key)){
				list = lineChartMap.get(key);
				boolean is = false;
				for(int i = 0;i < list.size();i++){
					if(list.get(i).updateTime == as.updateTime){
						is = true;
						break;
					}
				}
				if(!is) list.add(as);
				
				//lineChartMap.remove(key);
				lineChartMap.put(key, cleanOutmodedLineChartData(list,pd.description));
				pd.currentValue = getLineCahrtData(lineChartMap.get(key));
			}else{
				list.add(as);
				lineChartMap.put(key, list);
				pd.currentValue = getLineCahrtData(lineChartMap.get(key));
			}
			
		} catch (Exception e) {
			log.error("updatePartDataLineChart Exception:",e);
			return;
		}
	}

	public void updatePartDatabarChart(PartData pd){
		try{
			ActiveSignal as = getActiveSignal(ConfigCache.getInstance().getActiveBaseTypeSignal(Integer.parseInt(pd.deviceId),Integer.parseInt(pd.baseTypeId)));
			if (as == null) return;

			pd.deviceName = as.deviceName;
			pd.baseTypeName = as.baseTypeName;
			pd.unit = as.unit;
			pd.alarmSeverity = String.valueOf(as.getAlarmSeverity(Integer.parseInt(pd.deviceId)));

			pd.currentValue = String.format("{\"date\":[\"%s\"],\"data\":[%s]}",pd.baseTypeName,String.format("%.1f", as.getFloatValue()));
		}catch (Exception e){
			log.error("updatePartDatabarChart Exception:",e);
			return;
		}
	}

	public PartData avgMaxMinPartData(String params){
		List<PartData> pds = new ArrayList<PartData>();
		PartData pd = new PartData();
		if(params.equals("undefined")) return pd;

		try{
			String[] tokens = params.split("\\$");
			if(tokens.length == 1) return pd;
			//partId$gauge|AvgMaxMin&BS:xxx|DI:xxx&BS:xxx|DI:xxx
			String partId = tokens[0];

			// 优化缓存 根据partId缓存数据
			if(partIdAndDataMap.containsKey(partId)){
				if(partIdAndDataMap.get(partId).equals(params)){
					return partDataMap.get(partId).get(0);
				}
			}
			partIdAndDataMap.put(partId,params);

			String[] split = tokens[1].split("\\&");
			for(int i = 1;i < split.length;i++){
				if(split[i].indexOf("DI") == -1 || split[i].indexOf("BS") == -1) continue;
				PartData p = new PartData();
				p.partId = partId;
				p.deviceId = getStringByName(split[i],"DI");
				p.baseTypeId = getStringByName(split[i],"BS");
				p.description = split[0];
				pds.add(p);
			}
			partDataMap.put(partId, pds);

			pd.partId = partId;
			pd.description = split[0];//gauge|AvgMaxMin
			return pd;
		}catch (Exception ex){
			return pd;
		}
	}

	public void avgMaxMinUpdateData(PartData pd){
		try{
			if(!partDataMap.containsKey(pd.partId)){
				pd.currentValue = "{\"avg\":0,\"max\":0,\"min\":0,\"unit\":\"\"}";
				return;
			}
			/************************************************************************/
			//log.info("PartData Key:"+pd.partId+", Size:"+partDataMap.get(pd.partId).size());
			/************************************************************************/

			double count = 0,avg = 0,sum = 0,max = 0,min = 0;
			String unit = "";

			List<PartData> pds = partDataMap.get(pd.partId);
			for(PartData p : pds){
				ActiveSignal as = ConfigCache.getInstance().getActiveBaseTypeSignal(Integer.parseInt(p.deviceId),Integer.parseInt(p.baseTypeId));
				if (as == null) continue;

				sum += as.getFloatValue();
				if(count == 0){
					max = as.getFloatValue();
					min = as.getFloatValue();
					unit = as.unit;
				}else{
					if(as.getFloatValue() > max)
						max = as.getFloatValue();
					if(as.getFloatValue() < min)
						min = as.getFloatValue();
				}

				count ++;
			}

			if(count > 0) avg = sum / count;

			pd.currentValue = String.format("{\"avg\":\"%s\",\"max\":\"%s\",\"min\":\"%s\",\"unit\":\"%s\"}",
					String.format("%.1f", avg),String.format("%.1f", max),String.format("%.1f", min),unit);
			/************************************************************************/
			//log.info("Result:"+pd.currentValue);
			/************************************************************************/
		}catch (Exception ex){
			pd.currentValue = "{\"avg\":0,\"max\":0,\"min\":0,\"unit\":\"\"}";
		}
	}

	private ActiveSignal getActiveSignal(ActiveSignal as){
		if(as == null) return null;
		ActiveSignal item = new ActiveSignal();
		item.deviceId = as.deviceId;
		item.deviceName = as.deviceName;
		item.baseTypeId = as.baseTypeId;
		item.baseTypeName = as.baseTypeName;
		item.signalId = as.signalId;
		item.signalName = as.signalName;
		item.floatValue = as.getFloatValue();
		item.updateTime = as.updateTime;
		item.unit = as.unit;
		return item;
	}
	
	/** 清理过时的数据 */
	private List<ActiveSignal> cleanOutmodedLineChartData(List<ActiveSignal> signals,String desc){
		List<ActiveSignal> list = new ArrayList<ActiveSignal>();
		try {
			/*//获取30秒内的实时数据
			int sec = Integer.parseInt(desc.split("\\|")[1]);//desc:line|30
			Date nowTime = new Date();
			for(ActiveSignal as : signals){
				if(as.updateTime == null || as.updateTime.equals(""))
					as.updateTime = new Date();
				if(as.updateTime.getTime() > nowTime.getTime() - sec*1000 || signals.size() <= 7){
					list.add(as);
				}
			}*/
			//获取最新的size个实时数据
			Collections.sort(signals);
			int size = Integer.parseInt(desc.split("\\|")[1]);//desc:line|7
			for(int i = 0;i < signals.size(); i++){
				if(i >= signals.size() - size){
					if(signals.get(i).updateTime != null && !signals.get(i).updateTime.equals(""))
						list.add(signals.get(i));
				}
			}
		} catch (Exception e) {
			log.error("closeOutmodedLineChartData Exception:",e);
		}
		return list;
	}
	
	/** 返回折线图表的格式化数据 */
	private String getLineCahrtData(List<ActiveSignal> signals){
		SimpleDateFormat formatter = new SimpleDateFormat("HH:mm:ss");
		try {
			String date = "",data = "";
			for(int i = 0;i < signals.size();i++){
				if(signals.get(i).updateTime == null || signals.get(i).updateTime.equals(""))
					signals.get(i).updateTime = new Date();
				
				if(i == 0){
					 date = String.format("\"%s\"", formatter.format(signals.get(i).updateTime));
					 data = String.format("%.1f", signals.get(i).floatValue);
				}else{
					date += String.format(",\"%s\"", formatter.format(signals.get(i).updateTime));
					data += "," + String.format("%.1f", signals.get(i).floatValue);
				}
			}
			return String.format("{\"date\":[%s],\"data\":[%s]}", date,data);
		} catch (Exception e) {
			log.error("getLineCahrtData Exception:",e);
			return "{\"date\":[],\"data\":[]}";
		}
	}


	public String saveNodeTemperature(String jsonName,String content){
		try{
			String path = BasePath.getWebDirByEnv("web/data/nodeTemperature/");

			File file = new File(path);
			if(!file.exists())
				file.mkdirs();
			String filePath = path +"/"+jsonName;

			File f = new File(filePath);

			log.info("FilePath:"+f.getPath());

			if (f.exists()) f.delete();

			try {

				f.createNewFile();
				BufferedWriter writer = new BufferedWriter(new OutputStreamWriter(new FileOutputStream(filePath), "UTF-8"));
				writer.write(content);
				writer.close();

				return "OK";
			} catch (IOException e) {
				log.error("SaveNodeTemperature Exception:",e);
				return "IOError";
			}
		}catch (Exception ex){
			log.error("SaveNodeTemperature Exception:",ex);
			return "Error";
		}
	}

	//region 生成静态框架页面
	public String generateStaticPage(String fileName,JSONObject obj){
		try {
			JSONArray arr = obj.getJSONArray("parts");
			ArrayList<DiagramPart> parts = getParts(arr);
			jointStaticCode(fileName,parts);
			
			return "OK";
		}catch (Exception ex){
			log.error("GenerateStaticPage Exception:",ex);
			return "Error";
		}
	}

	/** 根据JSONArray返回parts集合 */
	private ArrayList<DiagramPart> getParts(JSONArray parts){
		ArrayList<DiagramPart> list = new ArrayList<DiagramPart>();
		for(int i = 0; i < parts.length(); i++){
			DiagramPart part = new DiagramPart();
			JSONObject obj = parts.getJSONObject(i);

			part.setId(getJsonValue(obj,"id"));
			part.setType(getJsonValue(obj,"type"));
			part.setLeft(getJsonValue(obj,"left"));
			part.setTop(getJsonValue(obj,"top"));
			part.setWidth(getJsonValue(obj,"width"));
			part.setHeight(getJsonValue(obj,"height"));
			part.setzIndex(getJsonValue(obj,"zindex"));
			part.setOptions(getJsonValue(obj,"options"));

			list.add(part);
		}
		return list;
	}

	/** 获取JsonObject的key的值，不存在key返回“” */
	private String getJsonValue(JSONObject obj,String key){
		try{
			if(obj.has(key)){
				return String.valueOf(obj.get(key));
			}else {
				if(key.equals("zindex"))
					return "0";
				return "";
			}
		}catch (Exception ex){
			log.error("GetJsonValue:",ex);
			return "";
		}
	}
	
	/** 拼接静态代码 */
	private String jointStaticCode(String fileName,ArrayList<DiagramPart> parts){
		String path = BasePath.getWebDirByEnv("/web/partials/templates");
		path = String.format("%s/%s.html",path,fileName);

		ArrayList<String> list = new ArrayList<String>();
		list.add("<div id=\"body-structure\" style=\"background-image: url('');\" class=\"ng-scope body-structure\">");
		for(DiagramPart part : parts){
			//读
			ArrayList<String> codes = loadConfigCode(part.type);
			//编辑
			HashMap<String, String> optionMap = splitOptions(part.options);//拆分Options为Map集合
			//	自适应
			part = ControlAdaptiveHelper.getInstance().initPart(part);
			// ------------------------------------
			//System.out.println("Adaptive:"+part.toString());
			// ------------------------------------
			codes = compileCodes(codes,part,optionMap);
			//存
			list.addAll(codes);
		}
		list.add("</div>");
		//写
		boolean bool = OtherModuleProvider.getInstance().writeFile(path, list, "UTF-8");
		// ------------------------------------
		//System.out.println("Write is "+bool);
		// ------------------------------------
		return "OK";
	}

	/** 根据type获取配置代码 */
	private ArrayList<String> loadConfigCode(String type){
		String path = BasePath.getWebDirByEnv("/web/partials/templates/config");
		path = String.format("%s/%s.html",path,type);

		ArrayList<String> reads = OtherModuleProvider.getInstance().readFile(path,"UTF-8");

		return reads;
	}

	/** 编辑代码 */
	private ArrayList<String> compileCodes(ArrayList<String> codes,DiagramPart part,HashMap<String, String> optionMap){
		ArrayList<String> list = new ArrayList<String>();
		for(String line : codes){
			if(line.indexOf("[id]") != -1)
				line = line.replace("[id]",part.id);

			if(line.indexOf("[left]") != -1)
				line = line.replace("[left]",part.left);

			if(line.indexOf("[top]") != -1)
				line = line.replace("[top]",part.top);

			if(line.indexOf("[width]") != -1)
				line = line.replace("[width]",part.width);

			if(line.indexOf("[height]") != -1)
				line = line.replace("[height]",part.height);

			if(line.indexOf("[zindex]") != -1)
				line = line.replace("[zindex]",part.zIndex);

			//存在options
			if(line.indexOf("[options") != -1)
				line = parseOptions(line,part.options,optionMap);

			//存在control
			if(line.indexOf("[control") != -1)
				line = parseControl(line,part,optionMap);

			list.add(line);
		}
		return list;
	}

	/** 解析Options编辑Line */
	private String parseOptions(String line,String options,HashMap<String, String> optionMap){
		String result = "";

		if(line.indexOf("[options]") != -1)
			result = line.replace("[options]",options);
		else
			result = parseOptionPart(line,optionMap);
		return result;
	}
	private String parseOptionPart(String line,HashMap<String, String> optionMap){
		String result = line;

		for (String key : optionMap.keySet()){
			String value = optionMap.get(key);
			String ch = String.format("[options.%s]",key);

			if(result.indexOf(ch) != -1)
				result = result.replace(ch,value);
			// --------------------------------------------------------
			//System.out.println("Chan:"+ch+", Value:"+value+", Result:"+result);
			// --------------------------------------------------------
		}

		return result;
	}

	/** 拆分Options为Map集合 */
	private HashMap<String,String> splitOptions(String options){
		HashMap<String,String> map = new HashMap<String,String>();
		try{
			String[] split = options.split("\\|");
			// --------------------------------------------------------
			//System.out.println("Options:"+options);
			// --------------------------------------------------------
			for(String str : split){
				String[] val = str.split("\\:");
				String v = val.length > 1 ? val[1].trim() : "";

				map.put(val[0].trim(),v);
				// --------------------------------------------------------
				//System.out.println("Length:"+val.length+", Key:"+val[0]+", Value:"+v);
				// --------------------------------------------------------
			}

		}catch (Exception ex){
			log.error("SplitOptions:",ex);
		}
		return map;
	}

	/** 解析Control编辑Line */
	private String parseControl(String line,DiagramPart part,HashMap<String, String> optionMap){
		HashMap<String,String> controlMap = new HashMap<String,String>();

		if(part.type.equals("piechartpart"))
			controlMap = splitPieChartPart(part,optionMap);
		if(part.type.equals("signalgroup"))
			controlMap = splitSignalGroup(part,optionMap);
		if(part.type.equals("controlpart"))
			controlMap = splitControlPart(part,optionMap);

		String result = line;
		for(String key : controlMap.keySet()){
			String value = controlMap.get(key);
			String ch = String.format("[control.%s]",key);

			if(result.indexOf(ch) != -1)
				result = result.replace(ch,value);
		}
		return result;
	}
	private HashMap<String,String> splitPieChartPart(DiagramPart part,HashMap<String, String> optionMap){
		double per = getControlPercent(Double.parseDouble(part.width),Double.parseDouble(part.height)-19,300);
		double width = per * 300;
		double fontSize = per*42;
		double top = (width / 2);

		HashMap<String,String> map = new HashMap<String,String>();
		map.put("Width",String.valueOf(width));
		map.put("Height",String.valueOf(width));
		map.put("FontSize",String.valueOf(fontSize));

		String title = optionMap.get("Title");
		if(title == null || title.length() == 0)
			map.put("Top",String.valueOf(top));
		else
			map.put("Top",String.valueOf(top+34));

		return map;
	}
	private HashMap<String,String> splitSignalGroup(DiagramPart part,HashMap<String, String> optionMap){
		HashMap<String,String> map = new HashMap<String,String>();
		int height = 0;

		String name = optionMap.get("Name");
		if(name == null || name.equals(""))//标题为空时
			height = (int)(Double.parseDouble(part.height) - 22);//35
		else//标题不为空时
			height = (int)(Double.parseDouble(part.height) - 72);//80

		map.put("Height",String.valueOf(height));
		return map;
	}
	private HashMap<String,String> splitControlPart(DiagramPart part,HashMap<String, String> optionMap){
		HashMap<String,String> map = new HashMap<String,String>();

		String type = optionMap.get("CommdanType");//控制类型 1:遥调  2:遥控

		if(type.equals("1")){//遥调 隐藏含义
			map.put("valueIsShow","");
			map.put("meaningIsShow","ng-hide");
		}else{//遥控 隐藏数值
			map.put("valueIsShow","ng-hide");
			map.put("meaningIsShow","");
		}
		return map;
	}

	/** 获取控件的宽高比 Width:DIV宽度 Height:DIV高度 Raw:默认大小  */
	public double getControlPercent(double width,double height,double raw){
		if(width > height){
			return height/raw;
		}else{
			return width/raw;
		}
	}
	//endregion
}
