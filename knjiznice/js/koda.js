
var baseUrl = 'https://rest.ehrscape.com/rest/v1';
var queryUrl = baseUrl + '/query';

var username = "ois.seminar";
var password = "ois4fri";


/**
 * Prijava v sistem z privzetim uporabnikom za predmet OIS in pridobitev
 * enolične ID številke za dostop do funkcionalnosti
 * @return enolični identifikator seje za dostop do funkcionalnosti
 */
function getSessionId() {
    var response = $.ajax({
        type: "POST",
        url: baseUrl + "/session?username=" + encodeURIComponent(username) +
                "&password=" + encodeURIComponent(password),
        async: false
    });
    return response.responseJSON.sessionId;
}

$(document).ready(function() {
    
  /**
   * Napolni testne vrednosti (ime, priimek in datum rojstva) pri kreiranju
   * EHR zapisa za novega bolnika, ko uporabnik izbere vrednost iz
   * padajočega menuja (npr. Pujsa Pepa).
   */
  $('#preberiPredlogoBolnika').change(function() {
    $("#kreirajSporocilo").html("");
    var podatki = $(this).val().split(",");
    $("#kreirajIme").val(podatki[0]);
    $("#kreirajPriimek").val(podatki[1]);
    $("#kreirajSpol").val(podatki[3]);
    $("#kreirajDatumRojstva").val(podatki[2]);
  });
  
  parseCookie();
  
  /**
    * Napolni testni EHR ID pri pregledu meritev vitalnih znakov obstoječega
   * bolnika, ko uporabnik izbere vrednost iz padajočega menuja
   * (npr. Ata Smrk, Pujsa Pepa)
   */
	$('#preberiEhrIdZaVitalneZnake').change(function() {
		$("#preberiMeritveVitalnihZnakovSporocilo").html("");
		$("#rezultatMeritveVitalnihZnakov").html("");
		$("#meritveVitalnihZnakovEHRid").val($(this).val());
	});

	
	$('#user').change(function() {
		$("#preberiSporocilo").html("");
		$("#dodajVitalnoEHR").val($(this).val());
	});
	
	$('#user').change(function() {
		$("#preberiSporocilo").html("");
		$("#preberiEHRid").val($(this).val());
	});
	
	$('#user').change(function() {
		$("#preberiSporocilo").html("");
		$("#meritveVitalnihZnakovEHRid").val($(this).val());
	});
	
	$('#user').change(function() {
		$("#preberiSporocilo").html("");
		$("#grafEhr").val($(this).val());
	});
	
// <------------Prikazi okvircke------------------->
	
	//Dodaj uporabnika
	$("#gumbDodajUporabnika").click(function(){
        $("#dodaj").css("display", "block");
    });
	
	//Vnos uporabnika
	$("#dodajPodatke").click(function(){
        $("#vnosPodatkov").css("display", "block");
    });
    
    //pregled Podatkov
	  $("#dodajPodatke").click(function(){
	        $("#pregledPodatkov").css("display", "block");
	    });
    
    //pregled Grafa
	  $("#gumbGraf").click(function(){
	        $("#graf_okvir").css("display", "block");
	    });
	    
	    
// <------------Skrij okvircke------------------->
	 $("#gumbEHR").click(function(){
	        $("#dodaj").css("display", "none");
	    });
	    
	 $("#gumbDodajMeritve").click(function(){
	        $("#graf_okvir").css("display", "none");
	    });
	    
    $("#dodajPodatke").click(function(){
        $("#dodaj").css("display", "none");
    });
    
    
  /**
   * Napolni testne vrednosti (EHR ID, datum in ura, telesna višina,
   * telesna teža, telesna temperatura, sistolični in diastolični krvni tlak,
   * nasičenost krvi s kisikom in merilec) pri vnosu meritve vitalnih znakov
   * bolnika, ko uporabnik izbere vrednosti iz padajočega menuja (npr. Ata Smrk)
   */
	$('#preberiObstojeciVitalniZnak').change(function() {
		$("#dodajMeritveVitalnihZnakovSporocilo").html("");
		var podatki = $(this).val().split("|");
		$("#dodajVitalnoEHR").val(podatki[0]);
		$("#dodajVitalnoDatumInUra").val(podatki[1]);
		$("#dodajVitalnoTelesnaVisina").val(podatki[2]);
		$("#dodajVitalnoTelesnaTeza").val(podatki[3]);
	});
	
	/**
   * Napolni testni EHR ID pri pregledu meritev vitalnih znakov obstoječega
   * bolnika, ko uporabnik izbere vrednost iz padajočega menuja
   * (npr. Ata Smrk, Pujsa Pepa)
   */
	$('#preberiEhrIdZaVitalneZnake').change(function() {
		$("#preberiMeritveVitalnihZnakovSporocilo").html("");
		$("#rezultatMeritveVitalnihZnakov").html("");
		$("#meritveVitalnihZnakovEHRid").val($(this).val());
	});


});

/**
 * Kreiraj nov EHR zapis za pacienta in dodaj osnovne demografske podatke.
 * V primeru uspešne akcije izpiši sporočilo s pridobljenim EHR ID, sicer
 * izpiši napako.
 */
function kreirajEHRzaBolnika() {
	sessionId = getSessionId();

	var ime = $("#kreirajIme").val();
	var priimek = $("#kreirajPriimek").val();
	var spol = $("#kreirajSpol").val();
	    switch (spol) {
	        case 'Ženski':
	            spol = 'FEMALE';
	            break;
	            
	        case 'Moški':
	            spol = 'MALE';
	            break;
	            
	        case 'Drugo':
	            spol = 'OTHER';
	            break;
	            
	        default:
                spol = 'UNKNOWN';	            
	    }
	    
	var datumRojstva = $("#kreirajDatumRojstva").val();

	if (!ime || !priimek || !spol || !datumRojstva || ime.trim().length == 0 ||
      priimek.trim().length == 0 || datumRojstva.trim().length == 0) {
		$("#kreirajSporocilo").html("<span class='obvestilo label " +
      "label-warning fade-in'>Prosim vnesite zahtevane podatke!</span>");
	} else {
		$.ajaxSetup({
		    headers: {"Ehr-Session": sessionId}
		});
		$.ajax({
		    url: baseUrl + "/ehr",
		    type: 'POST',
		    success: function (data) {
		        var ehrId = data.ehrId;
		        var partyData = {
		            firstNames: ime,
		            lastNames: priimek,
		            gender: spol,
		            dateOfBirth: datumRojstva,
		            partyAdditionalInfo: [{key: "ehrId", value: ehrId}]
		        };
		        $.ajax({
		            url: baseUrl + "/demographics/party",
		            type: 'POST',
		            contentType: 'application/json',
		            data: JSON.stringify(partyData),
		            success: function (party) {
		                if (party.action == 'CREATE') {
		                    $("#kreirajSporocilo").html("<span class='obvestilo " +
                          "label label-success fade-in'>Uspešno kreiran EHR '" +
                          ehrId + "'.</span>");
		                    //$("#preberiEHRid").val(ehrId);
		                  var value = dodajToCookie() + ime + "," + priimek + "," + ehrId + "|";
		                  createCookie("EhrPodatek", value, 60);
		                  parseCookie();
		                }
		            },
		            error: function(err) {
		            	$("#kreirajSporocilo").html("<span class='obvestilo label " +
                    "label-danger fade-in'>Napaka '" +
                    JSON.parse(err.responseText).userMessage + "'!");
		            }
		            
		        });
		    }
		});
	}
	
	//praznjenje okvirčkov s podatki
    $("#kreirajSporocilo").html("");
    $("#kreirajIme").val("");
    $("#kreirajPriimek").val("");
    $("#kreirajSpol").val("");
    $("#kreirajDatumRojstva").val("");
}

/**
 * Generator podatkov za novega pacienta, ki bo uporabljal aplikacijo. Pri
 * generiranju podatkov je potrebno najprej kreirati novega pacienta z
 * določenimi osebnimi podatki (ime, priimek in datum rojstva) ter za njega
 * shraniti nekaj podatkov o vitalnih znakih.
 * @param stPacienta zaporedna številka pacienta (1, 2 ali 3)
 * @return ehrId generiranega pacienta
 */
function generirajPodatke(stPacienta) {
  ehrId = "";

  // TODO: Potrebno implementirati

  return ehrId;
}


function createCookie(name, value, expires, path, domain) {
  var cookie = name + "=" + escape(value) + ";";

  if (expires) {
    // If it's a date
    if(expires instanceof Date) {
      // If it isn't a valid date
      if (isNaN(expires.getTime()))
       expires = new Date();
    }
    else
      expires = new Date(new Date().getTime() + parseInt(expires) * 1000 * 60 * 60 * 24);

    cookie += "expires=" + expires.toGMTString() + ";";
  }

  if (path)
    cookie += "path=" + path + ";";
  if (domain)
    cookie += "domain=" + domain + ";";

  document.cookie = cookie;
}

function getCookie(name) {
  var regexp = new RegExp("(?:^" + name + "|;\s*"+ name + ")=(.*?)(?:;|$)", "g");
  var result = regexp.exec(document.cookie);
  return (result === null) ? null : result[1];
}

function parseCookie() {
    $("#user").empty();
    /*
    //TODO
    var output = '<option value="'+ ehr + '">' +ime in priimek + ' ' + data[1] + '</option>';
    $("#user").append(output);
    
    */
    $("#user").append('<option value="">Izberi uporabnika...</option>');
    
    var current = getCookie("EhrPodatek");
    if(current) {
      current = current.replace(/%7C/g,"|");
        var a = current.split("|");
        
        a.forEach(function (c) {
            if(c) {
              c = c.replace(/%2C/g,",");
              var data = c.split(","); //ime,priimek,ehr
              //<option value="Moški/Ženski"></option>
              var output = '<option value="'+ data[2] + '">' + data[0] + ' ' + data[1] + '</option>';
              $("#user").append(output);
            }
        });
    }
}

function dodajToCookie() {
    var current = getCookie("EhrPodatek");
    if(current) {
        current = current.replace(/%7C/g,"|");
        current = current.replace(/%2C/g,",");
        return current;
    } else {
        return "";
    }
}

/**
 * Za dodajanje vitalnih znakov pacienta je pripravljena kompozicija, ki
 * vključuje množico meritev vitalnih znakov (EHR ID, datum in ura,
 * telesna višina, telesna teža, sistolični in diastolični krvni tlak,
 * nasičenost krvi s kisikom in merilec).
 */
function dodajMeritveVitalnihZnakov() {
	sessionId = getSessionId();

	var ehrId = $("#dodajVitalnoEHR").val();
	var datumInUra = $("#dodajVitalnoDatumInUra").val();
	var telesnaVisina = $("#dodajVitalnoTelesnaVisina").val();
	var telesnaTeza = $("#dodajVitalnoTelesnaTeza").val();

	if (!ehrId || ehrId.trim().length == 0) {
		$("#dodajMeritveVitalnihZnakovSporocilo").html("<span class='obvestilo " +
      "label label-warning fade-in'>Prosim vnesite zahtevane podatke!</span>");
	} else {
		$.ajaxSetup({
		    headers: {"Ehr-Session": sessionId}
		});
		var podatki = {
			// Struktura predloge je na voljo na naslednjem spletnem naslovu:
      // https://rest.ehrscape.com/rest/v1/template/Vital%20Signs/example
		    "ctx/language": "en",
		    "ctx/territory": "SI",
		    "ctx/time": datumInUra,
		    "vital_signs/height_length/any_event/body_height_length": telesnaVisina,
		    "vital_signs/body_weight/any_event/body_weight": telesnaTeza
		};
		var parametriZahteve = {
		    ehrId: ehrId,
		    templateId: 'Vital Signs',
		    format: 'FLAT'
		};
		$.ajax({
		    url: baseUrl + "/composition?" + $.param(parametriZahteve),
		    type: 'POST',
		    contentType: 'application/json',
		    data: JSON.stringify(podatki),
		    success: function (res) {
		        $("#dodajMeritveVitalnihZnakovSporocilo").html(
              "<span class='obvestilo label label-success fade-in'>" +
              res.meta.href + ".</span>");
		    },
		    error: function(err) {
		    	$("#dodajMeritveVitalnihZnakovSporocilo").html(
            "<span class='obvestilo label label-danger fade-in'>Napaka '" +
            JSON.parse(err.responseText).userMessage + "'!");
		    }
		});
	}
}

var podatki_graf = {
	weight: null,
	height: null
};

/**
 * Pridobivanje vseh zgodovinskih podatkov meritev izbranih vitalnih znakov
 * (telesna temperatura, filtriranje telesne temperature in telesna teža).
 * Filtriranje telesne temperature je izvedena z AQL poizvedbo, ki se uporablja
 * za napredno iskanje po zdravstvenih podatkih.
 */
function preberiMeritveVitalnihZnakov() {
	$("#preberiMeritveVitalnihZnakovSporocilo").empty();
	
	sessionId = getSessionId();

	var ehrId = $("#meritveVitalnihZnakovEHRid").val();

	if (!ehrId || ehrId.trim().length == 0) {
		$("#preberiMeritveVitalnihZnakovSporocilo").html("<span class='obvestilo " +
      "label label-warning fade-in'>Prosim vnesite zahtevan podatek!");
	} else {
		$.ajax({
			url: baseUrl + "/demographics/ehr/" + ehrId + "/party",
	    	type: 'GET',
	    	headers: {"Ehr-Session": sessionId},
	    	success: function (data) {
				var party = data.party;
				$("#rezultatMeritveVitalnihZnakov").html("<br/><span>Pridobivanje " +
          "podatkov za uporabnika <b>" + party.firstNames +
          " " + party.lastNames + "</b>.</span><br/><br/>");
          
        			
					$.ajax({
					    url: baseUrl + "/view/" + ehrId + "/" + "weight",
					    type: 'GET',
					    headers: {"Ehr-Session": sessionId},
					    success: function (res) {
					    	if (res.length > 0) {
					    		podatki_graf.weight = res;
					    		
					  var results = "<table id='tabelaPodatkov' class='table table-striped " +
                    "'><tr><th>Datum in ura</th>" + 
                    "<th class='text-right'>Telesna teža</th></tr>";
						        for (var i in res) {
						            results += "<tr><td>" + res[i].time + 
                          "</td><td class='text-right'>" + res[i].weight + " " 	+
                          res[i].unit + "</td>";
						        }
						        results += "</table>";
						        $("#rezultatMeritveVitalnihZnakov").append(results);
					    	} else {
					    		$("#preberiMeritveVitalnihZnakovSporocilo").html(
                    "<span class='obvestilo label label-warning fade-in'>" +
                    "Ni podatkov!</span>");
					    	}
					    },
					    error: function() {
					    	$("#preberiMeritveVitalnihZnakovSporocilo").html(
                  "<span class='obvestilo label label-danger fade-in'>Napaka '" +
                  JSON.parse(err.responseText).userMessage + "'!");
					    }
					});
						$.ajax({
						    url: baseUrl + "/view/" + ehrId + "/" + "height",
						    type: 'GET',
						    headers: {"Ehr-Session": sessionId},
						    success: function (res) {
						    	if (res.length > 0) {
						    		podatki_graf.height = res;
						    		$("#tabelaPodatkov tr:eq(0)").append("<th class='text-right'>Telesna višina</th>");
						    		
						    		var st = 1;
							        for (var i in res) {
							    		$("#tabelaPodatkov tr:eq(" + st + ")").append("<td class='text-right'>" + res[i].height + " " 	+ res[i].unit + "</td>");
							    		st++;
							        }
						    	} else {
						    		$("#preberiMeritveVitalnihZnakovSporocilo").html(
	                    "<span class='obvestilo label label-warning fade-in'>" +
	                    "Ni podatkov!</span>");
						    	}
						    },
						    error: function() {
						    	$("#preberiMeritveVitalnihZnakovSporocilo").html(
	                  "<span class='obvestilo label label-danger fade-in'>Napaka '" +
	                  JSON.parse(err.responseText).userMessage + "'!");
						    }
						});
					
	    	},
	    	error: function(err) {
	    		$("#preberiMeritveVitalnihZnakovSporocilo").html(
            "<span class='obvestilo label label-danger fade-in'>Napaka '" +
            JSON.parse(err.responseText).userMessage + "'</span>");
	    	}
		});
	}
}

function kreirajGraf() {
	$('#graf').empty();
	
	if(!podatki_graf.weight) {
		$("#grafSporocilo").html(
            "<span class='obvestilo label label-danger fade-in'>Napaka: ni podatkov!</span>");
        return;
	}
	
	var data_g = {
		time: ['x'],
		weight: ['Teža']
	};
	
	for (var i in podatki_graf.weight) {
		var c = podatki_graf.weight[i].time;
		//c = c.replace(/T/g," ");
		c = c.split('T');
		console.log (c);
		data_g.time.push(c[0]);
		data_g.weight.push(podatki_graf.weight[i].weight);
	}
	
	console.log(data_g);
var chart = c3.generate({
		bindto: '#graf',
    data: {
        x: 'x',
//        xFormat: '%Y%m%d', // 'xFormat' can be used as custom format of 'x'
        columns: [
            data_g.time,
//            ['x', '20130101', '20130102', '20130103', '20130104', '20130105', '20130106'],
            	data_g.weight
        ]
    },
    axis: {
        x: {
            type: 'timeseries',
            tick: {
                format: '%Y-%m-%d'
            }
        }
    }
});

}
