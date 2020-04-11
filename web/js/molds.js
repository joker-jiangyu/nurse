window.molds = [
  {
    id: "wallpath-default",
    title: "默认墙",
    remark: "默认外墙风格",
    img:"/img/3d/molds/wall10-inner.png",
    name: "wallPath",
    size: {
      width: 20,
      high: 270
    },
    faces: {
        "sideFace": {
          "texture": "/img/3d/molds/wall10-inner.png",
          "color": 0xffffff,
          "textureSize": 256,
          "tileWay": "H",
          "opacity": 1
        },
        topFace: {
          "color": 0xB0B7ED,
          "opacity": 1
        }
    }
  },
  {
    id: "wallpath-glass",
    title: "玻璃墙",
    remark: "玻璃内墙",
    img:"/img/3d/molds/glasswall.jpg",
    name: "wallPath",
    size: {
      width: 10,
      high: 270
    },
    faces: {
        "sideFace":{
          "color" : 0xB0CFF0,
          "transparent":true,
          "opacity":0.4
        },
        "topFace":{
          "color" : 0xB0CFF0,
          "opacity":0.4
        }
    }
  },
  {
    id: "wallpath-null",
    title: "无墙",
    remark: "不存在的墙，用于简化地板围墙配置",
    img:"/img/3d/null.png",
    name: "wallPath",
    size: {
      width: 5,
      high: 0
    },
    faces: {
        "sideFace":{
          "color" : 0xB0CFF0,
          "transparent":true,
          "opacity":0
        },
        "topFace":{
          "color" : 0xB0CFF0,
          "opacity":0
        }
    }
  },
    {
      id: "door-default",
      title: "默认门",
      img: "/img/3d/molds/door03_3d.png",
      remark: "默认金属单门",
      name:"door",
      type:"wallPart",
      size:{
        width: 100,
        high: 200,
        depth: 24
      },
      faces: {
        "sideFace":{
          "color" : 0xCAE7ED
        },
        "frontFace":{
          "texture": "/img/3d/molds/door03_3d.png",
          "color": 0xffffff,
          "transparent":true,
          "opacity": 1
        },
        "backFace":{
          "texture": "/img/3d/molds/door03_3d_01.png",
          "color": 0xffffff,
          "transparent":true,
          "opacity": 1
        }
      }
    },
    {
      id: "door-safedoor",
      title: "安全门",
      remark: "安全单门",
      img: "/img/3d/molds/door01_3d.png",
      name:"door",
      size:{
        width: 110,
        high: 210,
        depth: 22
      },
      faces: {
        "sideFace":{
          "color" : 0xCAE7ED
        },
        "frontFace":{
          "texture": "/img/3d/molds/door01_3d.png",
          "color": 0xffffff,
          "opacity": 1
        },
        "backFace":{
          "texture": "/img/3d/molds/door01_3d_01.png",
          "color": 0xffffff,
          "opacity": 1
        }
      }
    },
    {
      id: "door-metalwindow",
      title: "合金双扇窗",
      img: "/img/3d/molds/window01_3d.png",
      remark: "默认金属双扇窗",
      name:"door",
      size:{
        width: 200,
        high: 150,
        depth: 22
      },
      faces: {
        "sideFace":{
          "color" : 0xCAE7ED
        },
        "frontFace":{
          "texture": "/img/3d/molds/window01_3d.png",
          "color": 0xffffff,
          "transparent":true,
          "opacity": 1
        },
        "backFace":{
          "texture": "/img/3d/molds/window01_3d.png",
          "color": 0xffffff,
          "transparent":true,
          "opacity": 1
        }

      }
    },
    {
      id: "door-dualglassdoor",
      title: "玻璃双门",
      img: "/img/3d/molds/glass-door.png",
      remark: "玻璃双扇门",
      name:"door",
      size:{
        width: 190,
        high: 220,
        depth: 12
      },
      faces: {
        "sideFace":{
          "color" : 0xB0CFF0,
          "transparent":true,
          "opacity":0.4
        },
        "frontFace":{
          "texture": "/img/3d/molds/glass-door.png",
          "color": 0xffffff,
          "transparent":true,
          "opacity": 1
        },
        "backFace":{
          "texture": "/img/3d/molds/glass-door.png",
          "color": 0xffffff,
          "transparent":true,
          "opacity": 1
        }

      }
    },
    {
      id: "rack-default",
      title: "Rack HP 42U",
      remark: "HP S: 10000 G2, M: 10462 G2",
      img: "img/3d/molds/hprack.jpg",
      name:"rack",
      size:{
        width: 60.9,
        depth: 100.8,
        high: 200.4
      },
      faces:{
        topFace: { "texture": 'img/3d/molds/metal06.png' },
        bottomFace: { "texture": 'img/3d/molds/metal06.png' },
        leftFace: { "texture": 'img/3d/molds/metal06.png' },
        rightFace: { "texture": 'img/3d/molds/metal06.png' },
        frontFace: { "texture": 'img/3d/molds/RACK_Face.png' },
        backFace: { "texture": 'img/3d/molds/metal06.png' }
      }
    },
    {
      id: "rack-apcupssmart",
      title: "UPS APC-Smart",
      remark: "APC Smart-UPS 20KVA ",
      img: "img/3d/molds/apcicon.jpg",
      name:"rack",
      size:{
        width: 55.9,
        depth: 81.3,
        high: 149.9
      },
      faces:{
        topFace: { "texture": 'img/3d/molds/metal06.png' },
        bottomFace: { "texture": 'img/3d/molds/metal06.png' },
        leftFace: { "texture": 'img/3d/molds/metal06.png' },
        rightFace: { "texture": 'img/3d/molds/metal06.png' },
        frontFace: { "texture": 'img/3d/molds/apcups.jpg' },
        backFace: { "texture": 'img/3d/molds/metal06.png' }
      }
    },
    {
      id: "rack-libertPEX",
      title: "AC PEX-H",
      remark: "Libert",
      img: "img/3d/molds/PEX-H.png",
      name:"rack",
      size:{
        width: 197,
        depth: 86.7,
        high: 170.4
      },
      faces:{
        topFace: { "texture": 'img/3d/molds/metal06.png' },
        bottomFace: { "texture": 'img/3d/molds/metal06.png' },
        leftFace: { "texture": 'img/3d/molds/metal06.png' },
        rightFace: { "texture": 'img/3d/molds/metal06.png' },
        frontFace: { "texture": 'img/3d/molds/PEX-H.png' },
        backFace: { "texture": 'img/3d/molds/metal06.png' }
      }
    },
    {
      id: "rack-preserve",
      title: "机架预留位",
      remark: "无",
      img: "img/3d/molds/reserverack.png",
      name:"rack",
      size:{
        width: 60,
        depth: 100,
        high: 200
      },
      faces:{
        topFace: {"color" : 0xB0CFF0, "transparent":true, "opacity":0.4 },
        bottomFace: {"color" : 0xB0CFF0, "transparent":true, "opacity":0.4 },
        leftFace: {"color" : 0xB0CFF0, "transparent":true, "opacity":0.4 },
        rightFace: {"color" : 0xB0CFF0, "transparent":true, "opacity":0.4 },
        frontFace: {"color" : 0xB0CFF0, "transparent":true, "opacity":0.4 },
        backFace: {"color" : 0xB0CFF0, "transparent":true, "opacity":0.4 }
      }
    },
    {
      id: "rack-firebox",
      title: "灭火箱",
      remark: "无",
      img: "img/3d/molds/firebox.png",
      name:"rack",
      size:{
        width: 100,
        depth: 38,
        high: 70
      },
      faces:{
        topFace: { "color" : 0xff0000, "opacity":1 },
        bottomFace: { "color" : 0xff0000, "opacity":1 },
        leftFace: { "color" : 0xff0000, "opacity":1 },
        rightFace: { "color" : 0xff0000, "opacity":1 },
        frontFace: { "texture": 'img/3d/molds/firebox.png' },
        backFace: { "texture": 'img/3d/molds/firebox.png' }
      }
    },
    {
      id: "rack-d4cabinet",
      title: "四斗柜",
      remark: "四抽屉文件柜",
      img: "img/3d/molds/drawers4cabinet.png",
      name:"rack",
      size:{
        width: 50,
        depth: 50,
        high: 170
      },
      faces:{
        topFace: { "color" : 0xb3e6ff, "opacity":1 },
        bottomFace: { "color" : 0xb3e6ff, "opacity":1 },
        leftFace: { "color" : 0xb3e6ff, "opacity":1 },
        rightFace: { "color" : 0xb3e6ff, "opacity":1 },
        frontFace: { "texture": 'img/3d/molds/drawers4cabinet.png' },
        backFace: { "texture": 'img/3d/molds/drawers4cabinet.png' }
      }
    },
    {
      id: "rack-lowcabinet",
      title: "办公底柜",
      remark: "低办公柜",
      img: "img/3d/molds/lowcabinet.png",
      name:"rack",
      size:{
        width: 140,
        depth: 50,
        high: 130
      },
      faces:{
        topFace: { "color" : 0xe6e6e6, "opacity":1 },
        bottomFace: { "color" : 0xe6e6e6, "opacity":1 },
        leftFace: { "color" : 0xe6e6e6, "opacity":1 },
        rightFace: { "color" : 0xe6e6e6, "opacity":1 },
        frontFace: { "texture": 'img/3d/molds/lowcabinet.png' },
        backFace: { "texture": 'img/3d/molds/lowcabinet.png' }
      }
    },
    {
      id: "rack-cctvwarning",
      title: "监控提示牌",
      remark: "此区域已经被监控",
      img: "img/3d/molds/cctv_warning.png",
      name:"rack",
      size:{
        width: 50,
        depth: 1,
        high: 50
      },
      faces:{
        topFace: { "color" : 0xffffff, "opacity":0},
        bottomFace: { "color" : 0xffffff, "opacity":0},
        leftFace: { "color" : 0xffffff, "opacity":0},
        rightFace: { "color" : 0xffffff, "opacity":0},
        frontFace: {
          "texture":'img/3d/molds/cctv_warning.png',        
          "transparent":true,
          "opacity": 1,
          "color" : 0xffffff
        },
        backFace: {
          "texture":'img/3d/molds/cctv_warning.png',        
          "transparent":true,
          "opacity": 1,
          "color" : 0xffffff
        }
      }
    },
    {
      id: "flat-default",
      title: "绿色植物",
      remark: "室内绿色观叶植物",
      img: "img/3d/molds/plant.png",
      name:"flat",
      size:{
        width:70,
        high:140
      },
      face:{
        "texture": "img/3d/molds/plant.png",
        "transparent":true,
        "opacity": 1,
        "color" : 0xffffff
      }
    },
    {
      id: "flat-flower",
      title: "花瓶",
      remark: "室内摆放花瓶",
      img: "img/3d/molds/flower.png",
      name:"flat",
      size:{
        width:50,
        high:60
      },
      face:{
        "texture": "img/3d/molds/flower.png",
        "color" : 0xffffff,
        "transparent":true,
        "opacity": 1
      }
    },
    {
      id: "flat-tree",
      title: "绿树",
      remark: "行道树",
      img: "img/3d/molds/tree-2.png",
      name:"flat",
      size:{
        width:360,
        high: 440
      },
      face:{
        "texture": "img/3d/molds/tree-2.png",
        "color" : 0xffffff,
        "transparent":true,
        "opacity": 1
      }
    },
    {
      id: "flat-fire-extinguisher",
      title: "灭火器",
      remark: "单个灭火器",
      img: "img/3d/molds/fire-extinguisher.png",
      name:"flat",
      size:{
        width:25,
        high: 50
      },
      face:{
        "texture": "img/3d/molds/fire-extinguisher.png",
        "color" : 0xffffff,
        "transparent":true,
        "opacity": 1
      }
    },
    {
      id: "flat-camera",
      title: "摄像头",
      remark: "图标式摄像头",
      img: "img/3d/molds/CCTV-icon.png",
      name:"flat",
      size:{
        width:34,
        high: 34
      },
      face:{
        "texture": "img/3d/molds/CCTV-icon.png",
        "color" : 0xffffff,
        "transparent":true,
        "opacity": 1
      }
    }
  //,{
  //    id: "ball-default",
  //    title: "默认球机",
  //    remark: "默认为摄像机，可更换任何球状物体图片",
  //    name:"camera",
  //    type:"ball",
  //    size:{
  //      radius:30,
  //      high:300
  //    },
  //    face:{
  //      "texture": 'img/3d/global.jpg'
  //    }
  //  }
  ]
;
