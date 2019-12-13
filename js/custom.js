'use strict';

let launchliste = [];

function holeDaten() {
    axios.get('https://api.spacexdata.com/v3/launches')
        .then(function (response) {

        launchliste = response.data;

        let tempArray = launchliste.map(function (mission)  {

            return {
                bildgross: mission.links.mission_patch,
                bildklein: mission.links.mission_patch_small,
                startjahr: mission.launch_year,
                startdatum: mission.launch_date_local,
                beschreibung: mission.details,
                raketenname: mission.rocket.rocket_name,
                startplatz: mission.launch_site.site_name_long,
                ladungen: mission.rocket.second_stage.payloads.length,
                ladungsdetails: mission.rocket.second_stage.payloads,
                erfolg: mission.launch_success
            }
        });

        launchliste = tempArray;

        zeichneSelectboxen('startjahr');
        zeichneSelectboxen('raketenname');
        zeichneSelectboxen('startplatz');

        zeichnetabelle();

    })
    .catch(function(error) {
        console.log(error)
    })
}

function zeichneSelectboxen(element) {
let selectboxen = [];

for (let i of launchliste) {
    let tempElement = i[element];
    selectboxen.push(tempElement);
}

let reduzierteWerte = new Set(selectboxen);
let optionen = '';
for (let i of reduzierteWerte) {
    optionen += `<option value="${i}">${i}</option>`;
}
document.querySelector(('#' + element)).innerHTML += optionen;
}

function zeichnetabelle() {
    let eintrag = "";
    let zusammenfassung = "";
    let gesamtMissionen = 0;
    let erfolge = 0;
    let misserfolge = 0;
    let gesamtFracht = 0;
    let gesamtKg = 0;

    let startjahrSelect = document.querySelector('#startjahr').value;
    let raketennameSelect = document.querySelector('#raketenname').value;
    let startplatzSelect = document.querySelector('#startplatz').value;


    console.log('Selektiertes Startjahr: ', startjahrSelect)

    let listeGefiltert = launchliste;

    if (startjahrSelect !== 'alle') {
        console.log('Alle trifft nicht zu');
        listeGefiltert = listeGefiltert.filter(element => element.startjahr == startjahrSelect);
    }

    if (raketennameSelect !== 'alle') {
        console.log('Alle trifft nicht zu');
        listeGefiltert = listeGefiltert.filter(element => element.raketenname == raketennameSelect);
    }

    if (startplatzSelect !== 'alle') {
        console.log('Alle trifft nicht zu');
        listeGefiltert = listeGefiltert.filter(element => element.startplatz == startplatzSelect);
    }

    for (let i of listeGefiltert) {

        let kurzDatum = i.startdatum.slice(0, 10);

        let tempGewicht = 0;
        for (let j = 0; j < i.ladungen; j++) {
            tempGewicht = tempGewicht + i.ladungsdetails[j].payload_mass_kg;
        }

        if (i.erfolg == null) {
        i.erfolg = 'zukunft';
        }
        if (i.beschreibung == null) {
            i.beschreibung = 'No description available.';
        }
        if (i.bildklein == null) {
        i.bildklein = 'img/spacex-logo.png';
        }
        if (i.bildgross == null) {
        i.bildgross = 'img/spacex-logo.png';
        }

        gesamtMissionen++;

        if (i.erfolg === true) {
            erfolge++;
        } else {
            misserfolge++;
        }

        gesamtFracht = gesamtFracht + i.ladungen;

        gesamtKg = gesamtKg + tempGewicht;

        eintrag += `
        <tr class="${i.erfolg}">
            <td><a href="${i.bildgross}" target="_blank"><img src="${i.bildklein}" alt="Launch Mission Patch" class="patchimage"></a></td>
            <td class="text-center">${i.startjahr}</td>
            <td class="text-center">${kurzDatum}</td>
            <td>${i.beschreibung}</td>
            <td>${i.raketenname}</td>
            <td>${i.startplatz}</td>
            <td class="text-center">${i.ladungen} payload(s)<br>
                with ${tempGewicht} kg total mass</td>
            <td class="text-center"><img src="img/success-${i.erfolg}.png"  height="30px"></td>
        </tr>
        `;

    }

    let gesamtTonnen = (gesamtKg/1000).toFixed(2);
    zusammenfassung = `A total of ${gesamtMissionen} missions were launched. ${erfolge} of them were successful, ${misserfolge} were unsuccessful. ${gesamtFracht} payloads with a sum total weight of ${gesamtTonnen} tons were transported into the cosmos.`;

    if (listeGefiltert.length == 0) {
        eintrag = `
            <tr class="false">
                <td colspan="8" class="text-center"><strong>There are no results for these filter settings.</strong></td>
            </tr>
        `;
        zusammenfassung = '<strong>There are no results for these filter settings.</strong>';
    }
    document.querySelector('#zusammenfassung').innerHTML = zusammenfassung;
    document.querySelector('#tabelleninhalt').innerHTML = eintrag;

}


let alleFilter = document.querySelectorAll('#startjahr, #raketenname, #startplatz');

for (let i of alleFilter) {
    i.addEventListener('change', zeichnetabelle);
}

holeDaten();