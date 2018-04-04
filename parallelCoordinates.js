// define size plots
var margin = {top: 20, right: 20, bottom: 20, left: 50},
    widthPC = 1000,
    height = 800;

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
    var infoBox;
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

    // Init Menu
    initMenu(["Static", "Interactive"]);

    i = 0;
    function google_colors(d) {
        i += 1;
        var google_cols = ["#3366cc", "#dc3912", "#ff9900", "#109618", "#990099", "#0099c6", "#dd4477", "#66aa00", "#b82e2e", "#316395", "#994499", "#22aa99", "#aaaa11", "#6633cc", "#e67300", "#8b0707", "#651067", "#329262", "#5574a6", "#3b3eac"];
        return google_cols[d % google_cols.length];
    }

    oldColor = null;
    // render parallel coordinates polylines and store them back
    polylines = svgPC.append("g")
        .attr("class", "polyline") // see {@link stylesheet.css} for details
        .selectAll("path")
        .data(data)
        .enter().append("path")
        .attr("d", path)
        .style("stroke-width", "2")
        .style("stroke", function() {
            return google_colors(i)})
        // add tooltip action!
        .on("mouseover", function (d) {
            if(readMenu()==="Interactive"){

                highlighted = d; // store back highlighted element
                oldColor = d3.select(this).style("stroke"); // store back highlighted element's color
                a = highlighted.value;
                d3.select(this).style("stroke", "lightsteelblue"); // highlight line: color it and increase the stroke-width
                d3.select(this).style("stroke-width", "5");

                /*
                infoBox = d3.select("body").append("div") // set the div, see {@link stylesheet.css} for details
                    .attr("id", "infoBox")
                    .attr("class", "infoBox");
                infoBox.html("Cost: " + d["Cost (in ¢ per cal)"] + "\n"
                    + "Cal: " +  d["Calories (per 100 g)"] + "\n"
                    + "Sugar: " + d["Sugar (in g per 100 g)"]) // show the name on mouseover (accounts for all naming-schemes), add x and y offset
                    .style("right", 5 + "%")
                    .style("top", 10 + "%");
                */

                tooltip = d3.select("body").append("div") // set the div, see {@link stylesheet.css} for details
                    .attr("id", "tooltip")
                    .attr("class", "tooltip");
                tooltip.html(d["Name"]
                + ":\nCost: " + d["Cost (in ¢ per cal)"]
                + "¢\nCal: " +  d["Calories (per 100 g)"]
                + "cal\nSugar: " + d["Sugar (in g per 100 g)"] +"g") // show the name on mouseover (accounts for all naming-schemes), add x and y offset
                    .style("left", (d3.event.pageX) + "px")
                    .style("top", (d3.event.pageY - 10) + "px");
            }
        })
        .on("mouseout", function (d) {
            if(readMenu()==="Interactive") {
                highlighted = null;

                d3.select("#tooltip").remove();
                d3.select(this).style("stroke", oldColor); // undo highlighting (reset line color)
                d3.select(this).style("stroke-width", "1"); // highlight line

                oldColor = null;
            }
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



    i = 0;
    j = 0;
    function pos(d) {
        j += 1;
        var heights = [40, 80, 120, 160, 200, 240, 280, 320, 360, 400, 440, 480, 520];
        return (heights[d % heights.length]) + "px";
    }

    function render() {

        if(readMenu() === ("Interactive")){
            // remove descriptions
            d3.select("#names_div").style("opacity", "0");
            d3.select("#table_div").style("opacity", "0");

            polylines.style("stroke", "black").style("stroke-width", "1");

        } else if(readMenu() === ("Static")){
            // add descriptions
            d3.select("#names_div").style("opacity", "1");
            d3.select("#table_div").style("opacity", "1");

            i = 0;
            polylines.style("stroke-width", "2")
                .style("stroke", function() {
                return google_colors(i)});

        }

    }

    //------------------------------------------------------ menu ----------------------------------------------------//

    // init menu
    function initMenu(entries){
        entries.forEach(function(d) {
            $( "select#Mode").append("<option>"+d+"</option>");
        });

        $( "#Mode" ).change(function () {
                render();
            });
    }

    // read current scatterplot parameters
    function readMenu(){
        return $( "#Mode").val();
    }
});

d3.csv("infoVisT.csv", function (csvData) {
//-------------------------------------------------- table -------------------------------------------------------//
    // credit for this code to: http://bl.ocks.org/jfreels/6814721
    data = csvData;

    i = 0;
    function google_colors(d) {
        i += 1;
        var google_cols = ["#000000", "#3366cc", "#dc3912", "#ff9900", "#109618", "#990099", "#0099c6", "#dd4477", "#66aa00", "#b82e2e", "#316395", "#994499", "#22aa99", "#aaaa11", "#6633cc", "#e67300", "#8b0707", "#651067", "#329262", "#5574a6", "#3b3eac"];
        return google_cols[d % google_cols.length];
    }

    function tabulate(data, columns) {

        i = 0;

        var table = d3.select("#table_div").append("table"),
            thead = table.append("thead"),
            tbody = table.append("tbody");

        // append the header row
        thead.append("tr")
            .selectAll("th")
            .data(columns)
            .enter()
            .append("th")
            .style("background-color", function() {
                return google_colors(i)})
            .text(function (column) {
                return column;
            });
        // create a row for each object in the data
        var rows = tbody.selectAll("tr")
            .data(data)
            .enter()
            .append("tr");
        // create a cell in each row for each column
        var cells = rows.selectAll("td")
            .data(function (row) {
                return columns.map(function (column) {
                    return {column: column, value: row[column]};
                });
            })
            .enter()
            .append("td")
            .html(function (d) {
                return d.value;
            });

        return table;
    }

    var columns = ["Name","Baking","Beverages","Bread","Canned Goods","Cereal","Dairy","Frozen Foods","Juice","Meat","Pasta","Produce","Refrigerated items","Snacks"];
    table = tabulate (data,columns);

});
