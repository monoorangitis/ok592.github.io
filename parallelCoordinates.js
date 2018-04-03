// define size plots
var margin = {top: 20, right: 20, bottom: 20, left: 50},
    widthPC = 1000,
    height = 500;

// parallel coordinates SVG container...
var svgPC = d3.select("#pc").append("svg")
    .attr("width", widthPC)
    .attr("height", height)
    .append("g");

// ... graph and scale
var y = {};
var xPC;
var gPC;

// data
var data = {};
var dimensions = {};

// read in data. <b>this is where the file is chosen</b>
d3.csv("infoVis.csv", function (csvData) {


    //------------------------------------------------- preparation --------------------------------------------------//

    data = csvData;

    // Parse dimensions (i.e., attributes) from input file and discard first dimension (label)
    dimensions = d3.keys(data[0]);
    dimensions.splice(0, 1);


    //-------------------------------------------- parallel coordinates ----------------------------------------------//


    var lineGenerator = d3.line(); // line used to draw the path for polylines
    var tooltip;                   // the tooltip-div, that is shown on mouseover
    var highlighted;               // the highlighted element on mouseover

    // x and y scaling for parallel coordinates
    xPC = d3.scalePoint()
        .domain(dimensions)
        .range([margin.left, widthPC - margin.left - margin.right]);

    dimensions.forEach(function (d) {
        y[d] = d3.scaleLinear()
        // extent returns min and max values which are used to scale the axes.
            .domain(d3.extent(data, function (attr) {
                return +attr[d];
            }))
            .range([height - margin.bottom - margin.top, margin.top]);
    });

    // returns a path (line conntecting all points) of a single data point (line in the data-array)
    function path(d) {
        return lineGenerator(dimensions.map(function (k) {
            // Set points and scale y according to axes
            return [xPC(k), y[k](d[k])];
        }));
    }

    // render parallel coordinates polylines and store them back
    polylines = svgPC.append("g")
        .attr("class", "polyline") // see {@link stylesheet.css} for details
        .selectAll("path")
        .data(data)
        .enter().append("path")
        .attr("d", path)
        // add tooltip action!
        .on("mouseover", function (d) {
            highlighted = d; // store back highlighted element

            d3.select(this).style("stroke", "lightsteelblue"); // highlight line: color it and increase the stroke-width
            d3.select(this).style("stroke-width", "5");

            tooltip = d3.select("body").append("div") // set the div, see {@link stylesheet.css} for details
                .attr("id", "tooltip")
                .attr("class", "tooltip");
            tooltip.html(d.name || d.Name || d.species || d.ID) // show the name on mouseover (accounts for all naming-schemes), add x and y offset
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY - 10) + "px");

            redrawHighlightedCircle(); // call linked highlighting-method
        })
        .on("mouseout", function (d) {
            highlighted = null;

            d3.select("#tooltip").remove();
            d3.select(this).style("stroke", "black"); // undo highlighting (reset line color)
            d3.select(this).style("stroke-width", "1"); // highlight line

            redrawHighlightedCircle();
        });

    // parallel coordiantes axes container
    gPC = svgPC.selectAll(".dimension")
        .data(dimensions)
        .enter().append("g")
        .attr("class", "dimension")
        .attr("transform", function (d) {
            return "translate(" + xPC(d) + ")";
        });

    // define and plot parallel coordiantes axes
    gPC.append("g")
        .attr("class", "axis")
        // Call axis scale for each dimension
        .each(function (dim) {
            d3.select(this).call(d3.axisLeft().scale(y[dim]));
        })
        .append("text")
        .style("text-anchor", "middle")
        .attr("y", margin.top / 2)
        .text(String); // Get domain name from data
});