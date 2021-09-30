import * as d3 from "d3"
import * as topojson from "topojson"
import { DateTime } from "luxon"
import { Duration } from "luxon"
import { Interval } from "luxon"
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

	// This gets turned into UTC for the sunrise calc, so set it to 6pm for the actual date we want

	var winter = DateTime.local(2021, 6, 22, 18);

	var summer = DateTime.local(2021, 12, 22, 18);

	console.log(summer.toISO())

	// var summer = DateTime.fromISO("2021-12-22T00:01", {zone: "UTC+08:00"})

	function getTimezone(state, date, savings) {
		
		var nonDstStart = DateTime.fromISO("2021-04-04T00:01")
		var nonDstEnd = DateTime.fromISO("2021-10-03T09:24")

		if (state === "QLD") {
			if (savings === "normal" || savings === "off") {
				return "UTC+10:00"
			}

			else if (savings === "on") {
				return "UTC+11:00"
			}
			
		}

		else if (state === "WA") {
			if (savings === "normal" || savings === "off") {
				return "UTC+08:00"
			}

			else if (savings === "on") {
				return "UTC+09:00"
			}

		}

		else if (state === "NT") {
			
			if (savings === "normal" || savings === "off") {
				return "UTC+09:30"
			}
			
			else if (savings === "on") {
				return "UTC+10:30"
			}	
		}

		else if (state === "NSW" || state === "VIC" || state === "ACT" || state === "TAS") {

			// Check if it's a non-DST time

			if (savings === "normal") {
				if (date < nonDstEnd && date > nonDstStart) {
					return "UTC+10:00"
				}

				// else it's DST

				else {
					return "UTC+11:00"
				}
			}

			else if (savings === "on") {
				return "UTC+11:00"
			}
			
			else if (savings === "off") {
				return "UTC+10:00"
			}
			
		}

		else if (state === "SA") {

			// Check if it's a non-DST time

			if (savings === "normal") {

				if (date < nonDstEnd && date > nonDstStart) {
					return "UTC+09:30"
				}

				// else it's DST

				else {
					return "UTC+10:30"
				}
			}

			else if (savings === "on") {
				return "UTC+10:30"
			}
			
			else if (savings === "off") {
				return "UTC+09:30"
			}


		}

	}

	function getSunlight(season, latlon) {
		var sunrise = suncalc.getTimes(season, latlon[1], latlon[0]).sunrise
		var sunset = suncalc.getTimes(season, latlon[1], latlon[0]).sunset
		var diff = sunset - sunrise
		return diff
	}

	// is time1 before time2, and by how much. eg how many hours is sunrise before 7 am

	function hoursBefore(time1, time2) {

		// diff is in milliseconds

		console.log(time2.toISO(), time1.toISO())

		var diff = time2 - time1

		if (diff < 0) {
				return {"milliseconds": 0, "time": 0}
			}

		else {
			return {"milliseconds": diff, "time": Duration.fromMillis(diff).toFormat('hh:mm:ss')}
		}	

	}

	// How much of a time interval is daylight hours

	function hoursBetween(timestart, timeend, sunrise, sunset) {

		var intervalStart = sunrise

		if (sunrise < timestart) {
			intervalStart  = timestart
		}

		var intervalEnd = sunset 

		if (sunset > timeend) {
			intervalEnd = timeend
		}

		var timeDiff = timeend - timestart

		var sunDiff = intervalEnd - intervalStart

		return { "timeDiff": timeDiff, 
				"timeDiffStr": Duration.fromMillis(timeDiff).toFormat('hh:mm:ss'), 
				"sunDiff": sunDiff,
				"sunDiffStr": Duration.fromMillis(sunDiff).toFormat('hh:mm:ss')
			}

	}

	function getSunHours(date, latlon, state, savings) {
		
		var timeZone = getTimezone(state, date, savings)
		
		// console.log("State: ", state, "Timezone: ", timeZone, "Date: ", date)

		var sunrise = suncalc.getTimes(date, latlon[1], latlon[0]).sunrise

		console.log("sunrise", sunrise)

		var localSunrise = DateTime.fromJSDate(sunrise, { zone: timeZone})
		
		// console.log("timezone sunrise", localSunrise.toISO())

		var sunset = suncalc.getTimes(date, latlon[1], latlon[0]).sunset
		
		console.log("sunset", sunset)

		var localSunset = DateTime.fromJSDate(sunset, {zone: timeZone})

		// console.log("localSunset", localSunset.toISO())

		var dateStr = date.toFormat('yyyy-MM-dd')

		var wakingHoursStart = DateTime.fromISO(`${dateStr}T06:47`, { zone: timeZone}) 

		var wakingHoursEnd = DateTime.fromISO(`${dateStr}T22:43`, { zone: timeZone}) 

		var workingHoursStart = DateTime.fromISO(`${dateStr}T09:00`, { zone: timeZone}) 

		var workingHoursEnd = DateTime.fromISO(`${dateStr}T17:00`, { zone: timeZone})

		var sixPM = DateTime.fromISO(`${dateStr}T18:00`, { zone: timeZone})

		var sixAM = DateTime.fromISO(`${dateStr}T06:00`, { zone: timeZone})

		// var timeBeforeSunrise = hoursBefore(localSunrise, sixAM)

		// var sunHoursInWakingHours = hoursBetween(wakingHoursStart, wakingHoursEnd, localSunrise, localSunset)

		return hoursBetween(sixAM, sixPM, localSunrise, localSunset)
	}

	/*

	sleeping times from https://time.com/4318156/sleep-countries-style/

	{Country:"Australia",Image:"australian",key:"Australian",Sex:"Women",AvgBedTime:"22.6316",AvgWakeTime:"6.8772",AvgSleepDuration:"8.2456"},
	{Country:"Australia",Image:"australian",key:"Australian",Sex:"Men",AvgBedTime:"22.8453",AvgWakeTime:"6.7302",AvgSleepDuration:"7.8849"},

	women bed 22:37 wake 06:52

	men bed 22:50 wake 06:43

	avg 22:43 wake 06:47
	
	*/

	// Perth should be sunrise 07:17 sunset 17:20 in winter

	// getSunHours(winter,[115.6813544,-32.0391738], 'WA')

	// Sydney sunrise 07:00 sunset 16:54 in winter

	// getSunHours(summer, [151.208755,-33.870453], 'NSW')

	var geo = topojson.feature(data, data.objects['aus-hex-grid']).features

	var allValues = []

	geo.forEach(function(d, i) {
		console.log(i)
		d.properties.centroid = projection.invert(path.centroid(d))
		d.properties.sunHoursWinter = getSunHours(winter, d.properties.centroid, d.properties.state, "normal")
	})

	console.log("yep")

	console.log(geo)

	var colors = ['#ffeda0','#bd0026']

	var colorScale = d3.scaleLinear()
		.domain(d3.extent(allValues))
		.range(colors)

	// var winterScale = d3.scaleLinear()
	// 	.domain(d3.extent(geo, d => d.properties.sunHoursWinter.sunDiff))
	// 	.range(colors)	

	// var summerScale = d3.scaleLinear()
	// 	.domain(d3.extent(geo, d => d.properties.summer))
	// 	.range(colors)		

	// console.log(winterScale.domain(), winterScale.range())	

	features.append("g")
		.selectAll("path")
		.data(topojson.feature(data, data.objects['aus-hex-grid']).features)
		.enter()
		.append("path")
		.attr("fill", function(d) {
			return "lightgrey"
			// return winterScale(d.properties.sunHoursWinter.sunDiff)
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

