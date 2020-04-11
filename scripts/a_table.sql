
-- ----------------------------
-- Table structure for `nt_name`
-- ----------------------------
DROP TABLE IF EXISTS `nt_name`;
CREATE TABLE `nt_name` (
  `startinfo` varchar(200) NOT NULL,
  `endinfo` varchar(200) DEFAULT NULL,
  PRIMARY KEY (`startinfo`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

-- ----------------------------
-- Table structure for `nt_event`
-- ----------------------------
DROP TABLE IF EXISTS `nt_event`;
CREATE TABLE `nt_event` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `SequenceId` varchar(128) DEFAULT NULL,
  `StartTime` datetime DEFAULT NULL,
  `EndTime` datetime DEFAULT NULL,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Table structure for `nt_eventnotifylog`
-- ----------------------------
DROP TABLE IF EXISTS `nt_eventnotifylog`;
CREATE TABLE `nt_eventnotifylog` (
  `LogID` int(11) NOT NULL AUTO_INCREMENT,
  `ReceiverName` varchar(255) DEFAULT NULL,
  `ReceiverAddress` varchar(255) DEFAULT NULL,
  `SendTime` datetime DEFAULT NULL,
  `SequenceID` varchar(255) DEFAULT NULL,
  `NotifyContent` varchar(512) DEFAULT NULL,
  `Result` int(11) DEFAULT NULL COMMENT '0 ʧ�ܣ�1 �ɹ���2 ��ʱ',
  PRIMARY KEY (`LogID`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Table structure for `nt_eventnotifyrule`
-- ----------------------------
DROP TABLE IF EXISTS `nt_eventnotifyrule`;
CREATE TABLE `nt_eventnotifyrule` (
  `NotifyID` int(11) NOT NULL DEFAULT '0',
  `Description` varchar(255) DEFAULT NULL,
  `NotifyMode` int(11) DEFAULT NULL COMMENT '1 ����֪ͨ',
  `Receiver` varchar(512) DEFAULT NULL,
  `NotifyEventType` varchar(255) DEFAULT NULL COMMENT '1,�澯��ʼ;2,�澯����',
  `NotifyEventLevel` varchar(255) DEFAULT NULL COMMENT '3�������澯��2����Ҫ�澯��1��һ��澯��0����ʾ��Ϣ',
  `NotifyEquipID` text DEFAULT NULL,
  PRIMARY KEY (`NotifyID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Table structure for `nt_smsport`
-- ----------------------------
DROP TABLE IF EXISTS `nt_smsport`;
CREATE TABLE `nt_smsport` (
  `PortNo` varchar(255) DEFAULT NULL,
  `BaudRate` varchar(255) DEFAULT NULL,
  `SmsType` int(11) DEFAULT NULL COMMENT '1, GSM;2,CDMA'
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Table structure for `nt_testsendsms`
-- ----------------------------
DROP TABLE IF EXISTS `nt_testsendsms`;
CREATE TABLE `nt_testsendsms` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `Mobile` varchar(255) DEFAULT NULL,
  `Content` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS TBL_Employee; 

SELECT N'TBL_Account...';


DROP TABLE IF EXISTS TBL_Account;

CREATE TABLE TBL_Account 
(
   UserId INT NOT NULL,
   UserName NATIONAL VARCHAR(128) NOT NULL,
   LogonId NATIONAL VARCHAR(20) NOT NULL,
   Password NATIONAL VARCHAR(128),
   Enable BOOLEAN   NOT NULL  DEFAULT 1,
   MaxError INT,
   Locked BOOLEAN   NOT NULL  DEFAULT 0,
   ValidTime DATETIME,
   Description NATIONAL VARCHAR(255),
   IsRemote BOOLEAN   NOT NULL  DEFAULT 0,
   CenterId INT
);



SELECT N'TBL_Account_ID...';



ALTER TABLE TBL_Account
ADD CONSTRAINT PK_TBL_Account_ID PRIMARY KEY(UserId); 



SELECT N'TBL_ActiveControl...';





DROP TABLE IF EXISTS TBL_ActiveControl;

CREATE TABLE TBL_ActiveControl 
(
   StationId INT NOT NULL,
   StationName NATIONAL VARCHAR(255) NOT NULL,
   EquipmentId INT NOT NULL,
   EquipmentName NATIONAL VARCHAR(128) NOT NULL,
   ControlId INT NOT NULL,
   ControlName NATIONAL VARCHAR(128) NOT NULL,
   SerialNo BIGINT NOT NULL  AUTO_INCREMENT PRIMARY KEY,
   ControlSeverity INT NOT NULL,
   CmdToken NATIONAL VARCHAR(500) NOT NULL,
   ControlPhase INT NOT NULL,
   StartTime DATETIME NOT NULL,
   EndTime DATETIME,
   ConfirmTime DATETIME,
   ConfirmerId INT,
   ConfirmerName NATIONAL VARCHAR(255),
   ControlResultType INT,
   ControlResult NATIONAL VARCHAR(255),
   ControlExecuterId INT,
   ControlExecuterIdName NATIONAL VARCHAR(255),
   ControlType INT,
   ActionId INT,
   Description VARCHAR(255),
   Retry INT,
   BaseTypeId NUMERIC(10,0),
   BaseTypeName NATIONAL VARCHAR(128),
   ParameterValues NATIONAL VARCHAR(500) NOT NULL,
   BaseCondId NUMERIC(10,0)
);



SELECT N'TBL_ActiveControl_ID...';


/*
ALTER TABLE TBL_ActiveControl
ADD CONSTRAINT PK_TBL_ActiveControl_ID PRIMARY KEY(StationId,EquipmentId,ControlId,SerialNo,StartTime); 
*/


SELECT N'TBL_ActiveControl.TBL_ActiveControl_IDX1...';



CREATE INDEX TBL_ActiveControl_IDX1
ON TBL_ActiveControl
(SerialNo ASC); 



SELECT N'TBL_ActiveControlOfDoor...';





DROP TABLE IF EXISTS TBL_ActiveControlOfDoor;

CREATE TABLE TBL_ActiveControlOfDoor 
(
   StationId INT NOT NULL,
   HostId INT NOT NULL,
   EquipmentId INT NOT NULL,
   ControlId INT NOT NULL,
   UserId INT NOT NULL,
   ParameterValues NATIONAL VARCHAR(500),
   Description NATIONAL VARCHAR(255),
   LastUpdate DATETIME NOT NULL
);



SELECT N'TBL_ActiveEvent...';





DROP TABLE IF EXISTS TBL_ActiveEvent;

CREATE TABLE TBL_ActiveEvent 
(
   SequenceId NATIONAL VARCHAR(128) NOT NULL,
   StationId INT NOT NULL,
   StationName NATIONAL VARCHAR(255) NOT NULL,
   EquipmentId INT NOT NULL,
   EquipmentName NATIONAL VARCHAR(128) NOT NULL,
   EventId INT NOT NULL,
   EventName NATIONAL VARCHAR(128) NOT NULL,
   EventConditionId INT NOT NULL,
   EventSeverityId INT NOT NULL,
   EventSeverity NATIONAL VARCHAR(128) NOT NULL,
   StartTime DATETIME NOT NULL,
   EndTime DATETIME,
   CancelTime DATETIME,
   CancelUserId INT,
   CancelUserName NATIONAL VARCHAR(128),
   ConfirmTime DATETIME,
   ConfirmerId INT,
   ConfirmerName NATIONAL VARCHAR(128),
   EventValue FLOAT,
   ReversalNum INT,
   Meanings NATIONAL VARCHAR(255),
   EventFilePath NATIONAL VARCHAR(255),
   Description NATIONAL VARCHAR(255),
   SourceHostId INT,
   InstructionId NATIONAL VARCHAR(255),
   InstructionStatus INT,
   StandardAlarmNameId INT,
   StandardAlarmName NATIONAL VARCHAR(128),
   BaseTypeId NUMERIC(10,0),
   BaseTypeName NATIONAL VARCHAR(128),
   EquipmentCategory INT NOT NULL,
   EquipmentCategoryName NATIONAL VARCHAR(128),
   MaintainState INT   NOT NULL  DEFAULT 0,
   SignalId INT,
   RelateSequenceId NATIONAL VARCHAR(128),
   EventCategoryId INT NOT NULL,
   EventStateId INT NOT NULL,
   CenterId INT,
   CenterName NATIONAL VARCHAR(128),
   StructureName NATIONAL VARCHAR(128),
   MonitorUnitName NATIONAL VARCHAR(128),
   StructureId INT,
   StationCategoryId INT,
   EquipmentVendor NATIONAL VARCHAR(128)
);



SELECT N'TBL_ActiveEvent_ID...';



ALTER TABLE TBL_ActiveEvent
ADD CONSTRAINT PK_TBL_ActiveEvent_ID PRIMARY KEY(SequenceId); 



SELECT N'TBL_ActiveEvent.TBL_ActiveEvent_ID1...';



CREATE UNIQUE INDEX TBL_ActiveEvent_ID1
ON TBL_ActiveEvent
(SequenceId ASC); 


SELECT N'TBL_ActiveSignal...';





DROP TABLE IF EXISTS TBL_ActiveSignal;

CREATE TABLE TBL_ActiveSignal 
(
   StationId INT NOT NULL,
   StationName NATIONAL VARCHAR(255),
   EquipmentId INT NOT NULL,
   EquipmentName NATIONAL VARCHAR(128),
   SignalId INT NOT NULL,
   SignalName NATIONAL VARCHAR(128),
   SignalCategory INT,
   DataType INT NOT NULL,
   FloatValue FLOAT,
   StringValue NATIONAL VARCHAR(128),
   DateTimeValue DATETIME,
   SampleTime DATETIME NOT NULL,
   ShowPrecision NATIONAL VARCHAR(20),
   Unit NATIONAL VARCHAR(64),
   BaseTypeId NUMERIC(10,0),
   BaseTypeName NATIONAL VARCHAR(128),
   EventSeverity INT,
   EventSeverityName NATIONAL VARCHAR(128),
   Meanings NATIONAL VARCHAR(255),
   Flag INT,
   LastUpdate DATETIME NOT NULL
);



SELECT N'TBL_ActiveSignal_ID...';



ALTER TABLE TBL_ActiveSignal
ADD CONSTRAINT PK_TBL_ActiveSignal_ID PRIMARY KEY(StationId,EquipmentId,SignalId,LastUpdate); 



SELECT N'TBL_AlarmChange...';





DROP TABLE IF EXISTS TBL_AlarmChange;

CREATE TABLE TBL_AlarmChange 
(
   SequenceId NATIONAL VARCHAR(128) NOT NULL,
   SerialNo BIGINT NOT NULL  AUTO_INCREMENT PRIMARY KEY,
   OperationType INT NOT NULL,
   StationId INT NOT NULL,
   StationName NATIONAL VARCHAR(255) NOT NULL,
   EquipmentId INT NOT NULL,
   EquipmentName NATIONAL VARCHAR(128) NOT NULL,
   EventId INT NOT NULL,
   EventName NATIONAL VARCHAR(128) NOT NULL,
   EventConditionId INT NOT NULL,
   EventSeverityId INT NOT NULL,
   EventSeverity NATIONAL VARCHAR(128),
   StartTime DATETIME NOT NULL,
   EndTime DATETIME,
   CancelTime DATETIME,
   CancelUserId INT,
   CancelUserName NATIONAL VARCHAR(128),
   ConfirmTime DATETIME,
   ConfirmerId INT,
   ConfirmerName NATIONAL VARCHAR(128),
   EventValue FLOAT,
   ReversalNum INT,
   Meanings NATIONAL VARCHAR(255),
   EventFilePath NATIONAL VARCHAR(255),
   Description NATIONAL VARCHAR(255),
   SourceHostId INT,
   InstructionId NATIONAL VARCHAR(255),
   InstructionStatus INT,
   StandardAlarmNameId INT,
   StandardAlarmName NATIONAL VARCHAR(128),
   BaseTypeId NUMERIC(10,0),
   BaseTypeName NATIONAL VARCHAR(128),
   EquipmentCategory INT NOT NULL,
   EquipmentCategoryName NATIONAL VARCHAR(128),
   MaintainState INT   NOT NULL  DEFAULT 0,
   SignalId INT,
   RelateSequenceId NATIONAL VARCHAR(128),
   EventCategoryId INT NOT NULL,
   EventStateId INT NOT NULL,
   CenterId INT,
   CenterName NATIONAL VARCHAR(128),
   StructureName NATIONAL VARCHAR(128),
   MonitorUnitName NATIONAL VARCHAR(128),
   StructureId INT,
   StationCategoryId INT,
   EquipmentVendor NATIONAL VARCHAR(128),
   InsertTime  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

SELECT N'TBL_AlarmChange.TBL_AlarmChange_ID2...';



CREATE UNIQUE INDEX TBL_AlarmChange_ID2
ON TBL_AlarmChange
(SerialNo ASC); 


SELECT N'TBL_AlarmChange.TBL_AlarmChange_ID1...';



CREATE INDEX TBL_AlarmChange_ID1
ON TBL_AlarmChange
(SequenceId ASC, 
OperationType ASC); 



SELECT N'TBL_Area...';





DROP TABLE IF EXISTS TBL_Area;

CREATE TABLE TBL_Area 
(
   AreaId INT NOT NULL,
   AreaName NATIONAL VARCHAR(128) NOT NULL,
   Description NATIONAL VARCHAR(255)
);



SELECT N'TBL_Area_ID...';



ALTER TABLE TBL_Area
ADD CONSTRAINT PK_TBL_Area_ID PRIMARY KEY(AreaId); 



SELECT N'TBL_AreaMap...';





DROP TABLE IF EXISTS TBL_AreaMap;

CREATE TABLE TBL_AreaMap 
(
   StationId INT NOT NULL,
   AreaId INT NOT NULL
);



SELECT N'TBL_AreaMap_ID...';



ALTER TABLE TBL_AreaMap
ADD CONSTRAINT PK_TBL_AreaMap_ID PRIMARY KEY(StationId,AreaId); 



SELECT N'TBL_Card...';





DROP TABLE IF EXISTS TBL_Card;

CREATE TABLE TBL_Card 
(
   CardId INT NOT NULL,
   CardCode NATIONAL VARCHAR(20) NOT NULL,
   CardName NATIONAL VARCHAR(128),
   CardCategory INT,
   CardGroup INT,
   CardType INT, -- �������ͣ���:ID��/IC����ָ�ơ�����ʶ������
   UserId INT,
   StationId INT,
   CardStatus INT,
   StartTime DATETIME,
   EndTime DATETIME,
   RegisterTime DATETIME,
   UnRegisterTime DATETIME,
   LostTime DATETIME,
   Description NATIONAL VARCHAR(255)
);



SELECT N'TBL_Card_ID...';



ALTER TABLE TBL_Card
ADD CONSTRAINT PK_TBL_Card_ID PRIMARY KEY(CardId); 








SELECT N'TBL_ConfigChangeDefine...';





DROP TABLE IF EXISTS TBL_ConfigChangeDefine;

CREATE TABLE TBL_ConfigChangeDefine 
(
   ConfigId INT NOT NULL,
   EntityName NATIONAL VARCHAR(255) NOT NULL,
   TableName NATIONAL VARCHAR(255) NOT NULL,
   IdDefine NATIONAL VARCHAR(255)
);



SELECT N'TBL_ConfigChangeMacroLog...';





DROP TABLE IF EXISTS TBL_ConfigChangeMacroLog;

CREATE TABLE TBL_ConfigChangeMacroLog 
(
   ObjectId NATIONAL VARCHAR(255) NOT NULL,
   ConfigId INT NOT NULL,
   EditType INT NOT NULL,
   UpdateTime DATETIME NOT NULL
);



SELECT N'TBL_ConfigChangeMap...';





DROP TABLE IF EXISTS TBL_ConfigChangeMap;

CREATE TABLE TBL_ConfigChangeMap 
(
   MicroConfigId INT NOT NULL,
   MicroEditType INT NOT NULL,
   MacroConfigId INT NOT NULL,
   MacroEditType INT NOT NULL,
   IdConvertRule NATIONAL VARCHAR(255)
);



SELECT N'TBL_ConfigChangeMicroLog...';





DROP TABLE IF EXISTS TBL_ConfigChangeMicroLog;

CREATE TABLE TBL_ConfigChangeMicroLog 
(
   ObjectId NATIONAL VARCHAR(255) NOT NULL,
   ConfigId INT NOT NULL,
   EditType INT NOT NULL,
   UpdateTime DATETIME NOT NULL
);



SELECT N'TBL_ConfigCheckTask...';





DROP TABLE IF EXISTS TBL_ConfigCheckTask;

CREATE TABLE TBL_ConfigCheckTask 
(
   ObjectType NATIONAL VARCHAR(64) NOT NULL,
   ObjectId NATIONAL VARCHAR(128) NOT NULL,
   Priority INT NOT NULL,
   CheckTime DATETIME NOT NULL,
   BugType INT NOT NULL,
   Description NATIONAL VARCHAR(255)
);



SELECT N'TBL_ConfigCheckTask_ID...';



ALTER TABLE TBL_ConfigCheckTask
ADD CONSTRAINT PK_TBL_ConfigCheckTask_ID PRIMARY KEY(ObjectId,BugType); 



SELECT N'TBL_Control...';



DROP TABLE IF EXISTS TBL_Control;

CREATE TABLE TBL_Control 
(
   EquipmentTemplateId INT NOT NULL,
   ControlId INT NOT NULL,
   ControlName NATIONAL VARCHAR(128) NOT NULL,
   ControlCategory INT NOT NULL,
   CmdToken NATIONAL VARCHAR(500) NOT NULL,
   BaseTypeId NUMERIC(10,0),
   ControlSeverity INT NOT NULL,
   SignalId INT,
   TimeOut FLOAT,
   Retry INT,
   Description NATIONAL VARCHAR(255),
   Enable BOOLEAN NOT NULL,
   Visible BOOLEAN NOT NULL,
   DisplayIndex INT NOT NULL,
   CommandType INT NOT NULL,
   ControlType SMALLINT,
   DataType SMALLINT,
   `MaxValue` FLOAT NOT NULL,
   MinValue FLOAT NOT NULL,
   DefaultValue FLOAT,
   ModuleNo INT   NOT NULL  DEFAULT 0
);





SELECT N'TBL_Control_ID...';



ALTER TABLE TBL_Control
ADD CONSTRAINT PK_TBL_Control_ID PRIMARY KEY(EquipmentTemplateId,ControlId); 



SELECT N'TBL_ControlLogAction...';





DROP TABLE IF EXISTS TBL_ControlLogAction;

CREATE TABLE TBL_ControlLogAction 
(
   LogActionId INT NOT NULL,
   ActionId INT NOT NULL,
   ActionName NATIONAL VARCHAR(50),
   EquipmentId INT,
   ControlId INT,
   ActionValue NATIONAL VARCHAR(255)
);



SELECT N'TBL_ControlMeanings...';





DROP TABLE IF EXISTS TBL_ControlMeanings;

CREATE TABLE TBL_ControlMeanings 
(
   EquipmentTemplateId INT NOT NULL,
   ControlId INT NOT NULL,
   ParameterValue SMALLINT NOT NULL,
   Meanings NATIONAL VARCHAR(255),
   BaseCondId NUMERIC(10,0)
);



SELECT N'TBL_ControlMeanings_ID...';



ALTER TABLE TBL_ControlMeanings
ADD CONSTRAINT PK_TBL_ControlMeanings_ID PRIMARY KEY(EquipmentTemplateId,ControlId,ParameterValue); 




SELECT N'TBL_DataEntry...';





DROP TABLE IF EXISTS TBL_DataEntry;

CREATE TABLE TBL_DataEntry 
(
   EntryId INT NOT NULL,
   EntryCategory INT,
   EntryName NATIONAL VARCHAR(128),
   EntryTitle NATIONAL VARCHAR(128),
   EntryAlias NATIONAL VARCHAR(255),
   Enable BOOLEAN   NOT NULL  DEFAULT 1,
   Description NATIONAL VARCHAR(255)
);



SELECT N'TBL_DataEntry_ID...';



ALTER TABLE TBL_DataEntry
ADD CONSTRAINT PK_TBL_DataEntry_ID PRIMARY KEY(EntryId); 



SELECT N'TBL_DataItem...';





DROP TABLE IF EXISTS TBL_DataItem;

CREATE TABLE TBL_DataItem 
(
   EntryItemId INT NOT NULL,
   ParentEntryId INT   NOT NULL  DEFAULT 0,
   ParentItemId INT   NOT NULL  DEFAULT 0,
   EntryId INT NOT NULL,
   ItemId INT NOT NULL,
   ItemValue NATIONAL VARCHAR(128) NOT NULL,
   ItemAlias NATIONAL VARCHAR(255),
   IsSystem BOOLEAN   NOT NULL  DEFAULT 1,
   IsDefault BOOLEAN   NOT NULL  DEFAULT 0,
   Enable BOOLEAN   NOT NULL  DEFAULT 1,
   Description NATIONAL VARCHAR(255),
   ExtendField1 NATIONAL VARCHAR(255),
   ExtendField2 NATIONAL VARCHAR(255),
   ExtendField3 NATIONAL VARCHAR(255),
   ExtendField4 NATIONAL VARCHAR(255),
   ExtendField5 NATIONAL VARCHAR(255)
);



SELECT N'TBL_DataItem_ID...';



ALTER TABLE TBL_DataItem
ADD CONSTRAINT PK_TBL_DataItem_ID PRIMARY KEY(EntryItemId); 



SELECT N'TBL_Department...';





DROP TABLE IF EXISTS TBL_Department;

CREATE TABLE TBL_Department 
(
   DepartmentId INT NOT NULL,
   DepartmentName NATIONAL VARCHAR(128) NOT NULL,
   DepartmentLevel NATIONAL VARCHAR(20),
   DepartmentFunction NATIONAL VARCHAR(40),
   ParentDeprtId INT,
   Description NATIONAL VARCHAR(255),
   LastUpdateDate TIMESTAMP  
);



SELECT N'TBL_Department_ID...';



ALTER TABLE TBL_Department
ADD CONSTRAINT PK_TBL_Department_ID PRIMARY KEY(DepartmentId); 



SELECT N'TBL_Door...';





DROP TABLE IF EXISTS TBL_Door;

CREATE TABLE TBL_Door 
(
   DoorId INT NOT NULL,
   DoorNo INT NOT NULL,
   DoorName NATIONAL VARCHAR(128),
   StationId INT NOT NULL,
   EquipmentId INT NOT NULL,
   SamplerUnitId INT,
   Category INT NOT NULL,
   Address NATIONAL VARCHAR(255),
   WorkMode INT,
   Infrared INT,
   Password NATIONAL VARCHAR(10),
   DoorControlId INT,
   DoorInterval INT,
   OpenDelay INT,
   Encryption INT DEFAULT 0, -- 0:����Ҫ���룬1:��Ҫ����
   Description NATIONAL VARCHAR(255)
);



SELECT N'TBL_Door_ID...';



ALTER TABLE TBL_Door
ADD CONSTRAINT PK_TBL_Door_ID PRIMARY KEY(DoorId); 



SELECT N'TBL_DoorCard...';





DROP TABLE IF EXISTS TBL_DoorCard;

CREATE TABLE TBL_DoorCard 
(
   CardId INT NOT NULL,
   TimeGroupId INT NOT NULL,
   DoorId INT NOT NULL,
   StartTime DATETIME,
   EndTime DATETIME,
   Password NATIONAL VARCHAR(30)
);



SELECT N'TBL_DoorCard_ID...';



ALTER TABLE TBL_DoorCard
ADD CONSTRAINT PK_TBL_DoorCard_ID PRIMARY KEY(CardId,TimeGroupId,DoorId); 



SELECT N'TBL_DoorCardLost...';





DROP TABLE IF EXISTS TBL_DoorCardLost;

CREATE TABLE TBL_DoorCardLost 
(
   CardId INT NOT NULL,
   TimeGroupId INT NOT NULL,
   DoorId INT NOT NULL,
   StartTime DATETIME,
   EndTime DATETIME,
   Password NATIONAL VARCHAR(30)
);



SELECT N'TBL_DoorCardLost_ID...';



ALTER TABLE TBL_DoorCardLost
ADD CONSTRAINT PK_TBL_DoorCardLost_ID PRIMARY KEY(CardId,TimeGroupId,DoorId); 



SELECT N'TBL_DoorController...';





DROP TABLE IF EXISTS TBL_DoorController;

CREATE TABLE TBL_DoorController 
(
   DoorControlId INT NOT NULL,
   DoorControlName NATIONAL VARCHAR(128) NOT NULL,
   LicenseKey NATIONAL VARCHAR(30),
   Display INT,
   CardLength INT NOT NULL,
   MaxDoorCount INT NOT NULL,
   DLLPath NATIONAL VARCHAR(128),
   Description NATIONAL VARCHAR(255)
);



SELECT N'TBL_DoorController_ID...';



ALTER TABLE TBL_DoorController
ADD CONSTRAINT PK_TBL_DoorController_ID PRIMARY KEY(DoorControlId); 



SELECT N'TBL_DoorTimeGroup...';





DROP TABLE IF EXISTS TBL_DoorTimeGroup;

CREATE TABLE TBL_DoorTimeGroup 
(
   DoorId INT NOT NULL,
   TimeGroupId INT NOT NULL,
   TimeGroupType INT NOT NULL
);



SELECT N'TBL_DoorTimeGroup_ID...';



ALTER TABLE TBL_DoorTimeGroup
ADD CONSTRAINT PK_TBL_DoorTimeGroup_ID PRIMARY KEY(DoorId,TimeGroupId); 



SELECT N'TBL_Employee...';





DROP TABLE IF EXISTS TBL_Employee;

CREATE TABLE TBL_Employee 
(
   EmployeeId INT NOT NULL,
   DepartmentId INT,
   EmployeeName NATIONAL VARCHAR(128) NOT NULL,
   EmployeeType INT,
   EmployeeTitle INT,
   JobNumber NATIONAL VARCHAR(20) NOT NULL,
   Gender INT,
   Mobile NATIONAL VARCHAR(50),
   Phone NATIONAL VARCHAR(50),
   Email NATIONAL VARCHAR(128),
   Address NATIONAL VARCHAR(255),
   PostAddress NATIONAL VARCHAR(255),
   Enable BOOLEAN   NOT NULL  DEFAULT 1,
   Description NATIONAL VARCHAR(255),
   IsAddTempUser BOOLEAN   NOT NULL  DEFAULT 0,
   UserValidTime INT     DEFAULT 172800
);



SELECT N'TBL_Employee_ID...';



ALTER TABLE TBL_Employee
ADD CONSTRAINT PK_TBL_Employee_ID PRIMARY KEY(EmployeeId); 



SELECT N'TBL_Equipment...';





DROP TABLE IF EXISTS TBL_Equipment;

CREATE TABLE TBL_Equipment 
(
   StationId INT NOT NULL,
   EquipmentId INT NOT NULL,
   EquipmentName NATIONAL VARCHAR(128) NOT NULL,
   EquipmentNo NATIONAL VARCHAR(128) NOT NULL,
   EquipmentModule NATIONAL VARCHAR(128),
   EquipmentStyle NATIONAL VARCHAR(128),
   AssetState INT,
   Price FLOAT,
   UsedLimit FLOAT,
   UsedDate DATETIME,
   BuyDate DATETIME,
   Vendor NATIONAL VARCHAR(255),
   Unit NATIONAL VARCHAR(255),
   EquipmentCategory INT NOT NULL,
   EquipmentType INT NOT NULL,
   EquipmentClass INT,
   EquipmentState INT NOT NULL,
   EventExpression NATIONAL VARCHAR(1024),
   StartDelay FLOAT,
   EndDelay FLOAT,
   Property NATIONAL VARCHAR(255),
   Description NATIONAL VARCHAR(255),
   EquipmentTemplateId INT,
   HouseId INT,
   MonitorUnitId INT NOT NULL,
   WorkStationId INT,
   SamplerUnitId INT NOT NULL,
   DisplayIndex INT NOT NULL,
   ConnectState INT NOT NULL,
   UpdateTime DATETIME NOT NULL,
   ParentEquipmentId NATIONAL VARCHAR(255),
   RatedCapacity NATIONAL VARCHAR(255),
   InstalledModule NATIONAL VARCHAR(1024)   NOT NULL  DEFAULT '0',
   ProjectName NATIONAL VARCHAR(255),
   ContractNo NATIONAL VARCHAR(255),
   InstallTime DATETIME,
   EquipmentSN NATIONAL VARCHAR(255),
   SO NATIONAL VARCHAR(255)
);



SELECT N'TBL_Equipment_ID...';



ALTER TABLE TBL_Equipment
ADD CONSTRAINT PK_TBL_Equipment_ID PRIMARY KEY(StationId,EquipmentId,SamplerUnitId); 






DROP TABLE IF EXISTS TBL_EquipmentMaintain;


CREATE TABLE TBL_EquipmentMaintain
(
   StationId INT NOT NULL,
   EquipmentId INT NOT NULL,
   EquipmentState INT,
   StartTime DATETIME,
   EndTime DATETIME,
   UserId INT,
   Description NATIONAL VARCHAR(255),
   ExtendFiled1 NATIONAL VARCHAR(255),
   CONSTRAINT PK_TBL_EquipmentMaintain_ID PRIMARY KEY(StationId,EquipmentId)
);

SELECT N'TBL_EquipmentMask...';





DROP TABLE IF EXISTS TBL_EquipmentMask;

CREATE TABLE TBL_EquipmentMask 
(
   EquipmentId INT NOT NULL,
   StationId INT NOT NULL,
   TimeGroupId INT,
   Reason NATIONAL VARCHAR(255),
   StartTime DATETIME,
   EndTime DATETIME,
   UserId INT
);



SELECT N'TBL_EquipmentMask_ID...';



ALTER TABLE TBL_EquipmentMask
ADD CONSTRAINT PK_TBL_EquipmentMask_ID PRIMARY KEY(EquipmentId,StationId); 



SELECT N'TBL_EquipmentTemplate...';





DROP TABLE IF EXISTS TBL_EquipmentTemplate;

CREATE TABLE TBL_EquipmentTemplate 
(
   EquipmentTemplateId INT NOT NULL,
   EquipmentTemplateName NATIONAL VARCHAR(128) NOT NULL,
   ParentTemplateId INT NOT NULL,
   Memo NATIONAL VARCHAR(255) NOT NULL,
   ProtocolCode NATIONAL VARCHAR(255) NOT NULL,
   EquipmentCategory INT NOT NULL,
   EquipmentType INT NOT NULL,
   Property NATIONAL VARCHAR(255),
   Description NATIONAL VARCHAR(255),
   EquipmentStyle NATIONAL VARCHAR(128),
   Unit NATIONAL VARCHAR(255),
   Vendor NATIONAL VARCHAR(255),
   EquipmentBaseType INT,
   StationCategory INT
);



SELECT N'TBL_EquipmentTemplate_ID...';



ALTER TABLE TBL_EquipmentTemplate
ADD CONSTRAINT PK_TBL_EquipmentTemplate_ID PRIMARY KEY(EquipmentTemplateId); 



SELECT N'TBL_Event...';





DROP TABLE IF EXISTS TBL_Event;

CREATE TABLE TBL_Event 
(
   EquipmentTemplateId INT NOT NULL,
   EventId INT NOT NULL,
   EventName NATIONAL VARCHAR(128) NOT NULL,
   StartType INT NOT NULL,
   EndType INT NOT NULL,
   StartExpression NATIONAL VARCHAR(1024),
   SuppressExpression NATIONAL VARCHAR(1024),
   EventCategory INT NOT NULL,
   SignalId INT,
   Enable BOOLEAN NOT NULL,
   Visible BOOLEAN NOT NULL,
   Description NATIONAL VARCHAR(255),
   DisplayIndex INT,
   ModuleNo INT   NOT NULL  DEFAULT 0
);



SELECT N'TBL_Event_ID...';



ALTER TABLE TBL_Event
ADD CONSTRAINT PK_TBL_Event_ID PRIMARY KEY(EquipmentTemplateId,EventId); 




SELECT N'TBL_EventCondition...';





DROP TABLE IF EXISTS TBL_EventCondition;

CREATE TABLE TBL_EventCondition 
(
   EventConditionId INT NOT NULL,
   EquipmentTemplateId INT NOT NULL,
   EventId INT NOT NULL,
   StartOperation NATIONAL VARCHAR(4) NOT NULL,
   StartCompareValue FLOAT NOT NULL,
   StartDelay INT NOT NULL,
   EndOperation NATIONAL VARCHAR(4),
   EndCompareValue FLOAT,
   EndDelay INT,
   Frequency INT,
   FrequencyThreshold INT,
   Meanings NATIONAL VARCHAR(255),
   EquipmentState SMALLINT,
   BaseTypeId NUMERIC(10,0),
   EventSeverity INT NOT NULL,
   StandardName INT
);



SELECT N'TBL_EventCondition_ID...';



ALTER TABLE TBL_EventCondition
ADD CONSTRAINT PK_TBL_EventCondition_ID PRIMARY KEY(EventConditionId,EquipmentTemplateId,EventId); 



SELECT N'TBL_EventLogAction...';





DROP TABLE IF EXISTS TBL_EventLogAction;

CREATE TABLE TBL_EventLogAction 
(
   LogActionId INT NOT NULL,
   ActionName NATIONAL VARCHAR(255) NOT NULL,
   StationId INT NOT NULL,
   MonitorUnitId INT NOT NULL,
   TriggerType INT NOT NULL,
   StartExpression NATIONAL VARCHAR(1024),
   SuppressExpression NATIONAL VARCHAR(1024),
   InformMsg NATIONAL VARCHAR(255),
   Description NATIONAL VARCHAR(255)
);



SELECT N'TBL_EventMask...';





DROP TABLE IF EXISTS TBL_EventMask;

CREATE TABLE TBL_EventMask 
(
   EquipmentId INT NOT NULL,
   StationId INT NOT NULL,
   EventId INT NOT NULL,
   TimeGroupId INT,
   Reason NATIONAL VARCHAR(255),
   StartTime DATETIME,
   EndTime DATETIME,
   UserId INT
);



SELECT N'TBL_EventMask_ID...';



ALTER TABLE TBL_EventMask
ADD CONSTRAINT PK_TBL_EventMask_ID PRIMARY KEY(EquipmentId,StationId,EventId); 



SELECT N'TBL_EventMaskHistory...';





DROP TABLE IF EXISTS TBL_EventMaskHistory;

CREATE TABLE TBL_EventMaskHistory 
(
   SequenceId NATIONAL VARCHAR(128) NOT NULL,
   StationId INT NOT NULL,
   EquipmentId INT NOT NULL,
   EventId INT NOT NULL,
   EventConditionId INT NOT NULL,
   EventValue FLOAT,
   Meanings NATIONAL VARCHAR(255),
   BaseTypeId NUMERIC(10,0),
   StartTime DATETIME NOT NULL,
   EndTime DATETIME
);




SELECT N'TBL_HistoryAmeterRecord...';





DROP TABLE IF EXISTS TBL_HistoryAmeterRecord;

CREATE TABLE TBL_HistoryAmeterRecord 
(
   StationId INT NOT NULL,
   EquipmentId INT NOT NULL,
   SignalId INT NOT NULL,
   RecordTime DATETIME NOT NULL,
   RecordValue FLOAT,
   ReportTime DATETIME NOT NULL,
   RevisedValue FLOAT
);



SELECT N'TBL_HistoryBattery1...';





DROP TABLE IF EXISTS TBL_HistoryBattery1;

CREATE TABLE TBL_HistoryBattery1 
(
   StationId INT NOT NULL,
   StationName NATIONAL VARCHAR(255) NOT NULL,
   EquipmentId INT NOT NULL,
   EquipmentName NATIONAL VARCHAR(128) NOT NULL,
   SignalId INT NOT NULL,
   SignalName NATIONAL VARCHAR(128) NOT NULL,
   SignalCategory INT NOT NULL,
   FloatValue FLOAT,
   SampleTime DATETIME NOT NULL,
   ShowPrecision NATIONAL VARCHAR(20),
   Unit NATIONAL VARCHAR(64),
   BaseTypeId NUMERIC(10,0),
   BaseTypeName NATIONAL VARCHAR(128),
   EventSeverity INT,
   EventSeverityName NATIONAL VARCHAR(128),
   Meanings NATIONAL VARCHAR(255),
   ThresholdType INT,
   EquipmentState INT
);



SELECT N'TBL_HistoryBattery1.TBL_HistoryBattery1_IDX1...';



CREATE UNIQUE INDEX TBL_HistoryBattery1_IDX1
ON TBL_HistoryBattery1
(SampleTime DESC, 
StationId ASC, 
EquipmentId ASC, 
SignalId ASC); 


SELECT N'TBL_HistoryBattery1.TBL_HistoryBattery1_IDX2...';



CREATE INDEX TBL_HistoryBattery1_IDX2
ON TBL_HistoryBattery1
(StationId ASC, 
EquipmentId ASC, 
SignalId ASC, 
SampleTime DESC, 
FloatValue ASC); 



SELECT N'TBL_HistoryBattery10...';





DROP TABLE IF EXISTS TBL_HistoryBattery10;

CREATE TABLE TBL_HistoryBattery10 
(
   StationId INT NOT NULL,
   StationName NATIONAL VARCHAR(255) NOT NULL,
   EquipmentId INT NOT NULL,
   EquipmentName NATIONAL VARCHAR(128) NOT NULL,
   SignalId INT NOT NULL,
   SignalName NATIONAL VARCHAR(128) NOT NULL,
   SignalCategory INT NOT NULL,
   FloatValue FLOAT,
   SampleTime DATETIME NOT NULL,
   ShowPrecision NATIONAL VARCHAR(20),
   Unit NATIONAL VARCHAR(64),
   BaseTypeId NUMERIC(10,0),
   BaseTypeName NATIONAL VARCHAR(128),
   EventSeverity INT,
   EventSeverityName NATIONAL VARCHAR(128),
   Meanings NATIONAL VARCHAR(255),
   ThresholdType INT,
   EquipmentState INT
);



SELECT N'TBL_HistoryBattery10.TBL_HistoryBattery10_IDX1...';



CREATE UNIQUE INDEX TBL_HistoryBattery10_IDX1
ON TBL_HistoryBattery10
(SampleTime DESC, 
StationId ASC, 
EquipmentId ASC, 
SignalId ASC); 


SELECT N'TBL_HistoryBattery10.TBL_HistoryBattery10_IDX2...';



CREATE INDEX TBL_HistoryBattery10_IDX2
ON TBL_HistoryBattery10
(StationId ASC, 
EquipmentId ASC, 
SignalId ASC, 
SampleTime DESC, 
FloatValue ASC); 



SELECT N'TBL_HistoryBattery11...';





DROP TABLE IF EXISTS TBL_HistoryBattery11;

CREATE TABLE TBL_HistoryBattery11 
(
   StationId INT NOT NULL,
   StationName NATIONAL VARCHAR(255) NOT NULL,
   EquipmentId INT NOT NULL,
   EquipmentName NATIONAL VARCHAR(128) NOT NULL,
   SignalId INT NOT NULL,
   SignalName NATIONAL VARCHAR(128) NOT NULL,
   SignalCategory INT NOT NULL,
   FloatValue FLOAT,
   SampleTime DATETIME NOT NULL,
   ShowPrecision NATIONAL VARCHAR(20),
   Unit NATIONAL VARCHAR(64),
   BaseTypeId NUMERIC(10,0),
   BaseTypeName NATIONAL VARCHAR(128),
   EventSeverity INT,
   EventSeverityName NATIONAL VARCHAR(128),
   Meanings NATIONAL VARCHAR(255),
   ThresholdType INT,
   EquipmentState INT
);



SELECT N'TBL_HistoryBattery11.TBL_HistoryBattery11_IDX1...';



CREATE UNIQUE INDEX TBL_HistoryBattery11_IDX1
ON TBL_HistoryBattery11
(SampleTime DESC, 
StationId ASC, 
EquipmentId ASC, 
SignalId ASC); 


SELECT N'TBL_HistoryBattery11.TBL_HistoryBattery11_IDX2...';



CREATE INDEX TBL_HistoryBattery11_IDX2
ON TBL_HistoryBattery11
(StationId ASC, 
EquipmentId ASC, 
SignalId ASC, 
SampleTime DESC, 
FloatValue ASC); 



SELECT N'TBL_HistoryBattery12...';





DROP TABLE IF EXISTS TBL_HistoryBattery12;

CREATE TABLE TBL_HistoryBattery12 
(
   StationId INT NOT NULL,
   StationName NATIONAL VARCHAR(255) NOT NULL,
   EquipmentId INT NOT NULL,
   EquipmentName NATIONAL VARCHAR(128) NOT NULL,
   SignalId INT NOT NULL,
   SignalName NATIONAL VARCHAR(128) NOT NULL,
   SignalCategory INT NOT NULL,
   FloatValue FLOAT,
   SampleTime DATETIME NOT NULL,
   ShowPrecision NATIONAL VARCHAR(20),
   Unit NATIONAL VARCHAR(64),
   BaseTypeId NUMERIC(10,0),
   BaseTypeName NATIONAL VARCHAR(128),
   EventSeverity INT,
   EventSeverityName NATIONAL VARCHAR(128),
   Meanings NATIONAL VARCHAR(255),
   ThresholdType INT,
   EquipmentState INT
);



SELECT N'TBL_HistoryBattery12.TBL_HistoryBattery12_IDX1...';



CREATE UNIQUE INDEX TBL_HistoryBattery12_IDX1
ON TBL_HistoryBattery12
(SampleTime DESC, 
StationId ASC, 
EquipmentId ASC, 
SignalId ASC); 


SELECT N'TBL_HistoryBattery12.TBL_HistoryBattery12_IDX2...';



CREATE INDEX TBL_HistoryBattery12_IDX2
ON TBL_HistoryBattery12
(StationId ASC, 
EquipmentId ASC, 
SignalId ASC, 
SampleTime DESC, 
FloatValue ASC); 



SELECT N'TBL_HistoryBattery2...';





DROP TABLE IF EXISTS TBL_HistoryBattery2;

CREATE TABLE TBL_HistoryBattery2 
(
   StationId INT NOT NULL,
   StationName NATIONAL VARCHAR(255) NOT NULL,
   EquipmentId INT NOT NULL,
   EquipmentName NATIONAL VARCHAR(128) NOT NULL,
   SignalId INT NOT NULL,
   SignalName NATIONAL VARCHAR(128) NOT NULL,
   SignalCategory INT NOT NULL,
   FloatValue FLOAT,
   SampleTime DATETIME NOT NULL,
   ShowPrecision NATIONAL VARCHAR(20),
   Unit NATIONAL VARCHAR(64),
   BaseTypeId NUMERIC(10,0),
   BaseTypeName NATIONAL VARCHAR(128),
   EventSeverity INT,
   EventSeverityName NATIONAL VARCHAR(128),
   Meanings NATIONAL VARCHAR(255),
   ThresholdType INT,
   EquipmentState INT
);



SELECT N'TBL_HistoryBattery2.TBL_HistoryBattery2_IDX1...';



CREATE UNIQUE INDEX TBL_HistoryBattery2_IDX1
ON TBL_HistoryBattery2
(SampleTime DESC, 
StationId ASC, 
EquipmentId ASC, 
SignalId ASC); 


SELECT N'TBL_HistoryBattery2.TBL_HistoryBattery2_IDX2...';



CREATE INDEX TBL_HistoryBattery2_IDX2
ON TBL_HistoryBattery2
(StationId ASC, 
EquipmentId ASC, 
SignalId ASC, 
SampleTime DESC, 
FloatValue ASC); 



SELECT N'TBL_HistoryBattery3...';





DROP TABLE IF EXISTS TBL_HistoryBattery3;

CREATE TABLE TBL_HistoryBattery3 
(
   StationId INT NOT NULL,
   StationName NATIONAL VARCHAR(255) NOT NULL,
   EquipmentId INT NOT NULL,
   EquipmentName NATIONAL VARCHAR(128) NOT NULL,
   SignalId INT NOT NULL,
   SignalName NATIONAL VARCHAR(128) NOT NULL,
   SignalCategory INT NOT NULL,
   FloatValue FLOAT,
   SampleTime DATETIME NOT NULL,
   ShowPrecision NATIONAL VARCHAR(20),
   Unit NATIONAL VARCHAR(64),
   BaseTypeId NUMERIC(10,0),
   BaseTypeName NATIONAL VARCHAR(128),
   EventSeverity INT,
   EventSeverityName NATIONAL VARCHAR(128),
   Meanings NATIONAL VARCHAR(255),
   ThresholdType INT,
   EquipmentState INT
);



SELECT N'TBL_HistoryBattery3.TBL_HistoryBattery3_IDX1...';



CREATE UNIQUE INDEX TBL_HistoryBattery3_IDX1
ON TBL_HistoryBattery3
(SampleTime DESC, 
StationId ASC, 
EquipmentId ASC, 
SignalId ASC); 


SELECT N'TBL_HistoryBattery3.TBL_HistoryBattery3_IDX2...';



CREATE INDEX TBL_HistoryBattery3_IDX2
ON TBL_HistoryBattery3
(StationId ASC, 
EquipmentId ASC, 
SignalId ASC, 
SampleTime DESC, 
FloatValue ASC); 



SELECT N'TBL_HistoryBattery4...';





DROP TABLE IF EXISTS TBL_HistoryBattery4;

CREATE TABLE TBL_HistoryBattery4 
(
   StationId INT NOT NULL,
   StationName NATIONAL VARCHAR(255) NOT NULL,
   EquipmentId INT NOT NULL,
   EquipmentName NATIONAL VARCHAR(128) NOT NULL,
   SignalId INT NOT NULL,
   SignalName NATIONAL VARCHAR(128) NOT NULL,
   SignalCategory INT NOT NULL,
   FloatValue FLOAT,
   SampleTime DATETIME NOT NULL,
   ShowPrecision NATIONAL VARCHAR(20),
   Unit NATIONAL VARCHAR(64),
   BaseTypeId NUMERIC(10,0),
   BaseTypeName NATIONAL VARCHAR(128),
   EventSeverity INT,
   EventSeverityName NATIONAL VARCHAR(128),
   Meanings NATIONAL VARCHAR(255),
   ThresholdType INT,
   EquipmentState INT
);



SELECT N'TBL_HistoryBattery4.TBL_HistoryBattery4_IDX1...';



CREATE UNIQUE INDEX TBL_HistoryBattery4_IDX1
ON TBL_HistoryBattery4
(SampleTime DESC, 
StationId ASC, 
EquipmentId ASC, 
SignalId ASC); 


SELECT N'TBL_HistoryBattery4.TBL_HistoryBattery4_IDX2...';



CREATE INDEX TBL_HistoryBattery4_IDX2
ON TBL_HistoryBattery4
(StationId ASC, 
EquipmentId ASC, 
SignalId ASC, 
SampleTime DESC, 
FloatValue ASC); 



SELECT N'TBL_HistoryBattery5...';





DROP TABLE IF EXISTS TBL_HistoryBattery5;

CREATE TABLE TBL_HistoryBattery5 
(
   StationId INT NOT NULL,
   StationName NATIONAL VARCHAR(255) NOT NULL,
   EquipmentId INT NOT NULL,
   EquipmentName NATIONAL VARCHAR(128) NOT NULL,
   SignalId INT NOT NULL,
   SignalName NATIONAL VARCHAR(128) NOT NULL,
   SignalCategory INT NOT NULL,
   FloatValue FLOAT,
   SampleTime DATETIME NOT NULL,
   ShowPrecision NATIONAL VARCHAR(20),
   Unit NATIONAL VARCHAR(64),
   BaseTypeId NUMERIC(10,0),
   BaseTypeName NATIONAL VARCHAR(128),
   EventSeverity INT,
   EventSeverityName NATIONAL VARCHAR(128),
   Meanings NATIONAL VARCHAR(255),
   ThresholdType INT,
   EquipmentState INT
);



SELECT N'TBL_HistoryBattery5.TBL_HistoryBattery5_IDX1...';



CREATE UNIQUE INDEX TBL_HistoryBattery5_IDX1
ON TBL_HistoryBattery5
(SampleTime DESC, 
StationId ASC, 
EquipmentId ASC, 
SignalId ASC); 


SELECT N'TBL_HistoryBattery5.TBL_HistoryBattery5_IDX2...';



CREATE INDEX TBL_HistoryBattery5_IDX2
ON TBL_HistoryBattery5
(StationId ASC, 
EquipmentId ASC, 
SignalId ASC, 
SampleTime DESC, 
FloatValue ASC); 



SELECT N'TBL_HistoryBattery6...';





DROP TABLE IF EXISTS TBL_HistoryBattery6;

CREATE TABLE TBL_HistoryBattery6 
(
   StationId INT NOT NULL,
   StationName NATIONAL VARCHAR(255) NOT NULL,
   EquipmentId INT NOT NULL,
   EquipmentName NATIONAL VARCHAR(128) NOT NULL,
   SignalId INT NOT NULL,
   SignalName NATIONAL VARCHAR(128) NOT NULL,
   SignalCategory INT NOT NULL,
   FloatValue FLOAT,
   SampleTime DATETIME NOT NULL,
   ShowPrecision NATIONAL VARCHAR(20),
   Unit NATIONAL VARCHAR(64),
   BaseTypeId NUMERIC(10,0),
   BaseTypeName NATIONAL VARCHAR(128),
   EventSeverity INT,
   EventSeverityName NATIONAL VARCHAR(128),
   Meanings NATIONAL VARCHAR(255),
   ThresholdType INT,
   EquipmentState INT
);



SELECT N'TBL_HistoryBattery6.TBL_HistoryBattery6_IDX1...';



CREATE UNIQUE INDEX TBL_HistoryBattery6_IDX1
ON TBL_HistoryBattery6
(SampleTime DESC, 
StationId ASC, 
EquipmentId ASC, 
SignalId ASC); 


SELECT N'TBL_HistoryBattery6.TBL_HistoryBattery6_IDX2...';



CREATE INDEX TBL_HistoryBattery6_IDX2
ON TBL_HistoryBattery6
(StationId ASC, 
EquipmentId ASC, 
SignalId ASC, 
SampleTime DESC, 
FloatValue ASC); 



SELECT N'TBL_HistoryBattery7...';





DROP TABLE IF EXISTS TBL_HistoryBattery7;

CREATE TABLE TBL_HistoryBattery7 
(
   StationId INT NOT NULL,
   StationName NATIONAL VARCHAR(255) NOT NULL,
   EquipmentId INT NOT NULL,
   EquipmentName NATIONAL VARCHAR(128) NOT NULL,
   SignalId INT NOT NULL,
   SignalName NATIONAL VARCHAR(128) NOT NULL,
   SignalCategory INT NOT NULL,
   FloatValue FLOAT,
   SampleTime DATETIME NOT NULL,
   ShowPrecision NATIONAL VARCHAR(20),
   Unit NATIONAL VARCHAR(64),
   BaseTypeId NUMERIC(10,0),
   BaseTypeName NATIONAL VARCHAR(128),
   EventSeverity INT,
   EventSeverityName NATIONAL VARCHAR(128),
   Meanings NATIONAL VARCHAR(255),
   ThresholdType INT,
   EquipmentState INT
);



SELECT N'TBL_HistoryBattery7.TBL_HistoryBattery7_IDX1...';



CREATE UNIQUE INDEX TBL_HistoryBattery7_IDX1
ON TBL_HistoryBattery7
(SampleTime DESC, 
StationId ASC, 
EquipmentId ASC, 
SignalId ASC); 


SELECT N'TBL_HistoryBattery7.TBL_HistoryBattery7_IDX2...';



CREATE INDEX TBL_HistoryBattery7_IDX2
ON TBL_HistoryBattery7
(StationId ASC, 
EquipmentId ASC, 
SignalId ASC, 
SampleTime DESC, 
FloatValue ASC); 



SELECT N'TBL_HistoryBattery8...';





DROP TABLE IF EXISTS TBL_HistoryBattery8;

CREATE TABLE TBL_HistoryBattery8 
(
   StationId INT NOT NULL,
   StationName NATIONAL VARCHAR(255) NOT NULL,
   EquipmentId INT NOT NULL,
   EquipmentName NATIONAL VARCHAR(128) NOT NULL,
   SignalId INT NOT NULL,
   SignalName NATIONAL VARCHAR(128) NOT NULL,
   SignalCategory INT NOT NULL,
   FloatValue FLOAT,
   SampleTime DATETIME NOT NULL,
   ShowPrecision NATIONAL VARCHAR(20),
   Unit NATIONAL VARCHAR(64),
   BaseTypeId NUMERIC(10,0),
   BaseTypeName NATIONAL VARCHAR(128),
   EventSeverity INT,
   EventSeverityName NATIONAL VARCHAR(128),
   Meanings NATIONAL VARCHAR(255),
   ThresholdType INT,
   EquipmentState INT
);



SELECT N'TBL_HistoryBattery8.TBL_HistoryBattery8_IDX1...';



CREATE UNIQUE INDEX TBL_HistoryBattery8_IDX1
ON TBL_HistoryBattery8
(SampleTime DESC, 
StationId ASC, 
EquipmentId ASC, 
SignalId ASC); 


SELECT N'TBL_HistoryBattery8.TBL_HistoryBattery8_IDX2...';



CREATE INDEX TBL_HistoryBattery8_IDX2
ON TBL_HistoryBattery8
(StationId ASC, 
EquipmentId ASC, 
SignalId ASC, 
SampleTime DESC, 
FloatValue ASC); 



SELECT N'TBL_HistoryBattery9...';





DROP TABLE IF EXISTS TBL_HistoryBattery9;

CREATE TABLE TBL_HistoryBattery9 
(
   StationId INT NOT NULL,
   StationName NATIONAL VARCHAR(255) NOT NULL,
   EquipmentId INT NOT NULL,
   EquipmentName NATIONAL VARCHAR(128) NOT NULL,
   SignalId INT NOT NULL,
   SignalName NATIONAL VARCHAR(128) NOT NULL,
   SignalCategory INT NOT NULL,
   FloatValue FLOAT,
   SampleTime DATETIME NOT NULL,
   ShowPrecision NATIONAL VARCHAR(20),
   Unit NATIONAL VARCHAR(64),
   BaseTypeId NUMERIC(10,0),
   BaseTypeName NATIONAL VARCHAR(128),
   EventSeverity INT,
   EventSeverityName NATIONAL VARCHAR(128),
   Meanings NATIONAL VARCHAR(255),
   ThresholdType INT,
   EquipmentState INT
);



SELECT N'TBL_HistoryBattery9.TBL_HistoryBattery9_IDX1...';



CREATE UNIQUE INDEX TBL_HistoryBattery9_IDX1
ON TBL_HistoryBattery9
(SampleTime DESC, 
StationId ASC, 
EquipmentId ASC, 
SignalId ASC); 


SELECT N'TBL_HistoryBattery9.TBL_HistoryBattery9_IDX2...';



CREATE INDEX TBL_HistoryBattery9_IDX2
ON TBL_HistoryBattery9
(StationId ASC, 
EquipmentId ASC, 
SignalId ASC, 
SampleTime DESC, 
FloatValue ASC); 



SELECT N'TBL_HistoryBatteryMid...';





DROP TABLE IF EXISTS TBL_HistoryBatteryMid;

CREATE TABLE TBL_HistoryBatteryMid 
(
   StationId INT NOT NULL,
   StationName NATIONAL VARCHAR(255) NOT NULL,
   EquipmentId INT NOT NULL,
   EquipmentName NATIONAL VARCHAR(128) NOT NULL,
   SignalId INT NOT NULL,
   SignalName NATIONAL VARCHAR(128) NOT NULL,
   SignalCategory INT NOT NULL,
   FloatValue FLOAT,
   SampleTime DATETIME NOT NULL,
   ShowPrecision NATIONAL VARCHAR(20),
   Unit NATIONAL VARCHAR(64),
   BaseTypeId NUMERIC(10,0),
   BaseTypeName NATIONAL VARCHAR(128),
   EventSeverity INT,
   EventSeverityName NATIONAL VARCHAR(128),
   Meanings NATIONAL VARCHAR(255),
   ThresholdType INT,
   EquipmentState INT
);



SELECT N'TBL_HistoryControl...';





DROP TABLE IF EXISTS TBL_HistoryControl;

CREATE TABLE TBL_HistoryControl 
(
   StationId INT NOT NULL,
   StationName NATIONAL VARCHAR(255) NOT NULL,
   EquipmentId INT NOT NULL,
   EquipmentName NATIONAL VARCHAR(128) NOT NULL,
   ControlId INT NOT NULL,
   ControlName NATIONAL VARCHAR(128) NOT NULL,
   SerialNo INT NOT NULL,
   ControlSeverity INT NOT NULL,
   CmdToken NATIONAL VARCHAR(500) NOT NULL,
   ControlPhase INT NOT NULL,
   StartTime DATETIME NOT NULL,
   EndTime DATETIME,
   ConfirmTime DATETIME,
   ConfirmerId INT,
   ConfirmerName NATIONAL VARCHAR(255),
   ControlResultType INT,
   ControlResult NATIONAL VARCHAR(255),
   ControlExecuterId INT,
   ControlExecuterIdName NATIONAL VARCHAR(255),
   ControlType INT,
   ActionId INT,
   Description NATIONAL VARCHAR(255),
   Retry INT,
   BaseTypeId NUMERIC(10,0),
   BaseTypeName NATIONAL VARCHAR(128),
   ParameterValues NATIONAL VARCHAR(500) NOT NULL,
   BaseCondId NUMERIC(10,0)
);



SELECT N'TBL_HistoryControl.TBL_HistoryControl_IDX1...';



CREATE UNIQUE INDEX TBL_HistoryControl_IDX1
ON TBL_HistoryControl
(StartTime DESC, 
StationId ASC, 
EquipmentId ASC, 
ControlId ASC, 
SerialNo ASC); 


SELECT N'TBL_HistoryControlMid...';





DROP TABLE IF EXISTS TBL_HistoryControlMid;

CREATE TABLE TBL_HistoryControlMid 
(
   StationId INT NOT NULL,
   StationName NATIONAL VARCHAR(255) NOT NULL,
   EquipmentId INT NOT NULL,
   EquipmentName NATIONAL VARCHAR(128) NOT NULL,
   ControlId INT NOT NULL,
   ControlName NATIONAL VARCHAR(128) NOT NULL,
   SerialNo INT NOT NULL,
   ControlSeverity INT NOT NULL,
   CmdToken NATIONAL VARCHAR(500) NOT NULL,
   ControlPhase INT NOT NULL,
   StartTime DATETIME NOT NULL,
   EndTime DATETIME,
   ConfirmTime DATETIME,
   ConfirmerId INT,
   ConfirmerName NATIONAL VARCHAR(255),
   ControlResultType INT,
   ControlResult NATIONAL VARCHAR(255),
   ControlExecuterId INT,
   ControlExecuterIdName NATIONAL VARCHAR(255),
   ControlType INT,
   ActionId INT,
   Description NATIONAL VARCHAR(255),
   Retry INT,
   BaseTypeId NUMERIC(10,0),
   BaseTypeName NATIONAL VARCHAR(128),
   ParameterValues NATIONAL VARCHAR(500) NOT NULL,
   BaseCondId NUMERIC(10,0)
);



SELECT N'TBL_HistoryEvent...';





DROP TABLE IF EXISTS TBL_HistoryEvent;

CREATE TABLE TBL_HistoryEvent 
(
   SequenceId NATIONAL VARCHAR(128) NOT NULL,
   StationId INT NOT NULL,
   StationName NATIONAL VARCHAR(255) NOT NULL,
   EquipmentId INT NOT NULL,
   EquipmentName NATIONAL VARCHAR(128) NOT NULL,
   EventId INT NOT NULL,
   EventName NATIONAL VARCHAR(128) NOT NULL,
   EventConditionId INT NOT NULL,
   EventSeverityId INT NOT NULL,
   EventSeverity NATIONAL VARCHAR(128) NOT NULL,
   StartTime DATETIME NOT NULL,
   EndTime DATETIME NOT NULL,
   CancelTime DATETIME,
   CancelUserId INT,
   CancelUserName NATIONAL VARCHAR(128),
   ConfirmTime DATETIME,
   ConfirmerId INT,
   ConfirmerName NATIONAL VARCHAR(128),
   EventValue FLOAT,
   ReversalNum INT,
   Meanings NATIONAL VARCHAR(255),
   EventFilePath NATIONAL VARCHAR(255),
   Description NATIONAL VARCHAR(255),
   SourceHostId INT,
   InstructionId NATIONAL VARCHAR(255),
   InstructionStatus INT,
   StandardAlarmNameId INT,
   StandardAlarmName NATIONAL VARCHAR(128),
   BaseTypeId NUMERIC(10,0),
   BaseTypeName NATIONAL VARCHAR(128),
   EquipmentCategory INT,
   EquipmentCategoryName NATIONAL VARCHAR(128),
   MaintainState INT   NOT NULL  DEFAULT 0,
   SignalId INT,
   RelateSequenceId NATIONAL VARCHAR(128),
   EventCategoryId INT,
   EventStateId INT,
   CenterId INT,
   CenterName NATIONAL VARCHAR(128),
   StructureName NATIONAL VARCHAR(128),
   MonitorUnitName NATIONAL VARCHAR(128),
   StructureId INT,
   StationCategoryId INT,
   EquipmentVendor NATIONAL VARCHAR(128)
);



SELECT N'TBL_HistoryEvent.TBL_HistoryEvent_IDX1...';



CREATE UNIQUE INDEX TBL_HistoryEvent_IDX1
ON TBL_HistoryEvent
(StartTime DESC, 
StationId ASC, 
EquipmentId ASC, 
EventId ASC, 
EventConditionId ASC); 



SELECT N'TBL_HistoryEvent.TBL_HistoryEvent_IDX2...';

CREATE INDEX TBL_HistoryEvent_IDX2
ON TBL_HistoryEvent
(StructureId ASC, 
StationCategoryId ASC, 
EquipmentCategory ASC, 
StationId ASC, 
EventStateId ASC, 
EventCategoryId ASC, 
EventConditionId ASC, 
StartTime ASC); 


SELECT N'TBL_HistoryEvent.TBL_HistoryEvent_IDX3...';

CREATE INDEX TBL_HistoryEvent_IDX3
ON TBL_HistoryEvent
(StartTime DESC, 
BaseTypeId ASC, 
StationId ASC, 
EquipmentId ASC, 
EventSeverityId ASC,
SignalId ASC); 



SELECT N'TBL_HistoryEventMask...';





DROP TABLE IF EXISTS TBL_HistoryEventMask;

CREATE TABLE TBL_HistoryEventMask 
(
   SequenceId NATIONAL VARCHAR(128) NOT NULL,
   StationId INT NOT NULL,
   EquipmentId INT NOT NULL,
   EventId INT NOT NULL,
   EventConditionId INT NOT NULL,
   EventValue FLOAT,
   Meanings NATIONAL VARCHAR(255),
   BaseTypeId NUMERIC(10,0),
   StartTime DATETIME NOT NULL,
   EndTime DATETIME NOT NULL
);



SELECT N'TBL_HistoryEventMid...';





DROP TABLE IF EXISTS TBL_HistoryEventMid;

CREATE TABLE TBL_HistoryEventMid 
(
   SequenceId NATIONAL VARCHAR(128) NOT NULL,
   StationId INT NOT NULL,
   StationName NATIONAL VARCHAR(255) NOT NULL,
   EquipmentId INT NOT NULL,
   EquipmentName NATIONAL VARCHAR(128) NOT NULL,
   EventId INT NOT NULL,
   EventName NATIONAL VARCHAR(128) NOT NULL,
   EventConditionId INT NOT NULL,
   EventSeverityId INT NOT NULL,
   EventSeverity NATIONAL VARCHAR(128) NOT NULL,
   StartTime DATETIME NOT NULL,
   EndTime DATETIME NOT NULL,
   CancelTime DATETIME,
   CancelUserId INT,
   CancelUserName NATIONAL VARCHAR(128),
   ConfirmTime DATETIME,
   ConfirmerId INT,
   ConfirmerName NATIONAL VARCHAR(128),
   EventValue FLOAT,
   ReversalNum INT,
   Meanings NATIONAL VARCHAR(255),
   EventFilePath NATIONAL VARCHAR(255),
   Description NATIONAL VARCHAR(255),
   SourceHostId INT,
   InstructionId NATIONAL VARCHAR(255),
   InstructionStatus INT,
   StandardAlarmNameId INT,
   StandardAlarmName NATIONAL VARCHAR(128),
   BaseTypeId NUMERIC(10,0),
   BaseTypeName NATIONAL VARCHAR(128),
   EquipmentCategory INT,
   EquipmentCategoryName NATIONAL VARCHAR(128),
   MaintainState INT   NOT NULL  DEFAULT 0,
   SignalId INT,
   RelateSequenceId NATIONAL VARCHAR(128),
   EventCategoryId INT,
   EventStateId INT,
   CenterId INT,
   CenterName NATIONAL VARCHAR(128),
   StructureName NATIONAL VARCHAR(128),
   MonitorUnitName NATIONAL VARCHAR(128),
   StructureId INT,
   StationCategoryId INT,
   EquipmentVendor NATIONAL VARCHAR(128)
);



SELECT N'TBL_HistoryPassword...';





DROP TABLE IF EXISTS TBL_HistoryPassword;

CREATE TABLE TBL_HistoryPassword 
(
   UserId INT NOT NULL,
   Password NATIONAL VARCHAR(128),
   RecordTime DATETIME NOT NULL
);



SELECT N'TBL_HistoryPassword_ID...';



ALTER TABLE TBL_HistoryPassword
ADD CONSTRAINT PK_TBL_HistoryPassword_ID PRIMARY KEY(UserId,RecordTime); 



SELECT N'TBL_HistorySelection...';





DROP TABLE IF EXISTS TBL_HistorySelection;

CREATE TABLE TBL_HistorySelection 
(
   HistorySelectionId BIGINT NOT NULL  AUTO_INCREMENT PRIMARY KEY,
   UserId INT NOT NULL,
   SelectionType VARCHAR(128) NOT NULL,
   SelectionName VARCHAR(255) NOT NULL,
   SelectionContent LONGTEXT NOT NULL,
   Description VARCHAR(255),
   CreateTime DATETIME,
   QueryInformation LONGTEXT
);



SELECT N'TBL_HistorySignal1...';





DROP TABLE IF EXISTS TBL_HistorySignal1;

CREATE TABLE TBL_HistorySignal1 
(
   StationId INT NOT NULL,
   StationName NATIONAL VARCHAR(255) ,
   EquipmentId INT NOT NULL,
   EquipmentName NATIONAL VARCHAR(128),
   SignalId INT NOT NULL,
   SignalName NATIONAL VARCHAR(128),
   SignalCategory INT,
   DataType INT NOT NULL,
   FloatValue FLOAT,
   StringValue NATIONAL VARCHAR(128),
   DateTimeValue DATETIME,
   SampleTime DATETIME NOT NULL,
   ShowPrecision NATIONAL VARCHAR(20),
   Unit NATIONAL VARCHAR(64),
   BaseTypeId NUMERIC(10,0),
   BaseTypeName NATIONAL VARCHAR(128),
   EventSeverity INT,
   EventSeverityName NATIONAL VARCHAR(128),
   Meanings NATIONAL VARCHAR(255),
   ThresholdType INT,
   BaseCondId NUMERIC(10,0),
   BaseMeaning NATIONAL VARCHAR(255)
);



SELECT N'TBL_HistorySignal1.TBL_HistorySignal1_IDX1...';



CREATE UNIQUE INDEX TBL_HistorySignal1_IDX1
ON TBL_HistorySignal1
(SampleTime DESC, 
StationId ASC, 
EquipmentId ASC, 
SignalId ASC); 


SELECT N'TBL_HistorySignal1.TBL_HistorySignal1_IDX2...';



CREATE INDEX TBL_HistorySignal1_IDX2
ON TBL_HistorySignal1
(StationId ASC, 
EquipmentId ASC, 
SignalId ASC, 
SampleTime DESC, 
FloatValue ASC); 



SELECT N'TBL_HistorySignal10...';




DROP TABLE IF EXISTS TBL_HistorySignal10;

CREATE TABLE TBL_HistorySignal10 
(
   StationId INT NOT NULL,
   StationName NATIONAL VARCHAR(255) ,
   EquipmentId INT NOT NULL,
   EquipmentName NATIONAL VARCHAR(128),
   SignalId INT NOT NULL,
   SignalName NATIONAL VARCHAR(128),
   SignalCategory INT,
   DataType INT NOT NULL,
   FloatValue FLOAT,
   StringValue NATIONAL VARCHAR(128),
   DateTimeValue DATETIME,
   SampleTime DATETIME NOT NULL,
   ShowPrecision NATIONAL VARCHAR(20),
   Unit NATIONAL VARCHAR(64),
   BaseTypeId NUMERIC(10,0),
   BaseTypeName NATIONAL VARCHAR(128),
   EventSeverity INT,
   EventSeverityName NATIONAL VARCHAR(128),
   Meanings NATIONAL VARCHAR(255),
   ThresholdType INT,
   BaseCondId NUMERIC(10,0),
   BaseMeaning NATIONAL VARCHAR(255)
);



SELECT N'TBL_HistorySignal10.TBL_HistorySignal10_IDX1...';



CREATE UNIQUE INDEX TBL_HistorySignal10_IDX1
ON TBL_HistorySignal10
(SampleTime DESC, 
StationId ASC, 
EquipmentId ASC, 
SignalId ASC); 


SELECT N'TBL_HistorySignal10.TBL_HistorySignal10_IDX2...';



CREATE INDEX TBL_HistorySignal10_IDX2
ON TBL_HistorySignal10
(StationId ASC, 
EquipmentId ASC, 
SignalId ASC, 
SampleTime DESC, 
FloatValue ASC); 



SELECT N'TBL_HistorySignal11...';





DROP TABLE IF EXISTS TBL_HistorySignal11;

CREATE TABLE TBL_HistorySignal11 
(
   StationId INT NOT NULL,
   StationName NATIONAL VARCHAR(255) ,
   EquipmentId INT NOT NULL,
   EquipmentName NATIONAL VARCHAR(128),
   SignalId INT NOT NULL,
   SignalName NATIONAL VARCHAR(128),
   SignalCategory INT,
   DataType INT NOT NULL,
   FloatValue FLOAT,
   StringValue NATIONAL VARCHAR(128),
   DateTimeValue DATETIME,
   SampleTime DATETIME NOT NULL,
   ShowPrecision NATIONAL VARCHAR(20),
   Unit NATIONAL VARCHAR(64),
   BaseTypeId NUMERIC(10,0),
   BaseTypeName NATIONAL VARCHAR(128),
   EventSeverity INT,
   EventSeverityName NATIONAL VARCHAR(128),
   Meanings NATIONAL VARCHAR(255),
   ThresholdType INT,
   BaseCondId NUMERIC(10,0),
   BaseMeaning NATIONAL VARCHAR(255)
);



SELECT N'TBL_HistorySignal11.TBL_HistorySignal11_IDX1...';



CREATE UNIQUE INDEX TBL_HistorySignal11_IDX1
ON TBL_HistorySignal11
(SampleTime DESC, 
StationId ASC, 
EquipmentId ASC, 
SignalId ASC); 


SELECT N'TBL_HistorySignal11.TBL_HistorySignal11_IDX2...';



CREATE INDEX TBL_HistorySignal11_IDX2
ON TBL_HistorySignal11
(StationId ASC, 
EquipmentId ASC, 
SignalId ASC, 
SampleTime DESC, 
FloatValue ASC); 



SELECT N'TBL_HistorySignal12...';





DROP TABLE IF EXISTS TBL_HistorySignal12;

CREATE TABLE TBL_HistorySignal12 
(
   StationId INT NOT NULL,
   StationName NATIONAL VARCHAR(255) ,
   EquipmentId INT NOT NULL,
   EquipmentName NATIONAL VARCHAR(128),
   SignalId INT NOT NULL,
   SignalName NATIONAL VARCHAR(128),
   SignalCategory INT,
   DataType INT NOT NULL,
   FloatValue FLOAT,
   StringValue NATIONAL VARCHAR(128),
   DateTimeValue DATETIME,
   SampleTime DATETIME NOT NULL,
   ShowPrecision NATIONAL VARCHAR(20),
   Unit NATIONAL VARCHAR(64),
   BaseTypeId NUMERIC(10,0),
   BaseTypeName NATIONAL VARCHAR(128),
   EventSeverity INT,
   EventSeverityName NATIONAL VARCHAR(128),
   Meanings NATIONAL VARCHAR(255),
   ThresholdType INT,
   BaseCondId NUMERIC(10,0),
   BaseMeaning NATIONAL VARCHAR(255)
);



SELECT N'TBL_HistorySignal12.TBL_HistorySignal12_IDX1...';



CREATE UNIQUE INDEX TBL_HistorySignal12_IDX1
ON TBL_HistorySignal12
(SampleTime DESC, 
StationId ASC, 
EquipmentId ASC, 
SignalId ASC); 


SELECT N'TBL_HistorySignal12.TBL_HistorySignal12_IDX2...';



CREATE INDEX TBL_HistorySignal12_IDX2
ON TBL_HistorySignal12
(StationId ASC, 
EquipmentId ASC, 
SignalId ASC, 
SampleTime DESC, 
FloatValue ASC); 



SELECT N'TBL_HistorySignal2...';





DROP TABLE IF EXISTS TBL_HistorySignal2;

CREATE TABLE TBL_HistorySignal2 
(
   StationId INT NOT NULL,
   StationName NATIONAL VARCHAR(255) ,
   EquipmentId INT NOT NULL,
   EquipmentName NATIONAL VARCHAR(128),
   SignalId INT NOT NULL,
   SignalName NATIONAL VARCHAR(128),
   SignalCategory INT,
   DataType INT NOT NULL,
   FloatValue FLOAT,
   StringValue NATIONAL VARCHAR(128),
   DateTimeValue DATETIME,
   SampleTime DATETIME NOT NULL,
   ShowPrecision NATIONAL VARCHAR(20),
   Unit NATIONAL VARCHAR(64),
   BaseTypeId NUMERIC(10,0),
   BaseTypeName NATIONAL VARCHAR(128),
   EventSeverity INT,
   EventSeverityName NATIONAL VARCHAR(128),
   Meanings NATIONAL VARCHAR(255),
   ThresholdType INT,
   BaseCondId NUMERIC(10,0),
   BaseMeaning NATIONAL VARCHAR(255)
);



SELECT N'TBL_HistorySignal2.TBL_HistorySignal2_IDX1...';



CREATE UNIQUE INDEX TBL_HistorySignal2_IDX1
ON TBL_HistorySignal2
(SampleTime DESC, 
StationId ASC, 
EquipmentId ASC, 
SignalId ASC); 


SELECT N'TBL_HistorySignal2.TBL_HistorySignal2_IDX2...';



CREATE INDEX TBL_HistorySignal2_IDX2
ON TBL_HistorySignal2
(StationId ASC, 
EquipmentId ASC, 
SignalId ASC, 
SampleTime DESC, 
FloatValue ASC); 



SELECT N'TBL_HistorySignal3...';





DROP TABLE IF EXISTS TBL_HistorySignal3;

CREATE TABLE TBL_HistorySignal3 
(
   StationId INT NOT NULL,
   StationName NATIONAL VARCHAR(255) ,
   EquipmentId INT NOT NULL,
   EquipmentName NATIONAL VARCHAR(128),
   SignalId INT NOT NULL,
   SignalName NATIONAL VARCHAR(128),
   SignalCategory INT,
   DataType INT NOT NULL,
   FloatValue FLOAT,
   StringValue NATIONAL VARCHAR(128),
   DateTimeValue DATETIME,
   SampleTime DATETIME NOT NULL,
   ShowPrecision NATIONAL VARCHAR(20),
   Unit NATIONAL VARCHAR(64),
   BaseTypeId NUMERIC(10,0),
   BaseTypeName NATIONAL VARCHAR(128),
   EventSeverity INT,
   EventSeverityName NATIONAL VARCHAR(128),
   Meanings NATIONAL VARCHAR(255),
   ThresholdType INT,
   BaseCondId NUMERIC(10,0),
   BaseMeaning NATIONAL VARCHAR(255)
);



SELECT N'TBL_HistorySignal3.TBL_HistorySignal3_IDX1...';



CREATE UNIQUE INDEX TBL_HistorySignal3_IDX1
ON TBL_HistorySignal3
(SampleTime DESC, 
StationId ASC, 
EquipmentId ASC, 
SignalId ASC); 


SELECT N'TBL_HistorySignal3.TBL_HistorySignal3_IDX2...';



CREATE INDEX TBL_HistorySignal3_IDX2
ON TBL_HistorySignal3
(StationId ASC, 
EquipmentId ASC, 
SignalId ASC, 
SampleTime DESC, 
FloatValue ASC); 



SELECT N'TBL_HistorySignal4...';





DROP TABLE IF EXISTS TBL_HistorySignal4;

CREATE TABLE TBL_HistorySignal4 
(
   StationId INT NOT NULL,
   StationName NATIONAL VARCHAR(255) ,
   EquipmentId INT NOT NULL,
   EquipmentName NATIONAL VARCHAR(128),
   SignalId INT NOT NULL,
   SignalName NATIONAL VARCHAR(128),
   SignalCategory INT,
   DataType INT NOT NULL,
   FloatValue FLOAT,
   StringValue NATIONAL VARCHAR(128),
   DateTimeValue DATETIME,
   SampleTime DATETIME NOT NULL,
   ShowPrecision NATIONAL VARCHAR(20),
   Unit NATIONAL VARCHAR(64),
   BaseTypeId NUMERIC(10,0),
   BaseTypeName NATIONAL VARCHAR(128),
   EventSeverity INT,
   EventSeverityName NATIONAL VARCHAR(128),
   Meanings NATIONAL VARCHAR(255),
   ThresholdType INT,
   BaseCondId NUMERIC(10,0),
   BaseMeaning NATIONAL VARCHAR(255)
);



SELECT N'TBL_HistorySignal4.TBL_HistorySignal4_IDX1...';



CREATE UNIQUE INDEX TBL_HistorySignal4_IDX1
ON TBL_HistorySignal4
(SampleTime DESC, 
StationId ASC, 
EquipmentId ASC, 
SignalId ASC); 


SELECT N'TBL_HistorySignal4.TBL_HistorySignal4_IDX2...';



CREATE INDEX TBL_HistorySignal4_IDX2
ON TBL_HistorySignal4
(StationId ASC, 
EquipmentId ASC, 
SignalId ASC, 
SampleTime DESC, 
FloatValue ASC); 



SELECT N'TBL_HistorySignal5...';





DROP TABLE IF EXISTS TBL_HistorySignal5;

CREATE TABLE TBL_HistorySignal5 
(
   StationId INT NOT NULL,
   StationName NATIONAL VARCHAR(255) ,
   EquipmentId INT NOT NULL,
   EquipmentName NATIONAL VARCHAR(128),
   SignalId INT NOT NULL,
   SignalName NATIONAL VARCHAR(128),
   SignalCategory INT,
   DataType INT NOT NULL,
   FloatValue FLOAT,
   StringValue NATIONAL VARCHAR(128),
   DateTimeValue DATETIME,
   SampleTime DATETIME NOT NULL,
   ShowPrecision NATIONAL VARCHAR(20),
   Unit NATIONAL VARCHAR(64),
   BaseTypeId NUMERIC(10,0),
   BaseTypeName NATIONAL VARCHAR(128),
   EventSeverity INT,
   EventSeverityName NATIONAL VARCHAR(128),
   Meanings NATIONAL VARCHAR(255),
   ThresholdType INT,
   BaseCondId NUMERIC(10,0),
   BaseMeaning NATIONAL VARCHAR(255)
);



SELECT N'TBL_HistorySignal5.TBL_HistorySignal5_IDX1...';



CREATE UNIQUE INDEX TBL_HistorySignal5_IDX1
ON TBL_HistorySignal5
(SampleTime DESC, 
StationId ASC, 
EquipmentId ASC, 
SignalId ASC); 


SELECT N'TBL_HistorySignal5.TBL_HistorySignal5_IDX2...';



CREATE INDEX TBL_HistorySignal5_IDX2
ON TBL_HistorySignal5
(StationId ASC, 
EquipmentId ASC, 
SignalId ASC, 
SampleTime DESC, 
FloatValue ASC); 



SELECT N'TBL_HistorySignal6...';





DROP TABLE IF EXISTS TBL_HistorySignal6;

CREATE TABLE TBL_HistorySignal6 
(
   StationId INT NOT NULL,
   StationName NATIONAL VARCHAR(255) ,
   EquipmentId INT NOT NULL,
   EquipmentName NATIONAL VARCHAR(128),
   SignalId INT NOT NULL,
   SignalName NATIONAL VARCHAR(128),
   SignalCategory INT,
   DataType INT NOT NULL,
   FloatValue FLOAT,
   StringValue NATIONAL VARCHAR(128),
   DateTimeValue DATETIME,
   SampleTime DATETIME NOT NULL,
   ShowPrecision NATIONAL VARCHAR(20),
   Unit NATIONAL VARCHAR(64),
   BaseTypeId NUMERIC(10,0),
   BaseTypeName NATIONAL VARCHAR(128),
   EventSeverity INT,
   EventSeverityName NATIONAL VARCHAR(128),
   Meanings NATIONAL VARCHAR(255),
   ThresholdType INT,
   BaseCondId NUMERIC(10,0),
   BaseMeaning NATIONAL VARCHAR(255)
);



SELECT N'TBL_HistorySignal6.TBL_HistorySignal6_IDX1...';



CREATE UNIQUE INDEX TBL_HistorySignal6_IDX1
ON TBL_HistorySignal6
(SampleTime DESC, 
StationId ASC, 
EquipmentId ASC, 
SignalId ASC); 


SELECT N'TBL_HistorySignal6.TBL_HistorySignal6_IDX2...';



CREATE INDEX TBL_HistorySignal6_IDX2
ON TBL_HistorySignal6
(StationId ASC, 
EquipmentId ASC, 
SignalId ASC, 
SampleTime DESC, 
FloatValue ASC); 



SELECT N'TBL_HistorySignal7...';





DROP TABLE IF EXISTS TBL_HistorySignal7;

CREATE TABLE TBL_HistorySignal7 
(
   StationId INT NOT NULL,
   StationName NATIONAL VARCHAR(255) ,
   EquipmentId INT NOT NULL,
   EquipmentName NATIONAL VARCHAR(128),
   SignalId INT NOT NULL,
   SignalName NATIONAL VARCHAR(128),
   SignalCategory INT,
   DataType INT NOT NULL,
   FloatValue FLOAT,
   StringValue NATIONAL VARCHAR(128),
   DateTimeValue DATETIME,
   SampleTime DATETIME NOT NULL,
   ShowPrecision NATIONAL VARCHAR(20),
   Unit NATIONAL VARCHAR(64),
   BaseTypeId NUMERIC(10,0),
   BaseTypeName NATIONAL VARCHAR(128),
   EventSeverity INT,
   EventSeverityName NATIONAL VARCHAR(128),
   Meanings NATIONAL VARCHAR(255),
   ThresholdType INT,
   BaseCondId NUMERIC(10,0),
   BaseMeaning NATIONAL VARCHAR(255)
);



SELECT N'TBL_HistorySignal7.TBL_HistorySignal7_IDX1...';



CREATE UNIQUE INDEX TBL_HistorySignal7_IDX1
ON TBL_HistorySignal7
(SampleTime DESC, 
StationId ASC, 
EquipmentId ASC, 
SignalId ASC); 


SELECT N'TBL_HistorySignal7.TBL_HistorySignal7_IDX2...';



CREATE INDEX TBL_HistorySignal7_IDX2
ON TBL_HistorySignal7
(StationId ASC, 
EquipmentId ASC, 
SignalId ASC, 
SampleTime DESC, 
FloatValue ASC); 



SELECT N'TBL_HistorySignal8...';





DROP TABLE IF EXISTS TBL_HistorySignal8;

CREATE TABLE TBL_HistorySignal8 
(
   StationId INT NOT NULL,
   StationName NATIONAL VARCHAR(255) ,
   EquipmentId INT NOT NULL,
   EquipmentName NATIONAL VARCHAR(128),
   SignalId INT NOT NULL,
   SignalName NATIONAL VARCHAR(128),
   SignalCategory INT,
   DataType INT NOT NULL,
   FloatValue FLOAT,
   StringValue NATIONAL VARCHAR(128),
   DateTimeValue DATETIME,
   SampleTime DATETIME NOT NULL,
   ShowPrecision NATIONAL VARCHAR(20),
   Unit NATIONAL VARCHAR(64),
   BaseTypeId NUMERIC(10,0),
   BaseTypeName NATIONAL VARCHAR(128),
   EventSeverity INT,
   EventSeverityName NATIONAL VARCHAR(128),
   Meanings NATIONAL VARCHAR(255),
   ThresholdType INT,
   BaseCondId NUMERIC(10,0),
   BaseMeaning NATIONAL VARCHAR(255)
);



SELECT N'TBL_HistorySignal8.TBL_HistorySignal8_IDX1...';



CREATE UNIQUE INDEX TBL_HistorySignal8_IDX1
ON TBL_HistorySignal8
(SampleTime DESC, 
StationId ASC, 
EquipmentId ASC, 
SignalId ASC); 


SELECT N'TBL_HistorySignal8.TBL_HistorySignal8_IDX2...';



CREATE INDEX TBL_HistorySignal8_IDX2
ON TBL_HistorySignal8
(StationId ASC, 
EquipmentId ASC, 
SignalId ASC, 
SampleTime DESC, 
FloatValue ASC); 



SELECT N'TBL_HistorySignal9...';





DROP TABLE IF EXISTS TBL_HistorySignal9;

CREATE TABLE TBL_HistorySignal9 
(
   StationId INT NOT NULL,
   StationName NATIONAL VARCHAR(255) ,
   EquipmentId INT NOT NULL,
   EquipmentName NATIONAL VARCHAR(128),
   SignalId INT NOT NULL,
   SignalName NATIONAL VARCHAR(128),
   SignalCategory INT,
   DataType INT NOT NULL,
   FloatValue FLOAT,
   StringValue NATIONAL VARCHAR(128),
   DateTimeValue DATETIME,
   SampleTime DATETIME NOT NULL,
   ShowPrecision NATIONAL VARCHAR(20),
   Unit NATIONAL VARCHAR(64),
   BaseTypeId NUMERIC(10,0),
   BaseTypeName NATIONAL VARCHAR(128),
   EventSeverity INT,
   EventSeverityName NATIONAL VARCHAR(128),
   Meanings NATIONAL VARCHAR(255),
   ThresholdType INT,
   BaseCondId NUMERIC(10,0),
   BaseMeaning NATIONAL VARCHAR(255)
);



SELECT N'TBL_HistorySignal9.TBL_HistorySignal9_IDX1...';



CREATE UNIQUE INDEX TBL_HistorySignal9_IDX1
ON TBL_HistorySignal9
(SampleTime DESC, 
StationId ASC, 
EquipmentId ASC, 
SignalId ASC); 


SELECT N'TBL_HistorySignal9.TBL_HistorySignal9_IDX2...';



CREATE INDEX TBL_HistorySignal9_IDX2
ON TBL_HistorySignal9
(StationId ASC, 
EquipmentId ASC, 
SignalId ASC, 
SampleTime DESC, 
FloatValue ASC); 



SELECT N'TBL_HistorySignalMid...';





DROP TABLE IF EXISTS TBL_HistorySignalMid;

CREATE TABLE TBL_HistorySignalMid 
(
   StationId INT NOT NULL,
   StationName NATIONAL VARCHAR(255) NOT NULL,
   EquipmentId INT NOT NULL,
   EquipmentName NATIONAL VARCHAR(128) NOT NULL,
   SignalId INT NOT NULL,
   SignalName NATIONAL VARCHAR(128) NOT NULL,
   SignalCategory INT NOT NULL,
   DataType INT NOT NULL,
   FloatValue FLOAT,
   StringValue NATIONAL VARCHAR(128),
   DateTimeValue DATETIME,
   SampleTime DATETIME NOT NULL,
   ShowPrecision NATIONAL VARCHAR(20),
   Unit NATIONAL VARCHAR(64),
   BaseTypeId NUMERIC(10,0),
   BaseTypeName NATIONAL VARCHAR(128),
   EventSeverity INT,
   EventSeverityName NATIONAL VARCHAR(128),
   Meanings NATIONAL VARCHAR(255),
   ThresholdType INT,
   BaseCondId NUMERIC(10,0),
   BaseMeaning NATIONAL VARCHAR(255)
);




SELECT N'TBL_HourlySignal...';





DROP TABLE IF EXISTS TBL_HourlySignal;

CREATE TABLE TBL_HourlySignal 
(
   StationId INT NOT NULL,
   EquipmentId INT NOT NULL,
   SignalId INT NOT NULL,
   RecordTime DATETIME NOT NULL,
   DataType INT,
   FloatValue FLOAT,
   StringValue VARCHAR(255),
   ReportTime DATETIME NOT NULL,
   SignalPropertyId INT   NOT NULL  DEFAULT 0
);



SELECT N'TBL_House...';





DROP TABLE IF EXISTS TBL_House;

CREATE TABLE TBL_House 
(
   HouseId INT NOT NULL,
   StationId INT NOT NULL,
   HouseName NATIONAL VARCHAR(128) NOT NULL,
   Description NATIONAL VARCHAR(255),
   LastUpdateDate TIMESTAMP   NOT NULL
);



SELECT N'TBL_House_ID...';



ALTER TABLE TBL_House
ADD CONSTRAINT PK_TBL_House_ID PRIMARY KEY(HouseId,StationId); 




SELECT N'TBL_LoginInfo...';





DROP TABLE IF EXISTS TBL_LoginInfo;

CREATE TABLE TBL_LoginInfo 
(
   UserId INT NOT NULL,
   LoginType INT NOT NULL,
   LoginTime DATETIME NOT NULL,
   IPAddress NATIONAL VARCHAR(30)
);



SELECT N'TBL_LoginInfo_ID...';



ALTER TABLE TBL_LoginInfo
ADD CONSTRAINT PK_TBL_LoginInfo_ID PRIMARY KEY(UserId,LoginType,LoginTime); 



SELECT N'TBL_MenuItems...';





DROP TABLE IF EXISTS TBL_MenuItems;

CREATE TABLE TBL_MenuItems 
(
   MenuItemsId INT NOT NULL,
   ParentMenuItemsId INT,
   MenuItemsName NATIONAL VARCHAR(128) NOT NULL,
   Description NATIONAL VARCHAR(255)
);



SELECT N'TBL_MenuItems_ID...';



ALTER TABLE TBL_MenuItems
ADD CONSTRAINT PK_TBL_MenuItems_ID PRIMARY KEY(MenuItemsId); 



SELECT N'TBL_Menus...';





DROP TABLE IF EXISTS TBL_Menus;

CREATE TABLE TBL_Menus 
(
   MenusId INT NOT NULL,
   MenusName NATIONAL VARCHAR(128) NOT NULL,
   Description NATIONAL VARCHAR(255)
);



SELECT N'TBL_Menus_ID...';



ALTER TABLE TBL_Menus
ADD CONSTRAINT PK_TBL_Menus_ID PRIMARY KEY(MenusId); 



SELECT N'TBL_MenusMap...';





DROP TABLE IF EXISTS TBL_MenusMap;

CREATE TABLE TBL_MenusMap 
(
   MenusId INT NOT NULL,
   MenuItemsId INT NOT NULL
);



SELECT N'TBL_MenusMap_ID...';



ALTER TABLE TBL_MenusMap
ADD CONSTRAINT PK_TBL_MenusMap_ID PRIMARY KEY(MenusId,MenuItemsId); 



SELECT N'TBL_MUFullCfgState...';





DROP TABLE IF EXISTS TBL_MUFullCfgState;

CREATE TABLE TBL_MUFullCfgState 
(
   StationId INT NOT NULL,
   MonitorUnitId INT NOT NULL,
   ConfigFileCode CHAR(32) NOT NULL,
   UpdateTime DATETIME NOT NULL,
   State INT NOT NULL
);



SELECT N'TBL_MUFullCfgState_ID...';



ALTER TABLE TBL_MUFullCfgState
ADD CONSTRAINT PK_TBL_MUFullCfgState_ID PRIMARY KEY(StationId,MonitorUnitId); 



SELECT N'TBL_MUSyncRecord...';





DROP TABLE IF EXISTS TBL_MUSyncRecord;

CREATE TABLE TBL_MUSyncRecord 
(
   RecordId INT NOT NULL  AUTO_INCREMENT PRIMARY KEY,
   StationId INT NOT NULL,
   TaskId INT,
   MonitorUnitId INT NOT NULL,
   SyncResult INT NOT NULL,
   SyncTime DATETIME,
   Description NATIONAL VARCHAR(255)
);



SELECT N'TBL_MUSyncRecord_ID...';


/*
ALTER TABLE TBL_MUSyncRecord
ADD CONSTRAINT PK_TBL_MUSyncRecord_ID PRIMARY KEY(RecordId); 
*/


SELECT N'TBL_MUSyncTask...';





DROP TABLE IF EXISTS TBL_MUSyncTask;

CREATE TABLE TBL_MUSyncTask 
(
   TaskId INT NOT NULL  AUTO_INCREMENT PRIMARY KEY,
   StationId INT NOT NULL,
   MonitorUnitId INT NOT NULL,
   SyncState INT NOT NULL,
   SyncRule INT NOT NULL,
   PlanTime DATETIME,
   BeginTime DATETIME,
   EndTime DATETIME,
   UpdateTime DATETIME,
   MaxRetryCount INT NOT NULL,
   RetryCount INT NOT NULL,
   Description NATIONAL VARCHAR(255)
);



SELECT N'TBL_MUSyncTask_ID...';


/*
ALTER TABLE TBL_MUSyncTask
ADD CONSTRAINT PK_TBL_MUSyncTask_ID PRIMARY KEY(TaskId); 
*/


SELECT N'TBL_NewInStation...';





DROP TABLE IF EXISTS TBL_NewInStation;

CREATE TABLE TBL_NewInStation 
(
   IpAddress NATIONAL VARCHAR(128) NOT NULL,
   UpdateTime DATETIME NOT NULL,
   ExtendField1 NATIONAL VARCHAR(255),
   ExtendField2 NATIONAL VARCHAR(255),
   ExtendField3 NATIONAL VARCHAR(255)
);





SELECT N'TBL_Operation...';





DROP TABLE IF EXISTS TBL_Operation;

CREATE TABLE TBL_Operation 
(
   OperationId INT NOT NULL,
   OperationCategory INT,
   OperationName NATIONAL VARCHAR(128) NOT NULL,
   Description NATIONAL VARCHAR(255),
   MenusItemId INT
);



SELECT N'TBL_Operation_ID...';



ALTER TABLE TBL_Operation
ADD CONSTRAINT PK_TBL_Operation_ID PRIMARY KEY(OperationId); 



SELECT N'TBL_OperationDetail...';





DROP TABLE IF EXISTS TBL_OperationDetail;

CREATE TABLE TBL_OperationDetail 
(
   UserId INT NOT NULL,
   ObjectId NATIONAL VARCHAR(128),
   ObjectType INT NOT NULL,
   PropertyName NATIONAL VARCHAR(128),
   OperationTime DATETIME NOT NULL,
   OperationType NATIONAL VARCHAR(64) NOT NULL,
   OldValue NATIONAL VARCHAR(255),
   NewValue NATIONAL VARCHAR(255)
);



SELECT N'TBL_OperationGroup...';





DROP TABLE IF EXISTS TBL_OperationGroup;

CREATE TABLE TBL_OperationGroup 
(
   GroupId INT NOT NULL,
   GroupName NATIONAL VARCHAR(128) NOT NULL,
   Description NATIONAL VARCHAR(255)
);



SELECT N'TBL_OperationGroup_ID...';



ALTER TABLE TBL_OperationGroup
ADD CONSTRAINT PK_TBL_OperationGroup_ID PRIMARY KEY(GroupId); 



SELECT N'TBL_OperationGroupMap...';





DROP TABLE IF EXISTS TBL_OperationGroupMap;

CREATE TABLE TBL_OperationGroupMap 
(
   OperationId INT NOT NULL,
   GroupId INT NOT NULL
);



SELECT N'TBL_OperationGroupMap_ID...';



ALTER TABLE TBL_OperationGroupMap
ADD CONSTRAINT PK_TBL_OperationGroupMap_ID PRIMARY KEY(OperationId,GroupId); 



SELECT N'TBL_OperationRecord...';





DROP TABLE IF EXISTS TBL_OperationRecord;

CREATE TABLE TBL_OperationRecord 
(
   UserId INT NOT NULL,
   StationId INT,
   StationName NATIONAL VARCHAR(255),
   Operation INT NOT NULL,
   OperationTime DATETIME NOT NULL,
   OperationType INT,
   OperationContent NATIONAL VARCHAR(255) NOT NULL
);



SELECT N'TBL_OperationRecord.TBL_OperationRecord_IDX1...';



CREATE UNIQUE INDEX TBL_OperationRecord_IDX1
ON TBL_OperationRecord
(OperationTime DESC, 
UserId ASC, 
Operation ASC); 


SELECT N'TBL_OperationRecordMid...';





DROP TABLE IF EXISTS TBL_OperationRecordMid;

CREATE TABLE TBL_OperationRecordMid 
(
   UserId INT NOT NULL,
   StationId INT,
   StationName NATIONAL VARCHAR(255),
   Operation INT NOT NULL,
   OperationTime DATETIME NOT NULL,
   OperationType INT,
   OperationContent NATIONAL VARCHAR(255) NOT NULL
);



SELECT N'TBL_PrimaryKeyIdentity...';





DROP TABLE IF EXISTS TBL_PrimaryKeyIdentity;

CREATE TABLE TBL_PrimaryKeyIdentity 
(
   TableId INT NOT NULL,
   TableName NATIONAL VARCHAR(30),
   Description NATIONAL VARCHAR(255)
);



SELECT N'TBL_PrimaryKeyIdentity_ID...';



ALTER TABLE TBL_PrimaryKeyIdentity
ADD CONSTRAINT PK_TBL_PrimaryKeyIdentity_ID PRIMARY KEY(TableId); 



SELECT N'TBL_PrimaryKeyValue...';





DROP TABLE IF EXISTS TBL_PrimaryKeyValue;

CREATE TABLE TBL_PrimaryKeyValue 
(
   TableId INT NOT NULL,
   PostalCode INT NOT NULL,
   MinValue INT,
   CurrentValue INT
);



SELECT N'TBL_PrimaryKeyValue_ID...';



ALTER TABLE TBL_PrimaryKeyValue
ADD CONSTRAINT PK_TBL_PrimaryKeyValue_ID PRIMARY KEY(TableId,PostalCode); 




SELECT N'TBL_ReplicateLogs...';





DROP TABLE IF EXISTS TBL_ReplicateLogs;

CREATE TABLE TBL_ReplicateLogs 
(
   LogId BIGINT NOT NULL  AUTO_INCREMENT PRIMARY KEY,
   LogStr NATIONAL VARCHAR(4000) NOT NULL,
   InsertTime TIMESTAMP   NOT NULL
);




SELECT N'TBL_SARAlarmActiveRecord...';





DROP TABLE IF EXISTS TBL_SARAlarmActiveRecord;

CREATE TABLE TBL_SARAlarmActiveRecord 
(
   StationId INT NOT NULL,
   StationCategoryId INT NOT NULL,
   EquipmentId INT NOT NULL,
   EventId INT NOT NULL,
   EventConditionId INT NOT NULL,
   SequenceId NATIONAL VARCHAR(128) NOT NULL,
   StartTime DATETIME NOT NULL,
   EndTime DATETIME,
   Overturn INT,
   Meanings NATIONAL VARCHAR(255),
   EventValue FLOAT,
   BaseTypeId NUMERIC(10,0),
   StandardId INT,
   InsertDateTime DATETIME NOT NULL,
   RelationType INT NOT NULL
);



SELECT N'TBL_SARAlarmQueue...';





DROP TABLE IF EXISTS TBL_SARAlarmQueue;

CREATE TABLE TBL_SARAlarmQueue 
(
   StationId INT NOT NULL,
   StationCategoryId INT NOT NULL,
   EquipmentId INT NOT NULL,
   EventId INT NOT NULL,
   EventConditionId INT NOT NULL,
   SequenceId NATIONAL VARCHAR(128) NOT NULL,
   StartTime DATETIME NOT NULL,
   EndTime DATETIME,
   Overturn INT,
   Meanings NATIONAL VARCHAR(255),
   EventValue FLOAT,
   BaseTypeId NUMERIC(10,0),
   StandardId INT,
   InsertDateTime DATETIME NOT NULL
);



SELECT N'TBL_SARAlarmRecordStartTime...';





DROP TABLE IF EXISTS TBL_SARAlarmRecordStartTime;

CREATE TABLE TBL_SARAlarmRecordStartTime 
(
   StartTime DATETIME,
   RelationType INT
);



SELECT N'TBL_SARAlarmRelation...';





DROP TABLE IF EXISTS TBL_SARAlarmRelation;

CREATE TABLE TBL_SARAlarmRelation 
(
   StationId INT,
   EquipmentId INT,
   EventId INT,
   EventConditionId INT,
   StartTime DATETIME,
   StandardId INT,
   CauseStationId INT,
   CauseEquipmentId INT,
   CauseEventId INT,
   CauseEventConditionId INT,
   CauseStartTime DATETIME,
   CauseStandardId INT,
   RelationType INT
);



SELECT N'TBL_SARDerivateAlarmRule...';





DROP TABLE IF EXISTS TBL_SARDerivateAlarmRule;


CREATE TABLE TBL_SARDerivateAlarmRule
(
   RuleId INT NOT NULL,
   RuleName VARCHAR(255) NOT NULL,
   AlarmCount INT NOT NULL,
   AlarmEndCount INT NOT NULL,
   AlarmTimeScope INT NOT NULL,
   Description VARCHAR(255)
);

SELECT N'TBL_SARIsProcess...';





DROP TABLE IF EXISTS TBL_SARIsProcess;

CREATE TABLE TBL_SARIsProcess 
(
   IsProcess INT
);




SELECT N'TBL_SARReverseAlarmRule...';





DROP TABLE IF EXISTS TBL_SARReverseAlarmRule;

CREATE TABLE TBL_SARReverseAlarmRule 
(
   StartThreshold INT NOT NULL,
   EndThreshold INT NOT NULL,
   TimeThreshold INT NOT NULL
);




SELECT N'TBL_SARStationDerivateMap...';





DROP TABLE IF EXISTS TBL_SARStationDerivateMap;


CREATE TABLE TBL_SARStationDerivateMap
(
   RuleId INT NOT NULL,
   DerivateBaseTypeId INT NOT NULL,
   BaseTypeId INT NOT NULL,
   StationCategoryId INT NOT NULL
);

SELECT N'TBL_SARStationPrimaryMap...';





DROP TABLE IF EXISTS TBL_SARStationPrimaryMap;

CREATE TABLE TBL_SARStationPrimaryMap 
(
   PrimaryId INT NOT NULL,
   StationCategoryId INT NOT NULL
);



SELECT N'TBL_Signal...';





DROP TABLE IF EXISTS TBL_Signal;

CREATE TABLE TBL_Signal 
(
   EquipmentTemplateId INT NOT NULL,
   SignalId INT NOT NULL,
   Enable BOOLEAN NOT NULL,
   Visible BOOLEAN NOT NULL,
   Description NATIONAL VARCHAR(255),
   SignalName NATIONAL VARCHAR(128) NOT NULL,
   SignalCategory INT NOT NULL,
   SignalType INT NOT NULL,
   ChannelNo INT NOT NULL,
   ChannelType INT NOT NULL,
   Expression NATIONAL VARCHAR(1024),
   DataType INT,
   ShowPrecision NATIONAL VARCHAR(20),
   Unit NATIONAL VARCHAR(64),
   StoreInterval FLOAT,
   AbsValueThreshold FLOAT,
   PercentThreshold FLOAT,
   StaticsPeriod INT,
   BaseTypeId NUMERIC(10,0),
   ChargeStoreInterVal FLOAT,
   ChargeAbsValue FLOAT,
   DisplayIndex INT NOT NULL,
   MDBSignalId INT,
   ModuleNo INT   NOT NULL  DEFAULT 0
);



SELECT N'TBL_Signal_ID...';



ALTER TABLE TBL_Signal
ADD CONSTRAINT PK_TBL_Signal_ID PRIMARY KEY(EquipmentTemplateId,SignalId); 




SELECT N'TBL_SignalMeanings...';





DROP TABLE IF EXISTS TBL_SignalMeanings;

CREATE TABLE TBL_SignalMeanings 
(
   EquipmentTemplateId INT NOT NULL,
   SignalId INT NOT NULL,
   StateValue SMALLINT NOT NULL,
   Meanings NATIONAL VARCHAR(255),
   BaseCondId NUMERIC(10,0)
);



SELECT N'TBL_SignalMeanings_ID...';



ALTER TABLE TBL_SignalMeanings
ADD CONSTRAINT PK_TBL_SignalMeanings_ID PRIMARY KEY(EquipmentTemplateId,SignalId,StateValue); 



SELECT N'TBL_SignalProperty...';





DROP TABLE IF EXISTS TBL_SignalProperty;

CREATE TABLE TBL_SignalProperty 
(
   EquipmentTemplateId INT NOT NULL,
   SignalId INT NOT NULL,
   SignalPropertyId INT NOT NULL
);



SELECT N'TBL_SignalProperty_ID...';



ALTER TABLE TBL_SignalProperty
ADD CONSTRAINT PK_TBL_SignalProperty_ID PRIMARY KEY(EquipmentTemplateId,SignalId,SignalPropertyId); 



SELECT N'TBL_SignalStatistics...';





DROP TABLE IF EXISTS TBL_SignalStatistics;

CREATE TABLE TBL_SignalStatistics 
(
   StationId INT NOT NULL,
   StationName NATIONAL VARCHAR(255) NOT NULL,
   EquipmentId INT NOT NULL,
   EquipmentName NATIONAL VARCHAR(128) NOT NULL,
   SignalId INT NOT NULL,
   SignalName NATIONAL VARCHAR(128) NOT NULL,
   StatisticsTime DATETIME NOT NULL,
   MinValue FLOAT,
   MinTime DATETIME,
   `MaxValue` FLOAT,
   MaxTime DATETIME,
   AvgValue FLOAT,
   AvgTime DATETIME,
   BaseTypeId NUMERIC(10,0),
   BaseTypeName NATIONAL VARCHAR(128)
);



SELECT N'TBL_SignalStatistics.TBL_SignalStatistics_IDX1...';



CREATE UNIQUE INDEX TBL_SignalStatistics_IDX1
ON TBL_SignalStatistics
(StatisticsTime DESC, 
StationId ASC, 
EquipmentId ASC, 
SignalId ASC); 


SELECT N'TBL_SignalStatisticsMid...';





DROP TABLE IF EXISTS TBL_SignalStatisticsMid;

CREATE TABLE TBL_SignalStatisticsMid 
(
   StationId INT NOT NULL,
   StationName NATIONAL VARCHAR(255) NOT NULL,
   EquipmentId INT NOT NULL,
   EquipmentName NATIONAL VARCHAR(128) NOT NULL,
   SignalId INT NOT NULL,
   SignalName NATIONAL VARCHAR(128) NOT NULL,
   StatisticsTime DATETIME NOT NULL,
   MinValue FLOAT,
   MinTime DATETIME,
   `MaxValue` FLOAT,
   MaxTime DATETIME,
   AvgValue FLOAT,
   AvgTime DATETIME,
   BaseTypeId NUMERIC(10,0),
   BaseTypeName NATIONAL VARCHAR(128)
);



SELECT N'TBL_SpecialtyGroup...';





DROP TABLE IF EXISTS TBL_SpecialtyGroup;

CREATE TABLE TBL_SpecialtyGroup 
(
   SpecialtyGroupId INT NOT NULL,
   SpecialtyGroupName NATIONAL VARCHAR(128) NOT NULL,
   Description NATIONAL VARCHAR(255)
);



SELECT N'TBL_SpecialtyGroup_ID...';



ALTER TABLE TBL_SpecialtyGroup
ADD CONSTRAINT PK_TBL_SpecialtyGroup_ID PRIMARY KEY(SpecialtyGroupId); 



SELECT N'TBL_SpecialtyGroupMap...';





DROP TABLE IF EXISTS TBL_SpecialtyGroupMap;

CREATE TABLE TBL_SpecialtyGroupMap 
(
   SpecialtyGroupId INT NOT NULL,
   EntryItemId INT NOT NULL,
   Operation NATIONAL VARCHAR(255)
);



SELECT N'TBL_SpecialtyGroupMap_ID...';



ALTER TABLE TBL_SpecialtyGroupMap
ADD CONSTRAINT PK_TBL_SpecialtyGroupMap_ID PRIMARY KEY(SpecialtyGroupId,EntryItemId); 




SELECT N'TBL_Station...';





DROP TABLE IF EXISTS TBL_Station;

CREATE TABLE TBL_Station 
(
   StationId INT NOT NULL,
   StationName NATIONAL VARCHAR(255) NOT NULL,
   Latitude NUMERIC(20,17),
   Longitude NUMERIC(20,17),
   SetupTime DATETIME,
   CompanyId INT,
   ConnectState INT   NOT NULL  DEFAULT 2,
   UpdateTime DATETIME NOT NULL,
   StationCategory INT NOT NULL,
   StationGrade INT NOT NULL,
   StationState INT NOT NULL,
   ContactId INT,
   SupportTime INT,
   OnWayTime FLOAT,
   SurplusTime FLOAT,
   FloorNo NATIONAL VARCHAR(50),
   PropList NATIONAL VARCHAR(255),
   Acreage FLOAT,
   BuildingType INT,
   ContainNode BOOLEAN   NOT NULL  DEFAULT 0,
   Description NATIONAL VARCHAR(255),
   BordNumber INT,
   CenterId INT NOT NULL,
   Enable BOOLEAN   NOT NULL  DEFAULT 1,
   StartTime DATETIME,
   EndTime DATETIME,
   ProjectName NATIONAL VARCHAR(255),
   ContractNo NATIONAL VARCHAR(255),
   InstallTime DATETIME
);



SELECT N'TBL_Station_ID...';



ALTER TABLE TBL_Station
ADD CONSTRAINT PK_TBL_Station_ID PRIMARY KEY(StationId); 




SELECT N'TBL_StationMask...';





DROP TABLE IF EXISTS TBL_StationMask;

CREATE TABLE TBL_StationMask 
(
   StationId INT NOT NULL,
   TimeGroupId INT,
   Reason NATIONAL VARCHAR(255),
   StartTime DATETIME,
   EndTime DATETIME,
   UserId INT
);



SELECT N'TBL_StationMask_ID...';



ALTER TABLE TBL_StationMask
ADD CONSTRAINT PK_TBL_StationMask_ID PRIMARY KEY(StationId); 



SELECT N'TBL_StationStructure...';





DROP TABLE IF EXISTS TBL_StationStructure;

CREATE TABLE TBL_StationStructure 
(
   StructureId INT NOT NULL,
   StructureGroupId INT NOT NULL,
   ParentStructureId INT NOT NULL,
   StructureName VARCHAR(128) NOT NULL,
   IsUngroup BOOLEAN NOT NULL,
   StructureType INT NOT NULL,
   MapZoom FLOAT,
   Longitude NUMERIC(20,17),
   Latitude NUMERIC(20,17),
   Description VARCHAR(255),
   LevelPath NATIONAL VARCHAR(200) NOT NULL,
   Enable BOOLEAN NOT NULL
);



--  ///////////////////////////////////////////////////////////////////////////
--  ///////////////////////////////////////////////////////////////////////////
--  ///////////////////////////////////////////////////////////////////////////



/*     TBL_StandardDic
Comments:       �¼������׼��������

Author              Date             Comment       CODE[YYYYMMDD]
-- -----------------------------------------------------------------------------------------------------------
              2013-06-03       Created
*************************************************************************************************************/


SELECT N'TBL_StationStructure_ID...';



ALTER TABLE TBL_StationStructure
ADD CONSTRAINT PK_TBL_StationStructure_ID PRIMARY KEY(StructureId); 



SELECT N'TBL_StationStructureMap...';





DROP TABLE IF EXISTS TBL_StationStructureMap;

CREATE TABLE TBL_StationStructureMap 
(
   StructureId INT NOT NULL,
   StationId INT NOT NULL
);



SELECT N'TBL_StationStructureMap_ID...';



ALTER TABLE TBL_StationStructureMap
ADD CONSTRAINT PK_TBL_StationStructureMap_ID PRIMARY KEY(StructureId,StationId); 





SELECT N'TBL_SwapCardRecord...';





DROP TABLE IF EXISTS TBL_SwapCardRecord;

CREATE TABLE TBL_SwapCardRecord 
(
   StationId INT,
   StationName NATIONAL VARCHAR(255),
   EquipmentId INT,
   EquipmentName NATIONAL VARCHAR(128),
   CardStationId INT,
   CardStationName NATIONAL VARCHAR(255),
   CardId INT,
   CardCode NATIONAL VARCHAR(255),
   CardName NATIONAL VARCHAR(255),
   CardUserId INT,
   CardUserName NATIONAL VARCHAR(255),
   CardCategory INT,
   CardCategoryName NATIONAL VARCHAR(255),
   CardGroup INT,
   CardGroupName NATIONAL VARCHAR(255),
   CardStatus INT,
   CardStatusName NATIONAL VARCHAR(255),
   DoorId INT,
   DoorNo INT,
   DoorName NATIONAL VARCHAR(255),
   DoorCategory INT,
   DoorCategoryName NATIONAL VARCHAR(255),
   Valid INT,
   ValidName NATIONAL VARCHAR(128),
   Enter SMALLINT,
   RecordTime DATETIME
);



SELECT N'TBL_SwapCardRecord.TBL_SwapCardRecord_IDX1...';



CREATE UNIQUE INDEX TBL_SwapCardRecord_IDX1
ON TBL_SwapCardRecord
(RecordTime DESC, 
CardId ASC, 
DoorNo ASC); 


SELECT N'TBL_SwapCardRecordMid...';





DROP TABLE IF EXISTS TBL_SwapCardRecordMid;

CREATE TABLE TBL_SwapCardRecordMid 
(
   StationId INT,
   StationName NATIONAL VARCHAR(255),
   EquipmentId INT,
   EquipmentName NATIONAL VARCHAR(128),
   CardStationId INT,
   CardStationName NATIONAL VARCHAR(255),
   CardId INT,
   CardCode NATIONAL VARCHAR(255),
   CardName NATIONAL VARCHAR(255),
   CardUserId INT,
   CardUserName NATIONAL VARCHAR(255),
   CardCategory INT,
   CardCategoryName NATIONAL VARCHAR(255),
   CardGroup INT,
   CardGroupName NATIONAL VARCHAR(255),
   CardStatus INT,
   CardStatusName NATIONAL VARCHAR(255),
   DoorId INT,
   DoorNo INT,
   DoorName NATIONAL VARCHAR(255),
   DoorCategory INT,
   DoorCategoryName NATIONAL VARCHAR(255),
   Valid INT,
   ValidName NATIONAL VARCHAR(128),
   Enter SMALLINT,
   RecordTime DATETIME
);




SELECT N'TBL_SysConfig...';





DROP TABLE IF EXISTS TBL_SysConfig;

CREATE TABLE TBL_SysConfig 
(
   ConfigKey NATIONAL VARCHAR(512) NOT NULL,
   ConfigValue NATIONAL VARCHAR(4000)
);



SELECT N'TBL_TimeGroup...';





DROP TABLE IF EXISTS TBL_TimeGroup;

CREATE TABLE TBL_TimeGroup 
(
   TimeGroupId INT NOT NULL,
   TimeGroupCategory INT NOT NULL,
   TimeGroupName NATIONAL VARCHAR(128) NOT NULL,
   TimeGroupType SMALLINT NOT NULL,
   TimeGroupException BOOLEAN NOT NULL,
   StartTime DATETIME NOT NULL,
   EndTime DATETIME NOT NULL,
   LastUpdateDate DATETIME
);



SELECT N'TBL_TimeGroup_ID...';



ALTER TABLE TBL_TimeGroup
ADD CONSTRAINT PK_TBL_TimeGroup_ID PRIMARY KEY(TimeGroupId); 



SELECT N'TBL_TimeGroupSet...';





DROP TABLE IF EXISTS TBL_TimeGroupSet;

CREATE TABLE TBL_TimeGroupSet 
(
   TimeGroupSetId INT NOT NULL,
   TimeGroupSetName VARCHAR(128) NOT NULL
);



SELECT N'TBL_TimeGroupSet_ID...';



ALTER TABLE TBL_TimeGroupSet
ADD CONSTRAINT PK_TBL_TimeGroupSet_ID PRIMARY KEY(TimeGroupSetId); 



SELECT N'TBL_TimeGroupSpan...';





DROP TABLE IF EXISTS TBL_TimeGroupSpan;

CREATE TABLE TBL_TimeGroupSpan 
(
   TimeSpanId INT NOT NULL,
   TimeGroupId INT NOT NULL,
   StartTime DATETIME,
   EndTime DATETIME,
   Week SMALLINT,
   TimeSpanChar NATIONAL VARCHAR(255) NOT NULL,
   LastUpdateDate DATETIME
);



SELECT N'TBL_TimeGroupSpan_ID...';



ALTER TABLE TBL_TimeGroupSpan
ADD CONSTRAINT PK_TBL_TimeGroupSpan_ID PRIMARY KEY(TimeSpanId); 




SELECT N'TBL_UserRole...';





DROP TABLE IF EXISTS TBL_UserRole;

CREATE TABLE TBL_UserRole 
(
   RoleId INT NOT NULL,
   RoleName NATIONAL VARCHAR(128) NOT NULL,
   Description NATIONAL VARCHAR(255)
);



SELECT N'TBL_UserRole_ID...';



ALTER TABLE TBL_UserRole
ADD CONSTRAINT PK_TBL_UserRole_ID PRIMARY KEY(RoleId); 



SELECT N'TBL_UserRoleMap...';





DROP TABLE IF EXISTS TBL_UserRoleMap;

CREATE TABLE TBL_UserRoleMap 
(
   UserId INT NOT NULL,
   RoleId INT NOT NULL
);



SELECT N'TBL_UserRoleMap_ID...';



ALTER TABLE TBL_UserRoleMap
ADD CONSTRAINT PK_TBL_UserRoleMap_ID PRIMARY KEY(UserId,RoleId); 



SELECT N'TBL_UserRoleRight...';





DROP TABLE IF EXISTS TBL_UserRoleRight;

CREATE TABLE TBL_UserRoleRight 
(
   RoleId INT NOT NULL,
   OperationId INT NOT NULL,
   OperationType INT NOT NULL
);



SELECT N'TBL_UserRoleRight_ID...';



ALTER TABLE TBL_UserRoleRight
ADD CONSTRAINT PK_TBL_UserRoleRight_ID PRIMARY KEY(RoleId,OperationId,OperationType); 



SELECT N'TBL_WorkStation...';





DROP TABLE IF EXISTS TBL_WorkStation;

CREATE TABLE TBL_WorkStation 
(
   WorkStationId INT NOT NULL,
   WorkStationName NATIONAL VARCHAR(255) NOT NULL,
   WorkStationType INT NOT NULL,
   IPAddress NATIONAL VARCHAR(64) NOT NULL,
   ParentId INT   NOT NULL  DEFAULT 0,
   ConnectState INT NOT NULL,
   UpdateTime DATETIME NOT NULL,
   IsUsed BOOLEAN   NOT NULL  DEFAULT 1,
   CPU FLOAT,
   Memory FLOAT,
   ThreadCount INT,
   DiskFreeSpace FLOAT,
   DBFreeSpace FLOAT,
   LastCommTime DATETIME
);



SELECT N'TBL_WorkStation_ID...';



ALTER TABLE TBL_WorkStation
ADD CONSTRAINT PK_TBL_WorkStation_ID PRIMARY KEY(WorkStationId); 



SELECT N'TBL_ActiveEvent...';





DROP TABLE IF EXISTS TSL_ActiveEvent;

CREATE TABLE TSL_ActiveEvent 
(
   StationId INT NOT NULL,
   EquipmentId INT NOT NULL,
   EventId INT NOT NULL,
   EventConditionId INT NOT NULL,
   SequenceId NATIONAL VARCHAR(128) NOT NULL,
   StartTime DATETIME NOT NULL,
   EndTime DATETIME,
   ResetSequenceId NATIONAL VARCHAR(128),
   EventValue FLOAT,
   ReversalNum INT,
   Meanings NATIONAL VARCHAR(255),
   BaseTypeId NUMERIC(10,0)
);



SELECT N'TBL_ActiveEvent.TSL_ActiveEvent_ID1...';



CREATE UNIQUE INDEX TSL_ActiveEvent_ID1
ON TSL_ActiveEvent
(SequenceId ASC); 


SELECT N'TBL_ActiveEvent.TSL_ActiveEvent_ID2...';



CREATE INDEX TSL_ActiveEvent_ID2
ON TSL_ActiveEvent
(ResetSequenceId ASC); 



SELECT N'TBL_ChannelMap...';





DROP TABLE IF EXISTS TSL_ChannelMap;

CREATE TABLE TSL_ChannelMap 
(
   SamplerUnitId INT NOT NULL,
   MonitorUnitId INT NOT NULL,
   OriginalChannelNo INT NOT NULL,
   StandardChannelNo INT NOT NULL
);



SELECT N'TBL_ChannelMap_ID...';



ALTER TABLE TSL_ChannelMap
ADD CONSTRAINT PK_TSL_ChannelMap_ID PRIMARY KEY(SamplerUnitId); 



SELECT N'TBL_DataServerCapacity...';





DROP TABLE IF EXISTS TSL_DataServerCapacity;

CREATE TABLE TSL_DataServerCapacity 
(
   DataServerId INT NOT NULL,
   Capacity INT,
   Description VARCHAR(255)
);



SELECT N'TBL_DataServerCapacity_ID...';



ALTER TABLE TSL_DataServerCapacity
ADD CONSTRAINT PK_TSL_DataServerCapacity_ID PRIMARY KEY(DataServerId); 



SELECT N'TBL_MonitorUnit...';





DROP TABLE IF EXISTS TSL_MonitorUnit;

CREATE TABLE TSL_MonitorUnit 
(
   MonitorUnitId INT NOT NULL,
   MonitorUnitName NATIONAL VARCHAR(128) NOT NULL,
   MonitorUnitCategory INT NOT NULL,
   MonitorUnitCode NATIONAL VARCHAR(128) NOT NULL,
   WorkStationId INT,
   StationId INT,
   IpAddress NATIONAL VARCHAR(128),
   RunMode INT,
   ConfigFileCode CHAR(32),
   ConfigUpdateTime DATETIME,
   SampleConfigCode CHAR(32),
   SoftwareVersion NATIONAL VARCHAR(64),
   Description NATIONAL VARCHAR(255),
   StartTime DATETIME,
   HeartbeatTime DATETIME,
   ConnectState INT   NOT NULL  DEFAULT 2,
   UpdateTime DATETIME NOT NULL,
   IsSync BOOLEAN   NOT NULL  DEFAULT 1,
   SyncTime DATETIME,
   IsConfigOK BOOLEAN   NOT NULL  DEFAULT 1,
   ConfigFileCode_Old CHAR(32),
   SampleConfigCode_Old CHAR(32),
   AppCongfigId INT,
   CanDistribute BOOLEAN NOT NULL,
   Enable BOOLEAN NOT NULL,
   ProjectName NATIONAL VARCHAR(255),
   ContractNo NATIONAL VARCHAR(255),
   InstallTime DATETIME
);



SELECT N'TBL_MonitorUnit_ID...';



ALTER TABLE TSL_MonitorUnit
ADD CONSTRAINT PK_TSL_MonitorUnit_ID PRIMARY KEY(MonitorUnitId); 



SELECT N'TBL_MonitorUnitConfig...';





DROP TABLE IF EXISTS TSL_MonitorUnitConfig;

CREATE TABLE TSL_MonitorUnitConfig 
(
   AppConfigId INT NOT NULL,
   SiteWebTimeOut INT NOT NULL,
   RetryTimes INT NOT NULL,
   HeartBeat INT NOT NULL,
   EquipmentTimeOut INT NOT NULL,
   PortInterruptCount INT NOT NULL,
   PortInitializeInternal INT NOT NULL,
   MaxPortInitializeTimes INT NOT NULL,
   PortQueryTimeOut INT NOT NULL,
   DataSaveTimes INT NOT NULL,
   HistorySignalSavedTimes INT NOT NULL,
   HistoryBatterySavedTimes INT NOT NULL,
   HistoryEventSavedTimes INT NOT NULL,
   CardRecordSavedCount INT NOT NULL,
   ControlLog BOOLEAN NOT NULL,
   IpAddressDS NATIONAL VARCHAR(128)
);



SELECT N'TBL_MonitorUnitConfig_ID...';



ALTER TABLE TSL_MonitorUnitConfig
ADD CONSTRAINT PK_TSL_MonitorUnitConfig_ID PRIMARY KEY(AppConfigId); 



SELECT N'TBL_MonitorUnitControl...';





DROP TABLE IF EXISTS TSL_MonitorUnitControl;

CREATE TABLE TSL_MonitorUnitControl 
(
   StationId INT NOT NULL,
   MonitorUnitId INT NOT NULL,
   EquipmentId INT NOT NULL,
   ControlId INT NOT NULL,
   TargetControl INT NOT NULL,
   LogicExpression NATIONAL VARCHAR(1024)
);



SELECT N'TBL_MonitorUnitControl_ID...';



ALTER TABLE TSL_MonitorUnitControl
ADD CONSTRAINT PK_TSL_MonitorUnitControl_ID PRIMARY KEY(StationId,EquipmentId,ControlId); 



SELECT N'TBL_MonitorUnitEvent...';





DROP TABLE IF EXISTS TSL_MonitorUnitEvent;

CREATE TABLE TSL_MonitorUnitEvent 
(
   StationId INT NOT NULL,
   MonitorUnitId INT NOT NULL,
   EquipmentId INT NOT NULL,
   EventId INT NOT NULL,
   StartExpression NATIONAL VARCHAR(1024),
   SuppressExpression NATIONAL VARCHAR(1024)
);



SELECT N'TBL_MonitorUnitEvent_ID...';



ALTER TABLE TSL_MonitorUnitEvent
ADD CONSTRAINT PK_TSL_MonitorUnitEvent_ID PRIMARY KEY(StationId,EquipmentId,EventId); 



SELECT N'TBL_MonitorUnitSignal...';





DROP TABLE IF EXISTS TSL_MonitorUnitSignal;

CREATE TABLE TSL_MonitorUnitSignal 
(
   StationId INT NOT NULL,
   MonitorUnitId INT NOT NULL,
   EquipmentId INT NOT NULL,
   SignalId INT NOT NULL,
   ReferenceSamplerUnitId INT,
   ReferenceChannelNo INT,
   Expression NATIONAL VARCHAR(2048),
   InstanceType INT NOT NULL
);



SELECT N'TBL_MonitorUnitSignal_ID...';



ALTER TABLE TSL_MonitorUnitSignal
ADD CONSTRAINT PK_TSL_MonitorUnitSignal_ID PRIMARY KEY(StationId,EquipmentId,SignalId); 



SELECT N'TBL_Port...';





DROP TABLE IF EXISTS TSL_Port;

CREATE TABLE TSL_Port 
(
   PortId INT NOT NULL,
   MonitorUnitId INT NOT NULL,
   PortNo INT NOT NULL,
   PortName NATIONAL VARCHAR(128) NOT NULL,
   PortType INT NOT NULL,
   Setting NATIONAL VARCHAR(255) NOT NULL,
   PhoneNumber NATIONAL VARCHAR(20),
   LinkSamplerUnitId INT,
   Description NATIONAL VARCHAR(255)
);



SELECT N'TBL_Port_ID...';



ALTER TABLE TSL_Port
ADD CONSTRAINT PK_TSL_Port_ID PRIMARY KEY(MonitorUnitId,PortId); 



SELECT N'TBL_RealtimeRouting...';





DROP TABLE IF EXISTS TSL_RealtimeRouting;

CREATE TABLE TSL_RealtimeRouting 
(
   DataServerId INT NOT NULL,
   MonitorUnitId INT NOT NULL
);



SELECT N'TBL_RealtimeRouting_ID...';



ALTER TABLE TSL_RealtimeRouting
ADD CONSTRAINT PK_TSL_RealtimeRouting_ID PRIMARY KEY(MonitorUnitId,DataServerId); 



SELECT N'TBL_RouteDistribution...';





DROP TABLE IF EXISTS TSL_RouteDistribution;

CREATE TABLE TSL_RouteDistribution 
(
   DataServerId INT NOT NULL,
   MonitorUnitId INT NOT NULL,
   Description VARCHAR(255)
);



SELECT N'TBL_RouteDistribution_ID...';



ALTER TABLE TSL_RouteDistribution
ADD CONSTRAINT PK_TSL_RouteDistribution_ID PRIMARY KEY(DataServerId,MonitorUnitId); 



SELECT N'TBL_Sampler...';





DROP TABLE IF EXISTS TSL_Sampler;

CREATE TABLE TSL_Sampler 
(
   SamplerId INT NOT NULL,
   SamplerName NATIONAL VARCHAR(128) NOT NULL,
   SamplerType SMALLINT NOT NULL,
   ProtocolCode NATIONAL VARCHAR(255) NOT NULL,
   DLLCode NATIONAL VARCHAR(255) NOT NULL,
   DLLVersion NATIONAL VARCHAR(32) NOT NULL,
   ProtocolFilePath NATIONAL VARCHAR(255) NOT NULL,
   DLLFilePath NATIONAL VARCHAR(255) NOT NULL,
   DllPath NATIONAL VARCHAR(255) NOT NULL,
   Setting NATIONAL VARCHAR(255),
   Description NATIONAL VARCHAR(255),
   SoCode NATIONAL VARCHAR(255) NOT NULL,
   SoPath NATIONAL VARCHAR(255) NOT NULL
);



SELECT N'TBL_Sampler_ID...';



ALTER TABLE TSL_Sampler
ADD CONSTRAINT PK_TSL_Sampler_ID PRIMARY KEY(SamplerId); 



SELECT N'TBL_SamplerUnit...';





DROP TABLE IF EXISTS TSL_SamplerUnit;

CREATE TABLE TSL_SamplerUnit 
(
   SamplerUnitId INT NOT NULL,
   PortId INT NOT NULL,
   MonitorUnitId INT NOT NULL,
   SamplerId INT NOT NULL,
   ParentSamplerUnitId INT NOT NULL,
   SamplerType INT NOT NULL,
   SamplerUnitName NATIONAL VARCHAR(128) NOT NULL,
   Address INT NOT NULL,
   SpUnitInterval FLOAT,
   DllPath NATIONAL VARCHAR(128),
   ConnectState INT NOT NULL,
   UpdateTime DATETIME NOT NULL,
   PhoneNumber NATIONAL VARCHAR(20),
   Description NATIONAL VARCHAR(255)
);




drop table IF EXISTS TBL_ReportTask;


/*================================================*/
/*                                           */
/*================================================*/
create table TBL_ReportTask 
(
   TaskId INT not null,
   TaskName VARCHAR(128) not null,
   Description VARCHAR(255),
   ReportId INT not null,
   StartTime DATETIME,
   EndTime DATETIME,
   OutputTime DATETIME,
   OutputInterval INT,
   OutputIntervalType INT,
   QueryPeriod INT,
   QueryPeriodType INT,
   QueryParameters LONGTEXT not null,
   CommandText VARCHAR(255),
   CommandType VARCHAR(128),
   CenterType INT  not null  default 0,
   QueryCount INT,	
   EmailOut INT  not null  default 0,
   EmailUrl LONGTEXT,
   Creator INT,
   CreateTime TIMESTAMP,
   LastUpdateTime TIMESTAMP,
   constraint PK_ReportTask_ID primary key(TaskId)
);


drop table IF EXISTS TBL_ReportTaskFile;


/*================================================*/
/*                                           */
/*================================================*/
create table TBL_ReportTaskFile 
(
   FileId INT not null,
   TaskId INT,
   ReportId INT,
   FileName VARCHAR(128),
   QueryTime TIMESTAMP,
   constraint PK_ReportTaskFile_ID primary key(FileId)
);



SELECT N'TBL_SamplerUnit_ID...';



ALTER TABLE TSL_SamplerUnit
ADD CONSTRAINT PK_TSL_SamplerUnit_ID PRIMARY KEY(MonitorUnitId,SamplerUnitId,PortId); 



SELECT N'TBL_SubscribeSignal...';




/*20130806(�޸�20130809) ���ڿ�����Ҫ����Щ�ֶ�����������������**********************/
DROP TABLE IF EXISTS TSL_SubscribeSignal;

CREATE TABLE TSL_SubscribeSignal 
(
   StationId INT NOT NULL,
   HostId INT NOT NULL,
   EquipmentId INT NOT NULL,
   SignalId INT NOT NULL,
   SubscribeType INT NOT NULL,
   LastSampleDateTime DATETIME,
   LastUpdateDateTime DATETIME,
   SubscribeDateTime DATETIME
);




DROP TABLE IF EXISTS TBL_StationProjectInfo;

Create TABLE TBL_StationProjectInfo
(
   StationId INT NOT NULL,  -- ��վId
   ProjectName NATIONAL VARCHAR(255),  -- �洢��������
   ContractNo NATIONAL VARCHAR(255),
   InstallTime  DATETIME  -- ����ʱ��
);

CREATE UNIQUE INDEX TBL_StationProjectInfo_IDX1
ON TBL_StationProjectInfo
(StationId);


DROP TABLE IF EXISTS TBL_MonitorUnitProjectInfo;

Create TABLE TBL_MonitorUnitProjectInfo
(
   StationId INT NOT NULL,  -- ��վId
   MonitorUnitId INT NOT NULL,  -- ��ص�ԪId
   ProjectName NATIONAL VARCHAR(255),  -- �洢��������
   ContractNo NATIONAL VARCHAR(255),
   InstallTime  DATETIME  -- ����ʱ��
);

CREATE UNIQUE INDEX TBL_MUProjectInfo_IDX1
ON TBL_MonitorUnitProjectInfo 
(StationId, 
MonitorUnitId);


DROP TABLE IF EXISTS TBL_EquipmentProjectInfo;

Create TABLE TBL_EquipmentProjectInfo
(
         StationId INT NOT NULL,
         MonitorUnitId INT NOT NULL,
         EquipmentId INT NOT NULL,
         ProjectName NVARCHAR (255) NULL,
         ContractNo  NVARCHAR (255) NULL,       
		 InstallTime  DateTime NULL,
         EquipmentSN NVARCHAR (255) NULL,
         SO NVARCHAR(255)  NULL  )
;
CREATE UNIQUE INDEX TBL_EquipmentProjectInfo_IDX1
ON TBL_EquipmentProjectInfo 
(StationId, 
EquipmentId);





/*20130806(�޸�20130809) ���ڿ�����Ҫ����Щ�ֶ�����������������**********************/




SELECT N'TBL_SubscribeSignal_ID...';

ALTER TABLE TSL_SubscribeSignal
ADD CONSTRAINT PK_TSL_SubscribeSignal_ID PRIMARY KEY(StationId,HostId,EquipmentId,SignalId); 

ALTER TABLE TBL_Employee 
ADD CONSTRAINT FK_TBL_Employee_ID FOREIGN KEY(DepartmentId) REFERENCES TBL_Department(DepartmentId); 


-- S3����?\?-
SELECT N'TBL_FingerPrintMap...';


DROP TABLE IF EXISTS TBL_FingerPrintMap;

CREATE TABLE TBL_FingerPrintMap 
(
   CardId INT NOT NULL,
   FingerUserId INT NOT NULL,
   FingerPrintNO INT NOT NULL,
   FingerPrintData BLOB NOT NULL,
   FingerStatus INT NOT NULL
);

SELECT N'TBL_CardTypeMap...';

DROP TABLE IF EXISTS TBL_CardTypeMap;

CREATE TABLE TBL_CardTypeMap 
(
   CardId INT NOT NULL,
   CardType INT NOT NULL
);


--  ?��
DROP TABLE IF EXISTS TBL_DBVersionRecord;


CREATE TABLE TBL_DBVersionRecord
(
   SerialNo INT NOT NULL  AUTO_INCREMENT,
   UpdateTime DATETIME NOT NULL,
   Version NATIONAL VARCHAR(30) NOT NULL,
   `Module` NATIONAL VARCHAR(255),
   LastModifyTime DATETIME NOT NULL,
   Feature NATIONAL VARCHAR(255),
   CONSTRAINT PK_DBVERSIONRECORD PRIMARY KEY(SerialNo)
);



SELECT N'TBL_amicConfig...';

DROP TABLE IF EXISTS TBL_DynamicConfig;


CREATE TABLE TBL_DynamicConfig
(
   Id INT   AUTO_INCREMENT,
   UserId INT NOT NULL,     
   ConfigTime DATETIME NOT NULL, -- ��ASд��
   StationId INT NOT NULL,
   HostId INT NOT NULL,     
   SyncFlag INT  NOT NULL  DEFAULT -2, -- ͬ������ASд��?\?1��ͬ����?\?��ͬ���ɹ���1��ͬ��ʧ�ܣ���DS�ڶ�̬���óɹ���д��
   SyncXml NATIONAL VARCHAR(4000) NOT NULL, 
   SyncTime DATETIME,
   CONSTRAINT PK_DynamicConfig PRIMARY KEY(Id)
);


-- ���������ñ�
DROP TABLE IF EXISTS UpedPSMSCfgSamplerUnit;

create table UpedPSMSCfgSamplerUnit 
( 
   OStationId INT not null, 
   OSamplerUnitId INT not null, 
   MonitorUnitId INT, 
   SamplerUnitId INT, 
   OPostCode INT
);
 
DROP TABLE IF EXISTS TBL_StationIdMap;

CREATE TABLE TBL_StationIdMap
(
   OldStationId INT,
   KoloStationId INT,
   OPostCode INT
);



DROP TABLE IF EXISTS TBL_PrimaryAlarm;


CREATE TABLE TBL_PrimaryAlarm
(
   FilterId INT NOT NULL,
   StationCategory INT NOT NULL,
   PrimaryStationId INT NOT NULL,
   PrimaryEquipmentId INT NOT NULL,
   PrimaryBaseTypeId INT NOT NULL
);

CREATE UNIQUE INDEX TBL_PrimaryAlarm_ID1
ON TBL_PrimaryAlarm
(FilterId,
StationCategory,
PrimaryStationId,
PrimaryEquipmentId,
PrimaryBaseTypeId); 

DROP TABLE IF EXISTS TBL_SecondaryAlarm;


CREATE TABLE TBL_SecondaryAlarm
(
   FilterId INT NOT NULL,
   StationCategory INT NOT NULL,
   SecondaryStationId INT NOT NULL,
   SecondaryEquipmentId INT NOT NULL,
   SecondaryBaseTypeId INT NOT NULL
);


CREATE UNIQUE INDEX TBL_SecondaryAlarm_ID1
ON TBL_SecondaryAlarm
(FilterId,
StationCategory,
SecondaryStationId,
SecondaryEquipmentId,
SecondaryBaseTypeId); 
 
DROP TABLE IF EXISTS TBL_PrimarySecondMapRule;


CREATE TABLE TBL_PrimarySecondMapRule
(
   FilterId INT NOT NULL,
   RuleName VARCHAR(255) NOT NULL,
   ProcessDelay INT NOT NULL,
   Description VARCHAR(255)
);

CREATE UNIQUE INDEX TBL_PrimarySecondMapRule_ID1
ON TBL_PrimarySecondMapRule
(FilterId); 
 
DROP TABLE IF EXISTS TBL_SARSecondaryAlarmByFilter;


CREATE TABLE TBL_SARSecondaryAlarmByFilter
(
   SeconarySequenceId NATIONAL VARCHAR(256),
   StationId INT,
   EquipmentId INT,
   EventId INT,
   EventConditionId INT,
   StartTime DATETIME,
   PrimarySequenceId NATIONAL VARCHAR(256),
   InsertDateTime DATETIME
);


 
DROP TABLE IF EXISTS TSL_MonitorUnitIpMap;

CREATE TABLE TSL_MonitorUnitIpMap
(
   MonitorUnitId INT NOT NULL,
   NewIpAddress NATIONAL VARCHAR(128),
   OldIpAddress NATIONAL VARCHAR(128),
   RecordTime DATETIME,
   IsSync BOOLEAN  NOT NULL  DEFAULT 0,
   IsConflict BOOLEAN  NOT NULL  DEFAULT 0,
   Description NATIONAL VARCHAR(255)
); 


/*ҵ�������ֵ�����ڸ���ͬ��ҵ�ṩ��ͬ���ֵ䡣S2V3����
**************************************************************/
SELECT N'TBL_BussinessDataItem...';

DROP TABLE IF EXISTS TBL_BusinessDataItem;

CREATE TABLE TBL_BusinessDataItem
(
   BusinessId INT  NOT NULL  DEFAULT 0,
   ParentEntryId INT  NOT NULL  DEFAULT 0,
   ParentItemId INT  NOT NULL  DEFAULT 0,
   EntryId INT NOT NULL,
   ItemId INT NOT NULL,
   ItemValue NATIONAL VARCHAR(128) NOT NULL,
   ItemAlias NATIONAL VARCHAR(255),
   IsSystem BOOLEAN  NOT NULL  DEFAULT 1,
   IsDefault BOOLEAN  NOT NULL  DEFAULT 0,
   Enable BOOLEAN  NOT NULL  DEFAULT 1,
   Description NATIONAL VARCHAR(255),
   ExtendField1 NATIONAL VARCHAR(255),
   ExtendField2 NATIONAL VARCHAR(255),
   ExtendField3 NATIONAL VARCHAR(255),
   ExtendField4 NATIONAL VARCHAR(255),
   ExtendField5 NATIONAL VARCHAR(255),
   CONSTRAINT PK_TBL_BusinessDataItem_ID PRIMARY KEY(BusinessId,EntryId,ItemId)
);


/*�����ֵ�Idӳ���S2V3����
**************************************************************/
SELECT N'TBL_CategoryIdMap...';

DROP TABLE IF EXISTS TBL_CategoryIdMap;


CREATE TABLE TBL_CategoryIdMap
(
   BusinessId INT NOT NULL,  -- ��ҵ����
   CategoryTypeId INT NOT NULL,  -- ����Id��=1 StationCategory��=2 EquipmentCategory
   OriginalCategoryId INT NOT NULL,  -- ȱʡ����Id
   BusinessCategoryId INT NOT NULL,	   -- ��ҵ����Id	
   CONSTRAINT PK_TBL_CategoryIdMap_ID PRIMARY KEY(BusinessId,CategoryTypeId,OriginalCategoryId,BusinessCategoryId)
);


/*����IP�豸��֧�ֶ����Ž������豸��ѯ������Ϣ
**************************************************************/
SELECT N'TBL_IPDevice...';


DROP TABLE IF EXISTS TSL_IPDevice;

CREATE TABLE TSL_IPDevice
(
   DeviceId INT NOT NULL, 
   DeviceNo NATIONAL VARCHAR(128) NOT NULL,
   DeviceName NATIONAL VARCHAR(128) NOT NULL,
   ProtocolType INT NOT NULL,
   IpAddress NATIONAL VARCHAR(128) NOT NULL
);


SELECT N'TBLIPDevice_ID...';


ALTER TABLE TSL_IPDevice
ADD CONSTRAINT PK_TSL_IPDevice_ID PRIMARY KEY(DeviceId);

/*by DingShuhua in 20141027
*************************************************************************/
SELECT N'TBLificationLogMid...';

DROP TABLE IF EXISTS NotificationLogMid;


CREATE TABLE NotificationLogMid
(
   NotificationLogId NUMERIC(17,0) NOT NULL,
   StationId INT NOT NULL,
   EquipmentId INT NOT NULL,
   EventId INT NOT NULL,
   EventConditionId INT NOT NULL,
   StartTime DATETIME NOT NULL,
   EventStatus INT NOT NULL,
   NotifyResult INT NOT NULL,
   NotifyReciever INT,
   NotifyAddress NATIONAL VARCHAR(255),
   NotifyCategory INT,
   Description NATIONAL VARCHAR(255),
   SMSSentTime DATETIME,
   ExtendField1 NATIONAL VARCHAR(255),
   ExtendField2 NATIONAL VARCHAR(255),
   ExtendField3 NATIONAL VARCHAR(255)
);


SELECT N'TBL_HistoryEventMaskMid...';

DROP TABLE IF EXISTS TBL_HistoryEventMaskMid;


CREATE TABLE TBL_HistoryEventMaskMid
(
   SequenceId NATIONAL VARCHAR(128) NOT NULL,
   StationId INT NOT NULL,
   EquipmentId INT NOT NULL,
   EventId INT NOT NULL,
   EventConditionId INT NOT NULL,
   EventValue FLOAT,
   Meanings NATIONAL VARCHAR(255),
   BaseTypeId NUMERIC(10,0),
   StartTime DATETIME NOT NULL,
   EndTime DATETIME NOT NULL
);


SELECT N'TBL_LoginInfoMid...';

DROP TABLE IF EXISTS TBL_LoginInfoMid;


CREATE TABLE TBL_LoginInfoMid
(
   UserId INT NOT NULL,
   LoginType INT NOT NULL,
   LoginTime DATETIME NOT NULL,
   IPAddress NATIONAL VARCHAR(30)
);


SELECT N'TBL_MidXXXXMid...';

DROP TABLE IF EXISTS TBL_MidXXXXMid;


CREATE TABLE TBL_MidXXXXMid
(
   BusinessTypeId INT NOT NULL,
   ExpressionId INT NOT NULL,
   SerialId INT NOT NULL,
   BusinessTypeName NATIONAL VARCHAR(255) NOT NULL,
   ExpressionName NATIONAL VARCHAR(255) NOT NULL,
   StationId INT NOT NULL,
   StationName NATIONAL VARCHAR(255) NOT NULL,
   EquipmentId INT NOT NULL,
   EquipmentName NATIONAL VARCHAR(128) NOT NULL,
   SignalId INT NOT NULL,
   SignalName NATIONAL VARCHAR(128) NOT NULL,
   SignalCategory INT NOT NULL,
   DataType INT NOT NULL,
   FloatValue FLOAT,
   StringValue NATIONAL VARCHAR(128),
   DateTimeValue DATETIME,
   SampleTime DATETIME NOT NULL,
   ShowPrecision NATIONAL VARCHAR(20),
   Unit NATIONAL VARCHAR(64),
   BaseTypeId NUMERIC(10,0),
   BaseTypeName NATIONAL VARCHAR(128),
   EventSeverity INT,
   EventSeverityName NATIONAL VARCHAR(128),
   Meanings NATIONAL VARCHAR(255),
   ThresholdType INT,
   BusinessState INT,
   BaseCondId NUMERIC(10,0),
   BaseMeaning NATIONAL VARCHAR(255),
   ComeFromTableName NATIONAL VARCHAR(64) NOT NULL
);



SELECT N'TBL_OperationDetailMid...';

DROP TABLE IF EXISTS TBL_OperationDetailMid;


CREATE TABLE TBL_OperationDetailMid
(
   UserId INT NOT NULL,
   ObjectId NATIONAL VARCHAR(128),
   ObjectType INT NOT NULL,
   PropertyName NATIONAL VARCHAR(128),
   OperationTime DATETIME NOT NULL,
   OperationType NATIONAL VARCHAR(64) NOT NULL,
   OldValue NATIONAL VARCHAR(255),
   NewValue NATIONAL VARCHAR(255)
);


SELECT N'TBL_HistoryAmeterRecordMid...';

DROP TABLE IF EXISTS TBL_HistoryAmeterRecordMid;


CREATE TABLE TBL_HistoryAmeterRecordMid
(
   StationId INT NOT NULL,
   EquipmentId INT NOT NULL,
   SignalId INT NOT NULL,
   RecordTime DATETIME NOT NULL,
   RecordValue FLOAT,
   ReportTime DATETIME NOT NULL,
   RevisedValue FLOAT
);


SELECT N'TBL_SpaceUsedResult...';

DROP TABLE IF EXISTS TBL_SpaceUsedResult;


CREATE TABLE TBL_SpaceUsedResult
(
   tablename VARCHAR(776),
   rows DECIMAL(15,0),
   reserved DECIMAL(15,0),
   data DECIMAL(15,0),
   indexp DECIMAL(15,0),
   unused DECIMAL(15,0)    
);


SELECT N'TBL_tabaseSize...';

DROP TABLE IF EXISTS ZDatabaseSize;


CREATE TABLE ZDatabaseSize
(
   DateTime DATETIME NOT NULL,
   DatabaseMBSize FLOAT,
   DataMBSize FLOAT,
   LogMBSize FLOAT,
   FreeSpaceMBSize FLOAT,
   DatabaseMBSizeTodayUsed FLOAT,
   DataMBSizeTodayUsed FLOAT,
   LogMBSizeTodayUsed FLOAT,
   FreeSpaceMBSizeTodayUsed FLOAT,
   CONSTRAINT PK_TSL_DatabaseSize PRIMARY KEY(DateTime)
); 



SELECT N'TBL_Performance...';

DROP TABLE IF EXISTS ZDBPerformance;


CREATE TABLE ZDBPerformance
(
   DiagnoseTime DATETIME NOT NULL,
   InsertMS INT NOT NULL,
   UpdateMS INT NOT NULL,
   DeleteMS INT NOT NULL,
   CONSTRAINT PK_ZDBPerformance PRIMARY KEY(DiagnoseTime)
);



SELECT N'TBL_storyEventStatistic...';

DROP TABLE IF EXISTS ZHistoryEventStatistic;


CREATE TABLE ZHistoryEventStatistic
(
   StatisticDate DATETIME NOT NULL,
   StationId INT NOT NULL,
   StationName NATIONAL VARCHAR(255),
   EquipmentId INT NOT NULL,
   EquipmentName NATIONAL VARCHAR(128),
   EventId INT NOT NULL,
   EventName NATIONAL VARCHAR(128),
   `Count` INT,
   CONSTRAINT PK_ZTableHistoryEventStatistic PRIMARY KEY(StatisticDate,StationId,EquipmentId,EventId)
);



SELECT N'TBL_storyEventTop100...';

DROP TABLE IF EXISTS ZHistoryEventTop100;


CREATE TABLE ZHistoryEventTop100
(
   StatisticDate DATETIME NOT NULL,
   ItemType INT NOT NULL,
   ItemId INT NOT NULL,
   ItemName NATIONAL VARCHAR(255),
   TemplateId INT,
   TemplateName NATIONAL VARCHAR(255),
   `Count` INT
);



CREATE INDEX IX_ZHistoryEventTop100 
ON ZHistoryEventTop100
(StatisticDate ASC,
ItemType ASC,
ItemId ASC,
TemplateId ASC);


SELECT N'TBL_storySignalStatistic...';

DROP TABLE IF EXISTS ZHistorySignalStatistic;


CREATE TABLE ZHistorySignalStatistic
(
   StatisticDate DATETIME NOT NULL,
   StationId INT NOT NULL,
   StationName NATIONAL VARCHAR(255),
   EquipmentId INT NOT NULL,
   EquipmentName NATIONAL VARCHAR(128),
   SignalId INT NOT NULL,
   SignalName NATIONAL VARCHAR(128),
   `Count` INT,
   CONSTRAINT PK_ZTableHistorySignalStatistic PRIMARY KEY(StatisticDate,StationId,EquipmentId,SignalId)
);



SELECT N'TBL_storySignalTop100...';

DROP TABLE IF EXISTS ZHistorySignalTop100;


CREATE TABLE ZHistorySignalTop100
(
   StatisticDate DATETIME NOT NULL,
   ItemType INT NOT NULL,
   ItemId INT NOT NULL,
   ItemName NATIONAL VARCHAR(255),
   TemplateId INT,
   TemplateName NATIONAL VARCHAR(255),
   `Count` INT
);



CREATE INDEX IX_ZHistorySignalTop100 
ON ZHistorySignalTop100
(StatisticDate ASC,
ItemType ASC,
ItemId ASC,
TemplateId ASC);


SELECT N'TBL_storyDataCount...';

DROP TABLE IF EXISTS ZHistoryDataCount;


CREATE TABLE ZHistoryDataCount
(
   StatisticDate DATETIME NOT NULL,
   DataType INT NOT NULL,
   `Count` INT,
   CONSTRAINT PK_ZHistoryDataCount PRIMARY KEY(StatisticDate,DataType)
);


SELECT N'TBL_ckupTimeRecord...';

DROP TABLE IF EXISTS ZBackupTimeRecord;


CREATE TABLE ZBackupTimeRecord
(
   BackupType INT NOT NULL,
   LastBackupStartTime DATETIME NOT NULL,
   LastBackupEndTime DATETIME NOT NULL
);


--  ?��C�ӿڻ�ȡ���ø�����Ϣ
SELECT N'TBL_onfigChangeMicroLog...';

DROP TABLE IF EXISTS C_ConfigChangeMicroLog;

CREATE TABLE C_ConfigChangeMicroLog
(
   ObjectId NATIONAL VARCHAR(255) NOT NULL,
   ConfigId INT NOT NULL,
   EditType INT NOT NULL,
   UpdateTime DATETIME NOT NULL
);


DROP TABLE IF EXISTS TSL_AcrossMonitorUnitSignal;

CREATE TABLE TSL_AcrossMonitorUnitSignal
(
   StationId INT NOT NULL,
   MonitorUnitId INT NOT NULL,
   EquipmentId INT NOT NULL,
   SignalId INT NOT NULL,
   Expression NATIONAL VARCHAR(4000),
   CONSTRAINT PK_AcrossMonitorUnitSignal_ID PRIMARY KEY(StationId,EquipmentId,SignalId)
);



DROP TABLE IF EXISTS EventFilterCondition; 

DROP TABLE IF EXISTS EventFilterMap; 

DROP TABLE IF EXISTS EventFilterMap; 

DROP TABLE IF EXISTS NotifyReceiver; 

DROP TABLE IF EXISTS NotifyServer; 

DROP TABLE IF EXISTS ActiveNotification;

CREATE TABLE ActiveNotification 
(
   AlarmSequenceId INT NOT NULL,
   BirthTime DATETIME,
   StationId INT,
   StationName VARCHAR(128),
   EquipmentId INT,
   EquipmentName VARCHAR(128),
   EventId INT,
   EventConditionId INT,
   EventUniqueId VARCHAR(255),
   EventName VARCHAR(128),
   EventSeverity INT,
   SeverityName NATIONAL VARCHAR(50),
   EventStatus INT NOT NULL,
   Overturn INT,
   Meaning NATIONAL VARCHAR(128),
   StartTime DATETIME,
   EndTime DATETIME,
   ConfirmTime DATETIME,
   UpdateTimeFormat VARCHAR(255),
   ConfirmUserId INT,
   ConfirmUserName NATIONAL VARCHAR(128),
   CenterName NATIONAL VARCHAR(128),
   StationState NATIONAL VARCHAR(128),
   EquipmentCategoryName NATIONAL VARCHAR(128),
   EquipmentVendorName NATIONAL VARCHAR(128),
   EquipmentLogicCategory NATIONAL VARCHAR(128),
   LogicCategory NATIONAL VARCHAR(128),
   SubLogicCategory NATIONAL VARCHAR(128),
   InfectionToEquipment NATIONAL VARCHAR(128),
   InfectionToBusiness NATIONAL VARCHAR(128),
   StandardAlarmName NATIONAL VARCHAR(128),
   StandardNameId NATIONAL VARCHAR(128),
   AlarmComment NATIONAL VARCHAR(128),
   NetAlarmId NATIONAL VARCHAR(128),
   NotifyServerId INT,
   NotificationType INT,
   Setting NATIONAL VARCHAR(255),
   NotificationRecieverId INT,
   RetryTimes INT,
   EventFilterDelay INT,
   NotifyResult INT,
   InstructionId NATIONAL VARCHAR(128)
);


SELECT N'TBL_veNotification_ID...';



CREATE UNIQUE INDEX PK_ActiveNotification_ID
ON ActiveNotification
(AlarmSequenceId,
EventStatus);



SELECT N'TBL_Notification...';





DROP TABLE IF EXISTS AllNotification;

CREATE TABLE AllNotification 
(
   AlarmSequenceId INT NOT NULL,
   BirthTime DATETIME,
   StationId INT,
   StationName VARCHAR(128),
   EquipmentId INT,
   EquipmentName VARCHAR(128),
   EventId INT,
   EventConditionId INT,
   EventUniqueId VARCHAR(255) NOT NULL,
   EventName VARCHAR(128),
   EventSeverity INT,
   SeverityName VARCHAR(50),
   EventStatus INT NOT NULL,
   Overturn INT,
   Meaning VARCHAR(128),
   StartTime DATETIME,
   EndTime DATETIME,
   ConfirmTime DATETIME,
   UpdateTimeFormat VARCHAR(255),
   ConfirmUserId INT,
   ConfirmUserName VARCHAR(128),
   CenterName VARCHAR(128),
   StationState VARCHAR(128),
   EquipmentCategoryName VARCHAR(128),
   EquipmentVendorName VARCHAR(128),
   EquipmentLogicCategory VARCHAR(128),
   LogicCategory VARCHAR(128),
   SubLogicCategory VARCHAR(128),
   InfectionToEquipment VARCHAR(128),
   InfectionToBusiness VARCHAR(128),
   StandardAlarmName VARCHAR(128),
   StandardNameId VARCHAR(128),
   AlarmComment VARCHAR(128),
   NetAlarmId VARCHAR(128),
   DefaultStationGroupName VARCHAR(128),
   NotificationType INT NOT NULL,
   StationCategoryId INT,
   StationCategoryName VARCHAR(128)
);



SELECT N'TBL_otification_ID...';



ALTER TABLE AllNotification
ADD CONSTRAINT PK_AllNotification_ID PRIMARY KEY(AlarmSequenceId,EventUniqueId,EventStatus,NotificationType); 



SELECT N'TBL_Notification.AllNotification_IDX1...';



CREATE INDEX AllNotification_IDX1
ON AllNotification
(StationId ASC, 
EquipmentId ASC, 
EventId ASC, 
EventConditionId ASC, 
EventStatus ASC, 
StartTime ASC, 
NotificationType ASC); 



SELECT N'TBL_Notification.AllNotification_IDX2...';



CREATE INDEX AllNotification_IDX2
ON AllNotification
(EventUniqueId ASC, 
AlarmSequenceId ASC, 
EventStatus ASC, 
StartTime ASC, 
NotificationType ASC); 



SELECT N'TBL_ntFilter...';





DROP TABLE IF EXISTS EventFilter;

CREATE TABLE EventFilter 
(
   EventFilterId INT NOT NULL,
   EventFilterName NATIONAL VARCHAR(128),
   Description NATIONAL VARCHAR(255),
   LastUpdateDate TIMESTAMP   NOT NULL
);



SELECT N'TBL_tFilter_ID...';



ALTER TABLE EventFilter
ADD CONSTRAINT PK_EventFilter_ID PRIMARY KEY(EventFilterId); 



SELECT N'TBL_ntFilterCondition...';





DROP TABLE IF EXISTS EventFilterCondition;

CREATE TABLE EventFilterCondition 
(
   EventFilterId INT NOT NULL,
   EventFilterConditionId INT NOT NULL,
   EventFilterCombination NATIONAL VARCHAR(500) NOT NULL,
   EventFilterSegment1 INT,
   EventFilterSegment2 INT,
   EventFilterSegment3 INT,
   EventFilterSegment4 INT,
   EventFilterSegment5 INT,
   EventFilterSegment6 INT,
   EventFilterSegment7 INT,
   EventFilterSegment8 INT,
   EventFilterSegment9 INT,
   EventFilterSegment10 INT,
   EventFilterSegment11 INT,
   EventFilterDelay INT   NOT NULL  DEFAULT 0,
   EventFilterCount INT   NOT NULL  DEFAULT 0,
   Description NATIONAL VARCHAR(256),
   LastUpdateDate TIMESTAMP   NOT NULL
);



SELECT N'TBL_tFilterCondition_ID...';



ALTER TABLE EventFilterCondition
ADD CONSTRAINT PK_EventFilterCondition_ID PRIMARY KEY(EventFilterId,EventFilterConditionId); 



SELECT N'TBL_ntFilterMap...';





DROP TABLE IF EXISTS EventFilterMap;

CREATE TABLE EventFilterMap 
(
   EventFilterMemberId INT NOT NULL,
   EventFilterId INT NOT NULL
);



SELECT N'TBL_tFilterMap_ID...';



ALTER TABLE EventFilterMap
ADD CONSTRAINT PK_EventFilterMap_ID PRIMARY KEY(EventFilterMemberId,EventFilterId); 



SELECT N'TBL_EventFilterMember...';





DROP TABLE IF EXISTS EventFilterMember;

CREATE TABLE EventFilterMember 
(
   EventFilterMemberId INT NOT NULL,
   EventFilterMemberName NATIONAL VARCHAR(128) NOT NULL,
   Description NATIONAL VARCHAR(255),
   LastUpdateDate TIMESTAMP   NOT NULL
);



SELECT N'TBL_tFilterMember_ID...';



ALTER TABLE EventFilterMember
ADD CONSTRAINT PK_EventFilterMember_ID PRIMARY KEY(EventFilterMemberId); 



SELECT N'TBL_ntNotifyReciever...';





DROP TABLE IF EXISTS EventNotifyReciever;

CREATE TABLE EventNotifyReciever 
(
   StationId INT NOT NULL,
   EquipmentId INT NOT NULL,
   EventId INT NOT NULL,
   EventSeverity INT NOT NULL,
   EventState INT NOT NULL,
   NotifyReceiverId INT NOT NULL,
   NotifyReceiverCategory INT NOT NULL,
   NotifyReceiverName NATIONAL VARCHAR(128),
   NotifyAddress NATIONAL VARCHAR(255),
   NotifyContent NATIONAL VARCHAR(255),
   NotifyServerId INT,
   EventFilterDelay INT,
   EventFilterCount INT,
   EventFilterId INT,
   EventFilterConditionId INT,
   NotifyServerCategory INT
);



SELECT N'TBL_tNotifyReciever_ID...';



ALTER TABLE EventNotifyReciever
ADD CONSTRAINT PK_EventNotifyReciever_ID PRIMARY KEY(StationId,EquipmentId,EventId,EventSeverity,EventState,NotifyReceiverId,
NotifyReceiverCategory); 



SELECT N'TBL_ificationLog...';





DROP TABLE IF EXISTS NotificationLog;

CREATE TABLE NotificationLog 
(
   NotificationLogId NUMERIC(17,0) NOT NULL,
   StationId INT NOT NULL,
   EquipmentId INT NOT NULL,
   EventId INT NOT NULL,
   EventConditionId INT NOT NULL,
   StartTime DATETIME NOT NULL,
   EventStatus INT NOT NULL,
   NotifyResult INT NOT NULL,
   NotifyReciever INT,
   NotifyAddress NATIONAL VARCHAR(255),
   NotifyCategory INT,
   Description NATIONAL VARCHAR(255),
   SMSSentTime DATETIME,
   ExtendField1 NATIONAL VARCHAR(255),
   ExtendField2 NATIONAL VARCHAR(255),
   ExtendField3 NATIONAL VARCHAR(255)
);



SELECT N'TBL_ficationLog_ID...';



ALTER TABLE NotificationLog
ADD CONSTRAINT PK_NotificationLog_ID PRIMARY KEY(NotificationLogId); 


CREATE INDEX NotificationLog_IDX ON NotificationLog
(StartTime);


SELECT N'TBL_ifyMode...';





DROP TABLE IF EXISTS NotifyMode;

CREATE TABLE NotifyMode 
(
   NotifyModeId INT NOT NULL,
   NotifyModeName NATIONAL VARCHAR(128) NOT NULL,
   NotifyModeFormat NATIONAL VARCHAR(255),
   Description NATIONAL VARCHAR(255),
   LastUpdateDate TIMESTAMP   NOT NULL
);



SELECT N'TBL_fyMode_ID...';



ALTER TABLE NotifyMode
ADD CONSTRAINT PK_NotifyMode_ID PRIMARY KEY(NotifyModeId); 



SELECT N'TBL_ifyReceiver...';





DROP TABLE IF EXISTS NotifyReceiver;

CREATE TABLE NotifyReceiver 
(
   NotifyReceiverId INT NOT NULL,
   NotifyReceiverCategory INT NOT NULL,
   NotifyReceiverName NATIONAL VARCHAR(128) NOT NULL,
   NotifyAddress NATIONAL VARCHAR(255) NOT NULL,
   NotifyContent NATIONAL VARCHAR(255),
   Description NATIONAL VARCHAR(255),
   LastUpdateDate TIMESTAMP   NOT NULL
);



SELECT N'TBL_fyReceiver_ID...';



ALTER TABLE NotifyReceiver
ADD CONSTRAINT PK_NotifyReceiver_ID PRIMARY KEY(NotifyReceiverId,NotifyReceiverCategory); 



SELECT N'TBL_ifyReceiverMap...';





DROP TABLE IF EXISTS NotifyReceiverMap;

CREATE TABLE NotifyReceiverMap 
(
   EventFilterId INT NOT NULL,
   EventFilterConditionId INT NOT NULL,
   NotifyReceiverId INT NOT NULL,
   NotifyReceiverCategory INT NOT NULL,
   NotifyServerId INT NOT NULL,
   NotifyServerCategory INT NOT NULL
);



SELECT N'TBL_fyReceiverMap_ID...';



ALTER TABLE NotifyReceiverMap
ADD CONSTRAINT PK_NotifyReceiverMap_ID PRIMARY KEY(EventFilterId,EventFilterConditionId,NotifyReceiverId,NotifyReceiverCategory,
NotifyServerId,NotifyServerCategory); 



SELECT N'TBL_ifyServer...';





DROP TABLE IF EXISTS NotifyServer;

CREATE TABLE NotifyServer 
(
   NotifyServerId INT NOT NULL,
   NotifyServerCategory INT NOT NULL,
   NotifyServerName NATIONAL VARCHAR(128) NOT NULL,
   Description NATIONAL VARCHAR(255)
);



SELECT N'TBL_fyServer_ID...';



ALTER TABLE NotifyServer
ADD CONSTRAINT PK_NotifyServer_ID PRIMARY KEY(NotifyServerId,NotifyServerCategory); 



SELECT N'TBL_CustomInfo...';





DROP TABLE IF EXISTS TBL_CustomInfo;

CREATE TABLE TBL_CustomInfo 
(
   CustomInfoId INT NOT NULL,
   UserId INT NOT NULL,
   CustomType NATIONAL VARCHAR(128) NOT NULL,
   CustomContent LONGTEXT NOT NULL,
   CreateTime DATETIME NOT NULL,
   Description NATIONAL VARCHAR(255)
);



SELECT N'TBL_CustomInfo_ID...';



ALTER TABLE TBL_CustomInfo
ADD CONSTRAINT PK_TBL_CustomInfo_ID PRIMARY KEY(CustomInfoId); 



DROP TABLE IF EXISTS TBL_EquipmentIdMap;

CREATE TABLE TBL_EquipmentIdMap
(
   OldStationId INT,
   OldEquipmentId INT,
   KoloStationId INT,
   KoloEquipmentId INT,
   OPostCode INT
);


DROP TABLE IF EXISTS TBL_StationStructureIdMap;

CREATE TABLE TBL_StationStructureIdMap
(
   OldStructureId INT,
   KoloStructureId INT,
   OPostCode INT
);


DROP TABLE IF EXISTS TBL_EquipmentTemplateIdMap;


CREATE TABLE TBL_EquipmentTemplateIdMap
(
   OldEquipmentTemplateId INT,
   KoloEquipmentTemplateId INT
);


DROP TABLE IF EXISTS TBL_SamplerIdMap;


CREATE TABLE TBL_SamplerIdMap
(
   OldSamplerId INT,
   KoloSamplerId INT
);


DROP TABLE IF EXISTS UpedPSMSUserList;


create table UpedPSMSUserList 
(
   UserID INT not null,
   OUserID INT,
   OPostCode INT	   not null  DEFAULT 0,
   constraint PK_UpedPSMSUserList_ID primary key(UserID)
);

-- grant SELECT,INSERT,DELETE,UPDATE,REFERENCES on UpedPSMSUserList  to `root`;



DROP TABLE IF EXISTS UpedPSMSUserUpgradeStatus;

create table UpedPSMSUserUpgradeStatus 
(
   UserIsUpgrade BOOLEAN	   not null  DEFAULT 0
);

-- grant SELECT,INSERT,DELETE,UPDATE,REFERENCES on UpedPSMSUserUpgradeStatus  to `root`;


DROP TABLE IF EXISTS UpedPSMSArea;

create table UpedPSMSArea 
(
   AreaID INT not NULL,
   OAreaID INT,
   OPostCode INT	 not null  DEFAULT 0,
   constraint PK_UpedPSMSArea_ID primary key(AreaID)
);

-- grant SELECT,INSERT,DELETE,UPDATE,REFERENCES on UpedPSMSArea to `root`;


DROP TABLE IF EXISTS TBL_WorkStationMap;


CREATE TABLE TBL_WorkStationMap
(
   SiteWebWorkStationId INT,
   KoloWorkStationId INT,
   SiteWebWorkStationName NATIONAL VARCHAR(128),
   KoloWorkStationName NATIONAL VARCHAR(128)
);


SELECT N'TBL_EquipmentKeyValue...';


DROP TABLE IF EXISTS TBL_EquipmentKeyValue;

CREATE TABLE TBL_EquipmentKeyValue 
(
   EquipmentType INT NOT NULL,
   EquipmentCategory INT NOT NULL,
   MinValue INT,
   CurrentValue INT
);


SELECT N'TBL_EquipmentKeyValue_ID...';


ALTER TABLE TBL_EquipmentKeyValue
ADD CONSTRAINT PK_TBL_EquipmentKeyValue_ID PRIMARY KEY(EquipmentType,EquipmentCategory); 


SELECT N'TBL_Experience...';



DROP TABLE IF EXISTS TBL_Experience;

CREATE TABLE TBL_Experience 
(
   ExperienceId BIGINT NOT NULL  AUTO_INCREMENT,
   ExperienceCaption VARCHAR(4000),
   Measure VARCHAR(4000),
   Description VARCHAR(4000),
   LastUpdateDate TIMESTAMP   NOT NULL,
   `Condition` VARCHAR(4000),
   CONSTRAINT PK_Experience_ID PRIMARY KEY(ExperienceId) 
);


SELECT N'TBL_HomePage...';


DROP TABLE IF EXISTS TBL_HomePage;

CREATE TABLE TBL_HomePage 
(
   PageId INT NOT NULL,
   PageName NATIONAL VARCHAR(255) NOT NULL,
   FileName NATIONAL VARCHAR(255) NOT NULL,
   PageType INT NOT NULL,
   Description NATIONAL VARCHAR(255)
);


SELECT N'TBL_HomePage_ID...';


ALTER TABLE TBL_HomePage
ADD CONSTRAINT PK_TBL_HomePage_ID PRIMARY KEY(PageId); 


SELECT N'TBL_LogInformList...';


DROP TABLE IF EXISTS TBL_LogInformList;

CREATE TABLE TBL_LogInformList 
(
   LogActionId INT NOT NULL,
   InformerId INT NOT NULL,
   UserId INT,
   InfoType INT,
   Description NATIONAL VARCHAR(255)
);


SELECT N'TBL_NotificationSN...';


DROP TABLE IF EXISTS TBL_NotificationSN;

CREATE TABLE TBL_NotificationSN 
(
   SerialNo NUMERIC(12,0)
);


SELECT N'TBL_NotifyCommand...';


DROP TABLE IF EXISTS TBL_NotifyCommand;

CREATE TABLE TBL_NotifyCommand 
(
   SequenceId NUMERIC(20,17) NOT NULL,
   StationId INT NOT NULL,
   EquipmentId INT NOT NULL,
   CommandId INT NOT NULL,
   CommandSeverity INT,
   CmdToken NATIONAL VARCHAR(500),
   CommandPhase INT,
   StartTime DATETIME NOT NULL,
   EndTime DATETIME,
   ConfirmTime DATETIME,
   ConfirmerId INT,
   CommandResultType INT,
   CommandResult NATIONAL VARCHAR(255),
   CommandExecuterId INT,
   Description NATIONAL VARCHAR(255)
);

SELECT N'TBL_NotifyCommand_ID...';

ALTER TABLE TBL_NotifyCommand
ADD CONSTRAINT PK_TBL_NotifyCommand_ID PRIMARY KEY(SequenceId); 


SELECT N'TBL_PsmsEomsStation...';


DROP TABLE IF EXISTS TBL_PsmsEomsStation;

CREATE TABLE TBL_PsmsEomsStation 
(
   SequenceId INT NOT NULL,
   SSName NATIONAL VARCHAR(40),
   CenterId INT NOT NULL,
   StationId INT,
   Longitude NUMERIC(20,17),
   LastLongitude NUMERIC(20,17),
   Latitude NUMERIC(20,17),
   LastLatitude NUMERIC(20,17),
   EomsStationId INT,
   DistrictName NATIONAL VARCHAR(32),
   LastDistrictName NATIONAL VARCHAR(32),
   EomsSationName NATIONAL VARCHAR(40),
   LastEomsStationName NATIONAL VARCHAR(40),
   ContainBts NATIONAL VARCHAR(30),
   LastContainBts NATIONAL VARCHAR(30),
   FloorNo NATIONAL VARCHAR(50),
   LastFloorNo NATIONAL VARCHAR(50),
   PropList NATIONAL VARCHAR(100),
   LastPropList NATIONAL VARCHAR(100),
   Acreage FLOAT,
   LastAcreage FLOAT,
   BuildingType NATIONAL VARCHAR(30),
   LastBuildingType NATIONAL VARCHAR(30),
   ContainNode NATIONAL VARCHAR(5),
   LastContainNode NATIONAL VARCHAR(5),
   SetupTime NATIONAL VARCHAR(20),
   LastSetupTime NATIONAL VARCHAR(20),
   Vendors NATIONAL VARCHAR(100),
   LastVendors NATIONAL VARCHAR(100),
   BordNumber INT,
   LastBordNumber INT,
   AddressCodeId NATIONAL VARCHAR(255),
   LastAddressCodeId NATIONAL VARCHAR(255),
   OperationState INT,
   LastTime DATETIME,
   IsSynchronized BOOLEAN   NOT NULL  DEFAULT 0
);


SELECT N'TBL_PSMSEomsStation_ID...';

ALTER TABLE TBL_PsmsEomsStation
ADD CONSTRAINT PK_TBL_PSMSEomsStation_ID PRIMARY KEY(SequenceId); 

SELECT N'TBL_PsmsEomsStation.TBL_PsmsEomsStation_IDX1...';

CREATE INDEX TBL_PsmsEomsStation_IDX1
ON TBL_PsmsEomsStation
(StationId ASC); 


SELECT N'TBL_Report...';


DROP TABLE IF EXISTS TBL_Report;

CREATE TABLE TBL_Report 
(
   ReportId INT NOT NULL,
   ReportName NATIONAL VARCHAR(255) NOT NULL,
   Description NATIONAL VARCHAR(255),
   ReportFileId NATIONAL VARCHAR(255) NOT NULL,
   ReportFileName NATIONAL VARCHAR(255),
   PreviewImageName NATIONAL VARCHAR(255),
   CreateUserId INT,
   CreateUserName NATIONAL VARCHAR(255),
   CreateTime DATETIME,
   UpdateUserId INT,
   UpdateUserName NATIONAL VARCHAR(255),
   UpdateTime DATETIME,
   Version NATIONAL VARCHAR(50)
);


ALTER TABLE TBL_Report
ADD CONSTRAINT PK_TBL_Report_ID PRIMARY KEY(ReportId); 


SELECT N'TBL_ReportBroweHistory...';


DROP TABLE IF EXISTS TBL_ReportBroweHistory;

CREATE TABLE TBL_ReportBroweHistory 
(
   HistoryId INT NOT NULL,
   UserId INT,
   ReportId INT,
   ViewCount INT,
   LastBrowseTime DATETIME
);




SELECT N'TBL_ReportGroup...';


DROP TABLE IF EXISTS TBL_ReportGroup;

CREATE TABLE TBL_ReportGroup 
(
   ReportGroupId INT NOT NULL,
   GroupName NATIONAL VARCHAR(255) NOT NULL,
   UserId INT,
   GroupType INT   DEFAULT   NULL,
   Description NATIONAL VARCHAR(255)
);


SELECT N'TBL_ReportGroupMap...';


DROP TABLE IF EXISTS TBL_ReportGroupMap;

CREATE TABLE TBL_ReportGroupMap 
(
   ReportId INT NOT NULL,
   ReportGroupId INT NOT NULL
);


SELECT N'TBL_ReportQuery...';


DROP TABLE IF EXISTS TBL_ReportQuery;

CREATE TABLE TBL_ReportQuery 
(
   QueryID INT,
   ReportId INT,
   `Name` NATIONAL VARCHAR(255),
   Description NATIONAL VARCHAR(255),
   QueryTime DATETIME
);


SELECT N'TBL_ReportQueryParameter...';


DROP TABLE IF EXISTS TBL_ReportQueryParameter;

CREATE TABLE TBL_ReportQueryParameter 
(
   QueryParameterId INT NOT NULL,
   QueryID INT,
   ReportId INT,
   ParameterName NATIONAL VARCHAR(255),
   DataType NATIONAL VARCHAR(64),
   `Value` LONGTEXT
);


SELECT N'TBL_ReportRole...';


DROP TABLE IF EXISTS TBL_ReportRole;

CREATE TABLE TBL_ReportRole 
(
   ReportRoleId INT NOT NULL,
   RoleName NATIONAL VARCHAR(50) NOT NULL,
   Description NATIONAL VARCHAR(255)
);


ALTER TABLE TBL_ReportRole
ADD CONSTRAINT PK_TBL_ReportRole_ID PRIMARY KEY(ReportRoleId); 


SELECT N'TBL_ReportRoleMap...';


DROP TABLE IF EXISTS TBL_ReportRoleMap;

CREATE TABLE TBL_ReportRoleMap 
(
   ReportId INT NOT NULL,
   ReportRoleId INT NOT NULL
);

ALTER TABLE TBL_ReportRoleMap
ADD CONSTRAINT PK_TBL_ReportRoleMap_ID PRIMARY KEY(ReportId,ReportRoleId); 


SELECT N'TBL_ReportRoleUserMap...';


DROP TABLE IF EXISTS TBL_ReportRoleUserMap;

CREATE TABLE TBL_ReportRoleUserMap 
(
   ReportRoleId INT NOT NULL,
   UserId INT NOT NULL
);


SELECT N'TBL_ReportUserMap...';


DROP TABLE IF EXISTS TBL_ReportUserMap;

CREATE TABLE TBL_ReportUserMap 
(
   ReportId INT,
   UserId INT
);




DROP TABLE IF EXISTS TBL_StandardDic;

CREATE TABLE TBL_StandardDic
(
   StandardDicId INT NOT NULL,
   SignalStandardName NATIONAL VARCHAR(255) NOT NULL,
   SignalStandardId INT NOT NULL,
   EquipmentLogicClass NATIONAL VARCHAR(255) NOT NULL,
   StoreInterval INT,
   AbsValueThreshold FLOAT,
   PercentThreshold FLOAT,
   StandardName NATIONAL VARCHAR(255),
   EventSeverity INT,
   EventLogicClass NATIONAL VARCHAR(255),
   EventClass NATIONAL VARCHAR(255),
   NetManageId NATIONAL VARCHAR(255),
   EquipmentAffect NATIONAL VARCHAR(255),
   BusinessAffect NATIONAL VARCHAR(255),
   CompareValue VARCHAR(128),
   StartDelay VARCHAR(64),
   ControlStandardName NATIONAL VARCHAR(255),
   ControlStandardId INT,
   ControlType INT,
   Unit VARCHAR(128),
   Description VARCHAR(255),
   Meanings VARCHAR(255),
   NodeType INT,
   CONSTRAINT PK_TBL_StandardDic_ID PRIMARY KEY(StandardDicId)
);


SELECT N'TBL_StandardRule...';


DROP TABLE IF EXISTS TBL_StandardRule;

CREATE TABLE TBL_StandardRule 
(
   StandardRuleId INT NOT NULL  AUTO_INCREMENT PRIMARY KEY,
   StandardTemplateId INT NOT NULL,
   SignalName NATIONAL VARCHAR(128),
   EventName NATIONAL VARCHAR(128),
   Expression NATIONAL VARCHAR(128),
   Meanings NATIONAL VARCHAR(128),
   ControlName NATIONAL VARCHAR(128),
   StandardDicId INT
);


SELECT N'TBL_StandardTemplate...';


DROP TABLE IF EXISTS TBL_StandardTemplate;

CREATE TABLE TBL_StandardTemplate 
(
   StandardTemplateId INT NOT NULL,
   StandardTemplateName VARCHAR(255) NOT NULL,
   StationCategory INT NOT NULL,
   EquipmentCategory INT NOT NULL,
   Vendor NATIONAL VARCHAR(255) NOT NULL,
   EquipmentModel NATIONAL VARCHAR(255) NOT NULL,
   MonitorModule NATIONAL VARCHAR(255)
);


SELECT N'TBL_StandardTemplateMap...';


DROP TABLE IF EXISTS TBL_StandardTemplateMap;

CREATE TABLE TBL_StandardTemplateMap 
(
   EquipmentTemplateId INT NOT NULL,
   StationCategory INT NOT NULL,
   StandardTemplateId INT NOT NULL
);


SELECT N'TBL_StationEomsEx...';


DROP TABLE IF EXISTS TBL_StationEomsEx;

CREATE TABLE TBL_StationEomsEx 
(
   StationId INT NOT NULL,
   EmosStationId INT,
   AddressCodeId NATIONAL VARCHAR(255),
   ExtendField1 NATIONAL VARCHAR(255),
   ExtendField2 NATIONAL VARCHAR(255),
   ExtendField3 NATIONAL VARCHAR(255),
   ExtendField4 NATIONAL VARCHAR(255),
   ExtendField5 NATIONAL VARCHAR(255),
   ExtendField6 NATIONAL VARCHAR(255),
   ExtendField7 NATIONAL VARCHAR(255),
   ExtendField9 NATIONAL VARCHAR(255),
   ExtendField10 NATIONAL VARCHAR(255)
);

SELECT N'TBL_StationEomsEx_ID...';

ALTER TABLE TBL_StationEomsEx
ADD CONSTRAINT PK_TBL_StationEomsEx_ID PRIMARY KEY(StationId); 

SELECT N'TBL_StationEomsEx.TBL_StationEomsEx_IDX1...';

CREATE INDEX TBL_StationEomsEx_IDX1
ON TBL_StationEomsEx
(StationId ASC, 
EmosStationId ASC); 


SELECT N'TBL_StationSwatchMap...';


DROP TABLE IF EXISTS TBL_StationSwatchMap;

CREATE TABLE TBL_StationSwatchMap 
(
   SwatchStationId INT NOT NULL,
   StationId INT NOT NULL
);


SELECT N'TBL_StationVendorMap...';


DROP TABLE IF EXISTS TBL_StationVendorMap;

CREATE TABLE TBL_StationVendorMap 
(
   StationId INT NOT NULL,
   VendorName NATIONAL VARCHAR(50) NOT NULL
);

SELECT N'TBL_StationVendorMap_ID...';

ALTER TABLE TBL_StationVendorMap
ADD CONSTRAINT PK_TBL_StationVendorMap_ID PRIMARY KEY(StationId,VendorName); 


SELECT N'TBL_SuitReport...';


DROP TABLE IF EXISTS TBL_SuitReport;

CREATE TABLE TBL_SuitReport 
(
   SuitReportId INT NOT NULL,
   SuitReportName NATIONAL VARCHAR(255) NOT NULL,
   Description NATIONAL VARCHAR(255),
   CreateUserId INT,
   CreateUserName NATIONAL VARCHAR(255),
   CreateTime DATETIME,
   UpdateUserId INT,
   UpdateUserName NATIONAL VARCHAR(255),
   UpdateTime DATETIME
);


SELECT N'TBL_SuitReportMap...';


DROP TABLE IF EXISTS TBL_SuitReportMap;

CREATE TABLE TBL_SuitReportMap 
(
   SuitReportId INT NOT NULL,
   ReportId INT NOT NULL
);


SELECT N'TBL_SuitReportRoleMap...';


DROP TABLE IF EXISTS TBL_SuitReportRoleMap;

CREATE TABLE TBL_SuitReportRoleMap 
(
   SuitReportId INT NOT NULL,
   ReportRoleId INT NOT NULL
);


SELECT N'TBL_SwatchStation...';


DROP TABLE IF EXISTS TBL_SwatchStation;

CREATE TABLE TBL_SwatchStation 
(
   SwatchStationId INT NOT NULL  AUTO_INCREMENT PRIMARY KEY,
   SwatchStationName NATIONAL VARCHAR(128) NOT NULL,
   StationId INT NOT NULL,
   CreateTime DATETIME NOT NULL,
   Description NATIONAL VARCHAR(255)
);


SELECT N'TBL_UserHomePageMap...';


DROP TABLE IF EXISTS TBL_UserHomePageMap;

CREATE TABLE TBL_UserHomePageMap 
(
   PageId INT NOT NULL,
   UserId INT NOT NULL
);

SELECT N'TBL_UserHomePageMap_ID...';

ALTER TABLE TBL_UserHomePageMap
ADD CONSTRAINT PK_TBL_UserHomePageMap_ID PRIMARY KEY(UserId,PageId); 


ALTER TABLE EventFilterCondition 
ADD CONSTRAINT FK_FilterCondition_Event_ID FOREIGN KEY(EventFilterId) REFERENCES EventFilter(EventFilterId); 


ALTER TABLE EventFilterMap 
ADD CONSTRAINT FK_FilterMap_Member_ID FOREIGN KEY(EventFilterMemberId) REFERENCES EventFilterMember(EventFilterMemberId); 


ALTER TABLE EventFilterMap 
ADD CONSTRAINT FK_FilterRule_Member_ID FOREIGN KEY(EventFilterId) REFERENCES EventFilter(EventFilterId); 


ALTER TABLE NotifyReceiver 
ADD CONSTRAINT FK_NotifyReceiver_Mode_ID FOREIGN KEY(NotifyReceiverCategory) REFERENCES NotifyMode(NotifyModeId); 


ALTER TABLE NotifyServer 
ADD CONSTRAINT FK_NotifyServer_ID FOREIGN KEY(NotifyServerCategory) REFERENCES NotifyMode(NotifyModeId); 

DROP TABLE IF EXISTS TBL_EquipmentBaseType;


CREATE TABLE TBL_EquipmentBaseType
(
   BaseEquipmentId INT NOT NULL,
   BaseEquipmentName NATIONAL VARCHAR(128),
   EquipmentTypeId INT NOT NULL,
   EquipmentSubTypeId INT NOT NULL,
   Description NATIONAL VARCHAR(256),
   CONSTRAINT PK_TBL_EquipmentBaseType_ID PRIMARY KEY(BaseEquipmentId)
);


DROP TABLE IF EXISTS TBL_CommandBaseDic;

CREATE TABLE TBL_CommandBaseDic 
(
   BaseTypeId NUMERIC(10,0) NOT NULL,
   BaseTypeName NATIONAL VARCHAR(128) NOT NULL,
   BaseEquipmentId INT NOT NULL,
   EnglishName NATIONAL VARCHAR(256),
   BaseLogicCategoryId INT,
   CommandType INT NOT NULL,
   BaseStatusId INT,
   ExtendField1 NATIONAL VARCHAR(256),
   ExtendField2 NATIONAL VARCHAR(256),
   ExtendField3 NATIONAL VARCHAR(256),
   Description NATIONAL VARCHAR(256),
   BaseNameExt NATIONAL VARCHAR(128),
   IsSystem BOOLEAN   NOT NULL  DEFAULT 1
);


ALTER TABLE TBL_CommandBaseDic
ADD CONSTRAINT PK_TBL_CommandBaseDic_ID PRIMARY KEY(BaseTypeId); 


DROP TABLE IF EXISTS TBL_EventBaseDic;

CREATE TABLE TBL_EventBaseDic 
(
   BaseTypeId NUMERIC(10,0) NOT NULL,
   BaseTypeName NATIONAL VARCHAR(128) NOT NULL,
   BaseEquipmentId INT NOT NULL,
   EnglishName NATIONAL VARCHAR(256),
   EventSeverityId INT NOT NULL,
   ComparedValue FLOAT,
   BaseLogicCategoryId INT,
   StartDelay INT,
   EndDelay INT,
   ExtendField1 NATIONAL VARCHAR(256),
   ExtendField2 NATIONAL VARCHAR(256),
   ExtendField3 NATIONAL VARCHAR(256),
   ExtendField4 NATIONAL VARCHAR(256),
   ExtendField5 NATIONAL VARCHAR(256),
   Description NATIONAL VARCHAR(256),
   BaseNameExt NATIONAL VARCHAR(128),
   IsSystem BOOLEAN   NOT NULL  DEFAULT 1
);


ALTER TABLE TBL_EventBaseDic
ADD CONSTRAINT PK_TBL_EventBaseDic_ID PRIMARY KEY(BaseTypeId); 



DROP TABLE IF EXISTS TBL_SignalBaseDic;

CREATE TABLE TBL_SignalBaseDic 
(
   BaseTypeId NUMERIC(10,0) NOT NULL,
   BaseTypeName NATIONAL VARCHAR(128) NOT NULL,
   BaseEquipmentId INT NOT NULL,
   EnglishName NATIONAL VARCHAR(256),
   BaseLogicCategoryId INT,
   StoreInterval INT,
   AbsValueThreshold FLOAT,
   PercentThreshold FLOAT,
   StoreInterval2 INT,
   AbsValueThreshold2 FLOAT,
   PercentThreshold2 FLOAT,
   ExtendField1 NATIONAL VARCHAR(256),
   ExtendField2 NATIONAL VARCHAR(256),
   ExtendField3 NATIONAL VARCHAR(256),
   UnitId INT,
   BaseStatusId INT,
   BaseHysteresis FLOAT,
   BaseFreqPeriod INT,
   BaseFreqCount INT,
   BaseShowPrecision NATIONAL VARCHAR(30),
   BaseStatPeriod INT,
   CGElement NATIONAL VARCHAR(128),
   Description NATIONAL VARCHAR(256),
   BaseNameExt NATIONAL VARCHAR(128),
   IsSystem BOOLEAN   NOT NULL  DEFAULT 1
);

ALTER TABLE TBL_SignalBaseDic
ADD CONSTRAINT PK_TBL_SignalBaseDic_ID PRIMARY KEY(BaseTypeId); 



DROP TABLE IF EXISTS TBL_LogicCategoryBaseDic;

CREATE TABLE TBL_LogicCategoryBaseDic
(
   BaseEquipmentId INT NOT NULL,
   BaseLogicCategoryType INT NOT NULL,
   BaseLogicCategoryId INT NOT NULL,
   BaseLogicCategoryName NATIONAL VARCHAR(128),
   Description NATIONAL VARCHAR(256),
   CONSTRAINT PK_TBL_LogicCategoryBaseDic_ID PRIMARY KEY(BaseLogicCategoryId)
);


DROP TABLE IF EXISTS TBL_StatusBaseDic;

CREATE TABLE TBL_StatusBaseDic
(
   BaseStatusId INT NOT NULL,
   BaseStatusName NATIONAL VARCHAR(128) NOT NULL,
   BaseCondId INT NOT NULL,
   Operator NATIONAL VARCHAR(30),
   `Value` INT,
   Meaning NATIONAL VARCHAR(128),
   Description NATIONAL VARCHAR(256),
   CONSTRAINT PK_TBL_StatusBaseDic_ID PRIMARY KEY(BaseStatusId,BaseCondId)
);



DROP TABLE IF EXISTS TBL_BaseClassDic;

CREATE TABLE TBL_BaseClassDic 
(
   BaseClassId INT NOT NULL,
   BaseClassName NATIONAL VARCHAR(255) NOT NULL,
   BaseClassIcon NATIONAL VARCHAR(255)
);

ALTER TABLE TBL_BaseClassDic
ADD CONSTRAINT PK_TBL_BaseClassDic_ID PRIMARY KEY(BaseClassId); 




DROP TABLE IF EXISTS TBL_BaseUnitDic;

CREATE TABLE TBL_BaseUnitDic 
(
   BaseUnitID INT NOT NULL,
   BaseUnitName NATIONAL VARCHAR(255) NOT NULL,
   BaseUnitSymbol NATIONAL VARCHAR(255) NOT NULL,
   BaseUnitDescription NATIONAL VARCHAR(255)
);


ALTER TABLE TBL_BaseUnitDic
ADD CONSTRAINT PK_TBL_BaseUnitDic_ID PRIMARY KEY(BaseUnitID); 



DROP TABLE IF EXISTS TBL_BaseEquipmentCategoryMap;

CREATE TABLE TBL_BaseEquipmentCategoryMap 
(
   BaseEquipmentID INT NOT NULL,
   EquipmentCategory INT NOT NULL
);

ALTER TABLE TBL_BaseEquipmentCategoryMap
ADD CONSTRAINT PK_BaseEquipCategoryMap_ID PRIMARY KEY(BaseEquipmentID,EquipmentCategory); 



DROP TABLE IF EXISTS TBL_BaseCommandCode;

CREATE TABLE TBL_BaseCommandCode 
(
   CodeId INT NOT NULL,
   Command NATIONAL VARCHAR(255) NOT NULL,
   Description NATIONAL VARCHAR(255)
);

ALTER TABLE TBL_BaseCommandCode
ADD CONSTRAINT PK_TBL_BaseCommandCode_ID PRIMARY KEY(CodeId); 



DROP TABLE IF EXISTS TBL_BaseSignalEventCode;

CREATE TABLE TBL_BaseSignalEventCode 
(
   CodeId INT NOT NULL,
   Category NATIONAL VARCHAR(255) NOT NULL,
   `Signal` NATIONAL VARCHAR(255),
   `Event` NATIONAL VARCHAR(255),
   Description NATIONAL VARCHAR(255)
);

ALTER TABLE TBL_BaseSignalEventCode
ADD CONSTRAINT PK_TBL_BaseSignalEventCode_ID PRIMARY KEY(CodeId); 

	

	
-- TBL_?��
DROP TABLE IF EXISTS TBL_BaseDicVer;

CREATE TABLE TBL_BaseDicVer
(
   HiVer INT NOT NULL,  -- TBL_?����İ汾��
   LoVer INT NOT NULL,  
   Remark       NATIONAL VARCHAR (1000),
   ExtendField1 NATIONAL VARCHAR(1000),
   ExtendField2 NATIONAL VARCHAR(1000),
   CONSTRAINT PK_BaseDicVer PRIMARY KEY(HiVer,LoVer)
);


-- TBL_?�仯��ʷ��
DROP TABLE IF EXISTS TBL_BaseDicVerHistory;


CREATE TABLE TBL_BaseDicVerHistory
(
   Version NATIONAL VARCHAR(255) NOT NULL,   -- TBL_NVARCHAR (1000) NOT NULL,  --�汾�����������ر�ע�Ᵽ���ֶε�ʹ������
   UpdateDate DATETIME NOT NULL,  		-- ����ʱ��
   Editor INT NOT NULL,  		-- TBL_    NVARCHAR (1000) NULL,
   ExtendField2 NATIONAL VARCHAR(1000),
   CONSTRAINT PK_BaseDicVerHistory PRIMARY KEY(Version,UpdateDate)
);


-- TBL_?��
DROP TABLE IF EXISTS TBL_EquipTemplateBaseConfirm;

CREATE TABLE TBL_EquipTemplateBaseConfirm
(
   EquipmentTemplateId INT NOT NULL,
   ConfirmTime DATETIME NOT NULL,
   ConfirmUser INT NOT NULL,
   Reason NATIONAL VARCHAR(1000),
   CONSTRAINT PK_ETForBaseConfirm PRIMARY KEY(EquipmentTemplateId)
);


-- TBL_?��
DROP TABLE IF EXISTS TBL_SignalBaseConfirm;

CREATE TABLE TBL_SignalBaseConfirm
(
   EquipmentTemplateId INT NOT NULL,
   SignalId INT NOT NULL,
   StateValue INT,
   SubState NATIONAL VARCHAR(16)
);


-- TBL_?��
DROP TABLE IF EXISTS TBL_ControlBaseConfirm;

CREATE TABLE TBL_ControlBaseConfirm
(
   EquipmentTemplateId INT NOT NULL,
   ControlId INT NOT NULL,
   ParameterValue INT,
   SubState NATIONAL VARCHAR(16)
);


-- TBL_?��
DROP TABLE IF EXISTS TBL_EventBaseConfirm;

CREATE TABLE TBL_EventBaseConfirm
(
   EquipmentTemplateId INT NOT NULL,
   EventId INT NOT NULL,
   EventConditionId INT NOT NULL,
   SubState NATIONAL VARCHAR(16),
   CONSTRAINT PK_EventBaseConfirm PRIMARY KEY(EquipmentTemplateId,EventId,EventConditionId)
);



DROP TABLE IF EXISTS TBL_OriginBussinessCategoryMap;

CREATE TABLE TBL_OriginBussinessCategoryMap
(
   EquipmentTemplateId INT NOT NULL,
   OriginCategory INT NOT NULL,
   CONSTRAINT PK_OriginBussinessCategoryMap PRIMARY KEY(EquipmentTemplateId)
);



-- TBL_OBJECT_ID ('dbo.TBL_BusinessType') IS NOT NULL
DROP TABLE IF EXISTS TBL_BusinessType;


CREATE TABLE TBL_BusinessType
(
   BusinessTypeId INT NOT NULL,-- ҵ������Id
   BusinessTypeName NATIONAL VARCHAR(255) NOT NULL,-- ҵ����������
   MiddleTableName NATIONAL VARCHAR(255),
   Note   NATIONAL VARCHAR(1024),-- ��ע������ҵ�����������ݵ���Ϣ
   CONSTRAINT PK_TBL_BusinessType_ID PRIMARY KEY(BusinessTypeId)
);


-- ҵ������״̬��
DROP TABLE IF EXISTS TBL_BusinessTypeStatus;

CREATE TABLE TBL_BusinessTypeStatus
(
   StationId INT NOT NULL,-- ��վId
   BusinessTypeId INT NOT NULL,-- ҵ������Id	
   ExpressionId INT NOT NULL,-- ҵ����ʽId
   SerialId INT NOT NULL,--  ?��ʵ������Id
   BusinessState INT NOT NULL,--   	
	StartTime  	DATETIME NOT NULL,
   EndTime    	DATETIME NULL,
   GroupId    	INT NULL
   /*CONSTRAINT PK_TBL_BusinessTypeStatus_ID PRIMARY KEY(StationId,BusinessTypeId,ExpressionId,SerialId,BusinessState,StartTime)*/
);


DROP TABLE IF EXISTS TBL_BusinessExpressionCfg;

CREATE TABLE TBL_BusinessExpressionCfg
(
   BusinessTypeId INT NOT NULL,-- ҵ������Id
   ExpressionId INT NOT NULL,-- ҵ�����ͱ��ʽId
   StationId INT NOT NULL,--  
   MonitorUnitId INT NOT NULL,-- �ɼ���Id	
   ExpressionName NATIONAL VARCHAR(255),
	Expression  NATIONAL VARCHAR(1024),
	SuppressExpression  NATIONAL VARCHAR(1024) NULL,
	StateTriggerValue	INT DEFAULT 1,
	BeforeChgStoreInterval FLOAT NULL,
		AfterChgStoreInterval FLOAT NULL,
		Note  NVARCHAR (1024) NULL
	/*CONSTRAINT PK_TBL_BusinessExpCfg_ID PRIMARY KEY (BusinessTypeId,ExpressionId)*/
);


--  OBJECT_ID ('dbo.TBL_BizExpSignalsCfg') IS NOT NULL
DROP TABLE IF EXISTS TBL_BizExpSignalsCfg;

CREATE TABLE TBL_BizExpSignalsCfg
(
   BusinessTypeId INT NOT NULL,-- ҵ������Id
   ExpressionId INT NOT NULL,-- ���ʽId
   AssociationId INT NOT NULL,-- ����Id
   StationId INT NOT NULL,-- ��վId
   EquipmentId INT NOT NULL,-- �豸Id
   SignalId INT NOT NULL,-- �ź�Id	
   MonitorUnitId INT NOT NULL,-- �ɼ���Id	
   StoreInterval FLOAT,-- �洢����
   AbsValueThreshold FLOAT--  PK_TBL_BizExpSignalsCfg_ID PRIMARY KEY (BusinessTypeId, ExpressionId, StationId,EquipmentId,SignalId)
);


--  ??ģ���վʵ�����ñ�
--  OBJECT_ID ('dbo.TBL_BizExpStationsMap') IS NOT NULL
DROP TABLE IF EXISTS TBL_BizExpStationsMap;

CREATE TABLE TBL_BizExpStationsMap
(
	BusinessTypeId INT NOT NULL,
	ExpressionId INT NOT NULL,
	StationId INT NOT NULL,
	MonitorUnitId INT NOT NULL,	
	SerialId  INT NOT NULL,
	Expression  NVARCHAR (1024) NULL,
	SuppressExpression  NVARCHAR (1024) NULL,
	StateTriggerValue	INT DEFAULT 1,
	BeforeChgStoreInterval FLOAT NULL,
	AfterChgStoreInterval FLOAT NULL,
	ErrorFlag	INT		NULL,
	Note  NVARCHAR (1024) NULL
/*CONSTRAINT PK_TBL_BizExpStationsMap_ID PRIMARY KEY (BusinessTypeId,ExpressionId,StationId,MonitorUnitId,SerialId)*/
);

--  ??�����ź�ģ���վʵ�����ñ�
DROP TABLE IF EXISTS TBL_BizExpEquSignalsMap;

CREATE TABLE TBL_BizExpEquSignalsMap
(
   BusinessTypeId INT NOT NULL,-- ҵ������Id
   ExpressionId INT NOT NULL,-- ���ʽId
   AssociationId INT NOT NULL,-- ����Id
   StationId INT NOT NULL,--  ?�ľ�վId
   MonitorUnitId INT NOT NULL,-- �ɼ���Id	
   SerialId INT NOT NULL,--  
   EquipmentId INT NOT NULL,-- �豸Id
   SignalId INT NOT NULL,-- �ź�Id	
   StoreInterval FLOAT,-- �洢����
   AbsValueThreshold FLOAT--  PK_TBL_BizExpEquSignalsMap_ID PRIMARY KEY (StationId,BusinessTypeId,ExpressionId,SerialId,MonitorUnitId,EquipmentId,SignalId)
);



--  ?̬��?\?
DROP TABLE IF EXISTS TBL_MiddleTbl;

CREATE TABLE TBL_MiddleTbl
(
   BusinessTypeId INT NOT NULL,-- ҵ������Id
   ExpressionId INT NOT NULL,-- ҵ�����ͱ��ʽId
   SerialId INT NOT NULL,--  ??��Id
   BusinessTypeName NATIONAL VARCHAR(255) NOT NULL,
   ExpressionName NATIONAL VARCHAR(255) NOT NULL,
   StationId INT NOT NULL,
   StationName NATIONAL VARCHAR(255) NOT NULL,
   EquipmentId INT NOT NULL,
   EquipmentName NATIONAL VARCHAR(128) NOT NULL,
   SignalId INT NOT NULL,
   SignalName NATIONAL VARCHAR(128) NOT NULL,
   SignalCategory INT NOT NULL,
   DataType INT NOT NULL,
   FloatValue FLOAT,
   StringValue NATIONAL VARCHAR(128),
   DateTimeValue DATETIME,
   SampleTime DATETIME NOT NULL,
   ShowPrecision NATIONAL VARCHAR(20),
   Unit NATIONAL VARCHAR(64),
   BaseTypeId NUMERIC(10,0),
   BaseTypeName NATIONAL VARCHAR(128),
   EventSeverity INT,
   EventSeverityName NATIONAL VARCHAR(128),
   Meanings NATIONAL VARCHAR(255),
   ThresholdType INT,
   BusinessState INT,
   BaseCondId NUMERIC (10) NULL,
   BaseMeaning NATIONAL VARCHAR(255)
);

CREATE UNIQUE INDEX TBL_MiddleTbl_IDX1
ON TBL_MiddleTbl  
(ExpressionId,
SampleTime,
StationId,
EquipmentId,
SignalId);

CREATE  INDEX TBL_MiddleTbl_IDX2
ON TBL_MiddleTbl  
(BusinessTypeId,
ExpressionId,
StationId,
EquipmentId,
SignalId,
SampleTime,
FloatValue);


--  OBJECT_ID ('dbo.TBL_HistoryEngine') IS NOT NULL
DROP TABLE IF EXISTS TBL_HistoryEngine;

CREATE TABLE TBL_HistoryEngine 
(
   StationId INT NOT NULL,
   StationName NATIONAL VARCHAR(255) NOT NULL,
   EquipmentId INT NOT NULL,
   EquipmentName NATIONAL VARCHAR(128) NOT NULL,
   SignalId INT NOT NULL,
   SignalName NATIONAL VARCHAR(128) NOT NULL,
   SignalCategory INT NOT NULL,
   FloatValue FLOAT,
   SampleTime DATETIME NOT NULL,
   ShowPrecision NATIONAL VARCHAR(20),
   Unit NATIONAL VARCHAR(64),
   BaseTypeId NUMERIC(10,0),
   BaseTypeName NATIONAL VARCHAR(128),
   EventSeverity INT,
   EventSeverityName NATIONAL VARCHAR(128),
   Meanings NATIONAL VARCHAR(255),
   ThresholdType INT,
   EquipmentState INT,
   BaseCondId NUMERIC(10,0),
   BaseMeaning NATIONAL VARCHAR(255)
);



SELECT N'TBL_HistoryEngine.TBL_HistoryEngine_IDX1...';



CREATE UNIQUE INDEX TBL_HistoryEngine_IDX1
ON TBL_HistoryEngine
(SampleTime DESC, 
StationId ASC, 
EquipmentId ASC, 
SignalId ASC); 


SELECT N'TBL_HistoryEngine.TBL_HistoryBattery1_IDX2...';



CREATE INDEX TBL_HistoryEngine_IDX2
ON TBL_HistoryEngine
(StationId ASC, 
EquipmentId ASC, 
SignalId ASC, 
SampleTime DESC, 
FloatValue ASC); 


SELECT N'TBL_BizBaseTypeId...';


DROP TABLE IF EXISTS TBL_BizBaseTypeId;


CREATE TABLE TBL_BizBaseTypeId
(
BusinessTypeId    INT NOT NULL,  
BaseTypeId        INT NOT NULL,
StoreInterval     FLOAT NULL,
AbsValueThreshold FLOAT NULL
/*CONSTRAINT PK_TBL_BizBaseTypeId_ID PRIMARY KEY (BusinessTypeId, BaseTypeId)*/
);





DROP TABLE IF EXISTS TBL_StationBaseMap;


CREATE TABLE TBL_StationBaseMap
(
	StationBaseType INT NOT NULL,
	StationCategory INT NOT NULL,
	StandardType		INT NOT NULL
	/*CONSTRAINT PK_TBL_StationBaseMap_ID PRIMARY KEY (StationBaseType,StationCategory, StandardType)*/
);



/*      TBL_StandardType
Comments:       �ͻ���׼�����ͱ�

Author              Date             Comment       CODE[YYYYMMDD]
-------------------------------------------------------------------------------------------------------------
w93718              2014-03-21       Created
*************************************************************************************************************/
DROP TABLE IF EXISTS TBL_StandardType;


CREATE TABLE TBL_StandardType
(
   StandardId INT PRIMARY KEY,
   StandardName NATIONAL VARCHAR(255) NOT NULL,
   StandardAlias NATIONAL VARCHAR(255) NOT NULL,
   Remark NATIONAL VARCHAR(255)
);



/*      TBL_SignalBaseMap
Comments:       �źŻ����׼��������

Author              Date             Comment       CODE[YYYYMMDD]
-------------------------------------------------------------------------------------------------------------
w93718              2014-03-07       Created
*************************************************************************************************************/
DROP TABLE IF EXISTS TBL_SignalBaseMap;


CREATE TABLE TBL_SignalBaseMap
(
   StandardDicId INT NOT NULL,
   StandardType INT NOT NULL,
   StationBaseType INT NOT NULL,
   BaseTypeId NUMERIC(10,0) NOT NULL,
   CONSTRAINT PK_TBL_SignalBaseMap_ID PRIMARY KEY(StandardDicId,StandardType,StationBaseType,BaseTypeId)
);


/*     TBL_EventBaseMap
Comments:       �¼������׼��������

Author              Date             Comment       CODE[YYYYMMDD]
-------------------------------------------------------------------------------------------------------------
w93718              2014-03-07       Created
*************************************************************************************************************/
DROP TABLE IF EXISTS TBL_EventBaseMap;


CREATE TABLE TBL_EventBaseMap
(
   StandardDicId INT NOT NULL,
   StandardType INT NOT NULL,
   StationBaseType INT NOT NULL,
   BaseTypeId NUMERIC(10,0) NOT NULL,
   CONSTRAINT PK_TBL_EventBaseMap_ID PRIMARY KEY(StandardDicId,StandardType,StationBaseType,BaseTypeId)
);


/*     TBL_CommandBaseMap
Comments:       ���ƻ����׼��������

Author              Date             Comment       CODE[YYYYMMDD]
-------------------------------------------------------------------------------------------------------------
w93718              2014-03-07       Created
*************************************************************************************************************/
DROP TABLE IF EXISTS TBL_CommandBaseMap;


CREATE TABLE TBL_CommandBaseMap
(
   StandardDicId INT NOT NULL,
   StandardType INT NOT NULL,
   StationBaseType INT NOT NULL,
   BaseTypeId NUMERIC(10,0) NOT NULL,
   CONSTRAINT PK_TBL_CommandBaseMap_ID PRIMARY KEY(StandardDicId,StandardType,StationBaseType,BaseTypeId)
);



/*     TBL_WriteBackEntry
Comments:       �����׼�����д�ֶ���Ŀ

Author              Date             Comment       CODE[YYYYMMDD]
-------------------------------------------------------------------------------------------------------------
w93718              2014-03-12       Created
*************************************************************************************************************/

SELECT N'TBL_WriteBackEntry...';



DROP TABLE IF EXISTS TBL_WriteBackEntry;

CREATE TABLE TBL_WriteBackEntry 
(
   EntryId INT NOT NULL,
   EntryCategory INT,
   EntryName NATIONAL VARCHAR(128),
   EntryTitle NATIONAL VARCHAR(128),
   EntryAlias NATIONAL VARCHAR(255),
   Enable BOOLEAN   NOT NULL  DEFAULT 1,
   Description NATIONAL VARCHAR(255)
);



SELECT N'TBL_WriteBackEntry_ID...';



ALTER TABLE TBL_WriteBackEntry
ADD CONSTRAINT PK_TBL_WriteBackEntry_ID PRIMARY KEY(EntryId); 


/*     TBL_StandardBack
Comments:       ��׼�����ݱ�

Author              Date             Comment       CODE[YYYYMMDD]
-------------------------------------------------------------------------------------------------------------
w93718              2014-03-20       Created
*************************************************************************************************************/
SELECT N'TBL_StandardBack...';


DROP TABLE IF EXISTS TBL_StandardBack;

CREATE TABLE TBL_StandardBack 
(
   EntryCategory INT NOT NULL,
   EquipmentTemplateId INT NOT NULL,
   EntryId INT NOT NULL,
   EventConditionId INT NOT NULL,
    
   SignalName NATIONAL VARCHAR(128),
   StoreInterval FLOAT,
   AbsValueThreshold FLOAT,
   PercentThreshold FLOAT,
    
   EventName NATIONAL VARCHAR(128),
   EventSeverity INT,
   StartCompareValue FLOAT,
   StartDelay INT,
   StandardName INT,
   Meanings VARCHAR(255),
    
   ControlName NATIONAL VARCHAR(128)
);


SELECT N'TBL_StandardBack_ID...';


ALTER TABLE TBL_StandardBack
ADD CONSTRAINT PK_TBL_StandardBack_ID PRIMARY KEY(EntryCategory,EquipmentTemplateId,EntryId,EventConditionId); 



/*     TBL_StationBaseType
Comments:       ��վ�����

Author              Date             Comment       CODE[YYYYMMDD]
-------------------------------------------------------------------------------------------------------------
w93718              2013-03-21       Modified
*************************************************************************************************************/		
DROP TABLE IF EXISTS TBL_StationBaseType;


CREATE TABLE TBL_StationBaseType
(
   Id INT NOT NULL,
   StandardId INT NOT NULL,
   Type VARCHAR(128)
	
);

SELECT N'TBL_StationBaseType_ID...';


ALTER TABLE TBL_StationBaseType
ADD CONSTRAINT PK_TBL_StationBaseType_ID PRIMARY KEY(StandardId,Id); 



/*     TBL_StandardDicSig
Comments:       �źű�׼����

Author              Date             Comment       CODE[YYYYMMDD]
-------------------------------------------------------------------------------------------------------------
w93718              2013-03-22       Modified
*************************************************************************************************************/		
DROP TABLE IF EXISTS TBL_StandardDicSig;


CREATE TABLE TBL_StandardDicSig
(
   StandardDicId INT NOT NULL,
   StandardType INT NOT NULL,
   EquipmentLogicClassId INT NOT NULL,
   EquipmentLogicClass VARCHAR(128) NOT NULL,
   SignalLogicClassId INT,
   SignalLogicClass VARCHAR(128),
   SignalStandardName VARCHAR(255) NOT NULL,
   NetManageId VARCHAR(255),
   StoreInterval INT,
   AbsValueThreshold FLOAT,
   StatisticsPeriod INT,
   PercentThreshold FLOAT,
   StationCategory INT NOT NULL,
   ModifyType INT,
   Description VARCHAR(255),
   ExtendFiled1 VARCHAR(255),
   ExtendFiled2 VARCHAR(255)
);

SELECT N'TBL_StandardDicSig_ID...';


ALTER TABLE TBL_StandardDicSig
ADD CONSTRAINT PK_TBL_StandardDicSig_ID PRIMARY KEY(StandardDicId,StandardType,StationCategory); 




/*     TBL_StandardDicEvent
Comments:       �¼���׼����

Author              Date             Comment       CODE[YYYYMMDD]
-------------------------------------------------------------------------------------------------------------
w93718              2013-03-22       Modified
*************************************************************************************************************/		
DROP TABLE IF EXISTS TBL_StandardDicEvent;


CREATE TABLE TBL_StandardDicEvent
(
   StandardDicId INT NOT NULL,
   StandardType INT NOT NULL,
   EquipmentLogicClassId INT NOT NULL,
   EquipmentLogicClass VARCHAR(128) NOT NULL,
   EventLogicClassId INT,
   EventLogicClass VARCHAR(128),
   EventClass NATIONAL VARCHAR(255),
   EventStandardName NATIONAL VARCHAR(255),
   NetManageId NATIONAL VARCHAR(255),
   EventSeverity INT,
   CompareValue VARCHAR(128),
   StartDelay VARCHAR(64),
   Meanings VARCHAR(255),
   EquipmentAffect NATIONAL VARCHAR(255),
   BusinessAffect NATIONAL VARCHAR(255),
   StationCategory INT NOT NULL,
   ModifyType INT,
   Description VARCHAR(255),
   ExtendFiled1 VARCHAR(255),
   ExtendFiled2 VARCHAR(255)
);

SELECT N'TBL_StandardDicEvent_ID...';


ALTER TABLE TBL_StandardDicEvent
ADD CONSTRAINT PK_TBL_StandardDicEvent_ID PRIMARY KEY(StandardDicId,StandardType,StationCategory); 




/*     TBL_StandardDicControl
Comments:       ���Ʊ�׼����

Author              Date             Comment       CODE[YYYYMMDD]
-------------------------------------------------------------------------------------------------------------
w93718              2013-03-22       Modified
*************************************************************************************************************/		
DROP TABLE IF EXISTS TBL_StandardDicControl;


CREATE TABLE TBL_StandardDicControl
(
   StandardDicId INT NOT NULL,
   StandardType INT NOT NULL,
   EquipmentLogicClassId INT NOT NULL,
   EquipmentLogicClass VARCHAR(128) NOT NULL,
   ControlLogicClassId INT,
   ControlLogicClass VARCHAR(128),
   ControlStandardName NATIONAL VARCHAR(255),
   NetManageId NATIONAL VARCHAR(255),
   StationCategory INT NOT NULL,
   ModifyType INT,
   Description VARCHAR(255),
   ExtendFiled1 VARCHAR(255),
   ExtendFiled2 VARCHAR(255)
);

SELECT N'TBL_StandardDicControl_ID...';


ALTER TABLE TBL_StandardDicControl
ADD CONSTRAINT PK_TBL_StandardDicControl_ID PRIMARY KEY(StandardDicId,StandardType,StationCategory); 


/*     TBL_LogicClassEntry
Comments:       �����׼�����д�ֶ���Ŀ

Author              Date             Comment       CODE[YYYYMMDD]
-------------------------------------------------------------------------------------------------------------
w93718              2014-04-01       Created
*************************************************************************************************************/

SELECT N'TBL_LogicClassEntry...';



DROP TABLE IF EXISTS TBL_LogicClassEntry;

CREATE TABLE TBL_LogicClassEntry 
(
   EntryId INT NOT NULL,
   EntryCategory INT,
   LogicClassId INT,
   LogicClass NATIONAL VARCHAR(128),
   StandardType INT NOT NULL,
   Description NATIONAL VARCHAR(255)
);



SELECT N'TBL_LogicClassEntry_ID...';



ALTER TABLE TBL_LogicClassEntry
ADD CONSTRAINT PK_TBL_LogicClassEntry_ID PRIMARY KEY(EntryId,StandardType); 


/*     TBL_BaseEquipmentMap
Comments:       �������ƶ����ظ澯��׼��?\?
Author              Date             Comment       CODE[YYYYMMDD]
-------------------------------------------------------------------------------------------------------------
z92678              2014-07-08       Created
*************************************************************************************************************/
SELECT N'TBL_BaseEquipmentMap...';


DROP TABLE IF EXISTS TBL_BaseEquipmentMap;


CREATE TABLE TBL_BaseEquipmentMap
(
   StandardType INT NOT NULL,
   StandardDicId INT NOT NULL,
   StationBaseType INT NOT NULL,
   EquipmentBaseType INT NOT NULL,
   CONSTRAINT PK_TBL_BaseEquipmentMap_ID PRIMARY KEY(StandardType,StationBaseType,EquipmentBaseType,StandardDicId)
);



-- ����KPIҳ��
DROP TABLE IF EXISTS TBL_KPIPage; 

create table TBL_KPIPage 
(
   KPIPageId INT not null,
   UserId INT not null,
   `Name` NATIONAL VARCHAR(128) not null,
   Type INT not null,
   FileName NATIONAL VARCHAR(128) not null,
   FileDir NATIONAL VARCHAR(150),
   CreateTime DATETIME not null,
   ModifyTime DATETIME,
   Description NATIONAL VARCHAR(200),
   ThumbImage NATIONAL VARCHAR(200),
   constraint PK_TBL_KPIPAGE primary key(KPIPageId)
);
 
 

--  OBJECT_ID ('dbo.TBL_KPIPageUserRelate') IS NOT NULL
DROP TABLE IF EXISTS TBL_KPIPageUserRelate; 

create table TBL_KPIPageUserRelate
(
   UserId INT not null,
   KPIPageId INT not null
   /*constraint PK_TBL_KPIPAGEUSERRELATE primary key(UserId)*/
);




/*     TBL_ResourceStation
Comments:       ��Դ�����վ��Ϣ��

Author              Date             Comment       CODE[YYYYMMDD]
-------------------------------------------------------------------------------------------------------------
w93718              2015-02-04       Created
*************************************************************************************************************/
DROP TABLE IF EXISTS TBL_ResourceStation;


CREATE TABLE TBL_ResourceStation
(	
   StationId INT NOT NULL,
   StationName NATIONAL VARCHAR(255),
   StationAddress NATIONAL VARCHAR(255),
   Description NATIONAL VARCHAR(255),
   ExtendField1 NATIONAL VARCHAR(255),
   ExtendField2 NATIONAL VARCHAR(255),
   IsConfig INT,
   CONSTRAINT PK_TBL_ResourceStation_ID PRIMARY KEY(StationId)
);



/*     TBL_ResourceHouse
Comments:       ��Դ��������Ϣ?\?
Author              Date             Comment       CODE[YYYYMMDD]
-------------------------------------------------------------------------------------------------------------
w93718              2015-02-04       Created
*************************************************************************************************************/
DROP TABLE IF EXISTS TBL_ResourceHouse;


CREATE TABLE TBL_ResourceHouse
(	
   StationId INT NOT NULL,
   StationName NATIONAL VARCHAR(255),
   HouseId INT NOT NULL,
   HouseName NATIONAL VARCHAR(255),
   HouseNo NUMERIC(16,0),
   SystemNo NUMERIC(16,0),
   Description NATIONAL VARCHAR(255),
   ExtendField1 NATIONAL VARCHAR(255),
   ExtendField2 NATIONAL VARCHAR(255),
   IsConfig INT,
   CONSTRAINT PK_TBL_ResourceHouse_ID PRIMARY KEY(StationId,HouseId)
);



/*     TBL_ResourceEquipment
Comments:       ��Դ�����豸��Ϣ?\?
Author              Date             Comment       CODE[YYYYMMDD]
-------------------------------------------------------------------------------------------------------------
w93718              2015-02-04       Created
*************************************************************************************************************/
DROP TABLE IF EXISTS TBL_ResourceEquipment;


CREATE TABLE TBL_ResourceEquipment
(	
   StationId INT NOT NULL,
   StationName NATIONAL VARCHAR(255),
   EquipmentId INT NOT NULL,
   EquipmentName NATIONAL VARCHAR(255),
   SystemType NATIONAL VARCHAR(255),
   SystemId NATIONAL VARCHAR(255),
   SensorLocation NATIONAL VARCHAR(255),
   MonitoredEquipmentName NATIONAL VARCHAR(255),
   RateCapacity NATIONAL VARCHAR(255),
   DeviceId NATIONAL VARCHAR(255),
   AssetId NATIONAL VARCHAR(255),
   Description NATIONAL VARCHAR(255),
   ExtendField1 NATIONAL VARCHAR(255),
   ExtendField2 NATIONAL VARCHAR(255),
   IsConfig INT,
   CONSTRAINT PK_TBL_ResourceEquipment_ID PRIMARY KEY(StationId,EquipmentId)
);



/*     TBL_ResourceSignal
Comments:       ��Դ�����ź���Ϣ?\?
Author              Date             Comment       CODE[YYYYMMDD]
-------------------------------------------------------------------------------------------------------------
w93718              2015-02-04       Created
*************************************************************************************************************/
DROP TABLE IF EXISTS TBL_ResourceSignal;


CREATE TABLE TBL_ResourceSignal
(	
   EquipmentTemplateId INT NOT NULL,
   EquipmentTemplateName NATIONAL VARCHAR(255),
   SignalId INT NOT NULL,
   SignalName NATIONAL VARCHAR(255),
   ChannelNo INT,
   ChannelLevel INT,
   Description NATIONAL VARCHAR(255),
   ExtendField1 NATIONAL VARCHAR(255),
   ExtendField2 NATIONAL VARCHAR(255),
   IsConfig INT,
   CONSTRAINT PK_TBL_ResourceSignal_ID PRIMARY KEY(EquipmentTemplateId,SignalId)
);


--  ?��
DROP TABLE IF EXISTS TBL_DDSCardNo; 

CREATE TABLE TBL_DDSCardNo
(
   DoorId INT,
   CardId INT,
   CardNo INT 
);




--  OBJECT_ID ('dbo.TBL_DoorGroup') IS NOT NULL
DROP TABLE IF EXISTS TBL_DoorGroup;

CREATE TABLE TBL_DoorGroup
(
   DoorGroupId INT NOT NULL,
   DoorGroupName NATIONAL VARCHAR(128) NOT NULL,
   LastTime DATETIME,
   CONSTRAINT PK_TBL_DoorGroup_ID PRIMARY KEY(DoorGroupId)
);



--  ?��
DROP TABLE IF EXISTS TBL_DoorGroupMap;

CREATE TABLE TBL_DoorGroupMap
(
   DoorGroupId INT NOT NULL,
   DoorId INT NOT NULL,
   LastTime DATETIME
);



-- �Զ����Ž������
DROP TABLE IF EXISTS TBL_DoorGroup;

CREATE TABLE TBL_DoorGroup
(
   DoorGroupId INT NOT NULL,
   DoorGroupName NATIONAL VARCHAR(128) NOT NULL,
   LastTime DATETIME,
   CONSTRAINT PK_TBL_DoorGroup_ID PRIMARY KEY(DoorGroupId)
);



--  ?��
DROP TABLE IF EXISTS TBL_DoorGroupMap;

CREATE TABLE TBL_DoorGroupMap
(
   DoorGroupId INT NOT NULL,
   DoorId INT NOT NULL,
   LastTime DATETIME
);

drop table if exists tbl_videoequipment;
-- ¼���豸��
CREATE Table tbl_videoequipment(
EquipmentId INT PRIMARY KEY NOT NULL auto_increment, -- �豸ID ����������
StationId INT NOT NULL,	-- ��վ��� 100000003
EquipmentName VARCHAR(50) NOT NULL, -- �豸����
VideoType int not null, -- �豸���ͣ�1Ϊ�����Ƶ��2Ϊ�ط���Ƶ
IpAddress VARCHAR(50) NOT NULL,-- �豸IP��ַ *
Port INT NOT NULL, -- �豸�˿ں� *
ChanNum INT NOT NULL, -- ͨ���ţ�0/1/2�� *
UserName VARCHAR(50) NOT NULL,-- �û���
UserPwd VARCHAR(50) NOT NULL,-- �û�����
AddTime timestamp NOT NULL-- ���ʱ��
) ENGINE = INNODB auto_increment = 10000001;

drop table if exists tbl_camera;
-- ��Ƶ��
create table tbl_camera(
CameraId INT PRIMARY KEY NOT NULL auto_increment,	-- ��ƵID ����������
EquipmentId INT NOT NULL,-- �豸ID
CameraName VARCHAR(50) NOT NULL,-- ��Ƶ����
ChanNum INT NOT NULL,-- ��Ƶͨ����0/1/2��
AddTime timestamp NOT NULL-- ���ʱ��
) ENGINE = INNODB auto_increment = 10000001;

-- ���ݱ� ----------------------------------------------------------------------------
DROP TABLE IF EXISTS TBL_SignalBAK;

CREATE TABLE TBL_SignalBAK 
(
   EquipmentTemplateId INT NOT NULL,
   SignalId INT NOT NULL,
   Enable BOOLEAN NOT NULL,
   Visible BOOLEAN NOT NULL,
   Description NATIONAL VARCHAR(255),
   SignalName NATIONAL VARCHAR(128) NOT NULL,
   SignalCategory INT NOT NULL,
   SignalType INT NOT NULL,
   ChannelNo INT NOT NULL,
   ChannelType INT NOT NULL,
   Expression NATIONAL VARCHAR(1024),
   DataType INT,
   ShowPrecision NATIONAL VARCHAR(20),
   Unit NATIONAL VARCHAR(64),
   StoreInterval FLOAT,
   AbsValueThreshold FLOAT,
   PercentThreshold FLOAT,
   StaticsPeriod INT,
   BaseTypeId NUMERIC(10,0),
   ChargeStoreInterVal FLOAT,
   ChargeAbsValue FLOAT,
   DisplayIndex INT NOT NULL,
   MDBSignalId INT,
   ModuleNo INT   NOT NULL  DEFAULT 0
);

DROP TABLE IF EXISTS TBL_SignalMeaningsBAK;

CREATE TABLE TBL_SignalMeaningsBAK 
(
   EquipmentTemplateId INT NOT NULL,
   SignalId INT NOT NULL,
   StateValue SMALLINT NOT NULL,
   Meanings NATIONAL VARCHAR(255),
   BaseCondId NUMERIC(10,0)
);

DROP TABLE IF EXISTS TBL_SignalPropertyBAK;

CREATE TABLE TBL_SignalPropertyBAK 
(
   EquipmentTemplateId INT NOT NULL,
   SignalId INT NOT NULL,
   SignalPropertyId INT NOT NULL
);

DROP TABLE IF EXISTS TBL_SignalStatisticsBAK;

CREATE TABLE TBL_SignalStatisticsBAK 
(
   StationId INT NOT NULL,
   StationName NATIONAL VARCHAR(255) NOT NULL,
   EquipmentId INT NOT NULL,
   EquipmentName NATIONAL VARCHAR(128) NOT NULL,
   SignalId INT NOT NULL,
   SignalName NATIONAL VARCHAR(128) NOT NULL,
   StatisticsTime DATETIME NOT NULL,
   MinValue FLOAT,
   MinTime DATETIME,
   `MaxValue` FLOAT,
   MaxTime DATETIME,
   AvgValue FLOAT,
   AvgTime DATETIME,
   BaseTypeId NUMERIC(10,0),
   BaseTypeName NATIONAL VARCHAR(128)
);

DROP TABLE IF EXISTS TBL_SignalStatisticsMidBAK;

CREATE TABLE TBL_SignalStatisticsMidBAK 
(
   StationId INT NOT NULL,
   StationName NATIONAL VARCHAR(255) NOT NULL,
   EquipmentId INT NOT NULL,
   EquipmentName NATIONAL VARCHAR(128) NOT NULL,
   SignalId INT NOT NULL,
   SignalName NATIONAL VARCHAR(128) NOT NULL,
   StatisticsTime DATETIME NOT NULL,
   MinValue FLOAT,
   MinTime DATETIME,
   `MaxValue` FLOAT,
   MaxTime DATETIME,
   AvgValue FLOAT,
   AvgTime DATETIME,
   BaseTypeId NUMERIC(10,0),
   BaseTypeName NATIONAL VARCHAR(128)
);

DROP TABLE IF EXISTS TBL_SignalBaseDicBAK;

CREATE TABLE TBL_SignalBaseDicBAK 
(
   BaseTypeId NUMERIC(10,0) NOT NULL,
   BaseTypeName NATIONAL VARCHAR(128) NOT NULL,
   BaseEquipmentId INT NOT NULL,
   EnglishName NATIONAL VARCHAR(256),
   BaseLogicCategoryId INT,
   StoreInterval INT,
   AbsValueThreshold FLOAT,
   PercentThreshold FLOAT,
   StoreInterval2 INT,
   AbsValueThreshold2 FLOAT,
   PercentThreshold2 FLOAT,
   ExtendField1 NATIONAL VARCHAR(256),
   ExtendField2 NATIONAL VARCHAR(256),
   ExtendField3 NATIONAL VARCHAR(256),
   UnitId INT,
   BaseStatusId INT,
   BaseHysteresis FLOAT,
   BaseFreqPeriod INT,
   BaseFreqCount INT,
   BaseShowPrecision NATIONAL VARCHAR(30),
   BaseStatPeriod INT,
   CGElement NATIONAL VARCHAR(128),
   Description NATIONAL VARCHAR(256),
   BaseNameExt NATIONAL VARCHAR(128),
   IsSystem BOOLEAN   NOT NULL  DEFAULT 1
);

DROP TABLE IF EXISTS TBL_SignalBaseConfirmBAK;

CREATE TABLE TBL_SignalBaseConfirmBAK 
(
   EquipmentTemplateId INT NOT NULL,
   SignalId INT NOT NULL,
   StateValue INT,
   SubState NATIONAL VARCHAR(16)
);

DROP TABLE IF EXISTS TBL_SignalBaseMapBAK;

CREATE TABLE TBL_SignalBaseMapBAK 
(
   StandardDicId INT NOT NULL,
   StandardType INT NOT NULL,
   StationBaseType INT NOT NULL,
   BaseTypeId NUMERIC(10,0) NOT NULL,
   CONSTRAINT PK_TBL_SignalBaseMap_ID PRIMARY KEY(StandardDicId,StandardType,StationBaseType,BaseTypeId)
);

DROP TABLE IF EXISTS TBL_EquipmentBAK;

CREATE TABLE TBL_EquipmentBAK 
(
   StationId INT NOT NULL,
   EquipmentId INT NOT NULL,
   EquipmentName NATIONAL VARCHAR(128) NOT NULL,
   EquipmentNo NATIONAL VARCHAR(128) NOT NULL,
   EquipmentModule NATIONAL VARCHAR(128),
   EquipmentStyle NATIONAL VARCHAR(128),
   AssetState INT,
   Price FLOAT,
   UsedLimit FLOAT,
   UsedDate DATETIME,
   BuyDate DATETIME,
   Vendor NATIONAL VARCHAR(255),
   Unit NATIONAL VARCHAR(255),
   EquipmentCategory INT NOT NULL,
   EquipmentType INT NOT NULL,
   EquipmentClass INT,
   EquipmentState INT NOT NULL,
   EventExpression NATIONAL VARCHAR(1024),
   StartDelay FLOAT,
   EndDelay FLOAT,
   Property NATIONAL VARCHAR(255),
   Description NATIONAL VARCHAR(255),
   EquipmentTemplateId INT,
   HouseId INT,
   MonitorUnitId INT NOT NULL,
   WorkStationId INT,
   SamplerUnitId INT NOT NULL,
   DisplayIndex INT NOT NULL,
   ConnectState INT NOT NULL,
   UpdateTime DATETIME NOT NULL,
   ParentEquipmentId NATIONAL VARCHAR(255),
   RatedCapacity NATIONAL VARCHAR(255),
   InstalledModule NATIONAL VARCHAR(1024)   NOT NULL  DEFAULT '0',
   ProjectName NATIONAL VARCHAR(255),
   ContractNo NATIONAL VARCHAR(255),
   InstallTime DATETIME,
   EquipmentSN NATIONAL VARCHAR(255),
   SO NATIONAL VARCHAR(255)
);

DROP TABLE IF EXISTS TBL_EquipmentTemplateBAK;

CREATE TABLE TBL_EquipmentTemplateBAK 
(
   EquipmentTemplateId INT NOT NULL,
   EquipmentTemplateName NATIONAL VARCHAR(128) NOT NULL,
   ParentTemplateId INT NOT NULL,
   Memo NATIONAL VARCHAR(255) NOT NULL,
   ProtocolCode NATIONAL VARCHAR(255) NOT NULL,
   EquipmentCategory INT NOT NULL,
   EquipmentType INT NOT NULL,
   Property NATIONAL VARCHAR(255),
   Description NATIONAL VARCHAR(255),
   EquipmentStyle NATIONAL VARCHAR(128),
   Unit NATIONAL VARCHAR(255),
   Vendor NATIONAL VARCHAR(255),
   EquipmentBaseType INT,
   StationCategory INT
);

DROP TABLE IF EXISTS TBL_EventBAK;

CREATE TABLE TBL_EventBAK 
(
   EquipmentTemplateId INT NOT NULL,
   EventId INT NOT NULL,
   EventName NATIONAL VARCHAR(128) NOT NULL,
   StartType INT NOT NULL,
   EndType INT NOT NULL,
   StartExpression NATIONAL VARCHAR(1024),
   SuppressExpression NATIONAL VARCHAR(1024),
   EventCategory INT NOT NULL,
   SignalId INT,
   Enable BOOLEAN NOT NULL,
   Visible BOOLEAN NOT NULL,
   Description NATIONAL VARCHAR(255),
   DisplayIndex INT,
   ModuleNo INT   NOT NULL  DEFAULT 0
);

DROP TABLE IF EXISTS TBL_EventBaseConfirmBAK;

CREATE TABLE TBL_EventBaseConfirmBAK 
(
   EquipmentTemplateId INT NOT NULL,
   EventId INT NOT NULL,
   EventConditionId INT NOT NULL,
   SubState NATIONAL VARCHAR(16),
   CONSTRAINT PK_EventBaseConfirm PRIMARY KEY(EquipmentTemplateId,EventId,EventConditionId)
);

DROP TABLE IF EXISTS TBL_EventBaseDicBAK;

CREATE TABLE TBL_EventBaseDicBAK 
(
   BaseTypeId NUMERIC(10,0) NOT NULL,
   BaseTypeName NATIONAL VARCHAR(128) NOT NULL,
   BaseEquipmentId INT NOT NULL,
   EnglishName NATIONAL VARCHAR(256),
   EventSeverityId INT NOT NULL,
   ComparedValue FLOAT,
   BaseLogicCategoryId INT,
   StartDelay INT,
   EndDelay INT,
   ExtendField1 NATIONAL VARCHAR(256),
   ExtendField2 NATIONAL VARCHAR(256),
   ExtendField3 NATIONAL VARCHAR(256),
   ExtendField4 NATIONAL VARCHAR(256),
   ExtendField5 NATIONAL VARCHAR(256),
   Description NATIONAL VARCHAR(256),
   BaseNameExt NATIONAL VARCHAR(128),
   IsSystem BOOLEAN   NOT NULL  DEFAULT 1
);

DROP TABLE IF EXISTS TBL_EventBaseMapBAK;

CREATE TABLE TBL_EventBaseMapBAK 
(
   StandardDicId INT NOT NULL,
   StandardType INT NOT NULL,
   StationBaseType INT NOT NULL,
   BaseTypeId NUMERIC(10,0) NOT NULL,
   CONSTRAINT PK_TBL_EventBaseMap_ID PRIMARY KEY(StandardDicId,StandardType,StationBaseType,BaseTypeId)
);

DROP TABLE IF EXISTS TBL_EventConditionBAK;

CREATE TABLE TBL_EventConditionBAK 
(
   EventConditionId INT NOT NULL,
   EquipmentTemplateId INT NOT NULL,
   EventId INT NOT NULL,
   StartOperation NATIONAL VARCHAR(4) NOT NULL,
   StartCompareValue FLOAT NOT NULL,
   StartDelay INT NOT NULL,
   EndOperation NATIONAL VARCHAR(4),
   EndCompareValue FLOAT,
   EndDelay INT,
   Frequency INT,
   FrequencyThreshold INT,
   Meanings NATIONAL VARCHAR(255),
   EquipmentState SMALLINT,
   BaseTypeId NUMERIC(10,0),
   EventSeverity INT NOT NULL,
   StandardName INT
);

DROP TABLE IF EXISTS TBL_EventMaskBAK;

CREATE TABLE TBL_EventMaskBAK 
(
   EquipmentId INT NOT NULL,
   StationId INT NOT NULL,
   EventId INT NOT NULL,
   TimeGroupId INT,
   Reason NATIONAL VARCHAR(255),
   StartTime DATETIME,
   EndTime DATETIME,
   UserId INT
);

DROP TABLE IF EXISTS TBL_EventMaskHistoryBAK;

CREATE TABLE TBL_EventMaskHistoryBAK 
(
   SequenceId NATIONAL VARCHAR(128) NOT NULL,
   StationId INT NOT NULL,
   EquipmentId INT NOT NULL,
   EventId INT NOT NULL,
   EventConditionId INT NOT NULL,
   EventValue FLOAT,
   Meanings NATIONAL VARCHAR(255),
   BaseTypeId NUMERIC(10,0),
   StartTime DATETIME NOT NULL,
   EndTime DATETIME
);

DROP TABLE IF EXISTS TBL_ControlBAK;

CREATE TABLE TBL_ControlBAK 
(
   EquipmentTemplateId INT NOT NULL,
   ControlId INT NOT NULL,
   ControlName NATIONAL VARCHAR(128) NOT NULL,
   ControlCategory INT NOT NULL,
   CmdToken NATIONAL VARCHAR(500) NOT NULL,
   BaseTypeId NUMERIC(10,0),
   ControlSeverity INT NOT NULL,
   SignalId INT,
   TimeOut FLOAT,
   Retry INT,
   Description NATIONAL VARCHAR(255),
   Enable BOOLEAN NOT NULL,
   Visible BOOLEAN NOT NULL,
   DisplayIndex INT NOT NULL,
   CommandType INT NOT NULL,
   ControlType SMALLINT,
   DataType SMALLINT,
   `MaxValue` FLOAT NOT NULL,
   MinValue FLOAT NOT NULL,
   DefaultValue FLOAT,
   ModuleNo INT   NOT NULL  DEFAULT 0
);

DROP TABLE IF EXISTS TBL_ControlBaseConfirmBAK;

CREATE TABLE TBL_ControlBaseConfirmBAK
(
   EquipmentTemplateId INT NOT NULL,
   ControlId INT NOT NULL,
   ParameterValue INT,
   SubState NATIONAL VARCHAR(16)
);

DROP TABLE IF EXISTS TBL_EventLogActionBAK;

CREATE TABLE TBL_EventLogActionBAK 
(
   LogActionId INT NOT NULL,
   ActionName NATIONAL VARCHAR(255) NOT NULL,
   StationId INT NOT NULL,
   MonitorUnitId INT NOT NULL,
   TriggerType INT NOT NULL,
   StartExpression NATIONAL VARCHAR(1024),
   SuppressExpression NATIONAL VARCHAR(1024),
   InformMsg NATIONAL VARCHAR(255),
   Description NATIONAL VARCHAR(255)
);

DROP TABLE IF EXISTS TBL_ControlLogActionBAK;

CREATE TABLE TBL_ControlLogActionBAK 
(
   LogActionId INT NOT NULL,
   ActionId INT NOT NULL,
   ActionName NATIONAL VARCHAR(50),
   EquipmentId INT,
   ControlId INT,
   ActionValue NATIONAL VARCHAR(255)
);

DROP TABLE IF EXISTS TBL_ControlMeaningsBAK;

CREATE TABLE TBL_ControlMeaningsBAK 
(
   EquipmentTemplateId INT NOT NULL,
   ControlId INT NOT NULL,
   ParameterValue SMALLINT NOT NULL,
   Meanings NATIONAL VARCHAR(255),
   BaseCondId NUMERIC(10,0)
);

DROP TABLE IF EXISTS TBL_StationBAK;

CREATE TABLE TBL_StationBAK
(
   StationId INT NOT NULL,
   StationName NATIONAL VARCHAR(255) NOT NULL,
   Latitude NUMERIC(20,17),
   Longitude NUMERIC(20,17),
   SetupTime DATETIME,
   CompanyId INT,
   ConnectState INT   NOT NULL  DEFAULT 2,
   UpdateTime DATETIME NOT NULL,
   StationCategory INT NOT NULL,
   StationGrade INT NOT NULL,
   StationState INT NOT NULL,
   ContactId INT,
   SupportTime INT,
   OnWayTime FLOAT,
   SurplusTime FLOAT,
   FloorNo NATIONAL VARCHAR(50),
   PropList NATIONAL VARCHAR(255),
   Acreage FLOAT,
   BuildingType INT,
   ContainNode BOOLEAN   NOT NULL  DEFAULT 0,
   Description NATIONAL VARCHAR(255),
   BordNumber INT,
   CenterId INT NOT NULL,
   Enable BOOLEAN   NOT NULL  DEFAULT 1,
   StartTime DATETIME,
   EndTime DATETIME,
   ProjectName NATIONAL VARCHAR(255),
   ContractNo NATIONAL VARCHAR(255),
   InstallTime DATETIME
);

DROP TABLE IF EXISTS TSL_SamplerBAK;

CREATE TABLE TSL_SamplerBAK
(
   SamplerId INT NOT NULL,
   SamplerName NATIONAL VARCHAR(128) NOT NULL,
   SamplerType SMALLINT NOT NULL,
   ProtocolCode NATIONAL VARCHAR(255) NOT NULL,
   DLLCode NATIONAL VARCHAR(255) NOT NULL,
   DLLVersion NATIONAL VARCHAR(32) NOT NULL,
   ProtocolFilePath NATIONAL VARCHAR(255) NOT NULL,
   DLLFilePath NATIONAL VARCHAR(255) NOT NULL,
   DllPath NATIONAL VARCHAR(255) NOT NULL,
   Setting NATIONAL VARCHAR(255),
   Description NATIONAL VARCHAR(255),
   SoCode NATIONAL VARCHAR(255) NOT NULL,
   SoPath NATIONAL VARCHAR(255) NOT NULL
);

DROP TABLE IF EXISTS TSL_SamplerUnitBAK;

CREATE TABLE TSL_SamplerUnitBAK
(
   SamplerUnitId INT NOT NULL,
   PortId INT NOT NULL,
   MonitorUnitId INT NOT NULL,
   SamplerId INT NOT NULL,
   ParentSamplerUnitId INT NOT NULL,
   SamplerType INT NOT NULL,
   SamplerUnitName NATIONAL VARCHAR(128) NOT NULL,
   Address INT NOT NULL,
   SpUnitInterval FLOAT,
   DllPath NATIONAL VARCHAR(128),
   ConnectState INT NOT NULL,
   UpdateTime DATETIME NOT NULL,
   PhoneNumber NATIONAL VARCHAR(20),
   Description NATIONAL VARCHAR(255)
);

DROP TABLE IF EXISTS TSL_PortBAK;

CREATE TABLE TSL_PortBAK
(
   PortId INT NOT NULL,
   MonitorUnitId INT NOT NULL,
   PortNo INT NOT NULL,
   PortName NATIONAL VARCHAR(128) NOT NULL,
   PortType INT NOT NULL,
   Setting NATIONAL VARCHAR(255) NOT NULL,
   PhoneNumber NATIONAL VARCHAR(20),
   LinkSamplerUnitId INT,
   Description NATIONAL VARCHAR(255)
);

-- MDC -------------------
DROP TABLE IF EXISTS `mdc`;
CREATE TABLE `mdc` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,					
  `Name` varchar(50) DEFAULT NULL,						
  `Line1PhaseACurrentDeviceId`  int(11) DEFAULT NULL,  	
  `Line1PhaseACurrentSignalId`  int(11) DEFAULT NULL,  	
  `Line1PhaseAVoltageDeviceId`  int(11) DEFAULT NULL,	
  `Line1PhaseAVoltageSignalId`  int(11) DEFAULT NULL,  	
  `Line1PhaseBCurrentDeviceId`  int(11) DEFAULT NULL,  	
  `Line1PhaseBCurrentSignalId`  int(11) DEFAULT NULL,  	
  `Line1PhaseBVoltageDeviceId`  int(11) DEFAULT NULL,  	
  `Line1PhaseBVoltageSignalId`  int(11) DEFAULT NULL,  	
  `Line1PhaseCCurrentDeviceId`  int(11) DEFAULT NULL,  	
  `Line1PhaseCCurrentSignalId`  int(11) DEFAULT NULL,  	
  `Line1PhaseCVoltageDeviceId`  int(11) DEFAULT NULL,  	
  `Line1PhaseCVoltageSignalId`  int(11) DEFAULT NULL,  	
  `Line2PhaseACurrentDeviceId`  int(11) DEFAULT NULL,  	
  `Line2PhaseACurrentSignalId`  int(11) DEFAULT NULL,  	
  `Line2PhaseAVoltageDeviceId`  int(11) DEFAULT NULL,	
  `Line2PhaseAVoltageSignalId`  int(11) DEFAULT NULL,  	
  `Line2PhaseBCurrentDeviceId`  int(11) DEFAULT NULL,  	
  `Line2PhaseBCurrentSignalId`  int(11) DEFAULT NULL,  	
  `Line2PhaseBVoltageDeviceId`  int(11) DEFAULT NULL,  	
  `Line2PhaseBVoltageSignalId`  int(11) DEFAULT NULL,  	
  `Line2PhaseCCurrentDeviceId`  int(11) DEFAULT NULL,  	
  `Line2PhaseCCurrentSignalId`  int(11) DEFAULT NULL,  	
  `Line2PhaseCVoltageDeviceId`  int(11) DEFAULT NULL,  	
  `Line2PhaseCVoltageSignalId`  int(11) DEFAULT NULL,  	
  `PowerConsumptionDeviceId` int(11) DEFAULT NULL,	
  `PowerConsumptionSignalId` int(11) DEFAULT NULL,	
  `CabinetNumber` int(11) DEFAULT NULL,-- ��������
  `CabinetUHeight` int(11) DEFAULT NULL,-- ����U��
  `Type` INT(1) DEFAULT NULL,-- ΢ģ�����ͣ�����0�����ţ�1��˫�ţ�2
  `Description` varchar(100) DEFAULT NULL,				
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `cabinet`;
CREATE TABLE `cabinet` (
  `Id` int(11) NOT NULL,
  `Name` varchar(50) DEFAULT NULL,
  `MDCId` int(11) NOT NULL,
  `CabinetType` varchar(50) DEFAULT NULL,
  `Side` varchar(255) DEFAULT NULL,
  `PhaseACurrentDeviceId`  int(11) DEFAULT NULL,
  `PhaseACurrentSignalId`  int(11) DEFAULT NULL,
  `PhaseAVoltageDeviceId`  int(11) DEFAULT NULL,
  `PhaseAVoltageSignalId`  int(11) DEFAULT NULL,
  `PhaseBCurrentDeviceId`  int(11) DEFAULT NULL,
  `PhaseBCurrentSignalId`  int(11) DEFAULT NULL,
  `PhaseBVoltageDeviceId`  int(11) DEFAULT NULL,
  `PhaseBVoltageSignalId`  int(11) DEFAULT NULL,
  `PhaseCCurrentDeviceId`  int(11) DEFAULT NULL,
  `PhaseCCurrentSignalId`  int(11) DEFAULT NULL,
  `PhaseCVoltageDeviceId`  int(11) DEFAULT NULL,
  `PhaseCVoltageSignalId`  int(11) DEFAULT NULL,
  `RatedVoltage` double DEFAULT NULL,
  `RatedCurrent` double DEFAULT NULL,
  `Description` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


DROP TABLE IF EXISTS `MDC_CabinetDeviceMap`;
CREATE TABLE `MDC_CabinetDeviceMap`(
	`Id` INT NOT NULL AUTO_INCREMENT,
	`CabinetId` INT NOT NULL,										-- ������
	`DeviceName` VARCHAR(100) DEFAULT NULL,			-- �豸����
	`DeviceId` INT DEFAULT NULL,								-- ����豸���
	`UIndex` INT DEFAULT NULL,									-- �豸��ʼUλ
	`UHeight` INT DEFAULT NULL,									-- �豸U��
	`Weight` FLOAT DEFAULT NULL,								-- �豸����
	`Power` FLOAT DEFAULT NULL,									-- �豸�õ���
	`CoolingCapacity` FLOAT DEFAULT NULL,				-- �豸������
	`Description` VARCHAR(255) DEFAULT NULL,
  PRIMARY KEY (`Id`)
)ENGINE=InnoDB AUTO_INCREMENT=100000001 DEFAULT CHARSET=utf8;


DROP TABLE IF EXISTS `cabinet_signal_map`;
CREATE TABLE `cabinet_signal_map`(
  `CabinetId` int(11) DEFAULT NULL,				
  `DeviceId` int(11) DEFAULT NULL,				
  `SignalId` int(11) DEFAULT NULL 					
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `puerecord`;
CREATE TABLE `puerecord` (
  `MDCId` int(11) NOT NULL,						
  `pue` double DEFAULT NULL,					
  `collectTime` datetime DEFAULT NULL			
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `thermal_sensors`;
CREATE TABLE `thermal_sensors` (
  `MDCId` int(11) DEFAULT NULL,			
  `CabinetId` int(11)  DEFAULT NULL,    
  `SlideName` varchar(50) DEFAULT NULL,	
  `DeviceId` int(11) DEFAULT NULL,		
  `SignalId` int(11) DEFAULT NULL,		
  `x` varchar(255) DEFAULT NULL,		
  `y` varchar(255) DEFAULT NULL			
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- Mdc_Environment ΢ģ�黷����
DROP TABLE IF EXISTS `Mdc_Environment`;
CREATE TABLE `Mdc_Environment`(
	`Id` INT(11) NOT NULL,
	`MdcId` INT(11) NOT NULL,
	`Type` VARCHAR(20) NOT NULL,		-- ���ͣ�infrared:���⡢smoke:�̸С�water:ˮ����door:�Ŵš�skyFalling:�촰
	`Site` INT(2) NOT NULL,				-- ���
	`EquipmentId` INT(11) NOT NULL,		-- �豸���
	`SignalId` INT(11) NOT NULL,		-- �źű��
	`Description` VARCHAR(255) DEFAULT NULL,
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ��ͨ����ʪ�ȹ�����
DROP TABLE IF EXISTS `MDC_AisleThermalHumidity`;
CREATE TABLE `MDC_AisleThermalHumidity`(
	`Id` INT(11) NOT NULL,	
	`MDCId` INT(11) DEFAULT NULL,	
	`Site` INT NOT NULL,												-- λ�ã������� 1-3 (�������)
  `TDeviceId` INT(11) DEFAULT NULL,						-- �¶��豸
  `TSignalId` INT(11) DEFAULT NULL,						-- �¶��ź�
  `HDeviceId` INT(11) DEFAULT NULL,						-- ʪ���豸
  `HSignalId` INT(11) DEFAULT NULL,						-- ʪ���ź�
  `Description` VARCHAR(100) DEFAULT NULL,
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


/*
TBL_SyncCenter
Comments:       ����ͬ����ر�

Author              Date             Comment       CODE[YYYYMMDD]
w93718              2014-03-07       Created
*************************************************************************************************************/

SELECT N'TBL_SyncCenter...';

DROP TABLE IF EXISTS TBL_SyncCenter;

CREATE TABLE TBL_SyncCenter
(        
		 CenterId     INT NOT NULL,            		
		 CenterIP 	  NATIONAL VARCHAR(20) NOT NULL,       	
		 CenterPort   INT NOT NULL,            		
		 Enable BOOLEAN NOT NULL DEFAULT 0,			
		 IsNeedSync BOOLEAN NOT NULL DEFAULT 0,		
		 SyncTime	  DATETIME,      			
		 Description  NATIONAL VARCHAR(256),			
		 ExtendField1 NATIONAL VARCHAR(255), 			
         ExtendField2 NATIONAL VARCHAR(255),
		CONSTRAINT PK_TBL_SyncCenter_ID PRIMARY KEY(CenterId, CenterIP, CenterPort)
);


-- 邮件告警表
DROP TABLE IF EXISTS EMailTiming;
CREATE TABLE EMailTiming (
  Id INT(11) NOT NULL AUTO_INCREMENT,
	Type VARCHAR(50) NOT NULL,
	Regularly VARCHAR(50) DEFAULT NULL,
	Account VARCHAR(100) DEFAULT NULL,
	`Password` VARCHAR(50) DEFAULT NULL,
	SmtpIp VARCHAR(50) DEFAULT NULL,
	SmtpPort INT(10) DEFAULT NULL,
  Description VARCHAR(225) DEFAULT NULL,				
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


-- 机柜资产表
DROP TABLE IF EXISTS `CabinetAsset`;
CREATE TABLE `CabinetAsset` (
  `AssetId` INT(11) NOT NULL,
  `MDCId` INT(11) NOT NULL,
  `CabinetId` INT(11) NOT NULL,
  `AssetCode` VARCHAR(20) DEFAULT NULL,
  `Date` DATETIME,
  `Vendor` VARCHAR(20) DEFAULT NULL,
  `Model` VARCHAR(20) DEFAULT NULL,
  `Responsible` VARCHAR(20) DEFAULT NULL,
  `EmployeeId` INT(10) DEFAULT NULL,
  `Description` VARCHAR(255) DEFAULT NULL,
  PRIMARY KEY (`AssetId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- TCP/IP网络电话表
DROP TABLE IF EXISTS `TBL_NetworkPhone`;
CREATE TABLE `TBL_NetworkPhone` (
  `NPId` INT(11) NOT NULL,
  `NPIP` VARCHAR(20) NOT NULL,
  `NPPort` INT(10) NOT NULL,
  `Type` VARCHAR(10) NOT NULL,
  `Encoding` VARCHAR(10) DEFAULT NULL,
  `TextFormat` VARCHAR(255) DEFAULT NULL,
  `TimeType` VARCHAR(10) DEFAULT 'real',
  `TimeRegularly` VARCHAR(20) DEFAULT NULL,
  `Enable` BOOLEAN DEFAULT 0,
  `Description` VARCHAR(255) DEFAULT NULL,
  PRIMARY KEY (`NPId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- 页面组态管理表
DROP TABLE IF EXISTS `TBL_ConfigureMold`;
CREATE TABLE `TBL_ConfigureMold`(
	`ConfigId` INT(11) NOT NULL,	
	`ConfigName` VARCHAR(50) DEFAULT NULL,	
	`FontChart` VARCHAR(255) DEFAULT NULL,
  `ConfigUrl` VARCHAR(255) DEFAULT NULL,
  `EquipmentId` INT(11) DEFAULT NULL,
  `DisplayIndex` INT(11) DEFAULT NULL,
	`DisplayType` TINYINT(1) DEFAULT NULL,
  `ParentId` INT(11) DEFAULT NULL,
  `Visible` TINYINT(1) DEFAULT NULL,
  `Description` VARCHAR(255) DEFAULT NULL,
  PRIMARY KEY (`ConfigId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


-- 定时数据管理表
DROP TABLE IF EXISTS `TBL_IntervalClearData`;
CREATE TABLE `TBL_IntervalClearData`(
  `Id` INT(11) NOT NULL AUTO_INCREMENT,
  `Name`  VARCHAR(20) DEFAULT NULL,
  `ClearObject` VARCHAR(50) DEFAULT NULL,
  `Delay` INT(13) DEFAULT NULL,
  `Period`  INT(13) DEFAULT NULL,
  `StorageDays` INT DEFAULT NULL,
  `StorageCols` VARCHAR(50),
  `Status`  INT  DEFAULT NULL,
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- 资产表
DROP TABLE IF EXISTS `TBL_AssetsManager`;
CREATE TABLE `TBL_AssetsManager`(
	`AssetsId` INT(11) NOT NULL,
	`AssetsCode` VARCHAR(255) NOT NULL UNIQUE,
	`CabinetId` INT(11) DEFAULT NULL,
	`AssetsName` VARCHAR(125) NOT NULL,
	`AssetType` VARCHAR(50) DEFAULT NULL,
	`AssetStyle` VARCHAR(50) DEFAULT NULL,
	`EquipmentId` INT(11) DEFAULT NULL,
	`Vendor` VARCHAR(255) DEFAULT NULL,
	`UsedDate` DATE DEFAULT NULL,
	`Responsible` VARCHAR(255) DEFAULT NULL,
	`Position` VARCHAR(255) DEFAULT NULL,
	`UIndex` INT DEFAULT NULL,
	`UHeight` INT DEFAULT NULL,
	`Status` VARCHAR(50) DEFAULT NULL,
	`Description` VARCHAR(255) DEFAULT NULL,
  PRIMARY KEY (`AssetsId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- License表
DROP TABLE IF EXISTS `TBL_License`;
CREATE TABLE `TBL_License` (
  `LicenseCode` TEXT NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- 起始时间
DROP TABLE IF EXISTS `LIC_StartTime`;
CREATE TABLE `LIC_StartTime` (
  `UpdateDate` DATETIME NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;



-- MDC冷通道设备位置表
DROP TABLE IF EXISTS `MDC_AisleDeviceLocation`;
CREATE TABLE `MDC_AisleDeviceLocation`(
	`Id` INT(11) NOT NULL AUTO_INCREMENT,
	`TableId` INT(11) NOT NULL,
	`TableName` VARCHAR(255) NOT NULL,
	`DeviceType` VARCHAR(50) NOT NULL,
	`TableRow` INT NOT NULL,
	`TableCol` INT NOT NULL,
  PRIMARY KEY (`Id`)
)ENGINE=InnoDB AUTO_INCREMENT=100000001 DEFAULT CHARSET=utf8;

-- RTSP分流视频表
DROP TABLE IF EXISTS `TBL_RtspVideo`;
CREATE TABLE `TBL_RtspVideo`(
	`Id` INT(11) NOT NULL AUTO_INCREMENT,
	`VideoName` VARCHAR(50) DEFAULT NULL,
	`Path` Text NOT NULL,
  PRIMARY KEY (`Id`)
)ENGINE=InnoDB AUTO_INCREMENT=100000001 DEFAULT CHARSET=utf8;

-- 门禁控制规则表
DROP TABLE IF EXISTS TBL_DoorControlGovern;
CREATE TABLE TBL_DoorControlGovern
(
	`DoorControlId` INT(11) NOT NULL,
	`DoorType` VARCHAR(255) NOT NULL,
	`CardType` VARCHAR(255) DEFAULT NULL,
	`CardSystem` INT DEFAULT NULL,
	`CardNumber` INT DEFAULT 10,
	`TimeGroupNo` VARCHAR(255) DEFAULT NULL,
	`MaxTimeSpan` INT DEFAULT 6,
	`RemoteOpenDoor` VARCHAR(255) DEFAULT NULL,
	`AccessControlReset` VARCHAR(255) DEFAULT NULL,
	`AddCard`	VARCHAR(255) DEFAULT NULL,
	`DeleteCard`	VARCHAR(255) DEFAULT NULL,
	`DeleteAllCard`	VARCHAR(255) DEFAULT NULL,
	`ModifyCardSetting` VARCHAR(255) DEFAULT NULL,
	`AccessTimeSetting`	VARCHAR(255) DEFAULT NULL,
	`DoorOpenOvertimeSetting`	VARCHAR(255) DEFAULT NULL,
	`AccessControlTimingSetting` VARCHAR(255) DEFAULT NULL,
	`DoorEncryption`	VARCHAR(255)DEFAULT NULL,
	`OtherControl1` VARCHAR(255)DEFAULT NULL,
	`OtherControl2` VARCHAR(255)DEFAULT NULL,
	`OtherControl3` VARCHAR(255)DEFAULT NULL,
	PRIMARY KEY (`DoorControlId`)
)ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- 用户操作表
DROP TABLE IF EXISTS `TBL_UserOperationLog`;
CREATE TABLE `TBL_UserOperationLog` (
  `Id` INT(11) NOT NULL,
  `OperationId` INT NOT NULL,
  `LogonId` VARCHAR(128) NOT NULL,
  `IpAddress` VARCHAR(50) DEFAULT NULL,
  `EquipmentId` INT(11) DEFAULT NULL,
  `ControlId` INT(11) DEFAULT NULL,
  `ParameterValues` VARCHAR(500) DEFAULT NULL,
  `EventId` INT(11) DEFAULT NULL,
  `StartTime` DateTime DEFAULT NULL,
  `Description` VARCHAR(255) DEFAULT NULL,
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- 资产条表
DROP TABLE IF EXISTS `TBL_CabinetRackAssets`;
CREATE TABLE `TBL_CabinetRackAssets` (
  `RackId` INT NOT NULL,-- 资产条编号
	`CabinetId` INT NOT NULL,-- 机柜编号，关联Cabinet机柜表
	`RackIP` VARCHAR(25) DEFAULT NULL,-- 资产条IP
	`RackMask` VARCHAR(25) DEFAULT NULL,-- 资产条子网掩码
	`RackGateway` VARCHAR(25)DEFAULT NULL,-- 资产条默认网关
	`RackPort` INT DEFAULT 502,-- 资产条端口
	`ServerIP` VARCHAR(25) NOT NULL,-- 服务器IP
	`ServerPort` INT DEFAULT 502,-- 服务器端口
	`DeviceId` VARCHAR(10) DEFAULT NULL,-- 资产条设备ID
	`Status` INT DEFAULT 0,-- 状态；0:中断  1:正常  2:告警
	`UsedDate` DATE NOT NULL,-- 修改时间
	`Monitoring` INT DEFAULT 1,-- 启动实施监控 0:被动监听 1:主动监听
	`Description` VARCHAR(200) DEFAULT NULL,
  PRIMARY KEY (`RackId`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

-- 资产操作日志表
DROP TABLE IF EXISTS `TBL_AssetsManagerOperate`;
CREATE TABLE `TBL_AssetsManagerOperate`(
	`OperateId` INT NOT NULL,
	`LoginId` VARCHAR(50) NOT NULL, -- 操作用户
	`AssetsId` INT DEFAULT NULL, -- 资产编号
	`AssetsCode` VARCHAR(255) NOT NULL, -- 资产编码
	`AssetsName` VARCHAR(125) DEFAULT NULL, -- 资产名称
	`AssetsStyle` VARCHAR(125) DEFAULT NULL, -- 资产型号
	`CabinetId` INT NOT NULL, -- 关联机柜
	`EquipmentId` INT DEFAULT NULL, -- 关联设备
	`UIndex` INT DEFAULT NULL, -- U位
	`UHeight` INT DEFAULT NULL, -- U高
	`OperateType` VARCHAR(50) NOT NULL, -- 操作类型：资产下架|修改机架|修改资产|结束告警等
	`Status` VARCHAR(50) DEFAULT NULL, -- 状态
	`Meaning` VARCHAR(255) DEFAULT NULL, -- 含义
	`OperateDate` DATETIME DEFAULT NULL, -- 操作时间
	PRIMARY KEY (`OperateId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- 其他模块
DROP TABLE IF EXISTS `TBL_OtherModule`;
CREATE TABLE `TBL_OtherModule` (
  `ModuleId` INT(11) NOT NULL,
	`Name` VARCHAR(50) NOT NULL,-- 日志名称
	`LogFile` VARCHAR(255) NULL,-- 日志文件路径
	`LogCmd` VARCHAR(255) NULL,-- 日志命令行
	`Encode` VARCHAR(50) DEFAULT 'gbk',-- 字符编码
	`UploadPath` VARCHAR(255) NULL,-- 上传配置文件的目录
	PRIMARY KEY (`ModuleId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
-- 模块配置文件
DROP TABLE IF EXISTS `TBL_ModuleConfig`;
CREATE TABLE `TBL_ModuleConfig` (
  `ConfigId` INT(11) NOT NULL,
	`ModuleId` INT(11) NOT NULL,-- TBL_OtherModule表ID
	`FileType` VARCHAR(25) NULL DEFAULT 'other',
	`ConfigFile` VARCHAR(255) NOT NULL, -- 配置文件
	PRIMARY KEY (`ConfigId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- MDC控制表
-- ----------------------------
DROP TABLE IF EXISTS `MDC_Control`;
CREATE TABLE `MDC_Control` (
  `Id` INT NOT NULL,
	`MdcId` INT DEFAULT NULL,
  `ControlName` VARCHAR(50) NOT NULL,
	`Password` VARCHAR(50) DEFAULT NULL,
	`EquipmentId` INT NOT NULL,
	`BaseTypeId` INT NOT NULL,
	`ParameterValues` VARCHAR(500) DEFAULT NULL,
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- MDC设备图表关系表
-- ----------------------------
DROP TABLE IF EXISTS `MDC_DeviceChartMap`;
CREATE TABLE `MDC_DeviceChartMap` (
  `ChartMapId` INT NOT NULL,
	`DeviceId` INT NOT NULL,
  `ChartType` VARCHAR(50) DEFAULT 'line',
	`Title` VARCHAR(50) DEFAULT NULL,
	`Y1Name` VARCHAR(50) DEFAULT NULL,
	`Y2Name` VARCHAR(50) DEFAULT NULL,
	`XName` VARCHAR(50) DEFAULT NULL,
	`Max` VARCHAR(50) DEFAULT 'auto',
	`Min` VARCHAR(50) DEFAULT '0',
  PRIMARY KEY (`ChartMapId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- MDC图表信号关系表
-- ----------------------------
DROP TABLE IF EXISTS `MDC_ChartSignalMap`;
CREATE TABLE `MDC_ChartSignalMap` (
  `SignalMapId` INT NOT NULL,
  `ChartMapId` INT NOT NULL,
	`DeviceId` INT NOT NULL,
  `SignalId` INT DEFAULT NULL,
  `BaseTypeId` INT DEFAULT NULL,
	`Name` VARCHAR(50) DEFAULT NULL,
  PRIMARY KEY (`SignalMapId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


-- ----------------------------
-- 设备信息表
-- ----------------------------
DROP TABLE IF EXISTS `TBL_EquipmentInfo`;
CREATE TABLE `TBL_EquipmentInfo` (
	`EquipmentInfoId` INT NOT NULL COMMENT '唯一编号',
	`EquipmentId` INT NOT NULL COMMENT '设备表编号',
	`EquipmentModel` VARCHAR(50) DEFAULT NULL COMMENT '设备型号',
	`EquipmentVersion` VARCHAR(50) DEFAULT NULL COMMENT '设备版本号',
	`ImagesPath` VARCHAR(50) DEFAULT NULL COMMENT '设备图',
	`UsedDate` INT DEFAULT NULL COMMENT '运行时间(天)',
	`WarrantyPeriod` INT DEFAULT NULL COMMENT '保固期(年)',
	`MaintenanceTime` DATETIME DEFAULT NULL COMMENT '维修时间',
	`ConfigSetting` VARCHAR(100) DEFAULT NULL COMMENT '配置设置',
	`PatchName` VARCHAR(50) DEFAULT NULL COMMENT '补丁名称',
	`PatchVersion` VARCHAR(50) DEFAULT NULL COMMENT '补丁版本',
	`DigitalSignature` VARCHAR(50) DEFAULT NULL COMMENT '数字签名',
	`Location` LONGTEXT DEFAULT NULL COMMENT '设备位置',
	`Comment` LONGTEXT DEFAULT NULL COMMENT '备注',
    PRIMARY KEY (`EquipmentInfoId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- 设备操作记录表
-- ----------------------------
DROP TABLE IF EXISTS `TBL_EquipmentRecord`;
CREATE TABLE `TBL_EquipmentRecord` (
	`EquipmentRecordId` INT NOT NULL COMMENT '唯一编号',
	`EquipmentId` INT NOT NULL COMMENT '设备信息表编号',
	`UserName` VARCHAR(50) NOT NULL COMMENT '操作者',
	`IPAddress` VARCHAR(50) NOT NULL COMMENT '操作IP',
	`Operation` VARCHAR(50) NOT NULL COMMENT '操作(维修、修改配置)',
	`OperationTime` DATETIME NOT NULL COMMENT '操作时间',
	`Comment` LONGTEXT DEFAULT NULL COMMENT '备注',
	PRIMARY KEY (`EquipmentRecordId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;