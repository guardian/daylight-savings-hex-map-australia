// if you want to import a module from shared/js then you can
// just do e.g. import Scatter from "shared/js/scatter.js"
import axios from 'axios'

var submitter = document.querySelector('#gv-submitter')

var targetdivs = Array.from(document.querySelectorAll('.gv-print-container'))

/*
eg urls:
https://content.guardianapis.com/atom/chart/dec21a5d-de2c-4007-8bef-2025a805eff0
https://api.nextgen.guardianapps.co.uk/embed/atom/chart/dec21a5d-de2c-4007-8bef-2025a805eff0#amp=1



*/


submitter.addEventListener('change', function(e) {
    console.log(e.target.value)
    var callurl = e.target.value;

    if (e.target.value.indexOf('guardianapis') > -1) {
        callurl = callurl.replace('https://content.guardianapis.com/', 'https://api.nextgen.guardianapps.co.uk/embed/')
    }


    axios.get(callurl).then(resp => {
        var innards;
        //detect if an atom
        targetdivs.map(t => t.innerHTML = resp.data);
    })
})