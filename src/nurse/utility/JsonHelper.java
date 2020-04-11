package nurse.utility;

import java.lang.reflect.Field;
import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.List;
 
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

@SuppressWarnings("all")
public class JsonHelper {
	
    /**{"www":[{"title":"1","href":"12"}]} 
     * list转化为json
     * */
    public static <T>String ListjsonString(String str,List<T> lists) throws JSONException {
        JSONObject json=new JSONObject();
        json.put(str, ListjsonArray(lists));
        return json.toString();
    }
    /**[{"title":"1","href":"12"}]
     * */
    
private static <T>String ListjsonString(List<T> listobject) throws JSONException {
         
        return ListjsonArray(listobject).toString();
    }
public static String jsonListString(String notestring,String jsonString)throws JSONException
{
     
    JSONObject json= new JSONObject(jsonString);   
    String str=jsonListString(json,notestring);   
    return str;
    }
public static String jsonListString(JSONObject json,String notestring)throws JSONException
{
  if(json!=null){
    String str=(String) json.get(notestring);   
    return str;
  }
  else
  {
      return null;
  }
    }
//json转化为list
public static <T>List<T> jsonListObject(String classstring,String jsonString)
{
    try {
        if(!jsonString.equals(""))
        {
        JSONObject json= new JSONObject(jsonString);
        JSONArray jsonArray=json.getJSONArray(classstring);
         
        List<T> lists=new ArrayList<T>();
         
        for(int i=0;i<jsonArray.length();i++){ 
             JSONObject jb=(JSONObject) jsonArray.get(i);
             Class onwClass = null;
                Object jt=null;
                try {
                    onwClass = Class.forName(classstring);//类的反射根据类名创建类
                     jt=onwClass.newInstance();
                } catch (Exception e1) {
                    // TODO Auto-generated catch block
                    e1.printStackTrace();
                }
                Field[] fields = jt.getClass().getDeclaredFields();
             for (int j = 0; j < fields.length; j++) {
                    try {
                        fields[j].set(jt, jb.get(fields[j].getName()));//属性反射：根据得到字符串属性名赋值
                    } catch (IllegalArgumentException e) {
                        // TODO Auto-generated catch block
                        e.printStackTrace();
                         
                    } catch (IllegalAccessException e) {
                        // TODO Auto-generated catch block
                        e.printStackTrace();
                    }
                }
             lists.add((T) jt);
        }
         
        return lists;
        }
    } catch (JSONException e) {
        // TODO Auto-generated catch block
        e.printStackTrace();
    }   
    return null;
}
    public static <T>JSONArray ListjsonArray(List<T> listobject) throws JSONException {
        JSONArray jsonMembers = new JSONArray();
        JSONObject member1 = new JSONObject();
        for(Object obj:listobject)
        {
            jsonMembers.put(jsonObject(obj));
        }
        return jsonMembers;
    }
/**
 * 获取单个对象的JSONObject
 * */
    public static <T>JSONObject jsonObject(T obj) throws JSONException {
        JSONObject jsonobj=new JSONObject();
        String[] strs=null;
        strs=getFiledName(obj);
        for(String str:strs)
        {
        	Object f= getFieldValueByName(str,obj);
        	if (f != null)
        		jsonobj.put(str, f.toString());
        	else
        		jsonobj.put(str, "");
        }
        if(strs!=null)
        {
        return jsonobj;
        }
        return null;
    }
/**
 * 获取对象中的属性值
 * fieldName属性名
 * obj:对象名
 * */
    private  static <T>Object getFieldValueByName(String fieldName, T obj) {
//        try {
//            String firstLetter = fieldName.substring(0, 1).toUpperCase();
//            String getter = "get" + firstLetter + fieldName.substring(1);
//            Method method = obj.getClass().getMethod(getter, new Class[] {});
//            Object value = method.invoke(obj, new Object[] {});
//            return value;
//        } catch (Exception e) {
//            return null;
//        }
        
    	try{
	        Class c = obj.getClass();     
	        return c.getField(fieldName).get(obj);
    	}catch(Exception e){ return null;}
    }
/**
 * 获取对象中的属性名
 * Obj:对象
 * */
    private static <T>String[] getFiledName(T obj) {
        try {
            Field[] fields = obj.getClass().getDeclaredFields();
            String[] fieldNames = new String[fields.length];
            for (int i = 0; i < fields.length; i++) {
                fieldNames[i] = fields[i].getName();
            }
            return fieldNames;
        } catch (SecurityException e) {
            e.printStackTrace();
            System.out.println(e.toString());
        }
        return null;
    }
     
}