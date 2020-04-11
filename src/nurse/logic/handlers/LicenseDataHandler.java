package nurse.logic.handlers;

import nurse.entity.trasfer.HttpDataExchange;
import nurse.logic.providers.LicenseProvider;

public class LicenseDataHandler extends DataHandlerBase {
	
	private static final String CheckoutLicense = "CheckoutLicense";
	private static final String GenerateInfoFile = "GenerateInfoFile";
	private static final String UploadLicenseFile = "UploadLicenseFile";
	
	public LicenseDataHandler() {
		
	}
	
	@Override
	public void Execute(HttpDataExchange req, HttpDataExchange rep) {

		if (GetCommandName(req.requestCommand).equalsIgnoreCase(LicenseDataHandler.CheckoutLicense)){
			rep.responseResult = HandleCheckoutLicense(req.requestParams);
		}
		if (GetCommandName(req.requestCommand).equalsIgnoreCase(LicenseDataHandler.GenerateInfoFile)){
			rep.responseResult = HandleGenerateInfoFile(req.requestParams);
		}
		if (GetCommandName(req.requestCommand).equalsIgnoreCase(LicenseDataHandler.UploadLicenseFile)){
			rep.responseResult = HandleUploadLicenseFile(req.requestParams);
		}
	}
	
	/**
	 * 校验License有效期有多久，少于45天提示
	 * @return {IsShow:"true",Remain:"45"}
	 */
	private String HandleCheckoutLicense(String requestParams){
		return LicenseProvider.getInstance().checkoutLicense();
	}
	
	/**
	 * 生成本机机器码
	 */
	private String HandleGenerateInfoFile(String requestParams){
		if(LicenseProvider.getInstance().generateInfoFile())
			return "SUCCEED";
		else
			return "ERROR";
	}
	
	/**
	 * 上传License文件
	 */
	private String HandleUploadLicenseFile(String requestParams){
		//requestParams => upload/NurseLicense.key
		if(LicenseProvider.getInstance().uploadLicenseFile(requestParams))
			return "SUCCEED";
		else
			return "ERROR";
	}
}
