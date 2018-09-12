// Create the donut pie chart and insert it onto the page
function graphing(){

nv.addGraph(function() {
    var donutChart = nv.models.pieChart()
            .x(function(d) {
          return d.label
        })
            .y(function(d) {
          return d.value
        })
            .showLabels(true)
            .showLegend(false)
            .labelThreshold(.05)
            .labelType("key")
            .color(["#2c90ff", "#503fe3", "#7dd0b6", "#e38690", "#ead98b"])
            .tooltipContent(
          function(key, y, e, graph) { return 'Custom tooltip string' }
        ) // This is for when I turn on tooltips
            .tooltips(false)
            .donut(true)
            .donutRatio(0.35);
    
        // Insert text into the center of the donut
        function centerText() {
              return function() {
          var svg = d3.select("svg");
  
              var donut = svg.selectAll("g.nv-slice").filter(
            function (d, i) {
              return i == 0;
            }
          );
          
          // Insert first line of text into middle of donut pie chart
          donut.insert("text", "g")
              .text("Line One")
              .attr("class", "middle")
              .attr("text-anchor", "middle")
                  .attr("dy", "-.55em")
                  .style("fill", "#000");
          // Insert second line of text into middle of donut pie chart
          donut.insert("text", "g")
              .text("Line Two")
              .attr("class", "middle")
              .attr("text-anchor", "middle")
                  .attr("dy", ".85em")
                  .style("fill", "#000");
        }
      }
    
    // Put the donut pie chart together
    d3.select("#donut-chart svg")
      .datum(seedData())
      .transition().duration(300)
      .call(donutChart)
      .call(centerText())
      .call(pieSlice());
      
    return donutChart;
  });
  
  
  // Seed data to populate donut pie chart
  function seedData() {
    return [
      {
        "label": "Max Supply",
        "value":100-supplyPercent
      },
      {
        "label": "Issued",
        "value":supplyPercent
      }
    ];
  }

}