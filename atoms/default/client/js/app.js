// if you want to import a module from shared/js then you can
// just do e.g. import Scatter from "shared/js/scatter.js"
import Swiper, {
    Navigation,
    Pagination
} from 'swiper';

// configure Swiper to use modules
Swiper.use([Navigation, Pagination]);

console.log(Swiper)

var swiper = new Swiper('.swiper-container', {
    pagination: {
        el: '.swiper-pagination',
        clickable: 'true',
    },
    navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
    },
});





setTimeout(() => {
    if (window.resize) {
        const html = document.querySelector("html");
        const body = document.querySelector("body");
        html.style.overflow = "hidden";
        html.style.margin = "0px";
        html.style.padding = "0px";
        body.style.overflow = "hidden";
        body.style.margin = "0px";
        body.style.padding = "0px";
        window.resize();
    }
}, 100);