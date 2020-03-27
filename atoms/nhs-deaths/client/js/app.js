import loadJson from 'shared/js/load-json'
import covidMap from 'assets/covid-uk.json'
import * as d3B from 'd3'
import * as topojson from 'topojson'
import { $, $$, getDataUrlForEnvironment } from "shared/js/util"
import {event as currentEvent} from 'd3-selection';

let dataurl = getDataUrlForEnvironment();

const d3 = Object.assign({}, d3B, topojson);

const headline = d3.select(".interactive-nhs-wrapper").append("h2").attr('class', 'headline');
const standfirst = d3.select(".interactive-nhs-wrapper").append("div").attr('class', 'standfirst');

const map = d3.select(".interactive-nhs-wrapper").append("div").attr('class', 'map');

const atomEl = d3.select('.interactive-nhs-wrapper').node()

const isMobile = window.matchMedia('(max-width: 600px)').matches;

let width = atomEl.getBoundingClientRect().width;
let height = width  * 1.3;

let ukWidth = isMobile ? atomEl.getBoundingClientRect().width : atomEl.getBoundingClientRect().width /2;
let ukHeight = ukWidth * 1.3;

let londonWidth = isMobile ? atomEl.getBoundingClientRect().width : atomEl.getBoundingClientRect().width /2;
let londonHeight = londonWidth;

let tooltip = d3.select(".tooltip")

const radius = d3.scaleSqrt()
.range([0, isMobile ? 15 : 20])

let projection = d3.geoMercator()

let path = d3.geoPath()
.projection(projection)

const mapUk = map
.append('svg')
.attr('id', 'coronavirus-uk-map-svg')
.attr('width', ukWidth)
.attr('height', ukHeight)

const geo = mapUk.append('g').attr('class', 'geo');
const bubbles = mapUk.append('g');
const labels = mapUk.append('g');

const englandWales = topojson.feature(covidMap, {
	type: "GeometryCollection",
	geometries: covidMap.objects['covid-uk'].geometries.filter(d => d.properties.ctyua17cd.indexOf('S0') == -1 && d.properties.ctyua17cd != 'NIreland')
});

projection.fitSize([ukWidth, ukHeight], englandWales);

geo.selectAll('path')
.data(englandWales.features)
.enter()
.append('path')
.attr('d', path)
.attr('class', d => 'area ' + d.properties.ctyua17cd)

//---------------

const mapLondon = map
.append('svg')
.attr('id', 'coronavirus-london-map-svg')
.attr('width', londonWidth)
.attr('height', londonHeight)

const geoLondon = mapLondon.append('g');
const bubblesLondon = mapLondon.append('g');
const labelsLondon = mapLondon.append('g');

const london = topojson.feature(covidMap, {
	type: "GeometryCollection",
	geometries: covidMap.objects['covid-uk'].geometries.filter(d => d.properties.ctyua17cd.indexOf('E09') > -1)
});

projection.fitSize([londonWidth, londonHeight], london);

geoLondon.selectAll('path')
.data(london.features)
.enter()
.append('path')
.attr('d', path)
.attr('class', d => 'area ' + d.properties.ctyua17cd)


const source = d3.select(".interactive-nhs-wrapper").append("div").attr('class', 'source');

loadJson(dataurl)
.then(fileRaw => {

	console.log(fileRaw.sheets.furniture[0].text)

	headline.html(fileRaw.sheets.furniture[0].text)
	standfirst.html(fileRaw.sheets.furniture[1].text)
	source.html(fileRaw.sheets.furniture[2].text)


	let max = d3.max(fileRaw.sheets.deaths, d => +d.deaths);

	radius.domain([0, max]);

	let locations = fileRaw.sheets.deaths;

	locations.sort((a,b) => (+b.deaths > +a.deaths) ? 1 : ((+a.deaths > +b.deaths) ? -1 : 0))

	projection.fitSize([ukWidth, ukHeight], englandWales);

	bubbles.selectAll('buble')
	.data(locations)
	.enter()
	.append('circle')
	.attr("class", d => "bubble b" + d.id)
	.attr("r", d => radius(d.deaths))
	.attr("cx", d => projection([+d.long, +d.lat])[0])
	.attr("cy", d => projection([+d.long, +d.lat])[1])
	.on('mousemove', d => mouseMove(d.id))
	.on('mouseover', d => printResult(d.trust, d.deaths))
	.on('click', d => {
		cleanResult();
		printResult(d.trust, d.deaths)
		mouseMove(d.id)
	})
	.on('mouseout', d => cleanResult())

	projection.fitSize([londonWidth, londonHeight], london);

	bubblesLondon.selectAll('buble')
	.data(locations)
	.enter()
	.filter(d => d.lat < 51.648921 )
	.append('circle')
	.attr("class", d => "bubble b" + d.id)
	.attr("r", d => radius(d.deaths))
	.attr("cx", d => projection([+d.long, +d.lat])[0])
	.attr("cy", d => projection([+d.long, +d.lat])[1])
	.on('mousemove', d => mouseMove(d.id))
	.on('mouseover', d => printResult(d.trust, d.deaths))
	.on('click', d => {
		cleanResult();
		printResult(d.trust, d.deaths);
		mouseMove(d.id)

	})
	.on('mouseout', d => cleanResult())
	
	window.resize();

})


const printResult = (trust, deaths) => {

	let name = trust.toLowerCase().replace(/\b[a-z](?=[a-z]{2})/g, (letter) => letter.toUpperCase()).split(' Nhs')[0];

	tooltip.select('.tooltip-trust')
	.html(name)

	tooltip.select('.tooltip-result')
	.html(deaths)

	tooltip.classed(" over", true);
}




const mouseMove = (id) => {

	let b = bubbles.select('.b' + id)
	let bl = bubblesLondon.select('.b' + id)
	b.style('stroke', '#333')
	b.style('stroke-width', 2)
	bl.style('stroke', '#333')
	bl.style('stroke-width', 2)

	let here = d3.mouse(atomEl);

	let left = here[0];
	let top = here[1];


	if(isMobile)
	{
		tooltip.style('top',  top + 'px');

	}
	else
	{

		if(left > width / 2)left -= $('.tooltip').getBoundingClientRect().width

		tooltip.style('top',  top + 'px');
		tooltip.style('left', left + 'px')
	}
			

}

const cleanResult = () => {

	let b = bubbles.selectAll('.bubble')
	let bl = bubblesLondon.selectAll('.bubble')
	b.style('stroke', '#c70000')
	b.style('stroke-width', 1)
	bl.style('stroke', '#c70000')
	bl.style('stroke-width', 1)

	tooltip.classed(" over", false);
}




const makeLabel = (d, centroid, labels) =>{

	let txt = d.trust

	let labelWhite = labels.append('text')
	.attr('transform', 'translate(' + centroid[0] + ',' + centroid[1] + ')')

	labelWhite
	.append("tspan")
	.attr('class','country-label country-label--white')
	.text(txt)
	.attr('x', +d.offset_horizontal || 0) 
	.attr('y', -(d.offset_vertical) )

	labelWhite
	.append('tspan')
	.attr('class','country-cases country-cases--white')
	.text(d.text)
	.attr('x', d.offset_horizontal || 0)
	.attr('dy', '15' )

	let label = labels.append('text')
	.attr('transform', 'translate(' + centroid[0] + ',' + centroid[1] + ')')

	label
	.append("tspan")
	.attr('class','country-label')
	.text(txt)
	.attr('x', +d.offset_horizontal || 0) 
	.attr('y', -(d.offset_vertical) )

	label
	.append('tspan')
	.attr('class','country-cases')
	.text(d.text)
	.attr('x', d.offset_horizontal || 0)
	.attr('dy', '15' )

}