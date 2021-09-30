import * as d3 from "d3"

function makeTooltip(el, ttcontext) {
	console.log(ttcontext)
	console.log("make", el)
	const tooltipContext = d3.select(`#${ttcontext}`)
	var els = tooltipContext.selectAll(el)
	console.log(els)
	var width = document.querySelector(`#${ttcontext} #graphicContainer`).getBoundingClientRect().width
	
	var tooltip = tooltipContext.select(`.interactive-wrapper`).append("div")
		    .attr("class", "tooltip")
		    .attr("id", "tooltip")
		    .style("position", "absolute")
		    .style("background-color", "white")
		    .style("opacity", 0);

	els.on("mouseover", function(event,d) {
		
		console.log(d.properties.state)
		console.log(d.properties.centroid)
		console.log("sunrise", d.properties.daylight.sunriseStr)
		console.log("sunset", d.properties.daylight.sunsetStr)
		console.log("daylighthours", d.properties.daylight.sunDiffStr)
		console.log("maxDaylight", d.properties.daylight.timeDiffStr)

		var text = `<b>${d.properties.state}</b><br>Daylight hours:${d.properties.daylight.sunDiffStr}`
		
		tooltip.transition()
			.duration(200)
		   	.style("opacity", .9);

		tooltip.html(text)
		var tipHeight = document.querySelector(`#${ttcontext} #tooltip`).getBoundingClientRect().height
		var tipWidth = document.querySelector(`#${ttcontext} #tooltip`).getBoundingClientRect().width
		// console.log(tipHeight)
		var mouseX = event.pageX
        var mouseY = event.pageY
        console.log(mouseX, mouseY)
        var half = width/2;

        if (mouseX < half) {
            tooltip.style("left", (event.pageX + tipWidth/2) + "px");
        }

        else if (mouseX >= half) {
            tooltip.style("left", (event.pageX - tipWidth) + "px");
        }

        // tooltip.style("left", (d3.mouse(this)[0] + tipWidth/2) + "px");
        tooltip.style("top", (event.pageY) + "px");

	})
	
	els.on("mouseout", function(d) {

	  tooltip.transition()
	       .duration(500)
	       .style("opacity", 0);

	})


}

export { makeTooltip }