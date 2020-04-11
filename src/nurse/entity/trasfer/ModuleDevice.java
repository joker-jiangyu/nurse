package nurse.entity.trasfer;

import nurse.utility.Base64Helper;

import java.util.ArrayList;

public class ModuleDevice {
    public String id;
    public String code;
    public String name;
    public String type;

    /** 拆分Snmp配置的设备列表 */
    public static ArrayList<ModuleDevice> splitSnmpDevice(String[] devices,String ch){
        //devices => id-name-type
        ArrayList<ModuleDevice> list = new ArrayList<ModuleDevice>();
        for(String dev : devices){
            ModuleDevice md = new ModuleDevice();
            String[] split = dev.split(ch);
            System.out.println("Split id:"+split[0]+", name:"+split[1]+", type:"+split[2]);
            md.id = split[0];
            md.name = Base64Helper.decode(split[1]);
            md.type = split[2];
            list.add(md);
        }
        return list;
    }

    /** 拆分B接口配置的设备列表 */
    public static ArrayList<ModuleDevice> splitBDevice(String[] devices,String ch){
        //devices => code-id-name
        ArrayList<ModuleDevice> list = new ArrayList<ModuleDevice>();
        for(String dev : devices){
            ModuleDevice md = new ModuleDevice();
            String[] split = dev.split(ch);
            System.out.println("Split code:"+split[0]+", id:"+split[1]+", name:"+split[2]);
            md.code = split[0];
            md.id = split[1];
            md.name = Base64Helper.decode(split[2]);
            list.add(md);
        }
        return list;
    }
}
