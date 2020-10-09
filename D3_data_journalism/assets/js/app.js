// setting variable for height and width for ease of calculations
var svgWidth = 960;
var svgHeight = 500;
// set margins
var margin = {
    top: 20,
    right: 40,
    bottom: 80,
    left: 100
};
// set height and width of display
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
        .domain([d3.min(censusData, d => d[chosenXaxis]),
        d3.max(censusData, d => d[chosenXaxis])
        ])
        .range([0, width]);
    return xLinearScale;
}
// function used for updating y-scale var upon click on axis label
function yScale(censusData, chosenYaxis) {
    // create scales
    var yLinearScale = d3.scaleLinear()
        .domain([d3.min(censusData, d => d[chosenYaxis]),
        d3.max(censusData, d => d[chosenYaxis])
        ])
        // .domain([0, 50])
        .range([height, 0]);
    return yLinearScale;
}
// function to render new xaxis based on the newXScale
function renderXAxis(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);
    xAxis.transition()
        .duration(1000)
        .call(bottomAxis);

    return xAxis;
}
// function to render new yaxis based on the newXScale
function renderYAxis(newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale);
    yAxis.transition()
        .duration(1000)
        .call(leftAxis);
    return yAxis;
}
// function to render new circles by updating cx attribute 
function renderXcircles(circlesGroup, newXScale, chosenXaxis) {
    circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXaxis]));
    return circlesGroup;
}
// function to render new circles by updating cy attribute 
function renderYcircles(circlesGroup, newYScale, chosenYaxis) {
    circlesGroup.transition()
    .duration(1000)
    .attr("cy", d => newYScale(d[chosenYaxis]));
    return circlesGroup;
}
// function to move circle text by updating cx attribute
function renderXtext(circlesGroup, newXScale, chosenXaxis) {
    circlesGroup.transition()
    .duration(1000)
    .attr("dx", d => newXScale(d[chosenXaxis]));
    return circlesGroup;
}
// function to move circle text by updating cy attribute 
function renderYtext(circlesGroup, newYScale, chosenYaxis) {
    circlesGroup.transition()
    .duration(1000)
    .attr("dy", d => newYScale(d[chosenYaxis]));
    return circlesGroup;
}
// format income integers to read as currency
var formatter = new Intl.NumberFormat('en-US', {
    style: "currency",
    currency: "USD"
});

// create update tooltip function to update tips based on axes selections
function updateToolTip(chosenXaxis, chosenYaxis, circlesGroup) {
    // set x and y label variables
    var xLabel;
    var yLabel;
    // set percent labesl for each axis to blank
    var xpercent = ""
    var ypercent = ""
    // create conditionals for chosen x and y axes and their corresponding labels
    if (chosenXaxis === "age") {
        xLabel = "Age";
    }
    else if (chosenXaxis === "income") {
        xLabel = "Income";
    }
    else {
        xLabel = "Poverty";
        xpercent = "%"
    };

    if (chosenYaxis === "healthcare") {
        yLabel = "Healthcare";
        ypercent = "%"
    }
    else if (chosenYaxis === "obesity") {
        yLabel = "Obesity";
        ypercent = "%"
    }
    else {
        yLabel = "Smokes";
        ypercent = "%"
    };
    // call d3.tip to update tooltip html return 
    var toolTip = d3.tip()
        .attr("class", "tooltip")
        .offset([80, -60])
        .html(function (d) {
            // format to currency if chosen xaxis is income 
            if (chosenXaxis === "income"){
                var incomelevel = formatter.format(d[chosenXaxis]);
                return (`<strong>${d.state}</strong><br>${xLabel}: ${incomelevel.substring(0, incomelevel.length-3)}${xpercent}<br>${yLabel}: ${d[chosenYaxis]}${ypercent}`);

            }
            // otherwise return this label
            else return (`<strong>${d.state}</strong><br>${xLabel}: ${d[chosenXaxis]}${xpercent}<br>${yLabel}: ${d[chosenYaxis]}${ypercent}`);
        });
    // call tooltip on circlesgroup for mouse events
    circlesGroup.call(toolTip);
    // on mousein event
    circlesGroup.on("mouseover", function(data) {
        toolTip.show(data);
    })
        // onmouseout event
        .on("mouseout", function (data) {
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
    var yLinearScale = yScale(censusData, chosenYaxis);

    // create initial axis functions
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // append x axis
    var xAxis = chartGroup.append("g")
        .classed("x-axis", true)
        .attr("transform", `translate(0, ${height})`)
        .call(bottomAxis);
    // append y axis
    var yAxis = chartGroup.append("g")
        .classed("y-axis", true)
        // .attr("transform", `translate(0, ${height})`)
        .call(leftAxis);
    // append circles group
    var circlesGroup = chartGroup.selectAll("g circle") 
        .data(censusData)
        .enter()
        .append("g");
    // append circles to circlesgroup
    var circlesXY = circlesGroup
        .append("circle")
        .attr("cx", d => xLinearScale(d[chosenXaxis]))
        .attr("cy", d => yLinearScale(d[chosenYaxis]))
        .attr("r", 25)
        .classed("stateCircle", true);
    // append text to circles
    var circlesText = circlesGroup
        .append("text")
            .text(function (d) {
                return d.abbr})
            .attr("dx", d => xLinearScale(d[chosenXaxis]))

            .attr("dy", d => yLinearScale(d[chosenYaxis]))
            .classed("stateText", true);

    // Create group for three x-axis labels
    var xlabelsGroup = chartGroup.append("g")
        .attr("transform", `translate(${width / 2}, ${height + 20})`);

    // set labels and attributes to append to xlabelgroup
    var agelabel = xlabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 18)
        .attr("value", "age") // value to grab for event listener
        .classed("active", true)
        .text("Median Age");

    var incomelabel = xlabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 36)
        .attr("value", "income") // value to grab for event listener
        .classed("inactive", true)
        .text("Median Household Income");

    var povertylabel = xlabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 54)
        .attr("value", "poverty") // value to grab for event listener
        .classed("inactive", true)
        .text("In Poverty (%)");

    // create group for three y-axis labels
    var ylabelsGroup = chartGroup.append("g")
        .attr("transform", "rotate(-90)");
    // set labels and attributes to append to ylabelgroup
    var healthcarelabel = ylabelsGroup.append("text")
        .attr("y", 0 - margin.left + 50)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .attr("yValue", "healthcare")
        .classed("active", true)
        .classed("axis-text", true)
        .text("Lacks Healthcare (%)");

    var obesitylabel = ylabelsGroup.append("text")
        .attr("y", 0 - margin.left + 32)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .attr("yValue", "obesity")
        .classed("inactive", true)
        .classed("axis-text", true)
        .text("Obesity (%)");

    var smokeslabel = ylabelsGroup.append("text")
        .attr("y", 0 - margin.left + 14)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .attr("yValue", "smokes")
        .classed("inactive", true)
        .classed("axis-text", true)
        .text("Smokes (%)");

    // update tooltip funnction above csv import
    circlesGroup = updateToolTip(chosenXaxis, chosenYaxis, circlesGroup);

    // x axis labels event listener
    xlabelsGroup.selectAll("text")
        .on("click", function () {
            // get value of selection
            var value = d3.select(this).attr("value");
            if (value != chosenXaxis) {
                // replaces chosenXaxis with value
                chosenXaxis = value;
                // updates x scale for new data
                xLinearScale = xScale(censusData, chosenXaxis)  
                // updates x axis with transition
                xAxis = renderXAxis(xLinearScale, xAxis);
                // updates circles with new x values
                circlesXY = renderXcircles(circlesXY, xLinearScale, chosenXaxis);
                // updates circles text with new x values
                circlesText = renderXtext(circlesText, xLinearScale, chosenXaxis);
                // updates tooltips with new info
                circlesGroup = updateToolTip(chosenXaxis, chosenYaxis, circlesGroup);
                // changes classes to change bold text
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

    // y axis labels event listener
    ylabelsGroup.selectAll("text")
        .on("click", function () {
            // get value of selection
            var yValue = d3.select(this).attr("yValue");
            if (yValue != chosenYaxis) {
                // replaces chosenYaxis with value
                chosenYaxis = yValue;
                // updates y scale for new data
                yLinearScale = yScale(censusData, chosenYaxis);
                // updates y axis with transition
                yAxis = renderYAxis(yLinearScale, yAxis);
                // updates circles with new y values
                circlesXY = renderYcircles(circlesXY, yLinearScale, chosenYaxis);
                // updates circles text with new yvalues
                circlesText = renderYtext(circlesText, yLinearScale, chosenYaxis);
                // updates tooltips with new info
                circlesGroup = updateToolTip(chosenXaxis, chosenYaxis, circlesGroup);
                // changes classes to change bold text
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
// print any errors in console
}).catch(function(error) {
    console.log(error);
});
