package nurse.entity.persist;

import nurse.common.DataTable;

/**
 * KPI5单独实体类
 * @author Administrator
 *
 */
public class KPIBag {
	private String id;//编号
	private String bagType;//类型
	private String text;//标题
	private String sourceType;//sql字符串类型
	private String queryString;//sql字符串
	private String tag;//提示
	
	private String charts = "{}";
	private String chartData = "{}";
	
	public String getId() {
		return id;
	}
	public void setId(String id) {
		this.id = id;
	}
	public String getBagType() {
		return bagType;
	}
	public void setBagType(String bagType) {
		this.bagType = bagType;
	}
	public String getText() {
		return text;
	}
	public void setText(String text) {
		this.text = text;
	}
	public String getSourceType() {
		return sourceType;
	}
	public void setSourceType(String sourceType) {
		this.sourceType = sourceType;
	}
	public String getQueryString() {
		return queryString;
	}
	public void setQueryString(String queryString) {
		this.queryString = queryString;
	}
	public String getTag() {
		return tag;
	}
	public void setTag(String tag) {
		this.tag = tag;
	}

	public String getCharts(){
		return this.charts;
	}
	public void setCharts(String[] line){
		if(line.length <= 1) return;

		String str = "{\"ChartType\":\"%s\",\"Length\":\"%s\",%s}";
		String li = "\"Line%s\":\"%s\"";
		StringBuffer sb = new StringBuffer();
		for(int i = 1;i < line.length;i++){
			if(sb.length() == 0)
				sb.append(String.format(li, (i),getExprValue(line[i])));
			else
				sb.append(String.format(","+li, (i),getExprValue(line[i])));
		}
		this.charts = String.format(str, getExprValue(line[0]), (line.length-1), sb.toString());
	}
	
	public String getChartData(){
		return this.chartData;
	}
	public void setChartData(DataTable dt){
		int count = dt.getRowCount();//数据行数
		int columns = dt.getColumns().size();//数据列数
		String cfg = "{%s}";
		StringBuffer cfgs = new StringBuffer();
		StringBuffer sb = null;
		for(int i = 0;i < columns;i++){
			String arr = "\"Line%s\":[%s]";
			sb = new StringBuffer();
			for(int j = 0;j < count; j++){
				if(sb.length() == 0)
					sb.append(String.format("\"%s\"", dt.getValue(j, i)));
				else
					sb.append(String.format(",\"%s\"", dt.getValue(j, i)));
			}
			if(cfgs.length() == 0)
				cfgs.append(String.format(arr,(i+1) , sb.toString()));
			else
				cfgs.append(String.format(","+arr,(i+1) , sb.toString()));
		}
		this.chartData = String.format(cfg, cfgs);
	}
	
 	public String toString(){
		return "{"
					+ "\"ID\":\""+id+"\","
					+ "\"BagType\":\""+bagType+"\","
					+ "\"SourceType\":\""+sourceType+"\","
					+ "\"QueryString\":\""+queryString+"\","
					+ "\"Text\":\""+text+"\","
					+ "\"Tag\":\""+tag+"\","
					+ "\"Charts\":"+charts+","
					+ "\"ChartData\":"+chartData
				+ "}";
	}

 	private String getExprValue(String expr){
 		try {
			return expr.split("\\=")[1];
		} catch (Exception e) {
			return "";
		}
 	}
}
