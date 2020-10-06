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
var chosenYaxis = "healthcare";

// function used for updating x-scale var upon click on axis label
function xScale(censusData, chosenXaxis) {
    // create scales
    var xLinearScale = d3.scaleLinear()
        // .domain(d3.extent(chosenXaxis))
        .domain([d3.min(censusData, d => d[chosenXaxis]),
        d3.max(censusData, d => d[chosenXaxis])
        ])
        .range([0, width]);
    return xLinearScale;
}

function yScale(censusData, chosenYaxis) {
    // create scales
    var yLinearScale = d3.scaleLinear()
        // .domain(d3.extent(chosenXaxis))
        .domain([d3.min(censusData, d => d[chosenYaxis]),
        d3.max(censusData, d => d[chosenYaxis])
        ])
        .range([height, 0]);
    return yLinearScale;
}



// function used for updating xAxis var upon click on axis label
function renderAxes(newXScale, xAxis, newYScale, yAxis) {
    var bottomAxis = d3.axisBottom(newXScale);
    var leftAxis = d3.axisLeft(newYScale);
    xAxis.transition()
        .duration(1000)
        .call(bottomAxis);
    yAxis.transition()
        .duration(1000)
        .call(leftAxis);
    return xAxis, yAxis;
}

function renderXAxis(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);
    xAxis.transition()
        .duration(1000)
        .call(bottomAxis);

    return xAxis;
}

function renderYAxis(newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale);
    yAxis.transition()
        .duration(1000)
        .call(leftAxis);
    return yAxis;
}

// function used for updating circles group with a transition to
// new circles
function renderCircles(circlesGroup, newXScale, chosenXaxis, newYScale, chosenYaxis) {
    circlesGroup.transition()
        .duration(1000)
        .attr("cx", d => newXScale(d[chosenXaxis]))
        .attr("cy", d => newYScale(d[chosenYaxis]))
        ;
    return circlesGroup;
}

// poverty
// age
// income 
// healthcare
// obesity
// smokes 

function updateToolTip(chosenXaxis, chosenYaxis, circlesGroup) {
    var xLabel;
    var yLabel;

    if (chosenXaxis === "age") {
        xLabel = "Age";
    }
    else if (chosenXaxis === "income") {
        xLabel = "Income";
    }
    else {
        xLabel = "Poverty";
    };

    if (chosenYaxis === "healthcare") {
        yLabel = "Healthcare";
    }
    else if (chosenYaxis === "obesity") {
        yLabel = "Obesity";
    }
    else {
        yLabel = "Smokes";
    };

    var toolTip = d3.tip()
        .attr("class", "tooltip")
        .offset([80, -60])
        .html(function (d) {
            return (`${d.state}<br>${xLabel} ${d[chosenXaxis]}<br>${yLabel} ${d[chosenYaxis]}`);
        });

    circlesGroup.call(toolTip);

    circlesGroup.on("mouseover", function (data) {
        toolTip.show(data);
    })
        // onmouseout event
        .on("mouseout", function (data) {
            toolTip.hide(data);
        });
    return circlesGroup;
}

// Retrieve data from the CSV file and execute everything below
d3.csv("./assets/data/data.csv").then(function (censusData, err) {
    if (err) throw err;
    console.log(censusData)

    // parse data
    censusData.forEach(function (data) {
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
    var yLinearScale = yScale(censusData, chosenYaxis);

    // var yLinearScale = d3.scaleLinear()
    //     .domain([d3.min(censusData, d => d.healthcare), 
    //         d3.max(censusData, d => d.heathcare)
    //     ])
    //     .range([height, 0]);

    // create initial axis functions
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);
    // append x axis
    var xAxis = chartGroup.append("g")
        .classed("x-axis", true)
        .attr("transform", `translate(0, ${height})`)
        .call(bottomAxis);

    var yAxis = chartGroup.append("g")
        .classed("y-axis", true)
        .attr("transform", `translate(0, ${height})`)
        .call(leftAxis);
    //////////////////////////////////////////////////////////////////////
    // append y axis

    // chartGroup.append("g")
    //     .call(leftAxis);

    // append inital circles 
    var circlesGroup = chartGroup.selectAll("circle")
        .data(censusData)
        .enter()
        .append("circle")
        .attr("cx", d => xLinearScale(d.chosenXaxis))
        .attr("cy", d => yLinearScale(d.chosenYaxis))
        .attr("r", 20)
        .attr("fill", "pink")
        .attr("opacity", ".5");

    // Create group for three x-axis labels
    var xlabelsGroup = chartGroup.append("g")
        .attr("transform", `translate(${width / 2}, ${height + 20})`);

    var agelabel = xlabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 18)
        .attr("value", "age") // value to grab for event listener
        .classed("active", true)
        .text("Age");

    var incomelabel = xlabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 36)
        .attr("value", "income") // value to grab for event listener
        .classed("inactive", true)
        .text("Income");

    var povertylabel = xlabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 54)
        .attr("value", "poverty") // value to grab for event listener
        .classed("inactive", true)
        .text("Poverty");
    // create group for three y-axis labels
    var ylabelsGroup = chartGroup.append("g")
        .attr("transform", "rotate(-90)");

    var healthcarelabel = ylabelsGroup.append("text")
        .attr("y", 0 - margin.left + 30)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .attr("yValue", "healthcare")
        .classed("active", true)
        .classed("axis-text", true)
        .text("Healthcare");

    var obesitylabel = ylabelsGroup.append("text")
        .attr("y", 0 - margin.left + 20)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .attr("yValue", "obesity")
        .classed("inactive", true)
        .classed("axis-text", true)
        .text("Obesity");

    var smokeslabel = ylabelsGroup.append("text")
        .attr("y", 0 - margin.left + 10)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .attr("yValue", "smokes")
        .classed("inactive", true)
        .classed("axis-text", true)
        .text("Smokes");

    //create yaxis label
    // chartGroup.append("text")
    // .attr("transform", "rotate(-90)")
    // .attr("y", 0 - margin.left)
    // .attr("x", 0 - (height / 2))
    // .attr("dy", "1em")
    // .classed("axis-text", true)
    // .text("Healthcare");

    // update tooltip funnction above csv import
    var circlesGroup = updateToolTip(chosenXaxis, chosenYaxis, circlesGroup);

    // x axis labels event listener
    xlabelsGroup.selectAll("text")
        .on("click", function () {
            // get value of selection
            var value = d3.select(this).attr("value");
            if (value != chosenXaxis) {
                // replaces chosenXaxis with value
                chosenXaxis = value;
                xLinearScale = xScale(censusData, chosenXaxis);
                xAxis = renderXAxis(xLinearScale, xAxis);
                circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXaxis, yLinearScale, chosenYaxis);
                circlesGroup = updateToolTip(chosenXaxis, chosenYaxis, circlesGroup);
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
    ylabelsGroup.selectAll("text")
        .on("click", function () {
            // get value of selection
            var yValue = d3.select(this).attr("yValue");
            if (yValue != chosenYaxis) {
                // replaces chosenXaxis with value
                chosenYaxis = yValue;
                yLinearScale = yScale(censusData, chosenYaxis);
                yAxis = renderYAxis(yLinearScale, yAxis);
                circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXaxis, yLinearScale, chosenYaxis);
                circlesGroup = updateToolTip(chosenXaxis, chosenYaxis, circlesGroup);
                if (chosenYaxis === "healthcare") {
                    healthcarelabel
                        .classed("active", true)
                        .classed("inactive", false);
                    obesitylabel
                        .classed("active", false)
                        .classed("inactive", true);
                    smokeslabel
                        .classed("active", false)
                        .classed("inactive", true);
                }
                else if (chosenYaxis === "obesity") {
                    healthcarelabel
                        .classed("active", false)
                        .classed("inactive", true);
                    obesitylabel
                        .classed("active", true)
                        .classed("inactive", false);
                    smokeslabel
                        .classed("active", false)
                        .classed("inactive", true);
                }
                else {
                    healthcarelabel
                        .classed("active", false)
                        .classed("inactive", true);
                    obesitylabel
                        .classed("active", false)
                        .classed("inactive", true);
                    smokeslabel
                        .classed("active", true)
                        .classed("inactive", false);
                }
            }
        });

}).catch(function (error) {
    console.log(error);
});