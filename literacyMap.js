(function () {
    d3.queue()
        .defer(d3.json, "IND_adm2_Literacy.json")
        .await(function (error, topoMain) {
            var districts, disputed;
            if (error) throw error;

            // Features for districts and disputed areas
            districts = topojson.feature(topoMain, topoMain.objects.IND_adm2);

            // Select List
            let stateList = districts.features.map(d => d.properties.NAME_1);
            stateList = [...new Set(stateList)];
            let stateOptions = `<option selected value='All State'>All States</option>`;
            stateList.forEach(d => {
                stateOptions = stateOptions + `<option>${d}</option>`;
            });

            d3.select('#stateList').html(stateOptions);
            var STATE_VAL = 'All States'
            document.getElementById('stateList').addEventListener('change', function () {
                //console.log('You selected: ', this.value);
                STATE_VAL = this.value
                console.log(STATE_VAL)
                //
                var width = 500,
                    height = 600;
                // Filter data

                let preparedData = districts.features.filter(d => d.properties.NAME_1 == STATE_VAL);
                if (STATE_VAL == "All State") {
                    preparedData = districts.features
                    width = 800;
                    height = 700;
                }
                preparedData = {
                    type: "FeatureCollection",
                    features: preparedData
                }
                console.log(preparedData)
                d3.select("#select").call(selectFilter());
                var filter = d3.select('#select input[name="gender"]:checked').node().value;

                colorCode(preparedData.features, filter);
                
                var map = districtMap(preparedData).width(width).height(height).scale(1200).propTag(filter);
                d3.select("#map").call(map);

                // On change of selection re-render
                d3.selectAll("#select input[name=gender]").on("change", function () {
                    filter = d3.select('#select input[name="gender"]:checked').node().value;
                    colorCode(preparedData.features, filter);
                    map = districtMap(preparedData).width(width).height(height).scale(1200).propTag(filter);
                    d3.select("#map").call(map);
                });

            });


            // console.log(d3.select("#stateList").node().value)

            //let preparedData = districts.features.filter(d => d.properties.NAME_1 == d3.select("#stateList").node().value);
            //console.log(preparedData)

            // Radio HTML
            // selectFilter is the function that generates the radio buttons
            // The d3.select() function in D3.js is used to select the first element
            // that matches the specified selector string.
            d3.select("#select").call(selectFilter());
            // Get value of checked radio button
            var filter = d3.select('#select input[name="gender"]:checked').node().value;

            // Color codes for districts based on Literacy Rates
            colorCode(districts.features, filter);

            // Map render
            var map = districtMap(districts).width(800).height(700).scale(1200).propTag(filter);
            d3.select("#map").call(map);

            // On change of selection re-render
            d3.selectAll("#select input[name=gender]").on("change", function () {
                filter = d3.select('#select input[name="gender"]:checked').node().value;
                colorCode(districts.features, filter);
                map = districtMap(districts).width(800).height(700).scale(1200).propTag(filter);
                d3.select("#map").call(map);
            });
        });
}());

function selectFilter() {
    function render(selection) {
        selection.each(function () {
            // d3.select(this) creates a 1-element selection containing the current
            // node. This allows you to use D3's operators to modify the element
            d3.select(this).html("<form>" +
                "<input type='radio' name='gender' value='Literacy' checked> Literacy<br>" +
                "<input type='radio' name='gender' value='FemaleLiteracy'> Female Literacy<br>" +
                "<input type='radio' name='gender' value='MaleLiteracy'> Male Literacy<br>" +
                "<input type='radio' name='gender' value='Num_Schools'> Num_Schools<br>" +
                "</form>");
        });
    } // render
    return render;
}

function colorCode(data, filter) {

    var keyArray = data.map(function (item) { return item["properties"][filter]; });
    var sorted_data = keyArray.sort(d3.ascending);
    var quantile_025 = d3.quantile(sorted_data, 0.25)
    var quantile_050 = d3.quantile(sorted_data, 0.50)
    var quantile_075 = d3.quantile(sorted_data, 0.75)

    // colors ["#dadaeb", "#bcbddc", "#9e9ac8", "#807dba", "#6a51a3"]);
    var color = d3.scaleThreshold()
        .domain([quantile_025, quantile_050, quantile_075])
        .range(["#dadaeb", "#9e9ac8", "#807dba", "#6a51a3"]);
        
    data.forEach(function (d) {
        if (isNaN(d.properties[filter])) { d.properties[filter] = 0; }
        if (d.properties[filter] == 0) { d.color = "white"; }
        else { d.color = color(d.properties[filter]);}
    });
}
