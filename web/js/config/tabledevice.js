var data = [
    {
        "name":       "rfswitch1",
        "ip":         "192.168.1.1",
        "group":       "A"
    },
   {
        "name":       "rfswitch2",
        "ip":         "192.168.1.1",
        "group":       "B"
    },
	{
        "name":       "rfswitch3",
        "ip":         "192.168.1.2",
        "group":       "C"
    },
	{
        "name":       "rfswitch4",
        "ip":         "192.168.1.3",
        "group":       "D"
    },
	{
        "name":       "rfswitch5",
        "ip":         "192.168.1.4",
        "group":       "A"
    },
	{
        "name":       "rfswitch6",
        "ip":         "192.168.1.5",
        "group":       "B"
    },
	{
        "name":       "rfswitch7",
        "ip":         "192.168.1.6",
        "group":       "C"
    },
	{
        "name":       "rfswitch8",
        "ip":         "192.168.1.7",
        "group":       "D"
    },
	{
        "name":       "rfswitch9",
        "ip":         "192.168.1.8",
        "group":       "A"
    },
	{
        "name":       "rfswitch10",
        "ip":         "192.168.1.9",
        "group":       "B"
    },
	{
        "name":       "rfswitch11",
        "ip":         "192.168.1.10",
        "group":       "C"
    },
	{
        "name":       "rfswitch12",
        "ip":         "192.168.1.11",
        "group":       "D"
    }
	
];
var table;
var editFlag = false;
window.onload=function(){
   var tpl = $("#tpl").html();//get template
        //compile template
        var template = Handlebars.compile(tpl);
        table = $('#example').DataTable({ //datatable init
			data: data,
            columns: [
                {"data": "name"},
                {"data": "ip"},
                {"data": "group"}, 
				{"data": null}

            ],
            columnDefs: [
                {
                    targets: 3,//point to four column
                    render: function (a, b, c, d) {//render that get data from source
                        var context =
                        {
                            func: [
                                {"name": "  Edit ", "fn": "edit(\'" + c.name + "\',\'" + c.ip + "\',\'" + c.group  + "\')", "type": "primary"},
                                {"name": "Delete", "fn": "del(\'" + c.name + "\',\'" + c.ip + "\',\'" + c.group  + "\')", "type": "danger"}
                            ]
                        };
                        var html = template(context);//匹配内容
                        return html;
                    }
                }

            ],
			// language
			//Define the table control elements to appear on the page and in what order
            "dom": "<'row'<'col-xs-2'l><'#mytool.col-xs-4'><'col-xs-6'f>r>" +
                    "t" +
                    "<'row'<'col-xs-6'i><'col-xs-6'p>>",
            initComplete: function () {
                $("#mytool").append('<button type="button" class="btn btn-default btn-sm" onclick="add()" >ADD</button>');
            }
        });
        $("#save").click(save);//edit 呢
};
 /**
 * clear
*/
function clear() {
        $("#name").val("").attr("disabled",false);
        $("#ip").val("");
        $("#group").val("");
        editFlag = false;
}
	/**
     *save and edit 
	 */
function save() {
        var flag = $("#myModalLabel").text();
		//var flag = Edit;
		if(flag == "Edit"){
			//get input and ajax
			alert("Edit");
			return;
		}
		alert("add");//get input and ajax
		var addJson = {
            "name": $("#name").val(),
            "ip": $("#ip").val(),
            "group": $("#group").val(),
        };
		return;
    }
    /**
     * add data
     **/
    function add() {
		$("#ip").attr("disabled",false);
		$("#myModalLabel").text("ADD");
		$("#myModal").modal("show");
		var addJson = {
            "name": $("#name").val(),
            "ip": $("#ip").val(),
            "group": $("#group").val(),
        };
		//return addJson； 不能加return
        //ajax(addJson); 用ajax实现插入数据
    }
    /**
     *Edit
     **/
    function edit(name,ip,group) {
        //console.log(name);
        editFlag = true;
        $("#myModalLabel").text("Edit");
        $("#name").val(name);//为什么也有作用
        $("#ip").val(ip).attr("disabled",true);
        $("#group").val(group);
		//应该获得数据也就是要进行更新处理
        $("#myModal").modal("show");
    }

    /**
     delete
     * 
     */
    function del(name,ip,group) {
		//这个地方也好弄，可以获取数据
		alert(name+ip+group);

    }