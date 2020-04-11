package nurse.logic.handlers;

import nurse.entity.trasfer.HttpDataExchange;
import nurse.logic.providers.ImageManageProvider;

public class ImageManageDataHandler extends DataHandlerBase {
	private static final String LoadImagesByPath = "LoadImagesByPath";
	
	@Override
	public void Execute(HttpDataExchange req, HttpDataExchange rep) {
		if (GetCommandName(req.requestCommand).equalsIgnoreCase(ImageManageDataHandler.LoadImagesByPath)){
			rep.responseResult = handleLoadImagesByPath(req.requestParams);
		}
	}
	
	private String handleLoadImagesByPath(String requestParams){
		// requestParams => path
		return ImageManageProvider.getInstance().loadImagesByPath(requestParams);
	}
}
