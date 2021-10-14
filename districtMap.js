function districtMap(districts) {

    var width = 500, height = 600, scale = 1200;
    var propTag = 'Perc', ttName = 'perc', unit = '%';
    
    function render(selection) {
        selection.each(function () {

            d3v4.select(this).select("svg").remove();
            var svg = d3v4.select(this).append("svg")
                .attr("width", width)
                .attr("height", height);

            d3v4.select(this).select("#tooltip").remove();
            d3v4.select(this).append("div").attr("id", "tooltip").style("opacity", 0);

            var projection = d3v4.geoMercator()
                .fitExtent([[7, 7], [width, height]], districts)

            var path = d3v4.geoPath().projection(projection);


            svg.selectAll(".district")
                .data(districts.features)
                .enter().append("path")
                .attr("class", "district")
                .style("fill", function (d) { return d.color; })
                .attr("d", path)
                .on("mouseover", function (d) {
                    d3v4.select("#tooltip").transition()
                        .duration(200)
                        .style("opacity", .9);
                    d3v4.select("#tooltip").html("<h3>" + (d.id) + "</h3><h4>(" + (d.properties.NAME_1) + ")</h4><table>" +
                        "<tr><td>" + ttName + "</td><td>" + (d.properties[propTag]) + unit + "</td></tr>" +
                        "</table>")
                        .style("left", (d3v4.event.pageX - document.getElementById('map').offsetLeft + 20) + "px")
                        .style("top", (d3v4.event.pageY - document.getElementById('map').offsetTop - 60) + "px");
                })
                .on("mouseout", function (d) {
                    d3v4.select("#tooltip").transition()
                        .duration(500)
                        .style("opacity", 0);
                })
                .each(function() {
                    // https://stackoverflow.com/questions/26049910/change-the-color-of-nodes-on-double-click-in-d3v4
                    var sel = d3v4.select(this);
                    var sel_all = d3v4.selectAll(".district");
                    
                    var state = false;
                    sel.on("click", function (d) {
                        // console.log("You clicked", d.id);
                        // This line deselects previous selection
                        // Remove if grouping districts
                        sel_all.style('fill', function (d) { return d.color; });
                        state = !state;
                        console.log(state)
                        //console.log(sel)
                        if (state) {
                            //sel.style.remove()
                            sel.style('fill', '#df8e14');
                            d3v4.select("#info").html("<h3>" + (d.id) + "</h3><h5> (" + (d.properties.NAME_1) + ")</h5>")
                            // districtRank = getRank(d)
                            //console.log(districtRank)
                            d3v4.csv("district_category_ranks.csv", function (error, district_category_ranks) {
                                    if (error) throw error;
                                    districtRank = district_category_ranks.filter(function (row) {
                                        return row['district'] == d.lower_id;
                                    });
                                    // console.log(d.lower_id, districtRank)
                                    var col_list = district_category_ranks.columns
                                    var rankList = '';
                                    var listvar = [];
                                    
                                    for (var i = 1; i < col_list.length; i++) {
                                        rankList += `<h3> ${(col_list[i])} : ${(districtRank[0][col_list[i]])} </h3><br>`
                            
                                        axis_dict = {"axis": col_list[i], "value": (districtRank[0][col_list[i]])}
                                        
                                        listvar.push(axis_dict)
                                        
                                    }
                                    var temp_dict = [{ 'className': d.id, "axes": listvar }]

                                   
                                    //console.log(randomDataset())
                                    RadarChart.defaultConfig.levelTick = true;
                                    var radar = RadarChart.draw(".chart-container", temp_dict);
                                    d3v3.select("#chart").call(
                                        radar
                                        )
                                    d3v4.select("#rank").html(rankList)
                                });
                            
                        }
                        else {
                            sel.style('fill', function (d) { return d.color; });
                            d3v4.select("#info").html("")
                            d3v4.select("#rank").html("")
                            d3v3.select("#chart").html("")
                            // d3v3.select("#chart").remove()
                            
                        }
                    })
                })
              


            
        });
    } // render
    render.height = function (value) {
        if (!arguments.length) return height;
        height = value;
        return render;
    };
    render.width = function (value) {
        if (!arguments.length) return width;
        width = value;
        return render;
    };
    render.scale = function (value) {
        if (!arguments.length) return scale;
        scale = value;
        return render;
    };
    render.propTag = function (value) {
        if (!arguments.length) return propTag;
        propTag = value;
        return render;
    };
    render.ttName = function (value) {
        if (!arguments.length) return ttName;
        ttName = value;
        return render;
    };
    render.unit = function (value) {
        if (!arguments.length) return unit;
        unit = value;
        return render;
    };

    return render;
} // districtMap

function getRank(d){
    d3v4.queue()
                .defer(d3v4.csv, "district_category_ranks.csv")
                .await(function (error, district_category_ranks) {
                    if (error) throw error;
                    districtRank = district_category_ranks.filter(function (row) {
                        return row['district'] == d.lower_id;
                    });
                    // console.log(d.lower_id, districtRank)

                    //d3v4.select("#info").html("<h3> School Basic Sanitation: " + (districtRank[0]['School Basic Sanitation']) + "</h3>")
                    // return districtRank;
                });
}
