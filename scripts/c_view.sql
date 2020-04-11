DROP VIEW IF EXISTS VReportEquipment;

CREATE
	ALGORITHM = UNDEFINED
	DEFINER = `root`@`%`
	SQL SECURITY DEFINER
VIEW VReportEquipment
 AS
SELECT
ss.StructureId CenterId ,
		ss.StructureName CenterName ,
		sc.StructureId GroupId 		 		,
		sc.StructureName GroupName 		,
		su.StationCategory StationCategory ,
		st.ItemValue StationCategoryValue ,
		su.StationId StationId 		,
		su.StationName StationName 		,
		ee.EquipmentCategory EquipmentCategory		,
		ec.ItemValue EquipmentCategoryValue ,
		ee.EquipmentType EquipmentType ,
		ee.EquipmentId EquipmentId ,
		ee.EquipmentName EquipmentName ,
		ee.EquipmentNo EquipmentNo ,
		ee.BuyDate  BuyDate ,
		ee.UsedDate UsedDate ,
		ee.UsedLimit UsedLimit ,
		ee.Price  Price  ,
		ee.Description Description ,
		ev.ItemValue Vendor  ,
		eu.ItemValue Unit
FROM TBL_StationStructure ss 
INNER JOIN TBL_Station su ON ss.StructureId = su.CenterId
INNER JOIN TBL_Equipment ee ON su.StationId = ee.StationId
INNER JOIN TBL_StationStructureMap mp ON su.StationId = mp.StationId
INNER JOIN TBL_StationStructure sc ON mp.StructureId = sc.StructureId AND sc.StructureGroupId = 1 AND sc.StructureType = 1
INNER JOIN TBL_DataItem ec ON ee.EquipmentCategory = ec.ItemId AND ec.EntryId in(7,77,78)
LEFT JOIN TBL_DataItem ev ON ee.Vendor = ev.ItemId AND ev.EntryId = 14
LEFT JOIN TBL_DataItem eu ON ee.Unit = eu.ItemId AND eu.EntryId = 16
INNER JOIN TBL_DataItem st ON su.StationCategory = st.ItemId AND st.EntryId = 71;

DROP VIEW IF EXISTS VReportStation;

CREATE 
	ALGORITHM = UNDEFINED
	DEFINER = `root`@`%`
	SQL SECURITY DEFINER
VIEW VReportStation
 AS

SELECT
ss.StructureId CenterId ,
		ss.StructureName CenterName,
		sc.StructureId GroupId,
		sc.StructureName GroupName,
		su.StationCategory StationCategory,
		st.ItemValue StationCategoryValue,
		su.StationGrade StationGrade,
		sd.ItemValue StationGradeValue ,
		su.StationId StationId,
		su.StationName StationName,
		su.Longitude Longitude,
		su.Latitude Latitude,
		sc.Longitude YCoord,
		sc.Latitude XCoord
FROM TBL_StationStructure ss 
INNER JOIN TBL_Station su ON ss.StructureId  = 	su.CenterId
INNER JOIN TBL_StationStructureMap mp ON su.StationId = mp.StationId
INNER JOIN TBL_StationStructure sc ON mp.StructureId  = sc.StructureId AND sc.StructureGroupId in(0,1)
INNER JOIN TBL_DataItem st ON su.StationCategory = st.ItemId AND st.EntryId = 71
INNER JOIN TBL_DataItem sd ON su.StationGrade = sd.ItemId AND sd.EntryId = 2;

DROP VIEW IF EXISTS v_hisdata;
CREATE 
	ALGORITHM = UNDEFINED
	DEFINER = `root`@`%`
	SQL SECURITY DEFINER
VIEW `v_hisdata` AS SELECT * FROM tbl_historysignal1 
UNION SELECT * FROM tbl_historysignal2
UNION SELECT * FROM tbl_historysignal3
UNION SELECT * FROM tbl_historysignal4
UNION SELECT * FROM tbl_historysignal5
UNION SELECT * FROM tbl_historysignal6
UNION SELECT * FROM tbl_historysignal7
UNION SELECT * FROM tbl_historysignal8
UNION SELECT * FROM tbl_historysignal9
UNION SELECT * FROM tbl_historysignal10
UNION SELECT * FROM tbl_historysignal11
UNION SELECT * FROM tbl_historysignal12;
