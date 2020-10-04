var svgWidth = 960;
var svgHeight = 500;

var margin = {
    top: 20,
    right: 40,
    bottom: 80,
    left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var svg = d3
    .select("#scatter")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

// Append an SVG group
var chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params
var chosenXaxis = "age";

// function used for updating x-scale var upon click on axis label
function xScale(data, chosenXaxis) {
    // create scales
    var xLinearScale = d3.scaleLinear()
        .domain([d3.min(data), d => d[chosenXaxis],
        d3.max(data), d => d[chosenXaxis]
        ])
        .range([0, width]);
    return xLinearScale;
}


// function used for updating xAxis var upon click on axis label
function renderAxes(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);
    xAxis.transition()
        .duration(1000)
        .call(bottomAxis);
    return xAxis;
}

// function used for updating circles group with a transition to
// new circles
function renderCircles(circlesGroup, newXScale, chosenXaxis) {
    circlesGroup.transition()
        .duration(1000)
        .attr("cx", d => newXScale(d[chosenXaxis]));
    return circlesGroup;
}

// poverty
// age
// income 
// healthcare
// obesity
// smokes 

function updateToolTip(chosenXaxis, circlesGroup) {
    var label;

    if (chosenXaxis === "age") {
        label = "Age";
    }
    if (chosenXaxis === "income") {
        label = "Income";
    }

    else {
        label = "Poverty";
    }

    var toolTip = d3.tip()
        .attr("class", "tooltip")
        .offset([80, -60])
        .html(function (d) {
            return (`${d.state}<br>${label} ${d[chosenXaxis]}`);
        });

    circlesGroup.call(toolTip);

    circlesGroup.on("mouseover", function(data) {
        toolTip.show(data);
    })
        // onmouseout event
        .on("mouseout", function(data, index) {
            toolTip.hide(data);
        });
    return circlesGroup;
}

// Retrieve data from the CSV file and execute everything below
d3.csv("./assets/data/data.csv").then(function(censusData, err) {
    if (err) throw err;
    console.log(censusData)

    // parse data
    censusData.forEach(function(data) {
        data.age = +data.age;
        data.income = +data.income;
        data.poverty = +data.poverty;
        data.healthcare = +data.healthcare;
        data.obesity = +data.obesity;
        data.smokes = +data.smokes;
        console.log(data.healthcare)

    });
    // xLinearScale function above csv import
    var xLinearScale = xScale(censusData, chosenXaxis);
    // create y scale function
    var yLinearScale = d3.scaleLinear()
        .domain([0, d3.max(censusData, d => d.heathcare)])
        .range([height, 0]);

    // create initial axis functions
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);
    // append x axis
    var xAxis = chartGroup.append("g")
        .classed("x-axis", true)
        .attr("transform", `translate(0, ${height})`)
        .call(bottomAxis);

    // append y axis
    chartGroup.append("g")
        .call(leftAxis);
    // append inital circles 
    var circlesGroup = chartGroup.selectAll("circle")
        .data(censusData)
        .enter()
        .append("circle")
        .attr("cx", d => xLinearScale(d, d.age))
        .attr("cy", d => yLinearScale(d, d.healthcare))
        .attr("r", 20)
        .attr("fill", "pink")
        .attr("opacity", ".5");

    // Create group for three x-axis labels
    var labelsGroup = chartGroup.append("g")
        .attr("transform", `translate(${width / 2}, ${height + 20})`);

    var agelabel = labelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 20)
        .attr("value", "age") // value to grab for event listener
        .classed("active", true)
        .text("Age");

    var incomelabel = labelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 40)
        .attr("value", "income") // value to grab for event listener
        .classed("inactive", true)
        .text("Income");

    var povertylabel = labelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 60)
        .attr("value", "poverty") // value to grab for event listener
        .classed("inactive", true)
        .text("Poverty");

    // append y axis
    chartGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .classed("axis-text", true)
        .text("Healthcare");

    // update tooltip funnction above csv import
    var circlesGroup = updateToolTip(chosenXaxis, circlesGroup);

    // x axis labels event listener
    labelsGroup.selectAll("text")
        .on("click", function () {
            // get value of selection
            var value = d3.select(this).attr("value");
            if (value != chosenXaxis) {
                // replaces chosenXaxis with value
                chosenXaxis = value;
                xLinearScale = xScale(censusData, chosenXaxis);
                xAxis = renderAxes(xLinearScale, xAxis);
                circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXaxis);
                circlesGroup = updateToolTip(chosenXaxis, circlesGroup);
                if (chosenXaxis === "age") {
                    agelabel
                        .classed("active", true)
                        .classed("inactive", false);
                    incomelabel
                        .classed("active", false)
                        .classed("inactive", true);
                    povertylabel
                        .classed("active", false)
                        .classed("inactive", true);
                }
                else if (chosenXaxis === "income") {
                    agelabel
                        .classed("active", false)
                        .classed("inactive", true);
                    incomelabel
                        .classed("active", true)
                        .classed("inactive", false);
                    povertylabel
                        .classed("active", false)
                        .classed("inactive", true);
                }
                else {
                    agelabel
                        .classed("active", false)
                        .classed("inactive", true);
                    incomelabel
                        .classed("active", false)
                        .classed("inactive", true);
                    povertylabel
                        .classed("active", true)
                        .classed("inactive", false);
                }
            }
        });

}).catch(function (error) {
    console.log(error);
});