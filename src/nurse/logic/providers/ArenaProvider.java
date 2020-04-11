package nurse.logic.providers;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;

import org.apache.log4j.Logger;

import nurse.NurseApp;
import nurse.utility.BasePath;

public class ArenaProvider {

	private static ArenaProvider instance = new ArenaProvider();
	private static Logger log = Logger.getLogger(NurseApp.class);

	public ArenaProvider() {
	}

	public static ArenaProvider getInstance() {
		return instance;
	}

	public String getFile(String name) {        

		String filePath = BasePath.getDirByEnv("diagrams/web3d/" + name + ".json");
		
		log.debug("3d config File:" + filePath);
	
		File f = new File(filePath);

		if (!f.exists())
			return null;

		String fileContent = "";

		try {
			FileInputStream fis = new FileInputStream(f);
			InputStreamReader isr = new InputStreamReader(fis, "UTF-8");
			BufferedReader br = new BufferedReader(isr);

			String line = null;
			while ((line = br.readLine()) != null) {
				fileContent += line;
				fileContent += "\r\n";
			}

			br.close();
		} catch (Exception e) {
			e.printStackTrace();
		}

		return fileContent;
	}

	public String saveFile(String filename, String filecontent) {

		String encoding = "utf-8";  
		String filePath = BasePath.getDirByEnv("diagrams/web3d/" + filename + ".json");
		
		File f = new File(filePath); 
		
		if (f.exists()) f.delete();
		
		try { 
	        
	        f.createNewFile();  
	        BufferedWriter writer = new BufferedWriter(new OutputStreamWriter(new FileOutputStream(filePath), encoding));  
	        writer.write(filecontent);  
	        writer.close();
	    } catch (IOException e) {  
	        e.printStackTrace();
	        return "Fail";
	    }
		return "OK";	
	}
}
