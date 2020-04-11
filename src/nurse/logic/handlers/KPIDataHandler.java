package nurse.logic.handlers;


import java.io.BufferedReader;
import java.io.File;
import java.io.FileInputStream;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.util.HashMap;

import org.apache.log4j.Logger;

import nurse.NurseApp;
import nurse.PublicVar;
import nurse.entity.trasfer.HttpDataExchange;
import nurse.logic.providers.KPIBagProvider;
import nurse.utility.Base64Helper;
import nurse.utility.JsonHelper;

public class KPIDataHandler extends DataHandlerBase {
	
	private static final String KPILayout = "kpiLayout";
	private static final String KPIGetDataById = "kpiGetDataById";
	
	private static final String GetKPISqlDatas = "GetKPISqlDatas";
	
	private static HashMap<String, String> mapKPIHtml = new HashMap<String,String>(); 
	
	private static Logger log = Logger.getLogger(NurseApp.class);
	
	public void Execute(HttpDataExchange req, HttpDataExchange rep) {
		if (GetCommandName(req.requestCommand).equalsIgnoreCase(KPIDataHandler.KPILayout))
		{
			rep.responseResult = LoadKPILanyout(req.requestParams);
		}
		if (GetCommandName(req.requestCommand).equalsIgnoreCase(KPIDataHandler.KPIGetDataById))
		{
			rep.responseResult = LoadKPIDataById(req.requestParams);
		}	
		if (GetCommandName(req.requestCommand).equalsIgnoreCase(KPIDataHandler.GetKPISqlDatas))
		{
			rep.responseResult = handleGetKPISqlDatas(req.requestParams);
		}	
	}
	/**
	 * ���ػ���
	 * @param req "KPI5"
	 * @return String Base64Helper����
	 */
	private static String LoadKPILanyout(String param){
		//ʹ��Base64Helper������������ַ���
		String par = Base64Helper.decode(param);
		if(mapKPIHtml.containsKey(par)) return mapKPIHtml.get(par);
		InputStream is = PublicVar.class.getClass().getResourceAsStream("/kpi/"+par+".html");
		BufferedReader br = null;
		StringBuffer sb = new StringBuffer();
		String encoding = "UTF-8";
		String str = null;
		try {
			//ת���ַ�����ΪUTF-8
			InputStreamReader read = new InputStreamReader(is, encoding);
			br = new BufferedReader(read);
			while((str=br.readLine())!=null){
				sb.append(str.replaceAll("display:block", "").replaceAll("background-color:white", "")
						.replaceAll("border:solid 1px black", "").replaceAll("class='layouttable'","class='layouttable' cellspacing='5'")+"\n");
			}
			br.close();
		} catch (Exception e) {
			log.error(e);
		}
		//ȥ����ǰ���δ֪�ַ�
		str = sb.toString();
		mapKPIHtml.put(par, str);
		//����
		return str;
	}
	/**
	 * ����ID�������
	 * @param req "KPI5|Chart1|����1,����"
	 * @return String Base64Helper����
	 */
	private static String LoadKPIDataById(String param){
		//ʹ��Base64Helper������������ַ���
		String par = Base64Helper.decode(param);
		String[] split = par.split("\\|");
		if(split.length>=2){
			//String por = (split.length==3)?split[2]:"";
			String str = KPIBagProvider.getDataById(split[0],split[1]);
			return str;
		}
		return "�������";
	}
	
	private String handleGetKPISqlDatas(String requestParams){
		// requestParams => KpiNo
		return Base64Helper.encode(KPIBagProvider.getInstance().getKPISqlDatas(requestParams));
	}
}
