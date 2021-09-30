import { makeMap } from "shared/js/map";
import { DateTime } from "luxon"

Promise.all([
	fetch(`<%= path %>/aus-hex-grid.json`).then(res => res.json())
])
.then((results) =>  {
	makeMap(results[0],'select', false, DateTime.local(2021, 12, 22, 18), "normal", true, "daylight", "T05:00", "T09:00")
});
//makeMap(data, targetId, controls, time=DateTime.local(2021, 12, 22, 18), savings="normal", timezones=true, mapType="daylight", startTimeStr="T06:45", endTimeStr="T22:45")
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

//makeMap(data, targetId, time=DateTime.local(2021, 12, 22, 18), savings="normal", timezones=true, mapType="daylight", startTimeStr="T06:45", endTimeStr="T22:45")
