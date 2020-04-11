package nurse.logic.handlers;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Base64;
import java.util.Date;

import nurse.entity.persist.CabinetDeviceMap;
import nurse.entity.persist.Card;
import nurse.entity.persist.DoorCard;
import nurse.entity.trasfer.HttpDataExchange;
import nurse.logic.providers.CardProvider;
import nurse.logic.providers.DoorProvider;
import nurse.logic.providers.RealDataProvider;
import nurse.utility.Base64Helper;
import nurse.utility.JsonHelper;

public class CardDataHandler extends DataHandlerBase {
	private static final String GETCARDLIST = "getCardList";
	private static final String GETCARDDATAITEM = "getCardDataItem";
	private static final String GETCARDBYCARDID = "getCardByCardId";
	private static final String CHECKOUTCARDCODE = "checkoutCardCode";
	private static final String UPDATECARD = "updateCard";
	private static final String DELETECARD = "deleteCard";
	private static final String GETLIMITCARD = "getLimitCard";
	private static final String GETCARDNUMS = "getCardNums";
	
	
	/** 通知FSU读库中命令 **/
	private void RealDataProvider(){		
		if(ActiveSignalDataHandler.proxy==null) 
			ActiveSignalDataHandler.proxy = new RealDataProvider();
		for(int i=0;i<3;i++){
			ActiveSignalDataHandler.proxy.GetData(8888);
		}
	}
	
	public void Execute(HttpDataExchange req, HttpDataExchange rep) {

		if (GetCommandName(req.requestCommand).equalsIgnoreCase(CardDataHandler.GETCARDLIST)){
			rep.responseResult = HandlerSelectCardList(req.requestParams);
		}
		if (GetCommandName(req.requestCommand).equalsIgnoreCase(CardDataHandler.GETCARDDATAITEM)){
			rep.responseResult = HandlerGetCardDataItem();
		}
		if (GetCommandName(req.requestCommand).equalsIgnoreCase(CardDataHandler.GETCARDBYCARDID)){
			rep.responseResult = HandlerGetCardByCardId(req.requestParams);
		}
		if (GetCommandName(req.requestCommand).equalsIgnoreCase(CardDataHandler.CHECKOUTCARDCODE)){
			rep.responseResult = HandlerCheckoutCardCode(req.requestParams);
		}
		if (GetCommandName(req.requestCommand).equalsIgnoreCase(CardDataHandler.UPDATECARD)){
			rep.responseResult = HandlerUpdateCard(req.requestParams);
		}
		if (GetCommandName(req.requestCommand).equalsIgnoreCase(CardDataHandler.DELETECARD)){
			rep.responseResult = HandlerDeleteCard(req.requestParams);
		}
		if (GetCommandName(req.requestCommand).equalsIgnoreCase(CardDataHandler.GETLIMITCARD)){
			rep.responseResult = HandlerGetLimitCard(req.requestParams);
		}
		if (GetCommandName(req.requestCommand).equalsIgnoreCase(CardDataHandler.GETCARDNUMS)){
			rep.responseResult = HandlerGetCardNums(req.requestParams);
		}
	}

	private String HandlerSelectCardList(String requestParams){
		// requestParams => CardGroup|CardCategory|CardStatus|UserName|CardName|CardCode
		String[] split = requestParams.split("\\|");
		String cardGroup = Base64Helper.decode(split[0]);
		cardGroup = cardGroup.equals("0")?"":cardGroup;
		String cardCategory = Base64Helper.decode(split[1]);
		cardCategory = cardCategory.equals("0")?"":cardCategory;
		String cardStatus = Base64Helper.decode(split[2]);
		cardStatus = cardStatus.equals("0")?"":cardStatus;
		String userName = split.length>3?Base64Helper.decode(split[3]):"";
		String cardName = split.length>4?Base64Helper.decode(split[4]):"";
		String cardCode = split.length>5?Base64Helper.decode(split[5]):"";
		
		return JsonHelper.ListjsonString("ret", CardProvider.getInstance().getCardList(cardGroup,cardCategory,cardStatus,userName,cardName,cardCode));
	}
	
	private String HandlerGetCardDataItem(){
		// return => {CardGroup:[],CardCategory:[],CardStatus:[],DateItem:[]}
		return CardProvider.getInstance().getCardDataItem();
	}
	
	private String HandlerGetCardByCardId(String requestParams){
		// requestParams => CardId
		return JsonHelper.ListjsonString("ret", CardProvider.getInstance().getCardByCardId(requestParams));
	}
	
	private String HandlerCheckoutCardCode(String requestParams){
		// requestParams => CardCode
		if(CardProvider.getInstance().checkoutCardCode(requestParams))
			return "SUCCEED";
		else
			return "FAILURE";
	}
	
	private String HandlerUpdateCard(String requestParams){
		// requestParams => CardId|CardCode|CardName|CardCategory|UserId|CardStatus|DoorId1-TimeGroup1-Password1&...|EndTime|Description
		//  CardStatus == 2  => 挂失状态，给门禁下发命令删除此卡。
		//	CardStatus == 3  => 作废状态，UnRegisterTime作废时间时间，给门禁下发命令删除此卡。
		
		String[] split = Base64Helper.decode(requestParams).split("\\|");
		if(split.length<8) return "FAILURE";
		Card card = new Card();
		card.cardType = Integer.parseInt(split[0]);
		card.cardId = Integer.parseInt(split[1]);
		card.cardCode = split[2];
		card.cardName = split[3];
		card.cardCategory = Integer.parseInt(split[4]);
		String userId = split[5];
		card.cardStatus = Integer.parseInt(split[6]);
		String[] doorCardStr = split[7].split("\\&");
		String endTime = split[8];
		String description = split.length > 9 ? split[9] : "";
		
		ArrayList<DoorCard> doorCards = new ArrayList<DoorCard>();
		ArrayList<Card> cards = new ArrayList<Card>();
		String[] doors = new String[doorCardStr.length];
		int index = 0;
		for(String doorCard : doorCardStr){
			String[] dc = doorCard.split("\\-");
			DoorCard d = new DoorCard();
			d.doorId = CabinetDeviceMap.parseInt(dc[0]);
			d.timeGroupId = dc[1];
			d.password = dc.length > 2 ? dc[2] : "0000";
			d.cardCode = card.cardCode;
			doorCards.add(d);
			doors[index] = String.valueOf(d.doorId);
			index ++;
		}
		SimpleDateFormat formatter = new SimpleDateFormat("yyyy-MM-dd");
		Date data = null;
		try {
			data = formatter.parse(endTime);
		} catch (ParseException e) {}
		formatter = new SimpleDateFormat("yyyyMMdd");
		card.endTime = formatter.format(data);
		cards.add(card);

		//HashMap<Integer, String> dcs = DoorProvider.getInstance().checkCardCode(card.cardCode,doors);

		if(card.cardType == 1){//ID卡，下发控制命令
			RealDataProvider();
			//CardStatus = 2/3 时，下发命令删除此卡
			if(card.cardStatus == 2 || card.cardStatus == 3){
				if(!DoorProvider.getInstance().delDoorCardCommand(doorCards,true))
					return "FAILURE";
			}else{//下发命令授权
				//先删除原来的卡
				DoorProvider.getInstance().delDoorCardCommand(doorCards,false);
				//添加修改后的卡
				String result = DoorProvider.getInstance().insDoorCardCommand(null,doorCards,userId,card);
				if(result.equals("SUCCEED"))
					//修改TBL_Card的CardName,CardCategory,CardStatus,Description；非控制的数据
					CardProvider.getInstance().UpdateCardNotActionData(card.cardName,card.cardCategory,1,
							card.cardType,card.cardStatus,description,card.cardId);
				else
					return result;
			}
			return "SUCCEED";
		}else{//非ID卡，直接修改数据库
			//修改TBL_Card表数据
			if(CardProvider.getInstance().updateCard(String.valueOf(card.cardId),String.valueOf(card.cardType),
					card.cardName,String.valueOf(card.cardCategory),userId,String.valueOf(card.cardStatus),endTime,description))
				return "SUCCEED";
			else
				return "FAILURE";
		}
	}
	
	private String HandlerDeleteCard(String requestParams){
		// requestParams => CardId
		//根据CardId获取CardCode与关联DoorId
		ArrayList<DoorCard> dcs = CardProvider.getInstance().getDoorIdAndCardCodeByCardId(requestParams);
		
		CardProvider.getInstance().deleteCard(requestParams);
		
		RealDataProvider();
		//下发命令删除卡
		if(dcs != null && dcs.size() > 0) 
			DoorProvider.getInstance().delDoorCardCommand(dcs,true);

		return "SUCCEED";
	}

	private String HandlerGetLimitCard(String requestParams){
		// requestParams => Index|Size|CardCategory|CardName|CardType
		String result = "fail to get limit equipment";
        
        try{

        	String infoStr = new String(Base64.getDecoder().decode(requestParams), "UTF-8");
        	String[] split = infoStr.split("\\|");
        	
			int index = Integer.parseInt(split[0]);
			int size = Integer.parseInt(split[1]);
			String cardCategory = split[2].equals("0")?"%":split[2];
			String cardName = split[3].equals("0")?"":split[3];
			String cardType = split[4].equals("0")?"%":split[4];
    		
    		return JsonHelper.ListjsonString("ret", CardProvider.getInstance().getLimitCard(index, size,cardCategory,cardName,cardType));
        } catch (Exception e) {
			e.printStackTrace();
			
		}
        return result;
	}
	
	private String HandlerGetCardNums(String requestParams){
		// requestParams => CardCategory|CardName|CardType
		String result = "fail to get equipment nums";
        
        try{
    		String infoStr = new String(Base64.getDecoder().decode(requestParams), "UTF-8");
        	String[] split = infoStr.split("\\|");
    
    		String cardCategory = split[0].equals("0")?"%":split[0];
    		String cardName = split.length>1?split[1]:"";
    		String cardType = split[2].equals("0")?"%":split[2];
        	
        	int nums = CardProvider.getInstance().getCardNums(cardCategory,cardName,cardType);
        
        	return Integer.toString(nums);
        } catch (Exception e) {
			e.printStackTrace();

		}
        return result;
	}
}
