$( document ).ready(function() {
	$('#contract').val("");
	$('#account').val("");
	$("#balField").hide();
});

var url =""

function networkSelector(){

	if ($("#nw").hasClass("active")) {
		url = "http://dolphin.eosblocksmith.io";
	}
	else{
		url = "http://106.10.42.238";
	}
}

function check() {
	networkSelector();
	$("#err1").text("");
	$("#err2").text("");
	var contract = $('#contract').val();
	var account =  $('#account').val();
	if(contract == ""){
		$("#err1").text("Input required");
		return;
	}
	if(account == ""){
		$("#err2").text("Input required");
		return;
	}
	 var kk = contractExist(contract);
		console.log(kk);
	if(contractExist(contract) || accExist(account)){
		return;
	}
	//accExist(account);
	var data = JSON.stringify({
		"scope": account,
		"code": contract,
		"table": "accounts",
		"json": "true"
	});
	var xhr = new XMLHttpRequest();
	xhr.withCredentials = false;

	xhr.addEventListener("readystatechange", function () {
  		if (this.readyState === this.DONE) {
    		var bal = JSON.parse(this.responseText);
    		try{
    			var b = bal.rows[0].balance;
    		}
    		catch(err)
    		{
    			b = "Result not found";
    		}
    		//if(bal.code == 500) console.log("no ba")
    		//console.log(b);
    		$("#balance").text(b);
  			$("#balField").show();

		}
	});
	xhr.open("POST", url+":8888/v1/chain/get_table_rows");
	xhr.send(data);
}


function accExist(account){
	var status = false;
	var data = JSON.stringify({
		"account_name": account
	});
	var xhr = new XMLHttpRequest();
	xhr.withCredentials = false;
	xhr.addEventListener("readystatechange", function () {
  		if (this.readyState === this.DONE) {
    		var acc = JSON.parse(this.responseText);
    		if(acc.code==500){
    			//console.log("no account");
    			$("#err2").text("Account doesn't exist");
    			status = true;
    		}
  		}
	});
	xhr.open("POST", url+":8888/v1/chain/get_account");
	xhr.send(data);
	console.log("acc : "+status)
	return status;
}

function contractExist(contract){
	var status = false;
	var data = JSON.stringify({
		"account_name": contract,
  		"code_as_wasm": "true"
	});
	var xhr = new XMLHttpRequest();
	xhr.withCredentials = false;
	xhr.addEventListener("readystatechange", function () {
		if (this.readyState === this.DONE) {
			var con = JSON.parse(this.responseText);
			if (con.code == 500){
				$("#err1").text("Contract doesn't exist");
				status = true;
			}
  		}
	});
	xhr.open("POST", url+":8888/v1/chain/get_code");
	xhr.send(data);
	console.log("contract : "+status)
	return status;
}