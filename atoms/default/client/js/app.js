import * as d3 from "d3"
import * as topojson from "topojson"
import { DateTime } from "luxon"
import * as suncalc from "suncalc"

function init(data) {

	const container = d3.select("#graphicContainer")
	const context = d3.select("#graphicContainer")
	console.log(data)
	var isMobile;
	var windowWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);

	if (windowWidth < 610) {
			isMobile = true;
	}	

	if (windowWidth >= 610){
			isMobile = false;
	}

	var width = document.querySelector("#graphicContainer").getBoundingClientRect().width
	var height = width*0.6				
	var margin = {top: 0, right: 0, bottom: 0, left:0}
	
    context.select("#graphicContainer svg").remove();
    
    var chartKey = context.select("#chartKey");
	chartKey.html("");

	var svg = d3.select("#graphicContainer").append("svg")
				.attr("width", width + margin.left + margin.right)
				.attr("height", height + margin.top + margin.bottom)
				.attr("id", "svg")
				.attr("overflow", "hidden");					

	var features = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

		var projection = d3.geoMercator()
                .center([133.5523813,-28.125678])
                .scale(width * 0.8)
				.translate([width/2,height/2]); 	
				
				
	var path = d3.geoPath(projection);

	var winter = DateTime.local(2021, 5, 22);
	var summer = DateTime.local(2021, 11, 22);

	function getSunlight(season, latlon) {
		var sunrise = suncalc.getTimes(season, latlon[1], latlon[0]).sunrise
		var sunset = suncalc.getTimes(season, latlon[1], latlon[0]).sunset
		var diff = sunset - sunrise
		return diff
	}

	var geo = topojson.feature(data, data.objects['aus-hex-grid']).features

	var allValues = []

	geo.forEach(function(d) {
		d.properties.centroid = projection.invert(path.centroid(d))
		d.properties.winter = getSunlight(winter, d.properties.centroid)
		d.properties.summer = getSunlight(summer, d.properties.centroid)
		allValues.push(d.properties.winter)
		allValues.push(d.properties.summer)
	})

	var colors = ['#ffeda0','#bd0026']

	var colorScale = d3.scaleLinear()
		.domain(d3.extent(allValues))
		.range(colors)

	var winterScale = d3.scaleLinear()
		.domain(d3.extent(geo, d => d.properties.winter))
		.range(colors)	

	var summerScale = d3.scaleLinear()
		.domain(d3.extent(geo, d => d.properties.summer))
		.range(colors)		

	console.log(winterScale.domain(), winterScale.range())	

	features.append("g")
		.selectAll("path")
		.data(topojson.feature(data, data.objects['aus-hex-grid']).features)
		.enter()
		.append("path")
		.attr("fill", function(d) {
			// return winterScale(d.properties.winter)
			return summerScale(d.properties.summer)
		})
		.attr("d", path)

	d3.select("#loadingContainer").remove()	

}	// end init



Promise.all([
	d3.json(`<%= path %>/aus-hex-grid.json`)
	])
	.then((results) =>  {
		init(results[0])
		var to=null
		var lastWidth = document.querySelector("#graphicContainer").getBoundingClientRect()
		window.addEventListener('resize', function() {
			var thisWidth = document.querySelector("#graphicContainer").getBoundingClientRect()
			if (lastWidth != thisWidth) {
				window.clearTimeout(to);
				to = window.setTimeout(function() {
					    init(results[0])
					}, 100)
			}
		
		})

	});

