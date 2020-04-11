package nurse.utility;

import java.util.ArrayList;
import java.util.Date;
import java.util.Random;

import nurse.entity.persist.*;

public class MockHelper {

	public MockHelper() {
	}
	
//	public static ArrayList<SignalBaseType> getSignalBaseTypes()
//	{
//		ArrayList<SignalBaseType> ts = new ArrayList<SignalBaseType>();
//		
//		SignalBaseType s1 = new SignalBaseType();
//		s1.deviceBaseTypeId = 120;
//		s1.baseTypeId = 120110;
//		s1.baseTypeName = "A相输出电压";
//		
//		ts.add(s1);
//		
//		SignalBaseType s2 = new SignalBaseType();
//		s2.deviceBaseTypeId = 120;
//		s2.baseTypeId = 120111;
//		s2.baseTypeName = "B相输出电压";
//		
//		ts.add(s2);		
//				
//		SignalBaseType s3 = new SignalBaseType();
//		s3.deviceBaseTypeId = 120;
//		s3.baseTypeId = 120112;
//		s3.baseTypeName = "C相输出电压";
//		
//		ts.add(s3);
//		
//		return ts;
//	}
	
//	public static ArrayList<ActiveAlarm> getActiveAlarms()
//	{
//		ArrayList<ActiveAlarm> alarms = new ArrayList<ActiveAlarm>();
//		
//		ActiveAlarm a1 = new ActiveAlarm();
//		a1.siteId = 1;
//		a1.deviceId = 10;
//		a1.signalId = 100;
//		a1.eventId = 1000;
//		a1.baseTypeId = 10000;
//		a1.conditionId = 100000;
//		a1.startTime = new Date();
//		a1.alarmLevel = 1;
//		a1.alarmLevelName = "一般告警";
//		a1.eventCategoryId = 111;
//		a1.baseTypeName = "电池电压过高";
//		a1.deviceName = "蓄电池1#";
//		a1.meanings = "过高";
//		a1.signalName = "蓄电池电压";
//		a1.siteName = "三九医药";
//		a1.deviceVendor = "南达";
//		a1.triggerValue = 51.3f;
//		a1.uniqueId = UUID.randomUUID().toString();
//		a1.eventName = "蓄电池电压告警";
//		
//		alarms.add(a1);		
//
//		ActiveAlarm a2 = new ActiveAlarm();
//		a2.siteId = 1;
//		a2.deviceId = 11;
//		a2.signalId = 101;
//		a2.eventId = 1001;
//		a2.baseTypeId = 10001;
//		a2.conditionId = 100001;
//		a2.startTime = new Date();
//		a2.alarmLevel = 0;
//		a2.alarmLevelName = "提示";
//		a2.eventCategoryId = 112;
//		a2.baseTypeName = "水浸告警";
//		a2.deviceName = "环境设备";
//		a2.meanings = "告警";
//		a2.signalName = "配电房水浸";
//		a2.siteName = "三九医药";
//		a2.deviceVendor = "自产";
//		a2.triggerValue = 1f;
//		a2.uniqueId = UUID.randomUUID().toString();
//		a2.eventName = "水浸告警";
//		
//		alarms.add(a2);
//		
//		ActiveAlarm a3 = new ActiveAlarm();
//		a3.siteId = 1;
//		a3.deviceId = 12;
//		a3.signalId = 102;
//		a3.eventId = 1002;
//		a3.baseTypeId = 10002;
//		a3.conditionId = 100002;
//		a3.startTime = new Date();
//		a3.alarmLevel = 2;
//		a3.alarmLevelName = "重要告警";
//		a3.eventCategoryId = 113;
//		a3.baseTypeName = "环境温度过高告警";
//		a3.deviceName = "精密空调A1";
//		a3.meanings = "过高";
//		a3.signalName = "出风温度";
//		a3.siteName = "三九医药";
//		a3.deviceVendor = "APC";
//		a3.triggerValue = 1f;
//		a3.uniqueId = UUID.randomUUID().toString();
//		a3.eventName = "温度告警";
//		
//		alarms.add(a3);
//		
//		ActiveAlarm a4 = new ActiveAlarm();
//		a4.siteId = 1;
//		a4.deviceId = 13;
//		a4.signalId = 103;
//		a4.eventId = 1003;
//		a4.baseTypeId = 10003;
//		a4.conditionId = 100003;
//		a4.startTime = new Date();
//		a4.alarmLevel = 3;
//		a4.alarmLevelName = "紧急告警";
//		a4.eventCategoryId = 114;
//		a4.baseTypeName = "旁路告警";
//		a4.deviceName = "UPS1";
//		a4.meanings = "旁路";
//		a4.signalName = "旁路状态";
//		a4.siteName = "三九医药";
//		a4.deviceVendor = "Emerson";
//		a4.triggerValue = 0f;
//		a4.uniqueId = UUID.randomUUID().toString();
//		a4.eventName = "旁路告警";
//		
//		alarms.add(a4);
//		
//		ActiveAlarm a5 = new ActiveAlarm();
//		a5.siteId = 1;
//		a5.deviceId = 14;
//		a5.signalId = 104;
//		a5.eventId = 1004;
//		a5.baseTypeId = 10004;
//		a5.conditionId = 100004;
//		a5.startTime = new Date();
//		a5.alarmLevel = 2;
//		a5.alarmLevelName = "重要告警";
//		a5.eventCategoryId = 115;
//		a5.baseTypeName = "烟感告警";
//		a5.deviceName = "环境设备";
//		a5.meanings = "告警";
//		a5.signalName = "烟感状态";
//		a5.siteName = "三九医药";
//		a5.deviceVendor = "自产";
//		a5.triggerValue = 1f;
//		a5.uniqueId = UUID.randomUUID().toString();
//		a5.eventName = "烟感告警";
//		
//		alarms.add(a5);
//		
//		return alarms;
//	}

//	public static ArrayList<ActiveDevice> getActiveDevices()
//	{
//		ArrayList<ActiveDevice> ds = new ArrayList<ActiveDevice>();
//		
//		ActiveDevice d1= new ActiveDevice();
//		d1.siteId= 1;
//		d1.deviceId=11;
//		d1.baseTypeId = 111;
//		d1.connectStatus = 1;
//		d1.maxAlarmLevel =-1;
//		d1.siteName = "2楼机房";
//		d1.deviceName = "空调2号";
//		d1.vendor = "依米康";
//		d1.baseTypeName = "精密空调";
//		d1.remark="2013年生产";
//		
//		ds.add(d1);
//		
//		ActiveDevice d2= new ActiveDevice();
//		d2.siteId= 1;
//		d2.deviceId=12;
//		d2.baseTypeId = 111;
//		d2.connectStatus = 0;
//		d2.maxAlarmLevel =2;
//		d2.siteName = "2楼机房";
//		d2.deviceName = "空调1号";
//		d2.vendor = "Emerson";
//		d2.baseTypeName = "精密空调";
//		d2.remark="2011年生产";
//		
//		ds.add(d2);
//		
//		ActiveDevice d3= new ActiveDevice();
//		d3.siteId= 1;
//		d3.deviceId=13;
//		d3.baseTypeId = 120;
//		d3.connectStatus = 1;
//		d3.maxAlarmLevel =1;
//		d3.siteName = "1楼机房";
//		d3.deviceName = "APC UPS1";
//		d3.vendor = "APC";
//		d3.baseTypeName = "UPS";
//		d3.remark="2013年生产";
//		
//		ds.add(d3);
//		
//		ActiveDevice d4= new ActiveDevice();
//		d4.siteId= 1;
//		d4.deviceId=14;
//		d4.baseTypeId = 120;
//		d4.connectStatus = 0;
//		d4.maxAlarmLevel =-1;
//		d4.siteName = "2楼机房";
//		d4.deviceName = "UPS副机";
//		d4.vendor = "山拓";
//		d4.baseTypeName = "精密空调";
//		d4.remark="2010年生产";
//		
//		ds.add(d4);
//		
//		ActiveDevice d5= new ActiveDevice();
//		d5.siteId= 1;
//		d5.deviceId=15;
//		d5.baseTypeId = 200;
//		d5.connectStatus = 0;
//		d5.maxAlarmLevel = 1;
//		d5.siteName = "2楼机房";
//		d5.deviceName = "SPM 2号";
//		d5.vendor = "Emerson";
//		d5.baseTypeName = "配电";
//		d1.remark="2008年生产";
//		
//		ds.add(d5);
//		
//		ActiveDevice d6= new ActiveDevice();
//		d6.siteId= 1;
//		d6.deviceId=16;
//		d6.baseTypeId = 200;
//		d6.connectStatus = 1;
//		d6.maxAlarmLevel =1;
//		d6.siteName = "2楼机房";
//		d6.deviceName = "电表2号";
//		d6.vendor = "ASCO";
//		d6.baseTypeName = "配电";
//		d6.remark="2010年生产";
//		
//		ds.add(d6);
//		
//		ActiveDevice d7= new ActiveDevice();
//		d7.siteId= 1;
//		d7.deviceId=17;
//		d7.baseTypeId = 300;
//		d7.connectStatus = 1;
//		d7.maxAlarmLevel =3;
//		d7.siteName = "2楼机房";
//		d7.deviceName = "机房环境";
//		d7.vendor = "自产";
//		d7.baseTypeName = "机房环境设备";
//		d7.remark="2013年生产";
//		
//		ds.add(d7);
//		
//		ActiveDevice d8= new ActiveDevice();
//		d8.siteId= 1;
//		d8.deviceId=18;
//		d8.baseTypeId = 400;
//		d8.connectStatus = 1;
//		d8.maxAlarmLevel = 1;
//		d8.siteName = "2楼机房";
//		d8.deviceName = "财务系统Server";
//		d8.vendor = "HP";
//		d8.baseTypeName = "服务器";
//		d8.remark="2012年生产";
//		
//		ds.add(d8);
//		
//		ActiveDevice d9= new ActiveDevice();
//		d9.siteId= 1;
//		d9.deviceId=19;
//		d9.baseTypeId = 400;
//		d9.connectStatus = 1;
//		d9.maxAlarmLevel =-1;
//		d9.siteName = "2楼机房";
//		d9.deviceName = "维修管理服务器";
//		d9.vendor = "联想";
//		d9.baseTypeName = "服务器";
//		d9.remark="2014年生产";
//		
//		ds.add(d9);
//		
//		ActiveDevice d10= new ActiveDevice();
//		d10.siteId= 1;
//		d10.deviceId=20;
//		d10.baseTypeId = 500;
//		d10.connectStatus = 1;
//		d10.maxAlarmLevel =1;
//		d10.siteName = "2楼机房";
//		d10.deviceName = "交换机";
//		d10.vendor = "Cisco";
//		d10.baseTypeName = "网络设备";
//		d10.remark="2013年生产";
//		
//		ds.add(d10);
//		
//		return ds;
//	}
	
	public static ArrayList<ActiveSignal> getActiveSignals()
	{
		Random random = new Random();
		Date d = new Date();
		
		ArrayList<ActiveSignal> ds = new ArrayList<ActiveSignal>();
		
		ActiveSignal s1= new ActiveSignal();
		
		s1.setAlarmSeverity(2);
		s1.siteId= 1;
		s1.siteName = "机房A";
		s1.deviceId=13;
		s1.deviceName = "APC UPS1";
		s1.baseTypeId = 120110;
		s1.baseTypeName = "A相输出电压";
		s1.signalId = 1300232;
		s1.signalName = "相ＡＢ电流";
		s1.floatValue = random.nextFloat() * 380.23f;
		s1.meanings = null;
		s1.showPrecision = "0.00";
		s1.SignalCategory = 1;
		s1.unit = "V";
		s1.updateTime =d;
		ds.add(s1);
		
		ActiveSignal s2= new ActiveSignal();
		
		s2.setAlarmSeverity(-1);
		s2.siteId= 1;
		s2.siteName = "机房A";
		s2.deviceId=13;
		s2.deviceName = "APC UPS1";
		s2.baseTypeId = 120111;
		s2.baseTypeName = "B相输出电压";
		s2.signalId = 1300233;
		s2.signalName = "相BC电流";
		s2.floatValue = random.nextFloat() * 380.23f;
		s2.meanings = null;
		s2.showPrecision = "0.00";
		s2.SignalCategory = 1;
		s2.unit = "V";
		s2.updateTime =d;
		ds.add(s2);		

		ActiveSignal s3= new ActiveSignal();
		
		s3.setAlarmSeverity(-1);
		s3.siteId= 1;
		s3.siteName = "机房A";
		s3.deviceId=14;
		s3.deviceName = "UPS副机";
		s3.baseTypeId = 120111;
		s3.baseTypeName = "B相输出电压";
		s3.signalId = 1300233;
		s3.signalName = "相BC电流";
		s3.floatValue = random.nextFloat() * 380.23f;
		s3.meanings = null;
		s3.showPrecision = "0.00";
		s3.SignalCategory = 1;
		s3.unit = "V";
		s3.updateTime =d;
		ds.add(s3);

		ActiveSignal s4= new ActiveSignal();
		
		s4.setAlarmSeverity(-1);
		s4.siteId= 1;
		s4.siteName = "机房A";
		s4.deviceId=100000003;
		s4.deviceName = "UPS副机";
		s4.baseTypeId = 120111;
		s4.baseTypeName = "B相输出电压";
		s4.signalId = 1300233;
		s4.signalName = "相BC电流";
		s4.floatValue = random.nextFloat() * 380.23f;
		s4.meanings = null;
		s4.showPrecision = "0.00";
		s4.SignalCategory = 1;
		s4.unit = "V";
		s4.updateTime =d;
		ds.add(s4);
		
		return ds;
	}
}
