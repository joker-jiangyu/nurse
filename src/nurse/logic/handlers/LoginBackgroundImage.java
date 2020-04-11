package nurse.logic.handlers;

import nurse.entity.trasfer.HttpDataExchange;
import nurse.utility.BasePath;
import nurse.utility.DataUri;
import org.json.JSONObject;

import java.io.*;
import java.net.URISyntaxException;
import java.net.URL;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Base64;

public class LoginBackgroundImage extends DataHandlerBase{

    private static final String UploadImage = "uploadImage";


    public LoginBackgroundImage(){};

    @Override
    public void Execute(HttpDataExchange req, HttpDataExchange rep) {
        if (GetCommandName(req.requestCommand).equalsIgnoreCase(LoginBackgroundImage.UploadImage))
        {
            rep.responseResult = UploadImage(req.requestParams);
        }
    }

    private static final int BUFF_LENGTH = 1024*1024;

    private String UploadImage(String requestParams) {
        File file = null;
        File file1 = new File("");
        try {
            String path = file1.getCanonicalPath();
            file = new File(path+"/web/css/bgImage.css");
            if(!file.exists())file.mkdir();
            FileWriter fr = new FileWriter(file);
            StringBuffer sb = new StringBuffer();
            sb.append("a;\n");
            sb.append("b;\n");
            sb.append("c;\n");
            fr.write("abcdefg");
        } catch (IOException e) {
            e.printStackTrace();
        }


        return null;

    }

    private String handleSettingLogin() throws IOException {


        File file = null;
        File file1 = new File("");
        FileWriter fw = null;
        FileReader fr = null;

        file = new File(file1.getCanonicalPath()+"/web/img/123456.jpg");
        File file2 = new File("C:\\Users\\A\\Desktop\\新建文件夹\\123.jpg");
        file.delete();
        FileOutputStream out= new FileOutputStream(file);
        FileInputStream in=new FileInputStream(file2);

        byte[] by=new byte[1];
        while (in.read(by)!=-1) {
            out.write(by);
        }
        //将缓冲区中的数据全部写出
        out.flush();
        out.close();
        in.close();
//        file.renameTo(new File(file1.getCanonicalPath()+"/web/img/1111111.jpg"));


        return null;
    }

    public static void main(String[] args) throws IOException {
//
//        File file=new File("C:\\Users\\A\\Desktop\\新建文件夹\\veer-319510187.jpg"); //指定文件名及路径
//        String name="C:\\Users\\A\\Desktop\\新建文件夹\\123";
//        String filename=file.getAbsolutePath();
//        if(filename.indexOf(".")>=0)
//        {
//            filename = filename.substring(0,filename.lastIndexOf("."));
//        }
//        file.renameTo(new File(name+".jpg")); //改名

        new LoginBackgroundImage().handleSettingLogin();
    }

    public void main1(){

        File file = null;
        File file1 = new File("");
        try {
            String path = file1.getCanonicalPath();
            file = new File(path+"/web/css/bgImage.css");
            if(file.exists())file.delete();
            file.createNewFile();
            FileWriter fr = new FileWriter(file);
            StringBuffer sb = new StringBuffer();
            sb.append(".Body-Background{\n");
            sb.append(" background: url(../img/loginbg.jpg) left top/cover no-repeat !important;\n");
            sb.append("}\n");
            sb.append(".login_pannel{\n");
            sb.append("right: 68%;\n");
            sb.append("}\n");
            sb.append(".Login-Background{\n");
            sb.append("background: url(../img/logininfo.png) no-repeat;\n");
            sb.append("}\n");
            fr.write(sb.toString());
            fr.close();
        } catch (IOException e) {
            e.printStackTrace();
        }finally {

        }
    }
}
