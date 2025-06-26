
// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js";
import { getFirestore, getDocs, collection, query, where } from 'https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyCYgPMdifUdKkTcTlBeNNQotNJOsSGLgAM",
    authDomain: "ao-skills.firebaseapp.com",
    projectId: "ao-skills",
    storageBucket: "ao-skills.firebasestorage.app",
    messagingSenderId: "313665526646",
    appId: "1:313665526646:web:06ae83e61870ff8b5c3857",
    measurementId: "G-X0ZB1KKDQD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

function stats_to_rgba(string) {
    switch(string) {
        case "spi":
            return "rgba(34, 197, 94, 1)";
        case "mag":
            return "rgba(59, 130, 246, 1)";
        case "str":
            return "rgba(248, 113, 113, 1)";
        case "wep":
            return "rgba(250, 204, 21, 1)";
        case "mag_spi":
            return "rgba(32, 216, 172, 1)";
        case "mag_str":
            return "rgba(255, 144, 175, 1)";
        case "mag_wep":
            return "rgba(125, 220, 173, 1)";
        case "spi_str":
            return "rgba(168, 118, 67, 1)";
        case "spi_wep":
            return "rgba(146, 211, 83, 1)";
        case "str_wep":
            return "rgba(235, 161, 90, 1)";
        default:
            return "rgba(249, 219, 248, 1)";
    }
}

function calc_stats(spi, mag, str, wep) {

    let total = spi + mag + str + wep;
    let level = total / 2;
    let name = "None";
    let key = "mag_spi_str_wep";

    let spi_ratio = spi / total;
    let mag_ratio = mag / total;
    let str_ratio = str / total;
    let wep_ratio = wep / total;

    if (total == 0) {
        spi_ratio = 0;
        mag_ratio = 0;
        str_ratio = 0;
        wep_ratio = 0;
    }

    let ord_ratios = [
        {stat: "spi", value: spi_ratio}, 
        {stat: "mag", value: mag_ratio}, 
        {stat: "str", value: str_ratio}, 
        {stat: "wep", value: wep_ratio}
    ];

    ord_ratios.sort((a, b) => {
        if (a.value > b.value) return -1;
        if (a.value < b.value) return 1;
        return 0;
    });

    console.log(ord_ratios);
    
    if (ord_ratios[0].value >= 0.6) {
        key = ord_ratios[0].stat;
        switch(key) {
            case "spi":
                name = "Oracle";
                break;
            case "mag":
                name = "Mage";
                break;
            case "str":
                name = "Berserker";
                break;
            case "wep":
                name = "Warrior";
                break;
        }
    }
    else if (ord_ratios[0].value >= 0.4 && ord_ratios[1].value >= 0.4) {
        key = [ord_ratios[0].stat, ord_ratios[1].stat].sort().join("_");
        switch(key) {
            case "mag_spi":
                name = "Paladin";
                break;
            case "mag_str":
                name = "Warlock";
                break;
            case "mag_wep":
                name = "Conjurer";
                break;
            case "spi_str":
                name = "Juggernaut";
                break;
            case "spi_wep":
                name = "Knight";
                break;
            case "str_wep":
                name = "Warlord";
                break;
        }
    }
    else if (ord_ratios[0].value <= 0.5 && ord_ratios[1].value <= 0.4 && ord_ratios[2].value <= 0.4) {
        name = "Savant";
    }

    return [level, name, ord_ratios, key];
}

const in_spi = document.getElementById("input_spirit");
const in_mag = document.getElementById("input_magic");
const in_str = document.getElementById("input_strength");
const in_wep = document.getElementById("input_weapons");

const r_spi = document.getElementById("ratio_spirit");
const r_mag = document.getElementById("ratio_magic");
const r_str = document.getElementById("ratio_strength");
const r_wep = document.getElementById("ratio_weapons");

const div_build = document.getElementById("div_build");
const div_skills = document.getElementById("div_skills");

const calc_btn = document.getElementById("calc_btn");
calc_btn.addEventListener("click", async () => {

    let spirit = Number(in_spi.value);
    let magic = Number(in_mag.value);
    let strength = Number(in_str.value);
    let weapons = Number(in_wep.value);

    let res = calc_stats(spirit, magic, strength, weapons);
    
    res[2].forEach((elem) => {
        switch(elem.stat) {
            case "spi":
                r_spi.innerHTML = `${elem.value * 100}%`;
                break;
            case "mag":
                r_mag.innerHTML = `${elem.value * 100}%`;
                break;
            case "str":
                r_str.innerHTML = `${elem.value * 100}%`; 
                break;
            case "wep":
                r_wep.innerHTML = `${elem.value * 100}%`;
                break;
        }
    });

    div_build.innerHTML = `<h4><b>Level ${res[0]} <i style="color : ${stats_to_rgba(res[3])};">${res[1]}</i></b></h4>`;


    let statlist = [
        {stat: "spi", value: spirit}, 
        {stat: "mag", value: magic}, 
        {stat: "str", value: strength}, 
        {stat: "wep", value: weapons}
    ];

    const skills = (await getDocs(collection(db, "Habilidades"))).docs;

    console.log("unique total:", skills.length);
    
    let learnable = [];

    skills.forEach((skill) => {
        const data = skill.data();
        let stats = JSON.parse(JSON.stringify(data.stats));
        let shared = JSON.parse(JSON.stringify(data.stats));
        
        if ("shared" in data) {
            data.shared.forEach((st) => {
                shared.push(st);
            });
        }
        
        let st_values = [];
        let sh_values = [];
        
        let st_reqs = Math.ceil(data.requirements / stats.length);
        let sh_reqs = Math.ceil(data.requirements / shared.length);

        console.log("stats ==> " + JSON.stringify(stats));
        
        shared.forEach((sh_stat) => {
            const value = statlist.find((sl_stat) => sl_stat.stat == sh_stat );
            
            if (value && stats.includes(sh_stat))
                st_values.push(value);
            sh_values.push(value);
        })
        
        if (stats.includes("wep") || stats.includes("spi")) {
            if ("unique" in data && data.unique && 
                (st_values.every(elem => res[3].includes(elem.stat) && elem.value >= st_reqs) || 
                (sh_values.every(elem => res[3].includes(elem.stat) && elem.value >= sh_reqs)))) {
                    if ("exclusive" in data)
                        learnable.push({name: data.name, extra: `for the ${data.exclusive}`});
                    else 
                        learnable.push({name: data.name});
            }
            else {
                let st_req_item = (Math.min(...st_values.map(elem => Number(elem.value))) - ((st_reqs - 30) / st_values.length)) / 2;
                let sh_req_item = (Math.min(...sh_values.map(elem => Number(elem.value))) - ((sh_reqs - 30) / sh_values.length)) / 2;
                let max_wep_lvl = Math.ceil(Math.max(...[st_req_item, sh_req_item]));
                
                if (max_wep_lvl >= 0) {
                    if ("exclusive" in data)
                        learnable.push({name: data.name, extra: `for the ${data.exclusive}`});
                    else 
                        learnable.push({name: data.name, extra: `for an item of level ${max_wep_lvl}`});
                }
            }
        }
        else if ((st_values.every(elem => res[3].includes(elem.stat) && elem.value >= st_reqs)) || 
                (sh_values.every(elem => res[3].includes(elem.stat) && elem.value >= sh_reqs))) {
                if ("exclusive" in data)
                    learnable.push({name: data.name, extra: `for ${data.exclusive}`});
                else 
                    learnable.push({name: data.name});
        }
                
    });

    div_skills.innerHTML = "<h4>List of learnable skills</h4>";

    learnable.forEach((skill) => {
        if ("extra" in skill)
            div_skills.innerHTML += `<p class="py-1"><i>${skill.name}</i> ${skill.extra}</p>`;
        else 
            div_skills.innerHTML += `<p class="py-1"><i>${skill.name}</i></p>`;
    })  

});
