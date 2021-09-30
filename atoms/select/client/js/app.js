import { makeMap } from "shared/js/map";
import { DateTime } from "luxon"
import * as d3 from "d3"

Promise.all([
	fetch(`<%= path %>/aus-hex-grid.json`).then(res => res.json())
])
.then((results) =>  {
	makeMap(results[0],'select', "", true, DateTime.local(2021, 12, 22, 18), "normal", true, "daylight", "T05:00", "T09:00")

	var context = d3.select("#select")
	context.select("#select .controls").classed("hide", false)

	var winter = DateTime.local(2021, 6, 22, 18);
	var summer = DateTime.local(2021, 12, 22, 18);

	var savings = "normal"
	var timezones = true
	var mapType = "daylight"
	var time = summer

	var wakingHoursStart = "T06:45"
	var wakingHoursEnd = "T22:45"

	var workingHoursStart = "T09:00"
	var workingHoursEnd = "T17:00"

	var sixAM = "T06:00"
	var sixPM = "T18:00"

	var startTimeStr = "T06:45"
	var endTimeStr = "T22:45"

	
	context.select("#maptypeSelect").on("change", function() {
    	mapType = this.options[this.selectedIndex].value
    	console.log("mapType",mapType)

    	if (mapType != "daylight") {
    		console.log("yep")
    		context.select("#hoursSelect").attr("disabled", true)
    	}

    	else {
    		context.select("#hoursSelect").attr("disabled", null)
    	}
    	updateMap()
	})


	context.select("#hoursSelect").on("change", function() {
    	var hours = this.options[this.selectedIndex].value
    	startTimeStr = hours.split(",")[0]
		endTimeStr = hours.split(",")[1]

    	updateMap()
	})

	context.select("#savingsSelect").on("change", function() {
    	savings = this.options[this.selectedIndex].value
    	updateMap()
	})

	context.select("#timeSelect").on("change", function() {
    	time = DateTime.fromISO(this.options[this.selectedIndex].value)
    	updateMap()
	})

	context.select("#zoneSelect").on("change", function() {
		timezones = (this.options[this.selectedIndex].value === 'true');
    	updateMap()
	})

	function updateMap() {
		console.log("time", time, "savings", savings, "timezones", timezones, "mapType", mapType, "startTimeStr", startTimeStr, "endTimeStr", endTimeStr)
		makeMap(results[0],'select', "", true, time, savings, timezones, mapType, startTimeStr, endTimeStr)
	}


});
//makeMap(data, targetId, controls, time=DateTime.local(2021, 12, 22, 18), savings="normal", timezones=true, mapType="daylight", startTimeStr="T06:45", endTimeStr="T22:45")
// This gets turned into UTC for the sunrise calc, so set it to 6pm for the actual date we want



/*

sleeping times from https://time.com/4318156/sleep-countries-style/

{Country:"Australia",Image:"australian",key:"Australian",Sex:"Women",AvgBedTime:"22.6316",AvgWakeTime:"6.8772",AvgSleepDuration:"8.2456"},
{Country:"Australia",Image:"australian",key:"Australian",Sex:"Men",AvgBedTime:"22.8453",AvgWakeTime:"6.7302",AvgSleepDuration:"7.8849"},

women bed 22:37 wake 06:52

men bed 22:50 wake 06:43

avg 22:43 wake 06:47

*/

//makeMap(data, targetId, time=DateTime.local(2021, 12, 22, 18), savings="normal", timezones=true, mapType="daylight", startTimeStr="T06:45", endTimeStr="T22:45")
