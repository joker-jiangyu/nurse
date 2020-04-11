package nurse.logic.handlers;

import nurse.entity.persist.ChartSignalMap;
import nurse.entity.persist.DeviceChartMap;
import nurse.entity.trasfer.HttpDataExchange;
import nurse.logic.providers.MdcHistoryDataProvider;
import nurse.utility.Base64Helper;
import nurse.utility.JsonHelper;

import java.util.ArrayList;
import java.util.List;

public class MdcHistoryDataHandler extends DataHandlerBase {
    private static final String GetMdcChartMap = "GetMdcChartMap";
    private static final String InitDeviceChartMap = "InitDeviceChartMap";
    private static final String RemoveDeviceChartMap = "RemoveDeviceChartMap";
    private static final String InitChartSignalMap = "InitChartSignalMap";

    @Override
    public void Execute(HttpDataExchange req, HttpDataExchange rep) {
        if (GetCommandName(req.requestCommand).equalsIgnoreCase(MdcHistoryDataHandler.GetMdcChartMap)){
            rep.responseResult = handleGetMdcChartMap(req.requestParams);
        }
        if (GetCommandName(req.requestCommand).equalsIgnoreCase(MdcHistoryDataHandler.InitDeviceChartMap)){
            rep.responseResult = handleInitDeviceChartMap(req.requestParams);
        }
        if (GetCommandName(req.requestCommand).equalsIgnoreCase(MdcHistoryDataHandler.RemoveDeviceChartMap)){
            rep.responseResult = handleRemoveDeviceChartMap(req.requestParams);
        }
        if (GetCommandName(req.requestCommand).equalsIgnoreCase(MdcHistoryDataHandler.InitChartSignalMap)){
            rep.responseResult = handleInitChartSignalMap(req.requestParams);
        }
    }

    private String handleGetMdcChartMap(String requestParams){
        //requestParams => deviceId
        List<DeviceChartMap> list = MdcHistoryDataProvider.getInstance().getMdcChartMap(requestParams);
        return 	JsonHelper.ListjsonString("ret", list);
    }

    private String handleInitDeviceChartMap(String requestParams){
        //requestParams => ChartMapId|DeviceId|ChartType|Title|Y1Name|Y2Name|XName|Max|Min
        try{
            String[] split = Base64Helper.decode(requestParams).split("\\|");
            DeviceChartMap dcm = new DeviceChartMap();
            dcm.ChartMapId = Integer.parseInt(split[0].equals("") ? "-1" : split[0]);
            dcm.DeviceId = Integer.parseInt(split[1]);
            dcm.ChartType = split[2];
            dcm.Title = split[3];
            dcm.Y1Name = split[4];
            dcm.Y2Name = split[5];
            dcm.XName = split[6];
            dcm.Max = split[7];
            dcm.Min = split[8];

            return MdcHistoryDataProvider.getInstance().initDeviceChartMap(dcm);
        }catch (Exception ex){
            return "ParamError";
        }
    }

    private String handleRemoveDeviceChartMap(String requestParams){
        //requestParams => ChartMapId
        return MdcHistoryDataProvider.getInstance().removeDeviceChartMap(requestParams);
    }

    private String handleInitChartSignalMap(String requestParams){
        //requestParams => ChartMapId|DeviceId1-SignalId1-Name1|DeviceId2-SignalId2-Name2
        try{
            String[] split = Base64Helper.decode(requestParams).split("\\|");
            int chartMapId = Integer.parseInt(split[0]);
            List<ChartSignalMap> csms = new ArrayList<ChartSignalMap>();
            for(int i = 1;i < split.length;i ++){
                String[] str = split[i].split("\\-");
                ChartSignalMap csm = new ChartSignalMap();
                csm.ChartMapId = chartMapId;
                csm.DeviceId = Integer.parseInt(str[0]);
                csm.BaseTypeId = Integer.parseInt(str[1]);
                csm.Name = str.length > 2 ? str[2] : "";
                csms.add(csm);
            }

            return MdcHistoryDataProvider.getInstance().initChartSignalMap(chartMapId,csms);
        }catch (Exception e){
            return "ParamError";
        }
    }
}
