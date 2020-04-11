package nurse.entity.persist;

import java.util.Date;

public class LoginUser {
	
	public LoginUser() {
	}

	public String UserName;
	public Date LastedTime;
	public String UserToken;
	public Date LoginTime;
	
	public String userName() {
		return UserName;
	}
	
	public String userToken() {
		return UserToken;
	}
	
	
	public Date lastedTime() {
		return LastedTime;
	}
	
	public Date loginTime() {
		return LoginTime;
	}
	
	
}
