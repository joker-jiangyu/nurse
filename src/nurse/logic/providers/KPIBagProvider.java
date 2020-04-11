package nurse.logic.providers;

import java.io.File;
import java.io.FileInputStream;
import java.io.InputStream;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;

import org.apache.log4j.Logger;
import org.dom4j.Document;
import org.dom4j.Element;
import org.dom4j.io.SAXReader;

import nurse.PublicVar;
import nurse.common.DataTable;
import nurse.entity.persist.KPIBag;
import nurse.utility.BasePath;
import nurse.utility.DatabaseHelper;



/**
 * KPI5������
 * 	����KPI5.xml
 * @author Administrator
 *
 */
public class KPIBagProvider {
	private static HashMap<String,KPIBag> kpiBags = null;
	
	private static Logger log = Logger.getLogger(KPIBagProvider.class);
	private static KPIBagProvider instance = new KPIBagProvider();
	
	private static HashMap<String, String> selectSqlData = new HashMap<String, String>();
	
	public static KPIBagProvider getInstance(){
		return instance;
	}
	
	/**
	 * ����KPI5.xml
	 * @param url KPI�ļ���
	 */
	@SuppressWarnings("unchecked")
	private static void loadKPI(String url){
		InputStream is = PublicVar.class.getClass().getResourceAsStream("/kpi/"+url+".xml");
		
		kpiBags = new HashMap<String,KPIBag>();
		
		try {
			SAXReader reader = new SAXReader();
			Document doc = reader.read(is);
			Element root = doc.getRootElement();
			List<Element> rootList = root.elements();
			KPIBag kpiBag = null;
			for(Element item : rootList){
				kpiBag = new KPIBag();
				kpiBag.setId(item.attributeValue("ID"));
				kpiBag.setText(item.attributeValue("Text"));
				kpiBag.setBagType(item.attributeValue("BagType"));
				kpiBag.setQueryString(item.attributeValue("QueryString"));
				kpiBag.setSourceType(item.attributeValue("SourceType"));
				kpiBag.setTag(item.attributeValue("Tag"));
				kpiBags.put(kpiBag.getId(), kpiBag);
			}
		} catch (Exception e) {
			log.error(e);
		}
	}
	/**
	 * ���ݱ�Ż�ȡKPIBag����
	 * @param url KPI�ļ���
	 * @param id �磺Chart1
	 * @return KPIBag
	 */
	public static KPIBag getKPIBag(String url,String id){
		loadKPI(url);
		if(id.length()!=0){
			KPIBag kpiBag = kpiBags.get(id);
			if(kpiBag!=null)
				return kpiBag;
		}
		return null;
	}
	/**
	 * ���ݱ�Ż�ȡָ����Echarts������
	 * @param url KPI�ļ���
	 * @param id ��� �磺Chart1
	 * @param str �洢���̵Ĳ��� "����1,����2..."
	 * @return String 
	 */
	public static String getDataById(String url,String id){
		DataTable dt = null;//���ݿ�����
		DatabaseHelper db = new DatabaseHelper();
		KPIBag bag = getKPIBag(url,id);//����
		if(bag==null) 
			return null;
		
		String text = bag.getText();//����
		
		if(id.equalsIgnoreCase("label1"))
			return text;
		
		String sourceType = bag.getSourceType();//sql�ַ������ͣ�StoredProcedure�����̣�SQLStr��SQL���
		String qurey = bag.getQueryString();//sql�ַ���
		String chartType =  getTabText(bag.getTag(),"ChartType").toLowerCase();//ͼ������

		
		//����sourceType��ѯ���ݿ⣬����������
		if(sourceType.equalsIgnoreCase("StoredProcedure"))
			dt = db.executeQuery(db.prepareProcedure(qurey,"'',''"));
		else
			dt = db.executeToTable(qurey);//ִ��sql���
		
		switch(chartType){
		case "table"://���
			return getTable(text,bag,dt);
		case "bar"://����ͼ
			return getBar(text,bag,dt);
		case "pie"://��ͼ
			return getPie(text,bag,dt);
		case "line"://����ͼ
			return getLine(text,bag,dt);
		case "radar"://�״�ͼ
			return getRadar(text,bag,dt);
		case "gauge"://�Ǳ���
			return getGauge(text,bag,dt);
		}
		return "";
	}
	
	private static String getTable(String text,KPIBag bag,DataTable dt){
		int count = dt.getRowCount();//��������
		int columns = dt.getColumns().size();//��������
		String title = String.format("<div style='text-align:center;'><h3>%s</h3></div>", text);//����
		String ttitle = "<tr style='text-align:center; font-weight:bold;'>";//�������
		String tbody = "";//�������
		for(int i=0;i<columns;i++)
			ttitle += String.format("<th>%s</th>", getTabText(bag.getTag(),"Th"+(i+1)));
		ttitle += "</tr>";
		for(int i=0;i<count;i++){
			tbody += "<tr>";
			for(int j=0;j<columns;j++){
				tbody += String.format("<td>%s</td>", dt.getValue(i, j));
			}
			tbody += "</tr>";
		}
		String result = title+"<table width='100%' height='100%' class='datatable' border='1'>"
				+ttitle
				+tbody
				+"</table>";
		return result;
	}
	
	private static String getBar(String text,KPIBag bag,DataTable dt){
		String result = "";
		int count = dt.getRowCount();//��������
		int columns = dt.getColumns().size();//��������
		String xTitle = ",'name':'"+getTabText(bag.getTag(),"XTitle")+"'";
		String yTitle = ",'name':'"+getTabText(bag.getTag(),"YTitle")+"'";
		String xAxisData = "";
		String yAxisData = "";
		String legend = "";
		for(int j=0;j<count;j++){
			if(dt.getValue(j,0) == null) continue;
			StringBuffer v = new StringBuffer(dt.getValue(j,0).toString());
			if(v.length()>6) v.insert(v.length()/2, "\\n");
			xAxisData += String.format("'%s',", v);
		}
		if(columns>2){//���ݿⷵ�ض�������
			String legdata = "";
			for(int i=1;i<columns;i++){
				legdata += String.format("'%s',", dt.getColumns().get(i).getCaptionName());
			}
			legdata = (legdata=="")?"":legdata.substring(0,legdata.length()-1);
			legend = String.format(" 'legend': { 'x': 'right','top':'10px','data':[%s]},", legdata);
			for(int i=1;i<columns;i++){
				String data = "";
				for(int j=0;j<count;j++){
					if(dt.getValue(j,i) == null) continue;
					StringBuffer v = new StringBuffer(dt.getValue(j,i).toString());
					if(v.length()>6) v.insert(6, "\n");
					data += String.format("'%s',", v);
				}
				if(data!="")
					yAxisData += String.format("{'name':'%s','type':'bar','itemStyle': {'normal': {'label': {'show': 'true' }}},'data':[%s]},",
							dt.getColumns().get(i).getCaptionName(), data.substring(0, data.length()-1));
			}
		}else{//���ݿⷵ����������
			String data = "";
			for(int j=0;j<count;j++){
				data += String.format("'%s',", dt.getValue(j, 1));
			}
			if(data!="")
				yAxisData += String.format("{'type':'bar','itemStyle': {'normal': {'label': {'show': 'true' }}},'data':[%s]},",
					 data.substring(0, data.length()-1));
		}
		xAxisData = (xAxisData=="")?"":xAxisData.substring(0,xAxisData.length()-1);
		yAxisData = (xAxisData=="")?"":yAxisData.substring(0,yAxisData.length()-1);
		if(getTabText(bag.getTag(),"HorizontalAxisType")!=null && getTabText(bag.getTag(),"HorizontalAxisType").equalsIgnoreCase("y"))
			result = "{'tooltip':{'trigger':'axis','axisPointer':{'type':'shadow'}},'title':{'text':'"+text
				+"','x':'center'},'grid':{'left':'10%','containLabel':'true'},"+legend+" 'calculable':'true','yAxis':[{'type':'category','data':["+xAxisData
				+"],'axisLabel':{'show':'true','textStyle':{'color':'#ffffff'}}"+xTitle+"}],"
				+ "'xAxis':[{'type':'value','axisLabel':{'show':'true','textStyle':{'color':'#ffffff'}}"+yTitle+"}],'series':["+yAxisData+"]}";
		else
			result = "{'tooltip':{'trigger':'axis','axisPointer':{'type':'shadow'}},'title':{'text':'"+text
				+"','x':'center'},'grid':{'containLabel':'true'},"+legend+"'calculable':'true','xAxis':[{'type':'category','data':["+xAxisData
				+"],'axisLabel':{'show':'true','textStyle':{'color':'#ffffff'}}"+xTitle+"}],"
				+ "'yAxis':[{'type':'value','axisLabel':{'show':'true','textStyle':{'color':'#ffffff'}}"+yTitle+"}],'series':["+yAxisData+"]}";
		return result;
	}
	
	private static String getPie(String text,KPIBag bag,DataTable dt){
		int count = dt.getRowCount();//��������
		String data = "";//{value:'',name:''}...
		int totalAlarm = 0;
		for(int i=0;i<count;i++){
			data += String.format("{'value':'%s','name':'%s'},", dt.getValue(i, 1).toString(),
					dt.getValue(i, 0).toString());
			totalAlarm += Integer.parseInt(dt.getValue(i, 1).toString());
		}
		if(totalAlarm==0){
			data = String.format("{'value':'%s','name':'%s'},", "1","无告警");
		}
		data = (data=="")?"":data.substring(0,data.length()-1);
		String result = "{'title':{'text':'"+text+"','x':'center'},'tooltip':{'trigger':'item','formatter':'{b} <br/>{c}({d}%)'},"
				+ "'calculable' : 'false','series':[{'type':'pie','data':["+data+"]}]}";
		return result;
	}
	
	private static String getLine(String text,KPIBag bag,DataTable dt){
		int count = dt.getRowCount();//��������
		int columns = dt.getColumns().size();//��������

		StringBuffer xAxis = new StringBuffer();
		StringBuffer yAxis = new StringBuffer();
		String legdata = "";
		String legend = "";
		if(columns>2){
			for(int i=1;i<columns;i++){
				legdata += String.format("'%s',",dt.getColumns().get(i).getCaptionName());
			}
			if(legdata!="")
				legend = String.format(" 'legend':{'x':'right','data':[%s]},", legdata.substring(0,legdata.length()-1));
		}
		for(int i=0;i<columns;i++){
			String data = "";
			for(int j=0;j<count;j++){
				if(i == 0)
					xAxis.append(String.format("'%s',", dt.getValue(j, i)));
				else
					data += String.format("'%s',", dt.getValue(j, i));
			}
			if(i == 0)
				continue;
			data = (data=="")?"":data.substring(0, data.length()-1);
			data = String.format("{'type':'line','name':'%s','data':[%s]},", dt.getColumns().get(i).getCaptionName(),data);
			yAxis.append(data);
		}
		if(xAxis.length()!=0) xAxis.deleteCharAt(xAxis.length()-1);
		if(yAxis.length()!=0) yAxis.deleteCharAt(yAxis.length()-1);
		String result = "{'title':{'x':'center','text':'"+text+"'},"+legend+" 'tooltip':{'trigger':'axis'},'calculable':'true','xAxis':[{'type':'category','boundaryGap':'false',"
				+ "'data':["+xAxis+"]}],'yAxis':[{'type':'value','axisLabel':{'formatter':'{value}'}}],'series':["+
				yAxis+"]}";
		return result;
	}
	
	private static String getRadar(String text,KPIBag bag,DataTable dt){
		int count = dt.getRowCount();//��������

		String legend = getTabText(bag.getTag(),"YTitle");
		int max = 0;
		StringBuffer indicatorRadar = new  StringBuffer();
		StringBuffer seriesRadar = new StringBuffer();
		for(int i=0;i<count;i++){
			indicatorRadar.append(String.format("{'text':'%s','max':'@'},", dt.getValue(i, 0)));
			max = (max > Integer.parseInt(dt.getValue(i, 1).toString()))?max:Integer.parseInt(dt.getValue(i, 1).toString());
			seriesRadar.append(String.format("%s,", dt.getValue(i, 1)));
		}
		if(indicatorRadar.length()>0) indicatorRadar.deleteCharAt(indicatorRadar.length()-1);
		if(seriesRadar.length()>0) seriesRadar.deleteCharAt(seriesRadar.length()-1);
		String result = "{'title':{text:'"+text+"','x':'center'},'tooltip':{'trigger':'axis'},'legend':{'x':'right','data':["+legend+"]},'celculable':'true','polar':[{"
				+ "'indicator':["+indicatorRadar.toString().replaceAll("@", String.valueOf(max))+"],'radius':'130'}],'series':[{'type':'redar',"
				+ "'itemStyle':{'normal':{'areaStyle':{'type':'default'}}},'data':[{'value':["+seriesRadar+"],'name':'"+legend+"'}]}]}";
		return result;
	}
	
	private static String getGauge(String text,KPIBag bag,DataTable dt){
		text = bag.getTag();
		String[] paras = bag.getText().split("-");
		String result = "{'tooltip':{'formatter':'{a} <br/>{b} : {c}"+paras[2]+"'},'series':[{max:'"+paras[1]+"','name':'','type':'gauge','detail':{"
				+ "'formatter':'{value}"+paras[2]+"'},'data':[{'value':'"+dt.getValue(0, 0)+"','name':'"+text+"'}]}]}";
		return result;
	}
	
	/**
	 * �������ƻ�ȡtag���Ե�ָ��ֵ
	 * @param tagStr tag�����ַ���
	 * @param name ����
	 * @return String
	 */
	private static String getTabText(String tagStr,String name){
		int beginIndex = tagStr.lastIndexOf(name+"=")+name.length()+1;//��ʼλ��
		if(beginIndex>0){
			String old = tagStr.substring(beginIndex);
			int endIndex = old.indexOf("&");
			if(endIndex>=0)
				return old.substring(0,endIndex);
			else
				return tagStr.substring(beginIndex);
		}
		return null;
	}
	
	
	
	/*
	 *	1、KPI图表为历史告警和资产设备信息 
	 * 	2、每天缓存一次
	 * 	3、配置生效后缓存一次
	 * 
	 */

	private long nowTime = 0;
	public void factory(){
		try {
			SimpleDateFormat format = new SimpleDateFormat("yyyy-MM-dd"); 
			long nowTime = format.parse((String) format.format(new Date())).getTime();
			
			if(nowTime == 0 || nowTime >= this.nowTime){//一天执行一次
				log.info("Load KPI Charts.");
				loadKPIDataInfo();
				this.nowTime = nowTime;
			}
			
		} catch (Exception e) {
			log.error("factory Exception:"+e);
		}
	}
	
	/**
	 * 缓存所有KPI文件的页面所有图表内容
	 */
	public void loadKPIDataInfo(){
		try {
			List<String> allFile = UploadFileProviders.getAllFile(BasePath.getWebPath()+"data/", false);
			for(String f : allFile){
				if(f.indexOf("KPI") != -1 && f.indexOf(".xml") != -1){
					String no = f.substring(f.indexOf("KPI")+3, f.indexOf(".xml"));
					
					String select = selectKPIData(no);
					selectSqlData.put(no, select);
				}
			}
		} catch (Exception e) {
			log.error("loadKPIDataInfo Exception:"+e);
		}
	}
	
	/**
	 * 读取数据库KPI的数据
	 */
	private String selectKPIData(String kpiNo){
		DataTable dt = null;
		DatabaseHelper dbHelper = null;
		StringBuffer result = new StringBuffer();
		try {
			ArrayList<KPIBag> kpiList = loadKPIXml(kpiNo);
			for(KPIBag kb : kpiList){
				dbHelper = new DatabaseHelper();
				
				KPIBag kpi = new KPIBag();
				kpi.setId(kb.getId());
				kpi.setBagType(kb.getBagType());
				kpi.setText(kb.getText());
				//图表类型与相关信息
				String[] split = kb.getTag().split("\\&");
				kpi.setCharts(split);
				//图表的数据
				if(kb.getSourceType() != null){
					if(kb.getSourceType().equalsIgnoreCase("StoredProcedure"))
						dt = dbHelper.executeQuery(dbHelper.prepareProcedure(kb.getQueryString(),"'',''"));
					else
						dt = dbHelper.executeToTable(kb.getQueryString());
					kpi.setChartData(dt);
				}
				
				if(result.length() == 0)
					result.append(String.format("%s",kpi.toString()));
				else
					result.append(String.format(",%s",kpi.toString()));
			}
			return String.format("[%s]", result.toString());
		} catch (Exception e) {
			log.error("getKPISqlDatas Exception:",e);
			return "[]";
		}finally{
			if(dbHelper!= null) dbHelper.close();
		}
	}
	
	/**
	 * 根据KPI文件编号获取页面所有图表内容
	 */
	public String getKPISqlDatas(String kpiNo){
		if(selectSqlData.containsKey(kpiNo)){
			return selectSqlData.get(kpiNo);
		}
		
		loadKPIDataInfo();
		return selectSqlData.get(kpiNo);
	}
	
	/**
	 * 根据序号到web/data目录或许KPI.xml的文件
	 * @param kpiNo 序号
	 * @return 
	 */
	@SuppressWarnings("unchecked")
	private ArrayList<KPIBag> loadKPIXml(String kpiNo){
		HashMap<String,ArrayList<KPIBag>> KpiMap = new HashMap<String,ArrayList<KPIBag>>();
		
		ArrayList<KPIBag> list = new ArrayList<KPIBag>();
		try {
			File f = new File(BasePath.getWebPath()+"data/KPI"+kpiNo+".xml");
			if(!f.exists()) return new ArrayList<KPIBag>();

			InputStream is = new FileInputStream(f);
			
			
			SAXReader reader = new SAXReader();
			Document doc = reader.read(is);
			Element root = doc.getRootElement();
			List<Element> rootList = root.elements();
			for(Element item : rootList){
				KPIBag kpiBag = new KPIBag();
				kpiBag.setId(item.attributeValue("ID"));
				kpiBag.setText(item.attributeValue("Text"));
				kpiBag.setBagType(item.attributeValue("BagType"));
				kpiBag.setQueryString(item.attributeValue("QueryString"));
				kpiBag.setSourceType(item.attributeValue("SourceType"));
				kpiBag.setTag(item.attributeValue("Tag"));
				list.add(kpiBag);
			}
			KpiMap.put(kpiNo, list);
			
			return list;
		} catch (Exception e) {
			log.error("loadKPIXml Exception:",e);
			return list;
		}
	}

}


