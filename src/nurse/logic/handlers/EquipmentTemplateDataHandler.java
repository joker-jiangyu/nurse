package nurse.logic.handlers;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.util.ArrayList;
import java.util.Base64;

import nurse.common.DataTable;
import nurse.entity.persist.Control;
import nurse.entity.persist.ControlMeanings;
import nurse.entity.persist.EquipmentTemplate;
import nurse.entity.persist.Event;
import nurse.entity.persist.EventCondition;
import nurse.entity.persist.Sampler;
import nurse.entity.persist.Signal;
import nurse.entity.persist.SignalMeanings;
import nurse.entity.persist.SignalProperty;
import nurse.entity.trasfer.HttpDataExchange;
import nurse.entity.view.ActiveDevice;
import nurse.logic.providers.ConfigCache;
import nurse.logic.providers.ControlMeaningsProvider;
import nurse.logic.providers.ControlProvider;
import nurse.logic.providers.EquipmentTemplateProvider;
import nurse.logic.providers.EventProvider;
import nurse.logic.providers.SamplerProvider;
import nurse.logic.providers.SignalMeaningsProvider;
import nurse.logic.providers.SignalPropertyProvider;
import nurse.logic.providers.SignalProvider;
import nurse.utility.BasePath;
import nurse.utility.JsonHelper;
import nurse.logic.providers.EventConditionProvider;
  
import java.util.List;   

import org.dom4j.Document;   
import org.dom4j.Element;
import org.dom4j.io.SAXReader; 

public class EquipmentTemplateDataHandler extends DataHandlerBase {
	private static final String createEquipmentTemplate = "createEquipmentTemplate";
	private static final String allEquipmentTemplateList = "allEquipmentTemplateList";
	private static final String deleteEquipmentTemplate = "deleteEquipmentTemplate";
	private static final String getLoadEquipmentTemplateNums = "getLoadEquipmentTemplateNums";
	private static final String getEquipmentTemplate = "getEquipmentTemplate";
	private static final String getLimitEquipmentTemplate = "getLimitEquipmentTemplate";
	private static final String getEquipmentTemplateNums = "getEquipmentTemplateNums";
	private static final String getIOEquipmentTemplates = "getIOEquipmentTemplates";
	private static final String getEquipmentTemplatesByBaseType = "getEquipmentTemplatesByBaseType";
	private static final String getHostEquipmentTemplates = "getHostEquipmentTemplates";
	
	public EquipmentTemplateDataHandler() {
		
	}
	
	@Override
	public void Execute(HttpDataExchange req, HttpDataExchange rep) {

		if (GetCommandName(req.requestCommand).equalsIgnoreCase(EquipmentTemplateDataHandler.createEquipmentTemplate)){
			rep.responseResult = HandleCreateEquipmentTemplate(req.requestParams);
		}
		if (GetCommandName(req.requestCommand).equalsIgnoreCase(EquipmentTemplateDataHandler.allEquipmentTemplateList))
		{
			rep.responseResult = HandleAllEquipmentTemplateList(req.requestParams);
		}
		if (GetCommandName(req.requestCommand).equalsIgnoreCase(EquipmentTemplateDataHandler.deleteEquipmentTemplate))
		{
			rep.responseResult = HandleDeleteEquipmentTemplate(req.requestParams);
		}
		if (GetCommandName(req.requestCommand).equalsIgnoreCase(EquipmentTemplateDataHandler.getLoadEquipmentTemplateNums))
		{
			rep.responseResult = HandleGetLoadEquipmentTemplateNums(req.requestParams);
		}
		if (GetCommandName(req.requestCommand).equalsIgnoreCase(EquipmentTemplateDataHandler.getEquipmentTemplate))
		{
			rep.responseResult = HandleGetEquipmentTemplate(req.requestParams);
		}
		if (GetCommandName(req.requestCommand).equalsIgnoreCase(EquipmentTemplateDataHandler.getLimitEquipmentTemplate)){
			rep.responseResult = HandleGetLimitEquipmentTemplate(req.requestParams);
		}
		if (GetCommandName(req.requestCommand).equalsIgnoreCase(EquipmentTemplateDataHandler.getEquipmentTemplateNums)){
			rep.responseResult = HandleGetEquipmentTemplateNums(req.requestParams);
		}
		if (GetCommandName(req.requestCommand).equalsIgnoreCase(EquipmentTemplateDataHandler.getIOEquipmentTemplates)){
			rep.responseResult = HandleGetIOEquipmentTemplates(req.requestParams);
		}
		if (GetCommandName(req.requestCommand).equalsIgnoreCase(EquipmentTemplateDataHandler.getEquipmentTemplatesByBaseType)){
			rep.responseResult = HandleGetEquipmentTemplatesByBaseType(req.requestParams);
		}
		if (GetCommandName(req.requestCommand).equalsIgnoreCase(EquipmentTemplateDataHandler.getHostEquipmentTemplates)){
			rep.responseResult = HandleGetHostEquipmentTemplates(req.requestParams);
		}
	}
		
	
	private String HandleCreateEquipmentTemplate(String requestParams) {
		
		String path = null;
		String equipmentTemplatePath = null;
		String result = "fail to create equipmenttemplate";
		//��ȡϵͳ����  
        String encoding = System.getProperty("file.encoding");
        try {
        	//String utfStr =URLDecoder.decode(requestParams, "UTF-8");
        	String utfStr = new String(Base64.getDecoder().decode(requestParams), "UTF-8");
			path = new String(utfStr.getBytes(), encoding);
			path.replace('\\', '/');
			
		} catch (UnsupportedEncodingException e1) {
			e1.printStackTrace();
			
			return result;
		}
        
        //校验SO格式
        checkFormatBySo(path);
        
        String soPath = getSoPath(path);
        if(soPath.length() > 0)
        {
        	System.out.println("getSoPath():" + soPath);
        	//���ѹ�����а���SO��,�ƶ�SO�⵽ָ���ļ���
            try {
            	String soAfterPath = BasePath.getPath();		//��ȡ��·�� home/app/web
				soAfterPath = soAfterPath.replace('\\', '/');
            	
            	if(soAfterPath.indexOf("/") != -1)
    			{
            		soAfterPath = soAfterPath.substring(0, soAfterPath.lastIndexOf("/"));	//��ȡ��·�� home/app
				}
            	
            	File dir = new File(soAfterPath + "/samp/SO"); 
            	System.out.println("soAfterPath:" + soAfterPath + "/samp/SO");
            	//����ļ��в������򴴽�     
            	if  (!dir.exists()  && !dir.isDirectory())       
            	{        
            		dir.mkdirs();// �����༶Ŀ¼ 
            	}
            	File soFile = new File(soPath);
            	File destFile = new File(dir + "/" + soFile.getName());
            	
            	//�ƶ��ļ��� home/app/samp/SOĿ¼��
            	soFile.renameTo(destFile);
            } catch (Exception e) {
            	e.printStackTrace();
            }       
        }
        int EquipmentTemplateId = -1;
        
        equipmentTemplatePath = getEquipmentTemplatePath(path);
        
        if(equipmentTemplatePath.isEmpty())
        {
        	return result;
        }
        
        try{
        	SAXReader saxReader = new SAXReader();   
        	Document xmlDoc = saxReader.read(new File(equipmentTemplatePath));       
        	
        	EquipmentTemplate eqTemp = new EquipmentTemplate();
        	boolean ret = GenerateTemplateFromXml(eqTemp, xmlDoc);
            if (!ret) return result;
            
            //判断协议是否存在
            boolean existName = EquipmentTemplateProvider.getInstance().
            		existEquipmentTemplate(eqTemp.EquipmentTemplateName,eqTemp.ProtocolCode);
            if(existName)
            	return "equipmenttemplate already exist";

            //新增协议
            EquipmentTemplateProvider.getInstance().InsertEquipmentTemplate(eqTemp.EquipmentTemplateId,
            		eqTemp.EquipmentTemplateName, eqTemp.ParentTemplateId, eqTemp.Memo, eqTemp.ProtocolCode,
            		eqTemp.EquipmentCategory, eqTemp.EquipmentType, eqTemp.Property, eqTemp.Description,
            		eqTemp.EquipmentStyle, eqTemp.Unit, eqTemp.Vendor, eqTemp.EquipmentBaseType,
            		eqTemp.StationCategory);
            
            EquipmentTemplateId = eqTemp.getEquipmentTemplateId();
            
            if (eqTemp.EquipmentTemplateName != "RMU-MUHOST�豸")
            {
                GenerateSamplersFromXml(xmlDoc);
            }

            //存储EventId = -3的EventCondition状态，comm.get(0) == "true" 为已经添加
            List<String> comm = new ArrayList<String>();
            GenerateSignalsFromXml(xmlDoc, EquipmentTemplateId, comm);
            if (eqTemp.EquipmentCategory != 99 && comm.size() == 0)
            {
                GenerageCommmunicationSignal(xmlDoc, EquipmentTemplateId,eqTemp.EquipmentBaseType);
            }
            //�����豸ģ���¼�
			comm = new ArrayList<String>();
            GenerateEventsFromXml(xmlDoc, EquipmentTemplateId, comm);
            if (eqTemp.EquipmentCategory != 99 && comm.size() == 0)
            {
                GenerageCommmunicationEvent(xmlDoc, EquipmentTemplateId,eqTemp.EquipmentBaseType);
            }
            //�����豸ģ�����
            GenerateCommandsFromXml(xmlDoc, EquipmentTemplateId);
            
            result = GetEquipmentTemplateNums();
        
        } catch (Exception e) {
			e.printStackTrace();
			
			return result;
		}
        
        return result;
	}

	private String HandleAllEquipmentTemplateList(String requestParams) {
		
		ArrayList<EquipmentTemplate> temp = EquipmentTemplateProvider.getInstance().GetAllEquipmentTemplates();
		
		return JsonHelper.ListjsonString("ret", temp);
	}

	private String HandleDeleteEquipmentTemplate(String requestParams) {
		
		int equipmentTemplateId = Integer.valueOf(requestParams);

		String result = "fail to delete equipmenttemplate";
        
        try{
    		EquipmentTemplateProvider.getInstance().DelSo(equipmentTemplateId);
        	boolean bRet = EquipmentTemplateProvider.getInstance().DelEquipmentTemplate(equipmentTemplateId);
            
        	if(bRet)
        	{
        		result = GetEquipmentTemplateNums();
        	}
        
        } catch (Exception e) {
			e.printStackTrace();
			
			return result;
		}
        
        return result;
	}

	private String HandleGetLoadEquipmentTemplateNums(String requestParams) {
		
		int equipmentTemplateId = Integer.valueOf(requestParams);

		String result = "fail to get load equipmenttemplate nums";
        
        try{
        	result = GetEquipmentCountsByTemplateId(equipmentTemplateId);
        
        } catch (Exception e) {
			e.printStackTrace();
			
			return result;
		}
        
        return result;
	}
	
	private String HandleGetEquipmentTemplate(String requestParams) {
		
		int equipmentTemplateId = Integer.valueOf(requestParams);

		String result = "fail to get equipmenttemplate";
        
        try{
        	ArrayList<EquipmentTemplate> temp = EquipmentTemplateProvider.getInstance().GetEquipmentTemplate(equipmentTemplateId);
    		
    		return JsonHelper.ListjsonString("ret", temp);
        
        } catch (Exception e) {
			e.printStackTrace();

		}
        
        return result;
	}
	
	/** 
	 * ��ȡĿ��·����xml�ļ�
	 * 
	 * @param path 
	 *            String 
	 * @throws FileNotFoundException 
	 * @throws IOException 
	 * @return String 
	 */  
	public String getEquipmentTemplatePath(String path) 
	{ 
		
		String equipmentTemplatePath = "";
		 try {  
			 File file = new File(path);  
			// ���Ŀ��Ϊ�ļ���ֱ�ӷ���
			if (!file.isDirectory()) {  
				return  equipmentTemplatePath;
			} else if (file.isDirectory()) {  
				String[] filelist = file.list();  
				for (int i = 0; i < filelist.length; i++) {  
					File etfile = new File(path + "/" + filelist[i]);  
					
					if (etfile.isDirectory())
					{
						continue;
					}
					String fileName=etfile.getName();       
					String prefix=fileName.substring(fileName.lastIndexOf(".")+1); 
					
					if(prefix.equalsIgnoreCase("xml"))
					{
						equipmentTemplatePath = etfile.toString();
					}
				}   
			}  
	 
		 } catch (Exception e) {  
			 System.out.println("getEquipmentTemplatePath() Exception:" + e.getMessage());  
		 }  
		 
		 return equipmentTemplatePath;  
	} 	
	
	public String getSoPath(String path) 
	{ 
		
		String soPath = "";
		 try {  
			 File file = new File(path);  
			// ??????????????????
			if (!file.isDirectory()) {  
				return  soPath;
			} else if (file.isDirectory()) {  
				String[] filelist = file.list();  
				for (int i = 0; i < filelist.length; i++) {  
					File etfile = new File(path + "/" + filelist[i]);  
					
					if (etfile.isDirectory())
					{
						continue;
					}
					String fileName=etfile.getName();       
					String prefix=fileName.substring(fileName.lastIndexOf(".")+1); 
					
					if(prefix.equalsIgnoreCase("so"))
					{
						soPath = etfile.toString();
						break;
					}
				}   
			}  
	 
		 } catch (Exception e) {  
			 System.out.println("getSoPath() Exception:" + e.getMessage());  
		 }  
		 
		 return soPath;  
	} 

	/**
	 * 校验协议的SO格式；1、存在_A8.so改名为.so；2、同时存在_A8.so和.so，删除.so，并将_A8.so改名为.so
	 * @param path
	 * @return
	 */
	private void checkFormatBySo(String path){
		try {
			File file = new File(path);
			
			if(file.isDirectory()){
				//协议中.so后缀的文件集合
				ArrayList<String> soList = new ArrayList<String>();
				boolean isA8 = false;
				String[] fileList = file.list();
				for(int i = 0;i < fileList.length;i++){
					File etfile = new File(path + "/" + fileList[i]);
					if (etfile.isDirectory())
					{
						continue;
					}
					String fileName = etfile.getName();
					//获取后缀
					String suffix = fileName.substring(fileName.lastIndexOf(".")+1);
					if(suffix.equalsIgnoreCase("so")){
						soList.add(fileName);
						//获取_至.之间的字符
						if(fileName.indexOf("_A8") > -1 || fileName.indexOf("_a8") > -1){
							isA8 = true;
						}
					}
				}
				//存在XXX_A8.so的文件
				if(isA8){
					//删除XXX.so文件
					File sofile = null;
					for(String soName : soList){
						if(soName.indexOf("_A8") == -1 && soName.indexOf("_a8") == -1){
							sofile = new File(path + "/" + soName);
							if(sofile.isFile()){
								sofile.delete();
							}
						}
					}
					//将XXX_A8.so为XXX.so文件
					for(String soName : soList){
						if(soName.indexOf("_A8") > -1 || soName.indexOf("_a8") > -1){
							sofile = new File(path + "/" + soName);
							if(sofile.isFile()){
								soName = soName.replaceAll("_A8", "");
								soName = soName.replaceAll("_a8", "");
								File newFile = new File(path + File.separator + soName);
								
								System.out.println("Update So Name File:"+newFile.toString());
								if(!sofile.renameTo(newFile)){
									System.out.println("Update SO Name ERROR!");  
								}
							}
						}
					}
				}
			}
		} catch (Exception e) {
			System.out.println("delA8Char() Exception:" + e.getMessage());  
		}
	}
	

	/** 
	 * ����XML�ļ�������ģ�����
	 * 
	 * @param temp
	 * @param xmlDoc
	 * @throws  
	 * @throws IOException 
	 * @return boolean 
	 */  
	public boolean GenerateTemplateFromXml(EquipmentTemplate temp, Document xmlDoc)
	{
		boolean ret = true;
		
		try{
			Element tempElement = (Element)xmlDoc.selectSingleNode("/EquipmentTemplates/EquipmentTemplate");
			
			temp.ParentTemplateId = Integer.parseInt(tempElement.attributeValue("ParentTemplateId"));
	        temp.EquipmentTemplateId = GetEquipmentTemplateId();
	        temp.EquipmentTemplateName = tempElement.attributeValue("EquipmentTemplateName");
	        temp.ProtocolCode = tempElement.attributeValue("ProtocolCode");
	        temp.EquipmentCategory = Integer.parseInt(tempElement.attributeValue("EquipmentCategory"));
	        temp.EquipmentType = Integer.parseInt(tempElement.attributeValue("EquipmentType"));
	        temp.Memo = tempElement.attributeValue("Memo");
	        temp.Property = tempElement.attributeValue("Property");
	
	        temp.Description = tempElement.attributeValue("Decription");
	        temp.EquipmentStyle = tempElement.attributeValue("EquipmentStyle");
	        temp.Unit = tempElement.attributeValue("Unit");//TODO: �豸ģ�屸ע
	        temp.Vendor = tempElement.attributeValue("Vendor");//TODO:�豸ģ��Э��MDB��MD5��
	
	        if (tempElement.attributeValue("EquipmentBaseType") != "")
	        {
	            temp.EquipmentBaseType = Integer.parseInt(tempElement.attributeValue("EquipmentBaseType"));
	        }
	
	        if (tempElement.attributeValue("StationCategory") != "")
	        {
	            temp.StationCategory = Integer.parseInt(tempElement.attributeValue("StationCategory"));
	        }
	        else
	        {
	            temp.StationCategory = 0;
	        }
        
		} catch (Exception e) {
			e.printStackTrace();
			
			ret = false;
		}
		
		return ret;
	}
	
	
	/** 
	 * ����XML�ļ������ɲɼ���
	 * 
	 * @param xmlDoc
	 * @throws  
	 * @throws IOException 
	 * @return void 
	 */  
	public boolean GenerateSamplersFromXml(Document xmlDoc)
	{
		boolean ret = true;
		
		try{
			List<Element> spElements = xmlDoc.selectNodes("/EquipmentTemplates/Samplers/Sampler");
			
			if (spElements != null && spElements.size() > 0)
            {
				for (Element spElement : spElements)
                {
                    //��׼��������׼�����뵽���ݿ��У�����Ѿ������򲻲��룩
                    Sampler sp = new Sampler();
                    
                    sp.SamplerName = spElement.attributeValue("SamplerName");
                    sp.SamplerType = Integer.parseInt(spElement.attributeValue("SamplerType"));
                    sp.ProtocolCode = spElement.attributeValue("ProtocolCode");
                    sp.DLLCode = spElement.attributeValue("DllCode");
                    sp.DLLVersion = spElement.attributeValue("DLLVersion");
                    sp.ProtocolFilePath = spElement.attributeValue("ProtocolFilePath");
                    sp.DLLFilePath = spElement.attributeValue("DLLFilePath");
                    sp.DllPath = spElement.attributeValue("DllPath");
                    sp.Setting = spElement.attributeValue("Setting");
                    sp.Description = spElement.attributeValue("Description");

                    //�жϲɼ����Ƿ��Ѿ����ڣ�������������Ӳɼ�����������Ӳɼ���
                    DataTable dt = SamplerProvider.getInstance().GetSamplerByInfo(sp.SamplerName, sp.SamplerType, sp.ProtocolCode, sp.DllPath, sp.Setting);
                    		
                    if(dt.getRowCount() > 0){
                    	//�Ѿ����ڲɼ������������
                    }
                    else{
                    	sp.SamplerId = GetSamplerId();
                    	SamplerProvider.getInstance().InsertSampler(sp.SamplerId, sp.SamplerName, sp.SamplerType, sp.ProtocolCode, sp.DLLCode, sp.DLLVersion, sp.ProtocolFilePath, sp.DLLFilePath, sp.DllPath, sp.Setting, sp.Description, sp.SoCode, sp.SoPath);
                    }
                }
            }
            else
            {
            	System.out.println("û�вɼ�������");
            }
			
		} catch (Exception e) {
			e.printStackTrace();
			
			ret = false;
		}
		
		return ret;
	}
	
	/** 
	 * ����XML�ļ��������ź�
	 * 
	 * @param xmlDoc
	 * @throws  
	 * @throws IOException 
	 * @return void 
	 */  
	public boolean GenerateSignalsFromXml(Document xmlDoc, int EquipmentTemplateId,List<String> comm)
	{
		boolean ret = true;
		String[] propArr = null;
        String[] meaningsArr = null;
        
		try{
			List<Element> signalElements = xmlDoc.selectNodes("/EquipmentTemplates/EquipmentTemplate/Signals/Signal");
			
			if (signalElements != null && signalElements.size() > 0)
            {
				for (Element signalElement : signalElements)
                {
                    //��׼��������׼�����뵽���ݿ��У�����Ѿ������򲻲��룩
                    Signal signal = new Signal();
                    signal.EquipmentTemplateId = EquipmentTemplateId;
                    signal.SignalId = Integer.parseInt(signalElement.attributeValue("SignalId"));
                    signal.SignalName = signalElement.attributeValue("SignalName");
                    signal.SignalCategory = Integer.parseInt(signalElement.attributeValue("SignalCategory"));
                    signal.SignalType = Integer.parseInt(signalElement.attributeValue("SignalType"));

                    signal.ChannelNo = Integer.parseInt(signalElement.attributeValue("ChannelNo"));
                    if(signal.ChannelNo == -3)
                    {
						comm.add("true");
                    	//continue;
                    }
                    signal.ChannelType = Integer.parseInt(signalElement.attributeValue("ChannelType"));
                    signal.Expression = signalElement.attributeValue("Expression");
                    signal.DataType = signalElement.attributeValue("DataType").isEmpty() ? null : Integer.parseInt(signalElement.attributeValue("DataType"));
                    signal.ShowPrecision = signalElement.attributeValue("ShowPrecision");
                    signal.Unit = signalElement.attributeValue("Unit").trim().isEmpty() ? "" : signalElement.attributeValue("Unit");

                    signal.StoreInterval = signalElement.attributeValue("StoreInterval").isEmpty() ? null : Float.parseFloat(signalElement.attributeValue("StoreInterval"));
                    signal.AbsValueThreshold = signalElement.attributeValue("AbsValueThreshold").isEmpty() ? null : Float.parseFloat(signalElement.attributeValue("AbsValueThreshold"));
                    signal.PercentThreshold = signalElement.attributeValue("PercentThreshold").isEmpty() ? null : Float.parseFloat(signalElement.attributeValue("PercentThreshold"));
                    signal.StaticsPeriod = signalElement.attributeValue("StaticsPeriod").isEmpty() ? null : Integer.parseInt(signalElement.attributeValue("StaticsPeriod"));
                    signal.Enable = Boolean.parseBoolean(signalElement.attributeValue("Enable"));
                    signal.Visible = Boolean.parseBoolean(signalElement.attributeValue("Visible"));
                    signal.Description = signalElement.attributeValue("Discription");
                    signal.BaseTypeId = signalElement.attributeValue("BaseTypeId").isEmpty() ? null : Integer.parseInt(signalElement.attributeValue("BaseTypeId"));
                    signal.ChargeAbsValue = signalElement.attributeValue("ChargeAbsValue").isEmpty() ? null : Float.parseFloat(signalElement.attributeValue("ChargeAbsValue"));
                    signal.DisplayIndex = Integer.parseInt(signalElement.attributeValue("DisplayIndex"));

                    try
                    {
                    	signal.ChargeStoreInterVal = signalElement.attributeValue("ChargeStoreInterVal").isEmpty() ? null : Float.parseFloat(signalElement.attributeValue("ChargeStoreInterVal"));
                    } catch (Exception e) {
                    	signal.ChargeStoreInterVal = signalElement.attributeValue("ChangeStoreInterval").isEmpty() ? null : Float.parseFloat(signalElement.attributeValue("ChangeStoreInterval"));
	        		}
                    try
                    {
                    	signal.MDBSignalId = signalElement.attributeValue("MDBSignalId").isEmpty() ? null : Integer.parseInt(signalElement.attributeValue("MDBSignalId"));
                    } catch (Exception e) {
	                	signal.MDBSignalId = null;
	        		}
                    try
                    {
                    	signal.ModuleNo = signalElement.attributeValue("ModuleNo").isEmpty() ? 0 : Integer.parseInt(signalElement.attributeValue("ModuleNo"));
	                } catch (Exception e) {
	                	signal.ModuleNo = 0;
	        		}
                    
                    SignalProvider.getInstance().InsertSignal(signal.EquipmentTemplateId, signal.SignalId, signal.Enable, signal.Visible, 
                    		signal.Description, signal.SignalName, signal.SignalCategory, signal.SignalType, signal.ChannelNo, 
                    		signal.ChannelType, signal.Expression, signal.DataType, signal.ShowPrecision, signal.Unit, 
                    		signal.StoreInterval, signal.AbsValueThreshold, signal.PercentThreshold, signal.StaticsPeriod, 
                    		signal.BaseTypeId, signal.ChargeStoreInterVal, signal.ChargeAbsValue, signal.DisplayIndex, 
                    		signal.MDBSignalId, signal.ModuleNo);
                    
                  //�ź�����
                    propArr = signalElement.attributeValue("SignalProperty").split(",");
                    for (String prop : propArr)
                    {
                        if (isInteger(prop))
                        {
                        	int propId = Integer.parseInt(prop);
                        	SignalProperty signalProp = new SignalProperty();
                        	
                            signalProp.EquipmentTemplateId = signal.EquipmentTemplateId;
                            signalProp.SignalId = signal.SignalId;
                            signalProp.SignalPropertyId = propId;
                            
                            SignalPropertyProvider.getInstance().InsertSignalProperty(signalProp.EquipmentTemplateId, signalProp.SignalId, signalProp.SignalPropertyId);
                        }
                    }

                    //�źź���
                    meaningsArr = signalElement.attributeValue("SignalMeanings").split(";");
                    for (String meaning : meaningsArr)
                    {
                        String[] meaningArr = meaning.split(":");
                        if (isInteger(meaningArr[0]))
                        {
                        	short meaningId = Short.parseShort(meaningArr[0]);
                        	SignalMeanings signalMean = new SignalMeanings();
                        	
                            signalMean.EquipmentTemplateId = signal.EquipmentTemplateId;
                            signalMean.SignalId = signal.SignalId;
                            signalMean.StateValue = meaningId;
                            signalMean.Meanings = meaningArr[1];
                            
                            SignalMeaningsProvider.getInstance().InsertSignalMeanings(signalMean.EquipmentTemplateId, signalMean.SignalId, signalMean.StateValue, signalMean.Meanings);
                        }
                    }
                }
            }
            else
            {
            	System.out.println("û���źŴ���");
            }
			
		} catch (Exception e) {
			e.printStackTrace();
			
			ret = false;
		}
		
		return ret;
	}
	
	/** 
	 * ����ͨѶ״̬�ź�
	 * 
	 * @param xmlDoc
	 * @throws  
	 * @throws IOException 
	 * @return void 
	 */  
	public boolean GenerageCommmunicationSignal(Document xmlDoc, int EquipmentTemplateId,Integer EquipmentBaseType)
	{
		boolean ret = true;
		String[] propArr = null;
        String[] meaningsArr = null;
        
		try{
			ArrayList<Signal> commmunicationSignal = SignalProvider.getInstance().GetCommmunicationSignal(EquipmentTemplateId, -3);
			
			if(null != commmunicationSignal && commmunicationSignal.size() > 0)
			{
				//�Ѿ�����ͨѶ״̬�ź�
				return ret;
			}
			
			//��׼��������׼�����뵽���ݿ��У�����Ѿ������򲻲��룩
            Signal signal = new Signal();
            signal.EquipmentTemplateId = EquipmentTemplateId;
            signal.SignalId = -3;
			signal.SignalName = LanguageDataHandler.getLanaguageJsonValue("EquipmentTemplate.SignalName");/*"设备通讯状态"*/
            signal.SignalCategory = 2;
            signal.SignalType = 2;

            signal.ChannelNo = -3;
            signal.ChannelType = 1;
            signal.Expression = null;
            signal.DataType = 0;
            signal.ShowPrecision = "0";
            signal.Unit = null;

            signal.StoreInterval = null;
            signal.AbsValueThreshold = null;
            signal.PercentThreshold = null;
            signal.StaticsPeriod = null;
            signal.Enable = true;
            signal.Visible = true;
            signal.Description = null;
            signal.BaseTypeId = EquipmentBaseType == null ? null : Integer.parseInt(String.format("%d%d", EquipmentBaseType,999001));
            signal.ChargeStoreInterVal = null;
            signal.ChargeAbsValue = null;
            signal.DisplayIndex = 500;
            signal.MDBSignalId = null;
            signal.ModuleNo = 0;
            
            SignalProvider.getInstance().InsertSignal(signal.EquipmentTemplateId, signal.SignalId, signal.Enable, signal.Visible, 
            		signal.Description, signal.SignalName, signal.SignalCategory, signal.SignalType, signal.ChannelNo, 
            		signal.ChannelType, signal.Expression, signal.DataType, signal.ShowPrecision, signal.Unit, 
            		signal.StoreInterval, signal.AbsValueThreshold, signal.PercentThreshold, signal.StaticsPeriod, 
            		signal.BaseTypeId, signal.ChargeStoreInterVal, signal.ChargeAbsValue, signal.DisplayIndex, 
            		signal.MDBSignalId, signal.ModuleNo);
            
          //�ź�����
            propArr = new String[] { "27" };
            for (String prop : propArr)
            {
                if (isInteger(prop))
                {
                	int propId = Integer.parseInt(prop);
                	SignalProperty signalProp = new SignalProperty();
                	
                    signalProp.EquipmentTemplateId = signal.EquipmentTemplateId;
                    signalProp.SignalId = signal.SignalId;
                    signalProp.SignalPropertyId = propId;
                    
                    SignalPropertyProvider.getInstance().InsertSignalProperty(signalProp.EquipmentTemplateId, signalProp.SignalId, signalProp.SignalPropertyId);
                }
            }

            //�źź���
			String alarm = LanguageDataHandler.getLanaguageJsonValue("EquipmentTemplate.SignalMeanings0");
			String normal = LanguageDataHandler.getLanaguageJsonValue("EquipmentTemplate.SignalMeanings1");
			meaningsArr = new String[] { "0:"+alarm, "1:"+normal};
            for (String meaning : meaningsArr)
            {
                String[] meaningArr = meaning.split(":");
                if (isInteger(meaningArr[0]))
                {
                	short meaningId = Short.parseShort(meaningArr[0]);
                	SignalMeanings signalMean = new SignalMeanings();
                	
                    signalMean.EquipmentTemplateId = signal.EquipmentTemplateId;
                    signalMean.SignalId = signal.SignalId;
                    signalMean.StateValue = meaningId;
                    signalMean.Meanings = meaningArr[1];
                    
                    SignalMeaningsProvider.getInstance().InsertSignalMeanings(signalMean.EquipmentTemplateId, signalMean.SignalId, signalMean.StateValue, signalMean.Meanings);
                }
            }
		} catch (Exception e) {
			e.printStackTrace();
			
			ret = false;
		}
		
		return ret;
	}
	
	/** 
	 * ����XML�ļ������ɸ澯
	 * 
	 * @param xmlDoc
	 * @throws  
	 * @throws IOException 
	 * @return void 
	 */  
	public boolean GenerateEventsFromXml(Document xmlDoc, int EquipmentTemplateId, List<String> comm)
	{
		boolean ret = true;
		String[] propArr = null;
        String[] meaningsArr = null;
        
		try{
			List<Element> eventElements = xmlDoc.selectNodes("/EquipmentTemplates/EquipmentTemplate/Events/Event");
			
			if (eventElements != null && eventElements.size() > 0)
            {
				for (Element eventElement : eventElements)
                {
                    //��׼��������׼�����뵽���ݿ��У�����Ѿ������򲻲��룩
                    Event evt = new Event();
                    evt.EquipmentTemplateId = EquipmentTemplateId;
                    evt.EventId = Integer.parseInt(eventElement.attributeValue("EventId"));
                    evt.EventName = eventElement.attributeValue("EventName");
                    if (!eventElement.attributeValue("SignalId").isEmpty())
                    {
                        evt.SignalId = Integer.parseInt(eventElement.attributeValue("SignalId"));
                    }
                    evt.StartExpression = eventElement.attributeValue("StartExpression");
                    evt.EventCategory = Integer.parseInt(eventElement.attributeValue("EventCategory"));
                    evt.StartType = Integer.parseInt(eventElement.attributeValue("StartType"));
                    evt.EndType = Integer.parseInt(eventElement.attributeValue("EndType"));
                    evt.SuppressExpression = eventElement.attributeValue("SuppressExpression");
                    evt.Enable = Boolean.parseBoolean(eventElement.attributeValue("Enable"));
                    evt.Visible = Boolean.parseBoolean(eventElement.attributeValue("Visible"));
                    evt.Description = eventElement.attributeValue("Description");
                    if (!eventElement.attributeValue("DisplayIndex").isEmpty())
                    {
                        evt.DisplayIndex = Integer.parseInt(eventElement.attributeValue("DisplayIndex"));
                    }
                    try
                    {
                    	evt.ModuleNo = eventElement.attributeValue("ModuleNo").isEmpty() ? 0 : Integer.parseInt(eventElement.attributeValue("ModuleNo"));
	                } catch (Exception e) {
	                	evt.ModuleNo = 0;
	        		}
                    
                    if(evt.EventId == -3 && evt.EventCategory == 63)
                    {
                    	comm.add("true");
                    	//continue;
                    }
                    
                    EventProvider.getInstance().InsertEvent(evt.EquipmentTemplateId, evt.EventId, evt.EventName, evt.StartType, 
                    		evt.EndType, evt.StartExpression, evt.SuppressExpression, evt.EventCategory, evt.SignalId, evt.Enable, 
                    		evt.Visible, evt.Description, evt.DisplayIndex, evt.ModuleNo);
                    
                  //�¼�����
                    List<Element> ecElements = eventElement.selectNodes("Conditions/EventCondition");
                    for (Element ecElement : ecElements)
                    {
                        EventCondition evtCond = new EventCondition();

                        evtCond.EquipmentTemplateId = evt.EquipmentTemplateId;
                        evtCond.EventId = evt.EventId;
                        evtCond.EventConditionId = Integer.parseInt(ecElement.attributeValue("EventConditionId"));
                        evtCond.EventSeverity = Integer.parseInt(ecElement.attributeValue("EventSeverity"));
                        evtCond.StartOperation = ecElement.attributeValue("StartOperation");
                        evtCond.StartCompareValue = ecElement.attributeValue("StartCompareValue").isEmpty() ? 0 : Float.parseFloat(ecElement.attributeValue("StartCompareValue"));
                        evtCond.StartDelay = ecElement.attributeValue("StartDelay").isEmpty() ? 0 : Integer.parseInt(ecElement.attributeValue("StartDelay"));
                        evtCond.EndOperation = ecElement.attributeValue("EndOperation");
                        evtCond.EndCompareValue = ecElement.attributeValue("EndCompareValue").isEmpty() ? null : Float.parseFloat(ecElement.attributeValue("EndCompareValue"));
                        evtCond.EndDelay = ecElement.attributeValue("EndDelay").isEmpty() ? null : Integer.parseInt(ecElement.attributeValue("EndDelay"));
                        evtCond.Frequency = ecElement.attributeValue("Frequency").isEmpty() ? null : Integer.parseInt(ecElement.attributeValue("Frequency"));
                        evtCond.FrequencyThreshold = ecElement.attributeValue("FrequencyThreshold").isEmpty() ? null : Integer.parseInt(ecElement.attributeValue("FrequencyThreshold"));
                        evtCond.Meanings = ecElement.attributeValue("Meanings");
                        evtCond.EquipmentState = ecElement.attributeValue("EquipmentState").isEmpty() ? null : Short.parseShort(ecElement.attributeValue("EquipmentState"));
                        evtCond.BaseTypeId = ecElement.attributeValue("BaseTypeId").isEmpty() ? null : Integer.parseInt(ecElement.attributeValue("BaseTypeId"));
                        evtCond.StandardName = ecElement.attributeValue("StandardName").isEmpty() ? null : Integer.parseInt(ecElement.attributeValue("StandardName"));

                        EventConditionProvider.getInstance().InsertEventCondition(evtCond.EventConditionId, evtCond.EquipmentTemplateId, evtCond.EventId, 
                        		evtCond.StartOperation, evtCond.StartCompareValue, evtCond.StartDelay, evtCond.EndOperation, 
                        		evtCond.EndCompareValue, evtCond.EndDelay, evtCond.Frequency, evtCond.FrequencyThreshold, evtCond.Meanings, 
                        		evtCond.EquipmentState, evtCond.BaseTypeId, evtCond.EventSeverity, evtCond.StandardName);
                    }
                }
            }
            else
            {
            	System.out.println("No Event");
            }
			
		} catch (Exception e) {
			e.printStackTrace();
			
			ret = false;
		}
		
		return ret;
	}
	
	
	/** 
	 * ����ͨѶ״̬�¼�
	 * 
	 * @param xmlDoc
	 * @throws  
	 * @throws IOException 
	 * @return void 
	 */  
	public boolean GenerageCommmunicationEvent(Document xmlDoc, int EquipmentTemplateId,Integer EquipmentBaseType)
	{
		boolean ret = true;
		String[] propArr = null;
        String[] meaningsArr = null;
        
		try{
			ArrayList<Event> commmunicationEvent = EventProvider.getInstance().GetCommmunicationEvent(EquipmentTemplateId, -3);
			
			if(null != commmunicationEvent && commmunicationEvent.size() > 0)
			{
				//�Ѿ�����ͨѶ״̬�ź�
				return ret;
			}
			
			//��׼��������׼�����뵽���ݿ��У�����Ѿ������򲻲��룩
			Event evt = new Event();
			evt.EquipmentTemplateId = EquipmentTemplateId;
            evt.EventId = -3;
            evt.EventName = LanguageDataHandler.getLanaguageJsonValue("EquipmentTemplate.EventName");/*"设备通讯状态告警"*/
            evt.SignalId = -3;
            evt.StartExpression = "[-1,-3]";
            evt.EventCategory = 63;//�豸ͨѶ״̬�¼�
            evt.StartType = 1;
            evt.EndType = 3;
            evt.SuppressExpression = null;
            evt.Enable = true;
            evt.Visible = true;
            evt.Description = null;
            evt.DisplayIndex = 500;
            evt.ModuleNo = 0;
            
            EventProvider.getInstance().InsertEvent(evt.EquipmentTemplateId, evt.EventId, evt.EventName, evt.StartType, 
            		evt.EndType, evt.StartExpression, evt.SuppressExpression, evt.EventCategory, evt.SignalId, evt.Enable, 
            		evt.Visible, evt.Description, evt.DisplayIndex, evt.ModuleNo);
            
          //�¼�����
            EventCondition evtCond = new EventCondition();
            
            evtCond.EquipmentTemplateId = evt.EquipmentTemplateId;
            evtCond.EventId = evt.EventId;
            evtCond.EventConditionId = 0;
            evtCond.EventSeverity = 3;
            evtCond.StartOperation = "=";
            evtCond.StartCompareValue = Float.parseFloat("0");
            evtCond.StartDelay = 0;
            evtCond.EndOperation = null;
            evtCond.EndCompareValue = null;
            evtCond.EndDelay = null;
            evtCond.Frequency = null;
            evtCond.FrequencyThreshold = null;
            evtCond.Meanings = LanguageDataHandler.getLanaguageJsonValue("EquipmentTemplate.EventMeanings");/*"有告警"*/
            evtCond.EquipmentState = null;
            evtCond.BaseTypeId = EquipmentBaseType == null ? null : Integer.parseInt(String.format("%d%d", EquipmentBaseType,999001));;
            evtCond.StandardName = null;
            
            EventConditionProvider.getInstance().InsertEventCondition(evtCond.EventConditionId, evtCond.EquipmentTemplateId, evtCond.EventId, 
            		evtCond.StartOperation, evtCond.StartCompareValue, evtCond.StartDelay, evtCond.EndOperation, 
            		evtCond.EndCompareValue, evtCond.EndDelay, evtCond.Frequency, evtCond.FrequencyThreshold, evtCond.Meanings, 
            		evtCond.EquipmentState, evtCond.BaseTypeId, evtCond.EventSeverity, evtCond.StandardName);
            
		} catch (Exception e) {
			e.printStackTrace();
			
			ret = false;
		}
		
		return ret;
	}
	
	/** 
	 * ����XML�ļ������ɿ���
	 * 
	 * @param xmlDoc
	 * @throws  
	 * @throws IOException 
	 * @return void 
	 */  
	public boolean GenerateCommandsFromXml(Document xmlDoc, int EquipmentTemplateId)
	{
		boolean ret = true;
		String[] propArr = null;
        String[] meaningsArr = null;
        
		try{
			List<Element> cmdElements = xmlDoc.selectNodes("/EquipmentTemplates/EquipmentTemplate/Controls/Control");
			
			if (cmdElements != null && cmdElements.size() > 0)
            {
				for (Element cmdElement : cmdElements)
                {
                    //��׼��������׼�����뵽���ݿ��У�����Ѿ������򲻲��룩
                    Control cmd = new Control();
                    
                    cmd.EquipmentTemplateId = EquipmentTemplateId;
                    cmd.ControlId = Integer.parseInt(cmdElement.attributeValue("ControlId"));
                    cmd.ControlName = cmdElement.attributeValue("ControlName");
                    cmd.ControlCategory = Integer.parseInt(cmdElement.attributeValue("ControlCategory"));

                    cmd.CmdToken = cmdElement.attributeValue("CmdToken");
                    if (!cmdElement.attributeValue("BaseTypeId").isEmpty())
                    {
                        cmd.BaseTypeId = Integer.parseInt(cmdElement.attributeValue("BaseTypeId"));
                    }
                    cmd.ControlSeverity = Integer.parseInt(cmdElement.attributeValue("ControlSeverity"));
                    if (!cmdElement.attributeValue("SignalId").isEmpty())
                    {
                        cmd.SignalId = Integer.parseInt(cmdElement.attributeValue("SignalId"));
                    }
                    cmd.TimeOut = cmdElement.attributeValue("TimeOut").isEmpty() ? null : Float.parseFloat(cmdElement.attributeValue("TimeOut"));
                    cmd.Retry = cmdElement.attributeValue("Retry").isEmpty() ? null : Integer.parseInt(cmdElement.attributeValue("Retry"));
                    cmd.Description = cmdElement.attributeValue("Description");
                    cmd.Enable = Boolean.parseBoolean(cmdElement.attributeValue("Enable"));
                    cmd.Visible = Boolean.parseBoolean(cmdElement.attributeValue("Visible"));
                    cmd.DisplayIndex = Integer.parseInt(cmdElement.attributeValue("DisplayIndex"));
                    cmd.CommandType = Integer.parseInt(cmdElement.attributeValue("CommandType"));
                    if (!cmdElement.attributeValue("ControlType").isEmpty())
                    {
                        cmd.ControlType = Integer.parseInt(cmdElement.attributeValue("ControlType"));
                    }
                    if (!cmdElement.attributeValue("DataType").isEmpty())
                    {
                        cmd.DataType = Integer.parseInt(cmdElement.attributeValue("DataType"));
                    }
                    if (!cmdElement.attributeValue("MaxValue").isEmpty())
                    {
                        cmd.MaxValue = Float.parseFloat(cmdElement.attributeValue("MaxValue"));
                    }
                    if (!cmdElement.attributeValue("MinValue").isEmpty())
                    {
                        cmd.MinValue = Float.parseFloat(cmdElement.attributeValue("MinValue"));
                    }
                    cmd.DefaultValue = cmdElement.attributeValue("DefaultValue").isEmpty() ? null : Float.parseFloat(cmdElement.attributeValue("DefaultValue"));

                    if (cmdElement.attributeValue("ModuleNo") != null && !cmdElement.attributeValue("ModuleNo").isEmpty())
                    {
                        cmd.ModuleNo = Integer.parseInt(cmdElement.attributeValue("ModuleNo"));
                    }
                    else
                    {
                    	cmd.ModuleNo = 0;
                    }
                    
                    ControlProvider.getInstance().InsertControl(cmd.EquipmentTemplateId, cmd.ControlId, cmd.ControlName, 
                    		cmd.ControlCategory, cmd.CmdToken, cmd.BaseTypeId, cmd.ControlSeverity, cmd.SignalId, 
                    		cmd.TimeOut, cmd.Retry, cmd.Description, cmd.Enable, cmd.Visible, cmd.DisplayIndex, 
                    		cmd.CommandType, cmd.ControlType, cmd.DataType, cmd.MaxValue, cmd.MinValue, cmd.DefaultValue, cmd.ModuleNo);
                    
                  //���ƺ���
                    meaningsArr = cmdElement.attributeValue("ControlMeanings").split(";");
                    for (String meaning : meaningsArr)
                    {
                        String[] meaningArr = meaning.split(":");
                        if (isInteger(meaningArr[0]))
                        {
                        	short meaningId = Short.parseShort(meaningArr[0]);
                        	ControlMeanings cm = new ControlMeanings();
                        	
                        	cm.EquipmentTemplateId = cmd.EquipmentTemplateId;
                            cm.ControlId = cmd.ControlId;
                            cm.ParameterValue = meaningId;
                            cm.Meanings = meaningArr[1];
                            
                            ControlMeaningsProvider.getInstance().InsertControlMeanings(cm.EquipmentTemplateId, cm.ControlId, cm.ParameterValue, cm.Meanings);
                        }
                    }
                }
            }
            else
            {
            	System.out.println("û�п��ƴ���");
            }
			
		} catch (Exception e) {
			e.printStackTrace();
			
			ret = false;
		}
		
		return ret;
	}
	
	public boolean isInteger(String value) 
	{  
		try {   
			Integer.parseInt(value);   
			return true;  
		} catch (NumberFormatException e) 
		{   
			return false;  
		} 
	}

	
	/** 
	 * ��ȡģ��Id�����ģ���Ϊ�գ���ʹ��gEquipmentTemplateId�������Ϊ�գ���ʹ�����ֵ
	 * 
	 * @param  
	 *             
	 * @throws  
	 * @throws IOException 
	 * @return void 
	 */ 
	public int GetEquipmentTemplateId()	{
		int iEquipmentTemplateId = -1;
		try{
			//iEquipmentTemplateId = EquipmentTemplateProvider.getInstance().GetMaxEquipmentTemplateId();
			iEquipmentTemplateId = EquipmentTemplateProvider.getInstance().GenerateEquipmentTemplateId();

		} catch (Exception e) {
			e.printStackTrace();
		}
		
		return iEquipmentTemplateId;
	}
	
	/** 
	 * ��ȡ�ɼ���Id������ɼ�����Ϊ�գ���ʹ��gSamplerId�������Ϊ�գ���ʹ�����ֵ
	 * 
	 * @param  
	 *             
	 * @throws  
	 * @throws IOException 
	 * @return void 
	 */ 
	public int GetSamplerId()	{
		int iSamplerId = -1;
		try{
			//iSamplerId = SamplerProvider.getInstance().GetMaxSamplerId();
			iSamplerId = SamplerProvider.getInstance().GenerateSamplerId();

		} catch (Exception e) {
			e.printStackTrace();
		}
		
		return iSamplerId;
	}
	
	public String GetEquipmentTemplateNums(){
		int nums = 0;
		
		try{
			nums = EquipmentTemplateProvider.getInstance().GetEquipmentTemplateNums();

		} catch (Exception e) {
			e.printStackTrace();
		}
		
		return Integer.toString(nums);
	}
	
	public String GetEquipmentCountsByTemplateId(int EquipmentTemplateId){
		int nums = 0;
		
		try{
			nums = EquipmentTemplateProvider.getInstance().GetEquipmentCountsByTemplateId(EquipmentTemplateId);

		} catch (Exception e) {
			e.printStackTrace();
		}
		
		return Integer.toString(nums);
	}
	
	private String HandleGetLimitEquipmentTemplate(String requestParams) {
		String result = "fail to get limit equipmenttemplate";
        
        try{

        	String infoStr = new String(Base64.getDecoder().decode(requestParams), "UTF-8");
        	String[] paras = infoStr.split("\\|");
        	
			int index = Integer.parseInt(paras[0]);
			int size = Integer.parseInt(paras[1]);
			
			ArrayList<EquipmentTemplate> temp = EquipmentTemplateProvider.getInstance().GetLimitEquipmentTemplates(index, size);
    		
    		return JsonHelper.ListjsonString("ret", temp);
        
        } catch (Exception e) {
			e.printStackTrace();
			
		}
        
        return result;
	}
	
	private String HandleGetEquipmentTemplateNums(String requestParams) {
		
		String result = "fail to get equipmenttemplate nums";
        
        try{
        	int nums = EquipmentTemplateProvider.getInstance().GetEquipmentTemplateNums();
        
        	return Integer.toString(nums);
        } catch (Exception e) {
			e.printStackTrace();

		}
        
        return result;
	}
	
	private String HandleGetIOEquipmentTemplates(String requestParams) {
		
		ArrayList<EquipmentTemplate> temp = EquipmentTemplateProvider.getInstance().GetIOEquipmentTemplates();
		
		return JsonHelper.ListjsonString("ret", temp);
	}
	
	private String HandleGetEquipmentTemplatesByBaseType(String requestParams){
		//requestParams => ""(所有)/"BaseType1|BaseType2...(指定)"
		String[] baseTypes = requestParams.split("\\|");
		ArrayList<ActiveDevice> temp = ConfigCache.getInstance().getEquipmentTemplatesByBaseType(baseTypes);
		
		return JsonHelper.ListjsonString("ret", temp);
	}

	private String HandleGetHostEquipmentTemplates(String requestParams) {

		ArrayList<EquipmentTemplate> temp = EquipmentTemplateProvider.getInstance().GetHostEquipmentTemplates();

		return JsonHelper.ListjsonString("ret", temp);
	}
}