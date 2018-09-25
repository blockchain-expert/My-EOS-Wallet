var scatterConnected, scatterAccount, account, requiredFields;
scatter.connect("Wallet For EOS").then(function(connected){
    console.log('Scatter connected');
    scatterConnected = connected;
}).catch(function(x){
    console.log('x', x);
});
function signIn(){
    if(!scatterConnected)  {
        $("#viewTx").hide();
        $('#a1').addClass('active');
        $("#a2").addClass('active');
        $("#errorHeading").text("Install scatter");
        $("#errorMsg").text("Install scatter to use this functionality");
        $("#fromDiv").hide();
        $("#tick").hide();
        $("#sign-out").hide();
        $("#install").show();
        $("#sign-in").hide();
        return;
    }
    networkTest = {
        protocol:'http', 
        blockchain:'eos',
        host:'52.199.125.75',
        port:8888,
        chainId:"038f4b0fc8ff18a4f0842a8f0564611f6e96e8535901dd45e43ac8691a1c4dca",
    };
    networkMain = {
        protocol:'https', 
        blockchain:'eos',
        host:'nodes.get-scatter.com',
        port:443,
        chainId:"aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906",
    };
    networkSelector();
    if(isMainnet) {
        requiredFields = {
            accounts:[networkMain]
        };
    }
    else {
        requiredFields = {
            accounts:[networkTest]
        };
    }
    try {
        scatter.forgetIdentity().then(function(){scatter.getIdentity(requiredFields).then(function(id){
            account = id.accounts.find(function(x){ return x.blockchain === 'eos' });
            scatterAccount = account.name;
            $("#account").val(account.name);
            $("#detatchBtn").show();
            $("#integrateBtn").hide();
            $("#fromDiv").show();
            $("#from").text(account.name);
        })});
    }
    catch(err){
        scatter.getIdentity(requiredFields).then(function(id){
            account = id.accounts.find(function(x){ return x.blockchain === 'eos' });
            scatterAccount = account.name;
            $("#account").val(account.name);
            $("#detatchBtn").show();
            $("#integrateBtn").hide();
            $("#fromDiv").show();
            $("#from").text(account.name);
        })
    }
}

function checkIdentity(){
    scatter.getIdentity(requiredFields).then(function(){
        $("#detatchBtn").show();
        $("#integrateBtn").hide();
        return true;
    }).catch(function(){
        $("#detatchBtn").hide();
        $("#integrateBtn").show();
        return false;
    })
}

function signOut(){
    scatter.forgetIdentity().then(() => {
        $("#integrateBtn").show();
        $("#detatchBtn").hide();
        $("#fromDiv").hide();
        $("#viewTx").hide();
        $('#a1').addClass('active');
        $("#a2").addClass('active');
        $("#tick").hide();
        $("#install").hide();
        $("#sign-in").hide();
        $("#sign-out").show();
        $("#errorHeading").text("Signed out!");
        $("#errorMsg").text("Your scatter identity is signed out");
    });
}

function transferFn(){
    if(!scatterConnected)  {
        $("#viewTx").hide();
        $('#a1').addClass('active');
        $("#a2").addClass('active');
        $("#tick").hide();
        $("#sign-out").hide();
        $("#install").show();
        $("#sign-in").hide();
        $("#errorHeading").text("Install scatter");
        $("#errorMsg").text("Install scatter to use this functionality");
        return;
    }
    if(scatter.identity == null){
        $("#viewTx").hide();
        $('#a1').addClass('active');
        $("#a2").addClass('active');
        $("#tick").hide();
        $("#sign-out").hide();
        $("#install").hide();
        $("#sign-in").show();
        $("#errorHeading").text("Integrate scatter first!");
        $("#errorMsg").text("Integrate scatter to transfer tokens");
        return;
    }

    var to = $("#recipient").val();
    if(to == ""){
		$("#err3").text("Input required");
		return;
    }
    accExist(to);
    $("#err3").text("");
    $("#err4").text("");
    
    if(to == scatterAccount) {
        $("#err3").text("Recipient must be different");
		return;
    }
 
    if($("#quantity").val() == ""){
        $("#err4").text("Input required");
		return;
    }
    var quantity = parseFloat($("#quantity").val()).toFixed(4);
    if(isNaN($("#quantity").val())){
        $("#err4").text("Wrong input");
		return;
    }
    if(quantity <= 0){
        $("#err4").text("Wrong input");
		return;  
    }
    if(parseFloat(quantity) > parseFloat(tokenBal)){
        $("#err4").text("Insufficient Balance");
        return;
    }
    const accountScatter = scatter.identity.accounts.find(accountScatter => accountScatter.blockchain === 'eos');
    const options = {
             authorization: [ `${accountScatter.name}@${accountScatter.authority}`]
              };
    if(isMainnet)   var eos = scatter.eos(networkMain, Eos, options);
    else    var eos = scatter.eos(networkTest, Eos, options);

    
    //const account = scatter.identity.accounts.find(function(x){ return x.blockchain === 'eos' });
    setTimeout(function(){
        if(!st){
            return;
        }

        eos.contract(contract).then(contract => {
            var accName = accountScatter.name;
            var to = $("#recipient").val();
            contract.transfer(
            {
                "from": accName,
                "to": to,
                "quantity": quantity+" "+token[1],
                "memo": ""
            }).then(function(res){
                var start = new Date().getTime();
                for (var i = 0; i < 1e7; i++) {
                    if ((new Date().getTime() - start) > 500){
                        break;
                    }
                }
                $('#a1').addClass('active');
                $("#a2").addClass('active');
                $("#errorHeading").text("Transaction complete");
                $("#install").hide();
                $("#sign-out").hide();
                $("#sign-in").hide();
                $("#tick").show();
                $("#viewTx").show();
                $("#viewTx").click(function(){
                    if(isMainnet)   window.open("http://eosnetworkmonitor.io/#transactions:" + res.transaction_id, '_blank');
                    else    window.open("http://jungle.cryptolions.io/#tx:" + res.transaction_id, '_blank');
                });
                check();
            }).catch(function(err){
                console.log('err', err);
            });
        });
 },2000); 
}