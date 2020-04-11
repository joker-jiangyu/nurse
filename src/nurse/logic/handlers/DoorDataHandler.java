package nurse.logic.handlers;

import java.util.ArrayList;

import nurse.entity.persist.ActiveSignal;
import nurse.entity.persist.CabinetDeviceMap;
import nurse.entity.persist.Card;
import nurse.entity.persist.DataItem;
import nurse.entity.persist.Door;
import nurse.entity.persist.DoorCard;
import nurse.entity.trasfer.HttpDataExchange;
import nurse.logic.providers.ConfigCache;
import nurse.logic.providers.DataItemProvider;
import nurse.logic.providers.DoorProvider;
import nurse.logic.providers.RealDataProvider;
import nurse.utility.Base64Helper;
import nurse.utility.DoorGovernHelper;
import nurse.utility.JsonHelper;

public class DoorDataHandler extends DataHandlerBase {
	
	private static final String SPEEDADDDOORCARD = "speedAddDoorCard";
	private static final String GETDOORLISTBYDOORNAME = "getDoorListByDoorName";
	private static final String GETDOORBYDOORID = "getDoorByDoorId";
	private static final String UPDATEDOOR = "updateDoor";
	private static final String CONTROLDOOR = "controlDoor";
	private static final String GETDOORCARDLIST = "getDoorCardList";
	private static final String GETDOORBYTIMEGROUP = "getDoorByTimeGroup";
	private static final String DELDOORCARDCOMMAND = "delDoorCardCommand";
	private static final String GETLIMITDOORCARD = "getLimitDoorCard";
	private static final String GETDOORCARDNUMS = "getDoorCardNums";
	private static final String GetInfraredList = "getInfraredList";
	private static final String GetCardCode = "GetCardCode";
	private static final String GETDOORCONTROLS = "GetDoorControls";
	/** 通知FSU读库中命令 **/
	private void RealDataProvider(){		
		if(ActiveSignalDataHandler.proxy==null) 
			ActiveSignalDataHandler.proxy = new RealDataProvider();
		for(int i=0;i<3;i++){
			ActiveSignalDataHandler.proxy.GetData(8888);
		}
	}
	
	public void Execute(HttpDataExchange req, HttpDataExchange rep) {

		if (GetCommandName(req.requestCommand).equalsIgnoreCase(DoorDataHandler.SPEEDADDDOORCARD)){
			rep.responseResult = HandlerSpeedAddDoorCard(req.requestParams);
		}
		if (GetCommandName(req.requestCommand).equalsIgnoreCase(DoorDataHandler.GETDOORLISTBYDOORNAME)){
			rep.responseResult = HandlerGetDoorListByDoorName(req.requestParams);
		}
		if (GetCommandName(req.requestCommand).equalsIgnoreCase(DoorDataHandler.GETDOORBYDOORID)){
			rep.responseResult = HandlerGetDoorByDoorId(req.requestParams);
		}
		if (GetCommandName(req.requestCommand).equalsIgnoreCase(DoorDataHandler.UPDATEDOOR)){
			rep.responseResult = HandlerUpdateDoor(req.requestParams);
		}
		if (GetCommandName(req.requestCommand).equalsIgnoreCase(DoorDataHandler.CONTROLDOOR)){
			rep.responseResult = HandlerControlDoor(req.requestParams);
		}
		if (GetCommandName(req.requestCommand).equalsIgnoreCase(DoorDataHandler.GETDOORCARDLIST)){
			rep.responseResult = HandlerGetDoorCardList(req.requestParams);
		}
		if (GetCommandName(req.requestCommand).equalsIgnoreCase(DoorDataHandler.GETDOORBYTIMEGROUP)){
			rep.responseResult = HandlerGetDoorByTimeGroup(req.requestParams);
		}
		if (GetCommandName(req.requestCommand).equalsIgnoreCase(DoorDataHandler.DELDOORCARDCOMMAND)){
			rep.responseResult = HandlerDelDoorCardCommand(req.requestParams);
		}
		if (GetCommandName(req.requestCommand).equalsIgnoreCase(DoorDataHandler.GETLIMITDOORCARD)){
			rep.responseResult = HandlerGetLimitDoorCard(req.requestParams);
		}
		if (GetCommandName(req.requestCommand).equalsIgnoreCase(DoorDataHandler.GETDOORCARDNUMS)){
			rep.responseResult = HandlerGetDoorCardNums(req.requestParams);
		}
		if (GetCommandName(req.requestCommand).equalsIgnoreCase(DoorDataHandler.GetInfraredList)){
			rep.responseResult = HandlerGetInfraredList(req.requestParams);
		}
		if (GetCommandName(req.requestCommand).equalsIgnoreCase(DoorDataHandler.GetCardCode)){
			rep.responseResult = HandlerGetCardCode(req.requestParams);
		}
		if (GetCommandName(req.requestCommand).equalsIgnoreCase(DoorDataHandler.GETDOORCONTROLS)){
			rep.responseResult = HandlerGetDoorControls(req.requestParams);
		}
	}

	private String HandlerGetInfraredList(String requestParams) {
		 ArrayList<DataItem> temp = DataItemProvider.getInstance().GetDataItemsByEntryId(74);
		 return JsonHelper.ListjsonString("ret", temp);
	}

	private String HandlerSpeedAddDoorCard(String requestParams){
		// requestParams => CardCode|CardName|UserId|CardCategory|DoorId1&...|TimeGroupId|EndTime|Description
		String str = Base64Helper.decode(requestParams);
		String[] ccs = str.split("\\|");
		Card card = new Card();
		card.cardType = Integer.parseInt(ccs[0]);
		card.cardCode = ccs[1];
		card.cardName = ccs[2];
		String userId = ccs[3];
		card.cardCategory = Integer.parseInt(ccs[4]);
		String[] doors = ccs[5].split("\\&");
		String timeGroupId = ccs[6];
		String password = ccs[7];
		card.endTime = ccs[8];
		card.description = ccs.length>9?ccs[9]:"";
		
		ArrayList<DoorCard> doorCards = new ArrayList<DoorCard>();
		for(String doorId : doors){
			DoorCard doorCard = new DoorCard();
			doorCard.doorId = Integer.parseInt(doorId);
			doorCard.timeGroupId = timeGroupId;
			doorCard.password = password;
			doorCards.add(doorCard);
		}
		System.out.println("Parmams Door Value:"+ccs[5]+" ,Size:"+doorCards.size());/****** DeBug *******/
		
		//HashMap<Integer, String> dcs = DoorProvider.getInstance().checkCardCode(card.cardCode,doors);
		
		if(card.cardType == 1){ //1为ID卡  2为指纹  3为人脸
			RealDataProvider();
			//下发命令
			return DoorProvider.getInstance().insDoorCardCommand(doors,doorCards,userId,card);
		}else{//直接存库
			return DoorProvider.getInstance().insertDoorCard(doors,"FF",timeGroupId,card,userId,password);
		}
	}
	
	private String HandlerGetDoorListByDoorName(String requestParams){
		//requestParams => DoorName
		String doorName = Base64Helper.decode(requestParams);
		ArrayList<Door> temp = DoorProvider.getInstance().getDoorListByDoorName(doorName);
		
		return JsonHelper.ListjsonString("ret", temp);
	}
	
	private String HandlerGetDoorByDoorId(String requestParams){
		//requestParams => DoorId
		ArrayList<Door> temp = DoorProvider.getInstance().getDoorListByDoorId(requestParams);
		
		return JsonHelper.ListjsonString("ret", temp);
	}
	
	private String HandlerUpdateDoor(String requestParams){
		//requestParams => DoorId|DoorName|Password|OpenDelay|Infrared|Address
		
		String[] split = requestParams.split("\\|");
		if(split.length<6) return "Lack Parameter :"+requestParams;
		String doorId = Base64Helper.decode(split[0]);
		String doorName = Base64Helper.decode(split[1]);
		String doorNo=Base64Helper.decode(split[2]);
		String password = Base64Helper.decode(split[3]);
		String openDelay = Base64Helper.decode(split[4]);
		String ingrared = Base64Helper.decode(split[5]);
		String address = split.length > 6 ? Base64Helper.decode(split[6]) : "";
		String doorControlId = split.length > 7 ? Base64Helper.decode(split[7]) : "";
		
		//门延时
		Door door = null;
		if(!openDelay.equals("0")){
			RealDataProvider();
			//根据DoorId获得StationId、EquipmentId
			door = DoorProvider.getInstance().getStationIdAndEquipmentIdByDoorId(doorId);
			//下发门延时命令
			if(!DoorProvider.getInstance().updateDoorOpenDelay(door,openDelay))
				return "FAILURE";
		}
		
		if(DoorProvider.getInstance().updateDoor(doorId,doorName,doorNo,password,openDelay,ingrared,address,doorControlId)){
			//重置门控制配置
			DoorGovernHelper.getInstance().initDoorControlGovern();
			return "SUCCEED";
		}
		else
			return "FAILURE";
	}
	
	private String HandlerControlDoor(String requestParams){
		//requestParams => stationId|equipmentId|command(timing/removeCard/removeAll)
		String[] split = requestParams.split("\\|");
		if(split.length<3) return "FAILURE";
		String stationId = split[0];
		String equipmentId = split[1];
		String command = split[2];
		
		RealDataProvider();
		return DoorProvider.getInstance().controlDoor(stationId,equipmentId,command);
	}
	
	private String HandlerGetDoorCardList(String requestParams){
		// requestParams => CardGroup|TimeGroupId|EndTime|EmployeeName|DoorName|CardCode|CardName
		String[] split = requestParams.split("\\|");
		String cardGroup = Base64Helper.decode(split[0]).equals("0")?"":Base64Helper.decode(split[0]);
		String timeGroupId = Base64Helper.decode(split[1]).equals("0")?"":Base64Helper.decode(split[1]);
		String endTime = Base64Helper.decode(split[2]).equals("")?"9999-01-01":Base64Helper.decode(split[2]);
		String employeeName = split.length<4?"":Base64Helper.decode(split[3]);
		String doorName = split.length<5?"":Base64Helper.decode(split[4]);
		String cardCode = split.length<6?"":Base64Helper.decode(split[5]);
		String cardName = split.length<7?"":Base64Helper.decode(split[6]);
		
		return JsonHelper.ListjsonString("ret", DoorProvider.getInstance().getDoorCardList(cardGroup,timeGroupId,endTime,employeeName,doorName,cardCode,cardName));
	}
	
	private String HandlerGetDoorByTimeGroup(String requestParams){
		// requestParams => TimeGroupId
		return JsonHelper.ListjsonString("ret", DoorProvider.getInstance().getDoorByTimeGroup(requestParams));
	}
	
	public String HandlerDelDoorCardCommand(String requestParams){
		// requestParams => Door1|CardCode1&Door2|CardCode2&...
		String[] split = requestParams.split("\\&");
		ArrayList<DoorCard> dcs = new ArrayList<DoorCard>();
		for(String doorCard : split){
			DoorCard dc = new DoorCard();
			String[] d = doorCard.split("\\|");
			
			dc.doorId = CabinetDeviceMap.parseInt(d[0]);
			dc.cardCode = d[1];
			
			dcs.add(dc);
		}
		
		RealDataProvider();
		if(DoorProvider.getInstance().delDoorCardCommand(dcs,false))
			return "SUCCEED";
		else
			return "FAILURE";
	}
	
	public String HandlerGetLimitDoorCard(String requestParams){
		// requestParams => Index|Size|CardGroup|TimeGroupId|EndTime|EmployeeName|DoorName|CardCode|CardName

		String req = Base64Helper.decode(requestParams);
		String[] split = req.split("\\|");
		String index = split[0];
		String size = split[1];
		String cardGroup = split[2].equals("0")?"":split[2];
		String timeGroupId = split[3].equals("0")?"":split[3];
		String endTime = split[4].equals("")?"9999-01-01":split[4];
		String employeeName = split.length<6?"":split[5];
		String doorName = split.length<7?"":split[6];
		String cardCode = split.length<8?"":split[7];
		String cardName = split.length<9?"":split[8];
		
		return JsonHelper.ListjsonString("ret", DoorProvider.getInstance().getLimitDoorCard(index,size,cardGroup,timeGroupId,endTime,employeeName,doorName,cardCode,cardName));
	}
	
	public String HandlerGetDoorCardNums(String requestParams){
		// requestParams => CardGroup|TimeGroupId|EndTime|EmployeeName|DoorName|CardCode|CardName
		String req = Base64Helper.decode(requestParams);
		String[] split = req.split("\\|");
		String cardGroup = split[0].equals("0")?"":split[0];
		String timeGroupId = split[1].equals("0")?"":split[1];
		String endTime = split[2].equals("")?"9999-01-01":split[2];
		String employeeName = split.length<4?"":split[3];
		String doorName = split.length<5?"":split[4];
		String cardCode = split.length<6?"":split[5];
		String cardName = split.length<7?"":split[6];
		
		return Integer.toString(DoorProvider.getInstance().getDoorCardNums(cardGroup,timeGroupId,endTime,employeeName,doorName,cardCode,cardName));
	}
	private String HandlerGetCardCode(String requestParams) {
		String[] split = requestParams.split("\\|");
		String deviceId = split[0].equals("0")?"":split[0];
		String baseTypeId = split[1].equals("0")?"":split[1];//1001132001&1001305001
		
		String[] tbId = baseTypeId.split("\\&");
		ActiveSignal as = null;
		for(String id : tbId){
			as = ConfigCache.getInstance().getActiveBaseTypeSignal(Integer.parseInt(deviceId), 
					Integer.parseInt(id));
			if(as != null) return as.getCurrentValue();
		}
		
		return "";
	}
	
	private String HandlerGetDoorControls(String requestParams){
		return JsonHelper.ListjsonString("ret", DoorProvider.getInstance().getDoorControls());
	}
}
