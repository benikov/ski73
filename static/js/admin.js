
$(document).ready(dispatchAdmin);

function dispatchAdmin() {
    var dispatchTable = {
	"manage-news": getNewsManage,
	"manage-competitions": getFormulariesManage
    };
    var dispatched = analyzeGET(dispatchTable, "admop");
    //if (!dispatched)
	//pushHistoryState("/?op=admin");

}

function getClubsManage() {
    alert('clabs managing form is in process')
}

function getFormulariesManage() {
    $("#mainframe").load("static/manage-competitions.html");
}

function getModerRequestsManage() {
    $("#mainframe").load("static/moder-claims.html");
}

function getNewsManage() {
    $("#mainframe").load("static/manage-news.html");
}

function getModerRequestsList() {
    $.ajax({
	type: "POST",
	url: "moder-request-list",
	success: handleModerRequestsList,
	error:function (XMLHttpRequest, textStatus, errorThrown) {
		alert(textStatus);
	}
    });
}

function handleModerRequestsList(data) {
    data = eval('(' + data + ')');
    if (data.status == 'done') {
	document.dtbl.fnClearTable();
	if (data.list)
	    document.dtbl.fnAddData(data.list);
	else
	    $("#approve-submit").attr("disabled", "true");
    } else {
	alert(data.message);
    }
    
}
function initModerApprovePage() {
    $("#moder-requests-approve").ajaxForm({
	url : "moders-approve",
	type: "POST",
	success: handleModerApprove,
	beforeSend : function (jqXHR, settings) {
	    settings.data = settings.data.replace(/moders_length=\d+&/, "");
	    return true;
	},
	error:function (xhr, ajaxOptions, thrownError) {
	    alert(xhr.status + ":" + thrownError);
	}

	});

}

function initModerTable() {
    document.dtbl = $('#moders').dataTable({
	    "aoColumns": [
		{"sTitle": "Фамилия И. О.", "fnRender" : function(obj) { return obj.aData["surname"] + " " + obj.aData["name"] + " " + obj.aData["patronimic"];}},
		{"sTitle": "Год рождения", "mDataProp" : "birthDate"},
		{"sTitle": "Клуб", "mDataProp": "club"},
		{"sTitle": "Город", "mDataProp": "city"},
		{"sTitle": "Подтверждение <br>(да/проигнорироавть/забанить запрос)"
		 , "fnRender": function(obj){
			return "<input name='" + obj.aData["key"] + "' type='radio' value='0' checked>"
			+ "<input name='" + obj.aData["key"] + "' type='radio' value='1'>"
			+ "<input name='" + obj.aData["key"] + "' type='radio' value='2'>";
		    }
		}
			  ],
	    "bAutoWidth" : true
	});
}

function handleModerApprove(data) {
    response = eval("(" + data + ")");
    var allright = response.status == "done";
    
    var color =  allright?"green":"red";
    $("#moder-approve-status").text(allright?"Все успешно применилось":response.message).css("color", color);
    $("#moder-approve-status").fadeIn(3000).fadeOut(3000);
    revertUser();
    handleModerRequestsList(data);

}