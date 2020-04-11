package nurse.entity.conf;

import java.util.ArrayList;

public class HandlerConfig {
    public ArrayList<DataHandlerConfig> dataHandlers = null;

    public HandlerConfig(){
        dataHandlers = new ArrayList<DataHandlerConfig>();
    }
}
