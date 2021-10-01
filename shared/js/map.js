import * as d3 from "d3"
import * as topojson from "topojson"
import { DateTime } from "luxon"
import { Duration } from "luxon"
import { Interval } from "luxon"
import * as suncalc from "suncalc"
import { makeTooltip } from 'shared/js/tooltip';

export function makeMap(data, targetId, headline="", controls, time=DateTime.local(2021, 12, 22, 18), savings="normal", timezones=true, mapType="daylight", startTimeStr="T06:45", endTimeStr="T22:45", scale="scenario", parent="") {

	const container = d3.select(`#${targetId} #graphicContainer_${targetId}`)
	const context = d3.select(`#${targetId}`)

	var isMobile;
	var windowWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);

	if (windowWidth < 610) {
			isMobile = true;
	}	

	if (windowWidth >= 610){
			isMobile = false;
	}

	var width = document.querySelector(`#${targetId} #graphicContainer_${targetId}`).getBoundingClientRect().width
	var height = width*0.6				
	var margin = {top: 0, right: 0, bottom: 0, left:0}
	
    context.select(`#graphicContainer_${targetId} svg`).remove();
    
    var chartKey = context.select("#chartKey");
	chartKey.html("");

	var svg = context.select(`#graphicContainer_${targetId}`).append("svg")
				.attr("width", width + margin.left + margin.right)
				.attr("height", height + margin.top + margin.bottom)
				.attr("id", `svg_${targetId}`)
				.attr("overflow", "hidden");					

	context.select(".chartMultiTitle").text(headline)			

	var features = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	var projection = d3.geoMercator()
                .center([133.5523813,-28.125678])
                .scale(width * 0.8)
				.translate([width/2,height/2]); 		
				
	var path = d3.geoPath(projection);

	// This gets turned into UTC for the sunrise calc, so set it to 6pm for the actual date we want

	// var winter = DateTime.local(2021, 6, 22, 18);
	// var summer = DateTime.local(2021, 12, 22, 18);

	// normal, off, on, double?

	// var savings = "normal"
	
	// switches timezones off or on

	// var timezones = true
	
	// daylight or sunrise or sunset
	
	// var mapType = "daylight"

	// summer or winter

	// var season = "summer"

	// var time = summer

	// if (season === "winter") {
	// 	time = winter
	// }

	// For daylight hours within a start time and end time, set the start and end times

	// var wakingHoursStart = "T06:45"
	// var wakingHoursEnd = "T22:45"

	// var workingHoursStart = "T09:00"
	// var workingHoursEnd = "T17:00"

	// var sixAM = "T06:00"
	// var sixPM = "T18:00"

	// var startTimeStr = wakingHoursStart
	// var endTimeStr = wakingHoursEnd

	/*

	sleeping times from https://time.com/4318156/sleep-countries-style/

	{Country:"Australia",Image:"australian",key:"Australian",Sex:"Women",AvgBedTime:"22.6316",AvgWakeTime:"6.8772",AvgSleepDuration:"8.2456"},
	{Country:"Australia",Image:"australian",key:"Australian",Sex:"Men",AvgBedTime:"22.8453",AvgWakeTime:"6.7302",AvgSleepDuration:"7.8849"},

	women bed 22:37 wake 06:52

	men bed 22:50 wake 06:43

	avg 22:43 wake 06:47
	
	*/

	// console.log("Season: ", season, "Daylight savings: ", savings)

	// console.log(summer.toISO())

	const capitals = [
		{"id":7673, "name":"Sydney"},
		{"id":7957, "name":"Brisbane"},
		{"id":7307, "name":"Canberra"},
		{"id":6645, "name":"Melbourne"},
		{"id":7026, "name":"Hobart"},
		{"id":5530, "name":"Adelaide"},
		{"id":1601, "name":"Perth"},
		{"id":4153, "name":"Darwin"},
	]

	// var summer = DateTime.fromISO("2021-12-22T00:01", {zone: "UTC+08:00"})

	function getTimezone(state, date) {
		
		var nonDstStart = DateTime.fromISO("2021-04-04T00:01")
		var nonDstEnd = DateTime.fromISO("2021-10-03T09:24")

		if (!timezones) {

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

		else {

			if (state === "QLD") {
				if (savings === "normal" || savings === "off") {
					return "UTC+10:00"
				}

				else if (savings === "on") {
					// non DST
					if (date < nonDstEnd && date > nonDstStart) {
						return "UTC+10:00"
					}
					// DST
					else {
						return "UTC+11:00"
					}
					
				}
			
			}

			else if (state === "WA") {

				if (savings === "normal" || savings === "off") {
					return "UTC+08:00"
				}

				else if (savings === "on") {
					// Non DST
					if (date < nonDstEnd && date > nonDstStart) {
						return "UTC+08:00"
					}

					// DST
					else {
						return "UTC+09:00"
					}
					
				}

			}

			else if (state === "NT") {
				
				if (savings === "normal" || savings === "off") {
					return "UTC+09:30"
				}
				
				else if (savings === "on") {
					// non DST
					if (date < nonDstEnd && date > nonDstStart) {
						return "UTC+09:30"
					}
					// DST
					else {
						return "UTC+10:30"
					}
					
				}	
			}

			else if (state === "NSW" || state === "VIC" || state === "ACT" || state === "TAS") {

				// Check if it's a non-DST time

				if (savings === "normal" || savings === "on") {
					if (date < nonDstEnd && date > nonDstStart) {
						return "UTC+10:00"
					}

					// else it's DST

					else {
						return "UTC+11:00"
					}
				}

				// else if (savings === "on") {
				// 	return "UTC+11:00"
				// }
				
				else if (savings === "off") {
					return "UTC+10:00"
				}
				
			}

			else if (state === "SA") {

				// Check if it's a non-DST time

				if (savings === "normal" || savings === "on") {

					if (date < nonDstEnd && date > nonDstStart) {
						return "UTC+09:30"
					}

					// else it's DST

					else {
						return "UTC+10:30"
					}
				}

				// else if (savings === "on") {
				// 	return "UTC+10:30"
				// }
				
				else if (savings === "off") {
					return "UTC+09:30"
				}


			}
		}	
	}

	// function getSunlight(season, latlon) {
	// 	var sunrise = suncalc.getTimes(season, latlon[1], latlon[0]).sunrise
	// 	var sunset = suncalc.getTimes(season, latlon[1], latlon[0]).sunset
	// 	var diff = sunset - sunrise
	// 	return diff
	// }

	// is time1 before time2, and by how much. eg how many hours is sunrise before 7 am

	function hoursBefore(time1, time2) {

		// diff is in milliseconds

		// console.log(time2.toISO(), time1.toISO())

		var diff = time2 - time1

		if (diff < 0) {
				return {"milliseconds": 0, "time": 0}
			}

		else {
			return {"milliseconds": diff, "time": Duration.fromMillis(diff).toFormat('hh:mm:ss')}
		}	

	}

	// How many daylight hours between 6AM and 6PM

	function hoursBetween(timestart, timeend, sunrise, sunset) {

		var intervalStart = sunrise

		if (sunrise < timestart) {
			intervalStart = timestart
		}

		var intervalEnd = sunset 

		if (sunset > timeend) {
			intervalEnd = timeend
		}

		// time between 6am and 6pm for example

		var timeDiff = timeend - timestart

		// sunlight hours within 

		var sunDiff = intervalEnd - intervalStart

		var sunriseLocal = DateTime.fromISO(sunrise.toISO().split("+")[0])
		var sunsetLocal = DateTime.fromISO(sunset.toISO().split("+")[0])

		return { "timeDiff": timeDiff, 
				"timeDiffStr": Duration.fromMillis(timeDiff).toFormat('hh:mm'), 
				"sunDiff": sunDiff,
				"sunDiffStr": Duration.fromMillis(sunDiff).toFormat('hh:mm'),
				"sunriseStr":sunrise.toFormat('hh:mm'),
				"sunrise": sunrise,
				"sunsetStr":sunset.toFormat('hh:mm'),
				"sunset": sunset,
				"sunriseLocal":sunriseLocal,
				"sunriseLocalStr":sunriseLocal.toFormat('hh:mm'),
				"sunsetLocal":sunsetLocal
			}

	}

	function getSunHours(date, latlon, state) {
		
		var timeZone = getTimezone(state, date)
		
		// console.log("State: ", state, "Timezone: ", timeZone, "Date: ", date)

		var sunrise = suncalc.getTimes(date, latlon[1], latlon[0]).sunrise

		// console.log("sunrise", sunrise)

		var localSunrise = DateTime.fromJSDate(sunrise, { zone: timeZone})

		// console.log("timezone sunrise", localSunrise.toISO())

		var sunset = suncalc.getTimes(date, latlon[1], latlon[0]).sunset
		
		// console.log("sunset", sunset)

		var localSunset = DateTime.fromJSDate(sunset, {zone: timeZone})

		// console.log("localSunset", localSunset.toISO())

		var dateStr = date.toFormat('yyyy-MM-dd')

		var endTime = DateTime.fromISO(`${dateStr}${endTimeStr}`, { zone: timeZone})

		var startTime = DateTime.fromISO(`${dateStr}${startTimeStr}`, { zone: timeZone})

		// var timeBeforeSunrise = hoursBefore(localSunrise, sixAM)

		// var sunHoursInWakingHours = hoursBetween(wakingHoursStart, wakingHoursEnd, localSunrise, localSunset)

		return hoursBetween(startTime, endTime, localSunrise, localSunset)
	}

	// Perth should be sunrise 07:17 sunset 17:20 in winter

	// getSunHours(winter,[115.6813544,-32.0391738], 'WA')

	// Sydney sunrise 07:00 sunset 16:54 in winter

	// console.log("Syd", getSunHours(time, [151.208755,-33.870453], 'NSW'))

	// Brisbane -27.3911734,152.7832068

	// console.log("Bris", getSunHours(time, [152.7832068,-27.3911734], 'QLD'))

	var daylightColors = ['#bd0026','#ffeda0']

	var sunriseColors = ['#ffeda0', '#bd0026']

	var geo = topojson.feature(data, data.objects['aus-hex-grid']).features

	var allValues = []

	geo.forEach(function(d, i) {
		// console.log(i)
		d.properties.centroid = projection.invert(path.centroid(d))
		// d.properties.sunHoursWinter = getSunHours(winter, d.properties.centroid, d.properties.state)
		d.properties.daylight = getSunHours(time, d.properties.centroid, d.properties.state)

	})

	// console.log(geo)

	var domain = d3.extent(geo, d => d.properties.daylight.sunDiff)
	

	if (scale === "scenario") {
		if (startTimeStr === "T05:00" || startTimeStr === "T17:00") {
			domain = [3000000, 14400000]
		} 

		else if (startTimeStr === "T06:45") {
			domain = [32105750, 51302612]

		} 
	} 
	
	var colorScale = d3.scaleLinear()
		.domain(domain)
		.range(daylightColors)

	var sunriseScale = d3.scaleTime()
		.domain(d3.extent(geo, d => d.properties.daylight.sunriseLocal))
		.range(sunriseColors)

	var sunriseAESTScale = d3.scaleTime()
		.domain(d3.extent(geo, d => d.properties.daylight.sunrise))
		.range(sunriseColors)			

	console.log(colorScale.domain())	

	features.append("g")
		.selectAll("path")
		.data(geo)
		.enter()
		.append("path")
		.attr("class", `hex_${targetId}`)
		.attr("fill", function(d) {
			if (mapType === "daylight") {
				return colorScale(d.properties.daylight.sunDiff)
			}
			
			else if (mapType === "sunrise") {
				return sunriseScale(d.properties.daylight.sunriseLocal)
			}

			else if (mapType === "sunriseAEST") {
				return sunriseAESTScale(d.properties.daylight.sunrise)
			}
		})
		.attr("d", path)

	makeTooltip(`.hex_${targetId}`, targetId, mapType);	
	makeKey()


	function updateMap() {

		var newGeo = topojson.feature(data, data.objects['aus-hex-grid']).features
		
		newGeo.forEach(function(d, i) {
			// console.log(i)
			d.properties.centroid = projection.invert(path.centroid(d))
			// d.properties.sunHoursWinter = getSunHours(winter, d.properties.centroid, d.properties.state)
			d.properties.daylight = getSunHours(time, d.properties.centroid, d.properties.state)
		})


	}

		

	d3.select("#loadingContainer").remove()	


	function makeKey() {

		const formatTime = d3.timeFormat("%H:%M");

		context.select("#chartKey").html("")
		var keyWidth = width * 0.3
		var keyLabel = "Key"

		if (width < 840) {
			keyWidth = width * 0.5
		}

		if (isMobile) {
			keyWidth = width
		}

		var keyText1 = ""
		var keyText2 = ""

		if (mapType === "daylight") {
			keyText1 = Duration.fromMillis(colorScale.domain()[0]).toFormat('h:m').split(":")[0] + " hrs, " + Duration.fromMillis(colorScale.domain()[0]).toFormat('h:m').split(":")[1] + " mins"
			keyText2 = Duration.fromMillis(colorScale.domain()[1]).toFormat('h:m').split(":")[0] + " hrs, " + Duration.fromMillis(colorScale.domain()[1]).toFormat('h:m').split(":")[1] + " mins"
			keyLabel = "Daylight hours"
			// keyText1 = Duration.fromMillis(colorScale.domain()[0]).toFormat('h:mm')
			// keyText2 = Duration.fromMillis(colorScale.domain()[1]).toFormat('h:mm')

			// keyText1 = parseInt(Duration.fromMillis(colorScale.domain()[0]).toFormat('h:m').split(":")[0]) + (Duration.fromMillis(colorScale.domain()[0]).toFormat('h:m').split(":")[1]/60)
			// keyText2 = parseInt(Duration.fromMillis(colorScale.domain()[1]).toFormat('h:m').split(":")[0]) + (Duration.fromMillis(colorScale.domain()[1]).toFormat('h:m').split(":")[1]/60)
			
		}

		else if (mapType === "sunrise") {
			keyText1 = formatTime(sunriseScale.domain()[0])
			keyText2 = formatTime(sunriseScale.domain()[1])
			keyLabel = "Time"
		}

		else if (mapType === "sunriseAEST") {
			keyText1 = formatTime(sunriseAESTScale.domain()[0])
			keyText2 = formatTime(sunriseAESTScale.domain()[1])
			keyLabel = "Time"
		}

		var keyLeftMargin = 0

		var keySvg = context.select("#chartKey").append("svg")
	                .attr("width", keyWidth)
	                .attr("height", "50px")
	                .attr("id", "keySvg")          

	    var redGradient = keySvg.append("defs")
		  .append("svg:linearGradient")
		  .attr("id", "redGradient")
		  .attr("x1", "0%")
		  .attr("y1", "100%")
		  .attr("x2", "100%")
		  .attr("y2", "100%")
		  .attr("spreadMethod", "pad");

	    redGradient.append("stop")
	      .attr("offset", "0%")
	      .attr("stop-color", mapType === "daylight" ? daylightColors[0] : daylightColors[1])
	      .attr("stop-opacity", 1);

	    redGradient.append("stop")
	      .attr("offset", "100%")
	      .attr("stop-color", mapType === "daylight" ? daylightColors[1] : daylightColors[0])
	      .attr("stop-opacity", 1);

	    keySvg.append("rect")
			.attr("y", 20)
			.attr("x", keyLeftMargin)
			.attr("width", keyWidth - keyLeftMargin)
			.attr("height", 15)
			.style("fill", "url(#redGradient)")

	    keySvg.append("text")
	        .attr("x", keyLeftMargin)
	        .attr("text-anchor", "start")
	        .attr("y", 47)
	        .attr("class", "keyLabel").text(keyText1)  

	    keySvg.append("text")
	        .attr("x", keyWidth)
	        .attr("text-anchor", "end")
	        .attr("y", 47)
	        .attr("class", "keyLabel").text(keyText2)

	     keySvg.append("text")
	        .attr("x", keyLeftMargin)
	        .attr("text-anchor", "start")
	        .attr("y", 15)
	        .attr("class", "keyLabel").text(keyLabel)     
	}	

}	// end init

// Promise.all([
// 	d3.json(`<%= path %>/aus-hex-grid.json`)
// 	])
// 	.then((results) =>  {
// 		init(results[0])
// 		var to=null
// 		var lastWidth = document.querySelector("#graphicContainer_${targetId}").getBoundingClientRect()
// 		window.addEventListener('resize', function() {
// 			var thisWidth = document.querySelector("#graphicContainer_${targetId}").getBoundingClientRect()
// 			if (lastWidth != thisWidth) {
// 				window.clearTimeout(to);
// 				to = window.setTimeout(function() {
// 					    init(results[0])
// 					}, 100)
// 			}
		
// 		})

// 	});

