import * as d3select from 'd3-selection'
import * as d3fetch from 'd3-fetch'
import * as d3shape from 'd3-shape'
import * as d3collection from 'd3-collection'
import * as d3scale from 'd3-scale'
import * as d3axis from 'd3-axis'
import palette from 'shared/js/palette'

console.log('version 1.02')

const d3 = Object.assign({}, d3axis, d3scale, d3select, d3fetch, d3shape, d3collection)
const dataurl = "https://interactive.guim.co.uk/2021/jan/vaccinations/vaccinations.csv"

var excludes = ["Israel", "Bahrain", "England", "Wales", "Scotland", "Northern Ireland"]

var chosen = ["United Kingdom", "United States", "Spain", "Italy", "Germany"]

d3.csv(dataurl).then(data => {

    //remove dupes and outliers
    var filtered = data.filter(d => chosen.includes(d.location))

    // nest rows by country
    var nested = d3.nest().key(d => d.location).entries(filtered);

    //figure out max percentage
    var vaxvalues = filtered.map(f => Number(f.total_vaccinations_per_hundred))
    var maxvax = Math.max(...vaxvalues);

    // overall chart stuff
    var width = d3
        .select(".gv-chart")
        .style("width")
        .slice(0, -2);

    var height = 0.6 * width;

    var chart = d3.select('.gv-chart').append('svg')
        .attr("width", width)
        .attr("height", height)

    var scaleX = d3
        .scaleTime()
        .domain([Date.parse('2020-12-20'), new Date()])
        .range([0, width]);

    var scaleY = d3
        .scaleLinear()
        .domain([0, maxvax * 1.1])
        .range([height, 0]);

    chart.append("g")
        .attr("class", "gv-x-axis")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(scaleX)
            .ticks(3));

    chart.append("g")
        .attr("class", "gv-y-axis")
        .call(d3.axisLeft(scaleY)
            .tickSize(-width));


    const colors = [palette.newsRed, palette.blue, palette.darkorange, palette.greenDark, palette.highlightDark, palette.darkblue, 'blue', 'green', 'orange', 'grey', 'red', 'blue', 'green', 'orange', 'grey', 'red', 'blue', 'green', 'orange', 'grey', 'red', 'blue', 'green', 'orange', 'grey', 'red', 'blue', 'green', 'orange', 'grey', 'red', 'blue', 'green', 'orange', 'grey', 'red', 'blue', 'green', 'orange', 'grey', 'red', 'blue', 'green', 'orange', 'grey', 'red', 'blue', 'green', 'orange', 'grey', 'red', 'blue', 'green', 'orange', 'grey']

    var legendBlobs = Array.from(document.querySelectorAll('.gv-blob'))
    var legendLabels = Array.from(document.querySelectorAll('.gv-key-label'))

    console.log(legendBlobs)

    // order by date and draw line for each
    nested.map((n, i) => {

        legendBlobs[i].style.backgroundColor = colors[i]
        legendLabels[i].innerText = n.key

        n.values.sort((a, b) => {
            var date1 = Date.parse(a.date);
            var date2 = Date.parse(b.date);
            return date1 - date2;
        })

        //draw line for this one
        var lineg = chart.append("path")
            .datum(n.values.filter(d => d.total_vaccinations_per_hundred.length > 0))
            .attr("id", function(d) {
                return d[0].location
            })
            .attr("fill", "none")
            .attr("stroke", colors[i])
            .attr("stroke-width", 2)
            .attr("d", d3.line()
                .x(function(d) {
                    return scaleX(Date.parse(d.date));
                })
                .y(function(d) {
                    return scaleY(d.total_vaccinations_per_hundred);
                }).curve(d3.curveCatmullRom.alpha(0.5))
            );

        var label = chart.append("text")
            .text(n.key)
            .attr("y", scaleY(n.values[n.values.length - 1].total_vaccinations_per_hundred))
            .attr("x", 400)



    })




})