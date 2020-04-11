var mdcConfig = {
    mdcName: "mdc",
    racks: [
        { index: 1, name: "服务柜10", state: "default", face: "default" },
        { index: 2, name: "服务柜11", state: "alarm", level: 1, face: "default" },
        { index: 3, name: "空调柜4", state: "default", face: "default" },
        { index: 4, name: "服务柜12", state: "default", face: "default" },
        { index: 5, name: "结构墙", state: "default", face: "default" },
        { index: 6, name: "服务柜13", state: "capacity", percent: 21, face: "default" },
        { index: 7, name: "空调柜5", state: "default", face: "default" },
        { index: 8, name: "服务柜14", state: "default", face: "default" },
        { index: 9, name: "服务柜15", state: "capacity", percent: 0, face: "default" },
        { index: 10, name: "服务柜16", state: "default", face: "default" },
        { index: 11, name: "空调柜6", state: "default", face: "default" },
        { index: 12, name: "服务柜17", state: "default", face: "default" },
        { index: 13, name: "电池柜2", state: "default", face: "side" },
        { index: 14, name: "CWD", state: "default", face: "default" },
        { index: 15, name: "管控柜", state: "default", face: "default" },
        { index: 16, name: "配电柜1", state: "default", face: "default" },
        { index: 17, name: "HVDC", state: "default", face: "default" },
        { index: 18, name: "电池柜1", state: "capacity", percent: 88, face: "default" },
        { index: 19, name: "服务柜1", state: "default", face: "default" },
        { index: 20, name: "空调柜1", state: "default", face: "default" },
        { index: 21, name: "服务柜2", state: "default", face: "default" },
        { index: 22, name: "服务柜3", state: "default", face: "default" },
        { index: 23, name: "服务柜4", state: "default", face: "default" },
        { index: 24, name: "空调柜2", state: "default", face: "default" },
        { index: 25, name: "服务柜5", state: "default", face: "default" },
        { index: 26, name: "服务柜6", state: "default", face: "default" },
        { index: 27, name: "服务柜7", state: "default", face: "default" },
        { index: 28, name: "空调柜3", state: "default", face: "default" },
        { index: 29, name: "服务柜8", state: "default", face: "default" },
        { index: 30, name: "服务柜9", state: "default", face: "default" }
    ],
};
window.lary = Lary.create("renderCanvas", mdcConfig);

//反面测试，打开即可观看效果
setInterval(lary.showSide, 5000);

//alarm的告警测试，打开即可观看效果
function randomAlarm() {
    var rand = mdcConfig.racks[Math.floor(Math.random() * mdcConfig.racks.length)];

    var randLevel = Math.floor(Math.random() * 5);
    if (randLevel === 0) {
        rand.state = "default";
    } else {
        rand.state = "alarm";
    }
    rand.level = randLevel;

    lary.refresh(mdcConfig);
};

setInterval(randomAlarm, 2000);


//capacity的测试，打开即可观看效果
function randomCapacity() {
    var rand = mdcConfig.racks[Math.floor(Math.random() * mdcConfig.racks.length)];

    rand.percent = Math.floor(Math.random() * 100);

    rand.state = "capacity";

    lary.refresh(mdcConfig);
};

setInterval(randomCapacity, 3000);

//增加face字段，可参考createCabinetBox来增加新的面板材质。可显示各种不同的设备，解决了盒子的贴图问题

//TODO: click event for rack