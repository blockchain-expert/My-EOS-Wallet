$( document ).ready(function() {
	$('#contract').val("");
	$('#account').val("");
	$('#contract').keypress(function(e){
        if(e.which == 13){
            $('#check').click();
        }
	});
	$('#account').keypress(function(e){
        if(e.which == 13){
            $('#check').click();
        }
    });
});

var url =""
var supplyPercent;
var token;
var isMainnet = false;

function networkSelector(){
	if ($("#nw").hasClass("active")){
		isMainnet = false;
		url = "http://52.199.125.75:8888";  // Test NET
	}
	else{
		isMainnet = true;
		url = "http://bp.cryptolions.io:8888";       // MAIN NET
	}
}

var tokenBal;
function tokenDetails(token,contract){
	var data = JSON.stringify({
	  "scope": token[1],
	  "code": contract,
	  "table": "stat",
	  "json": "true"
	});
	  
	var xhr = new XMLHttpRequest();
	xhr.withCredentials = false;
	  
	xhr.addEventListener("readystatechange", function () {
		if (this.readyState === this.DONE) {	
			var acc = JSON.parse(this.responseText);
			if(jQuery.isEmptyObject(acc.rows)){
				console.log("Unavailable");
			}
			else{
				var balance = token[0];
				tokenBal = token[0];
				var max_supply = acc.rows[0].max_supply.match(/[a-zA-Z]+|[0-9]+(?:\.[0-9]+)?|\.[0-9]+/g);
				var max_supply_token=Math.floor(max_supply[0]);
				var supply = acc.rows[0].supply.match(/[a-zA-Z]+|[0-9]+(?:\.[0-9]+)?|\.[0-9]+/g);
				var supply_token=Math.floor(supply[0]);
				supplyPercent=percentage(supply_token,max_supply_token);
				var tokenHolding=percentage(balance,supply_token);
			}
		}
	});  
	xhr.open("POST", url+"/v1/chain/get_table_rows");
	xhr.send(data);
}

var ram_usageper, net_usageper, cpu_usageper, ram_quota_unit, ram_usage_unit;
var net_limit_unit, net_used_unit, cpu_limit_unit, cpu_used_unit;

function accountDetails(token,account){
	var status = false;
	var data = JSON.stringify({
		"account_name": account
	});
	var xhr = new XMLHttpRequest();
	xhr.withCredentials = false;
	xhr.addEventListener("readystatechange", function () {
  		if (this.readyState === this.DONE) {
    		var acc = JSON.parse(this.responseText);
			var eos_bal=acc.core_liquid_balance;
	  		$("#eosBalance").text("EOS : "+eos_bal);
	  		availability(acc.self_delegated_bandwidth);
			var ram_quota=acc.ram_quota;
			var ram_usage=acc.ram_usage;
			var ram_avail=ram_quota-ram_usage;
			
			ram_usageper=percentage(ram_usage,ram_quota);
			var ram_availper=100-ram_usageper;
			
			ram_quota_unit=netCalc(ram_quota);
			ram_usage_unit=netCalc(ram_usage);
			var ram_avail_unit=netCalc(ram_avail);
			
			var net_limit=acc.net_limit.max
			var net_used=acc.net_limit.used
			var net_avail=net_limit-net_used;

			net_usageper=percentage(net_used,net_limit);
			var net_availper=100-net_usageper;

			net_limit_unit=netCalc(net_limit);
			net_used_unit=netCalc(net_used);
			var net_avail_unit=netCalc(net_avail);


			var cpu_limit=acc.cpu_limit.max;
			var cpu_used=acc.cpu_limit.used;
			var cpu_avail=cpu_limit-cpu_used;
			
			cpu_usageper=percentage(cpu_used,cpu_limit);
			var cpu_availper=100-cpu_usageper;
			
			cpu_limit_unit = cpuCalc(cpu_limit);
			cpu_used_unit = cpuCalc(cpu_used);
			var cpu_avail_unit = cpuCalc(cpu_avail);

			updateChart();
  		}
	});
	xhr.open("POST", url+"/v1/chain/get_account");
	xhr.send(data);
	return status;
}

function updateChart() {
	var ramBar = document.getElementById("ramBar");
	var netBar = document.getElementById("netBar");
	var cpuBar = document.getElementById("cpuBar");
	var ramWidth = 0;
	var netWidth = 0;
	var cpuWidth = 0;
	var ramBool, netBool,cpuBool = false;
	var id = setInterval(frame, 10);
	function frame() {
		if (ramWidth >= ram_usageper) {
			ramBool = true;
		} else {
			ramWidth++;
			ramBar.style.width = ramWidth + '%';
			$("#ramUsed").html(ram_usage_unit+" used");
			$("#ramMax").html(ram_quota_unit);
		}
		/////////////////////////////////////////////
		if (netWidth >= net_usageper) {
			cpuBool = true;
		} else {
			netWidth++;
			netBar.style.width = netWidth + '%';
			$("#netUsed").html(net_used_unit+" used");
			$("#netMax").html(net_limit_unit);
		}
		/////////////////////////////////////////////
		if (cpuWidth >= cpu_usageper) {
			netBool = true;
		} else {
			cpuWidth++;
			cpuBar.style.width = cpuWidth + '%';
			$("#cpuUsed").html(cpu_used_unit+" used");
			$("#cpuMax").html(cpu_limit_unit);
		}
		if(ramBool && netBool && cpuBool){
			clearInterval(id);
		}
	}
}

var account, contract;

function check() {
	$("#err6").text("");
	networkSelector();
	$("#err1").text("");
	$("#err2").text("");
	contract = $('#contract').val();
	account =  $('#account').val();
	if(contract == ""){
		$("#err1").text("Input required");
		return;
	}
	if(account == ""){
		$("#err2").text("Input required");
		return;
	}

	var cExist = contractExist(contract);
	var aExist = accExist(account);
	setTimeout(function(){
		if(!cExist || !aExist)	return;
	},5000);
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
				token = b.match(/[a-zA-Z]+|[0-9]+(?:\.[0-9]+)?|\.[0-9]+/g);
				tokenDetails(token,contract);
				accountDetails(token,account);
				$('#preloader').show();
				setTimeout(function(){
					$('#preloader').hide();
				},1000);
				$("#quantity").attr("placeholder","Quantity in "+token[1]);
				$("#err3").text("");
				$("#balanceField").hide();
				$("#details").show();
				//updateChart();
    		}
    		catch(err)
    		{
				$("#err6").text("Result not found");
			}
    		$("#balance").text(b);
			$("#balField").show();
			$("#quantity").val("");
			$("#recipient").val("");

			if(scatter.identity != null) {
				$("#detatchBtn").show();
        		$("#integrateBtn").hide();
			}
			else {
				$("#detatchBtn").hide();
        		$("#integrateBtn").show();
			}
			window.location.hash = '#details';
		}
	});
	xhr.open("POST", url+"/v1/chain/get_table_rows");
	xhr.send(data);
}

var st = false;
function accExist(account){
	st = false;
	var exist = false;
	var data = JSON.stringify({
		"account_name": account
	});
	var xhr = new XMLHttpRequest();
	xhr.withCredentials = false;
	xhr.addEventListener("readystatechange", function () {
  		if (this.readyState === this.DONE) {
			var acc = JSON.parse(this.responseText);
    		if(acc.code==500){
				$("#err2").text("Account doesn't exist");
				$("#err3").text("Account doesn't exist");
			}
			else{
				exist = true;
				st = true;
			}
  		}
	});
	xhr.open("POST", url+"/v1/chain/get_account");
	xhr.send(data);
	return exist;
}

function contractExist(contract){
	var exist = false;
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
			}
			else	exist = true;
  		}
	});	
	xhr.open("POST", url+"/v1/chain/get_code");
	xhr.send(data);
	return status;
}

function cpuCalc(val){
	var cpu_val;
	var cpu_unit=""
	if(val>=60000000) {
		cpu_val=val/60000000;
		cpu_val=cpu_val.toFixed(3);
		cpu_unit="min";
	}
	else if(val>=1000000) {
		cpu_val=val/1000000;
		cpu_val=cpu_val.toFixed(3);
		cpu_unit="sec";
	}
	else if(val>=1000) {
		cpu_val=val/1000;
		cpu_val=cpu_val.toFixed(3);
		cpu_unit="ms";
	}
	else {
		cpu_val=val;
		cpu_unit="µs"
	}	
	var cpu_value=cpu_val+" "+cpu_unit;	
	return cpu_value;
}

function netCalc(val){
	var net_val;
	var net_unit=""
	if(val>=1073741824) {
		net_val=val/1073741824;
		net_val=net_val.toFixed(3);
		net_unit="GiB"
	}
	else if(val>=1048576) {
		net_val=val/1048576;
		net_val=net_val.toFixed(3);
		net_unit="MiB";
	}
	else if(val>=1024) {
		net_val=val/1024;
		net_val=net_val.toFixed(3);
		net_unit="KiB";
	}
	else {
		net_val=val;
		net_unit="bytes"
	}	
	var net_value=net_val+" "+net_unit;	
	return net_value;
}

function noValue(value){
	if(value=="NaN"){
		value=0;
		return value;
	}
	else{
		var	res = value.match(/[a-zA-Z]+|[0-9]+(?:\.[0-9]+)?|\.[0-9]+/g);
		return res[0];
	}
}

function availability(result){
	if(jQuery.isEmptyObject(result)) {	
		var net_staked="0.0000 EOS";
		var net_delegated="0.0000";
		var cpu_staked="0.0000 EOS";
		var cpu_delegated="0.0000";	
	}
	else {
		var net_staked=result.net_weight;
		var net_resource=result.net_weight;
		var netStaked=noValue(net_staked);
		var netResource=noValue(net_resource);
		var net_delegated=netResource-netStaked;
		net_delegated=net_delegated.toFixed(4);

		var cpu_staked=result.cpu_weight;
		var cpu_resource=result.cpu_weight;
		var cpuStaked=noValue(cpu_staked);
		var cpuResource=noValue(cpu_resource);
		var cpu_delegated=cpuResource-cpuStaked;
		cpu_delegated=cpu_delegated.toFixed(4);
	}

	$("#netStaked").text("Staked : "+net_staked);
	$("#netDelegated").text("Delegated : "+net_delegated+ " EOS");

	$("#cpuStaked").text("Staked : "+cpu_staked);
	$("#cpuDelegated").text("Delegated : "+cpu_delegated+ " EOS");
}

function percentage(a,b) {
	var per=((a/b)*100).toFixed(6);
	return per;
}

function checkAnother(){
	window.location.hash = '#entry';
	$('#preloader').show();
	setTimeout(function(){
		$('#preloader').hide();
	},500);
    $("#details").hide();
    $("#balanceField").show();
    $("#contract").val("");
    $("#account").val("");
    st = false;
}