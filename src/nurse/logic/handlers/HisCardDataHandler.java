package nurse.logic.handlers;


import java.util.ArrayList;
import nurse.entity.persist.CardRecode;
import nurse.entity.trasfer.HttpDataExchange;
import nurse.logic.providers.CardRecordProvider;
import nurse.utility.Base64Helper;
import nurse.utility.JsonHelper;

public class HisCardDataHandler  extends DataHandlerBase{
	private static final String getHisCard = "getHisCard";
	private static final String LikeHisCards = "likeHisCards";
	private static final String LikeHisCardTotals = "likeHisCardTotals";
	
	public HisCardDataHandler() {
	}
	
	@Override
	public void Execute(HttpDataExchange req, HttpDataExchange rep) {

		if (GetCommandName(req.requestCommand).equalsIgnoreCase(HisCardDataHandler.getHisCard))
		{
			rep.responseResult = handlegetHisCard(req.requestParams);
		}
		if (GetCommandName(req.requestCommand).equalsIgnoreCase(HisCardDataHandler.LikeHisCards))
		{
			rep.responseResult = handleLikeHisCards(req.requestParams);
		}
		if (GetCommandName(req.requestCommand).equalsIgnoreCase(HisCardDataHandler.LikeHisCardTotals))
		{
			rep.responseResult = handleLikeHisCardTotals(req.requestParams);
		}
	}

	private String handlegetHisCard(String requestParams) {
		String[] ss = requestParams.split("\\|");
		ArrayList<CardRecode> aas = CardRecordProvider.getInstance().getHisCardByTimeSpan(ss[0], ss[1]);
		return 	JsonHelper.ListjsonString("ret", aas);
	}
	
	private String handleLikeHisCards(String requestParams){
		// requestParams => index|size|startTime|endTime|doorNo|doorName|cardCode|cardName|employeeName|itemValue
		String[] split = Base64Helper.decode(requestParams).split("\\|");
		int index = Integer.parseInt(split[0]);
		int size = Integer.parseInt(split[1]);
		String startTime = split[2];
		String endTime = split[3];
		String doorNo = split.length > 4 ? split[4] : "";
		String doorName = split.length > 5 ? split[5] : "";
		String cardCode = split.length > 6 ? split[6] : "";
		String cardName = split.length > 7 ? split[7] : "";
		String employeeName = split.length > 8 ? split[8] : "";
		String itemValue = split.length > 9 ? split[9] : "";
		String itemAlias = split.length > 10 ? split[10] : "";

		ArrayList<CardRecode> aas = CardRecordProvider.getInstance().likeHisCards(index,size,startTime,endTime,
				doorNo,doorName,cardCode,cardName,employeeName,itemValue,itemAlias);
		return JsonHelper.ListjsonString("ret", aas);
	}
	
	private String handleLikeHisCardTotals(String requestParams){
		// requestParams => startTime|endTime|doorNo|doorName|cardCode|cardName|employeeName|itemValue
		String[] split = Base64Helper.decode(requestParams).split("\\|");
		String startTime = split[0];
		String endTime = split[1];
		String doorNo = split.length > 2 ? split[2] : "";
		String doorName = split.length > 3 ? split[3] : "";
		String cardCode = split.length > 4 ? split[4] : "";
		String cardName = split.length > 5 ? split[5] : "";
		String employeeName = split.length > 6 ? split[6] : "";
		String itemValue = split.length > 7 ? split[7] : "";
		String itemAlias = split.length > 8 ? split[8] : "";
		
		return CardRecordProvider.getInstance().likeHisCardTotals(startTime,endTime,
				doorNo,doorName,cardCode,cardName,employeeName,itemValue,itemAlias);
	}

}
