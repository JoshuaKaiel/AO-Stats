

function calc_stats(spi, mag, str, wep) {

    let total = spi + mag + str + wep;
    let level = total / 2;
    let name = "None";

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
        {stat: "spirit", value: spi_ratio}, 
        {stat: "magic", value: mag_ratio}, 
        {stat: "strength", value: str_ratio}, 
        {stat: "weapons", value: wep_ratio}
    ];

    ord_ratios.sort((a, b) => {
        if (a.value > b.value) return -1;
        if (a.value < b.value) return 1;
        return 0;
    });

    console.log(ord_ratios);
    
    if (ord_ratios[0].value >= 0.6) {
        switch(ord_ratios[0].stat) {
            case "spirit":
                name = "Oracle";
                break;
            case "magic":
                name = "Mage";
                break;
            case "strength":
                name = "Berserker";
                break;
            case "weapons":
                name = "Warrior";
                break;
        }
    }
    else if (ord_ratios[0].value >= 0.4 && ord_ratios[1].value >= 0.4) {
        let stat_key = [ord_ratios[0].stat, ord_ratios[1].stat].sort().join("_")
        switch(stat_key) {
            case "magic_spirit":
                name = "Paladin";
                break;
            case "magic_strength":
                name = "Warlock";
                break;
            case "magic_weapons":
                name = "Conjurer";
                break;
            case "spirit_strength":
                name = "Juggernaut";
                break;
            case "spirit_weapons":
                name = "Knight";
                break;
            case "strength_weapons":
                name = "Warlord";
                break;
        }
    }
    else if (ord_ratios[0].value <= 0.5 && ord_ratios[1].value <= 0.4 && ord_ratios[2].value <= 0.4) {
        name = "Savant";
    }

    return [level, name, ord_ratios];
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

const calc_btn = document.getElementById("calc_btn");
calc_btn.addEventListener("click", () => {

    let spirit = Number(in_spi.value);
    let magic = Number(in_mag.value);
    let strength = Number(in_str.value);
    let weapons = Number(in_wep.value);

    let res = calc_stats(spirit, magic, strength, weapons);
    
    div_build.innerHTML = `<h4><b>Level ${res[0]} <i>${res[1]}</i></b></h4>`;

    res[2].forEach((elem) => {
        switch(elem.stat) {
            case "spirit":
                r_spi.innerHTML = `${elem.value * 100}%`;
                break;
            case "magic":
                r_mag.innerHTML = `${elem.value * 100}%`;
                break;
            case "strength":
                r_str.innerHTML = `${elem.value * 100}%`; 
                break;
            case "weapons":
                r_wep.innerHTML = `${elem.value * 100}%`;
                break;
        }
    });

});
