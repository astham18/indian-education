function districtMap(districts) {

    var width = 500, height = 600, scale = 1200;
    var propTag = 'Count', ttName = 'Count', unit = '';

    function render(selection) {
        selection.each(function () {

            d3.select(this).select("svg").remove();
            var svg = d3.select(this).append("svg")
                .attr("width", width)
                .attr("height", height);

            d3.select(this).select("#tooltip").remove();
            d3.select(this).append("div").attr("id", "tooltip").style("opacity", 0);

            var projection = d3.geoMercator()
                .fitExtent([[7, 7], [width, height]], districts)

            var path = d3.geoPath().projection(projection);


            svg.selectAll(".district")
                .data(districts.features)
                .enter().append("path")
                .attr("class", "district")
                .style("fill", function (d) { return d.color; })
                .attr("d", path)
                .on("mouseover", function (d) {
                    d3.select("#tooltip").transition()
                        .duration(200)
                        .style("opacity", .9);
                    d3.select("#tooltip").html("<h3>" + (d.id) + "</h3><h4>(" + (d.properties.NAME_1) + ")</h4><table>" +
                        "<tr><td>" + ttName + "</td><td>" + (d.properties[propTag]) + unit + "</td></tr>" +
                        "</table>")
                        .style("left", (d3.event.pageX - document.getElementById('map').offsetLeft + 20) + "px")
                        .style("top", (d3.event.pageY - document.getElementById('map').offsetTop - 60) + "px");
                })
                .on("mouseout", function (d) {
                    d3.select("#tooltip").transition()
                        .duration(500)
                        .style("opacity", 0);
                })
                .each(function() {
                    // https://stackoverflow.com/questions/26049910/change-the-color-of-nodes-on-double-click-in-d3
                    var sel = d3.select(this);
                    var sel_all = d3.selectAll(".district");
                    
                    var state = false;
                    sel.on("dblclick", function (d) {
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
                            d3.select("#info").html("<h3>" + (d.id) + "</h3><h4>(" + (d.properties.NAME_1) + ")</h4>")
                            // sel.style('fill', function (d) { return d.color; });
                        }
                        else {
                            sel.style('fill', function (d) { return d.color; });
                            d3.select("#info").html("")
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
