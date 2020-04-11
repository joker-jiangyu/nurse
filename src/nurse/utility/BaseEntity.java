package nurse.utility;

public class BaseEntity {
    /** 将时间字符串最后的.0去掉 **/
    public static String toTimeString(String time){
        try{
            int index = time.lastIndexOf(".0");
            return time.substring(0,index);
        }catch (Exception ex){
            return time;
        }
    }

    public static int toInt(Object obj){
        try{
            return Integer.parseInt(obj.toString());
        }catch (Exception ex){
            return 0;
        }
    }

    public static String getSplitString(String[] split,int index){
        try {
            return split.length > index ? split[index] : "";
        }catch (Exception e){
            return "";
        }
    }

    public static int getSplitInt(String[] split,int index){
        try {
            return split.length > index ? Integer.parseInt(split[index]) : -1;
        }catch (Exception e){
            return -1;
        }
    }

    public static double getSplitDouble(String[] split,int index){
        try {
            return split.length > index ? Double.parseDouble(split[index]) : -1;
        }catch (Exception e){
            return -1;
        }
    }
}
