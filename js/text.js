var data = JSON.stringify({
    "scope": "chainceoneos",
    "code": "therealkarma",
    "table": "accounts",
    "json": "true"
  });

  var xhr = new XMLHttpRequest();
  xhr.withCredentials = false;
  
  xhr.addEventListener("readystatechange", function () {
    if (this.readyState === this.DONE) {
        var acc = JSON.parse(this.responseText);
        console.log(acc);
    }
  });

	
	xhr.open("POST", "http://node.eosmeso.io/v1/chain/get_code");
	xhr.send(data);
	