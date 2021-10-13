(function () {
    d3.queue()
        .defer(d3.json, "IND_adm2_Literacy.json")
        .defer(d3.csv, "num_schools.csv")
        .await(function (error, topoMain, schools) {
            var districts, disputed;
            if (error) throw error;

            // Features for districts
            districts = topojson.feature(topoMain, topoMain.objects.IND_adm2);

            // CSV data
            // Add csv data to json
            // Need to add another loop for features
            for (var y = 0; y < districts.features.length; y++) {
                district_name = districts.features[y].id.toLowerCase()
                for (var i = 0; i < schools.length; i++) {
                    district_name_csv = schools[i].district.toLowerCase()
                    if (district_name == district_name_csv) {
                        // Only 576 were found, need to check missing
                        //console.log("true")
                        // This will only work for one feature for now
                        feature = schools[i].feature
                        value = schools[i].value
                        districts.features[y].properties[feature] = value
                    }

                }
            }

            // Select List
            let stateList = districts.features.map(d => d.properties.NAME_1);
            stateList = [...new Set(stateList)];
            let stateOptions = `<option selected value='All State'>All States</option>`;
            stateList.forEach(d => {
                stateOptions = stateOptions + `<option>${d}</option>`;
            });

            d3.select('#stateList').html(stateOptions);

            var STATE_VAL = 'All States'

            // List of categories 
            let categoryList = schools.map(d => d.category);
            categoryList = [...new Set(categoryList)];
            let categoryOptions = `<option selected value='None'>None</option>`;
            categoryList.forEach(d => {
                categoryOptions = categoryOptions + `<option>${d}</option>`;
            });
            d3.select('#categoryList').html(categoryOptions);
            //console.log(categoryList)

            document.getElementById('stateList').addEventListener('change', function () {
                //console.log('You selected: ', this.value);
                STATE_VAL = this.value
                //console.log(STATE_VAL)

                
                var map = districtMap(preparedData).width(width).height(height).scale(1200);
            d3.select("#map").call(map);

            // On change of selection re-render
            var name = 'feature';
            d3.selectAll(`#select input[name=${name}]`).on("change", function () {
                filter = d3.select(`#select input[name=${name}]:checked`).node().value;
                colorCode(preparedData.features, filter);
                map = districtMap(preparedData).width(width).height(height).scale(1200);
                d3.select("#map").call(map);
            });

                document.getElementById('categoryList').addEventListener('change', function () {
                    CATEGORY_VAL = this.value
                    console.log(CATEGORY_VAL)

                    selectedData = schools.filter(function(row){
                        return row['category'] == CATEGORY_VAL;
                    });
                    //console.log(selectedData)
                    let featureList = selectedData.map(d => d.feature);
                    featureList = [...new Set(featureList)];

                    // Filter feature
                    var name = CATEGORY_VAL
                    d3.select("#select").call(selectFilter(featureList, name));

                    var filter = d3.select(`#select input[name=${name}]:checked`).node().value;
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

                    colorCode(preparedData.features, filter);

                    var map = districtMap(preparedData).width(width).height(height).scale(1200).propTag(filter);
                    d3.select("#map").call(map);

                    // On change of selection re-render
                    d3.selectAll(`#select input[name=${name}]`).on("change", function () {
                        filter = d3.select(`#select input[name=${name}]:checked`).node().value;
                        colorCode(preparedData.features, filter);
                        map = districtMap(preparedData).width(width).height(height).scale(1200).propTag(filter);
                        d3.select("#map").call(map);
                    });
                });
            });


            // console.log(d3.select("#stateList").node().value)

            //let preparedData = districts.features.filter(d => d.properties.NAME_1 == d3.select("#stateList").node().value);
            //console.log(preparedData)

            // Radio HTML
            // selectFilter is the function that generates the radio buttons
            // The d3.select() function in D3.js is used to select the first element
            // that matches the specified selector string.

            // var name = "feature"
            // let featureList = ['num_schools']
            // d3.select("#select").call(selectFilter(featureList, name));
            // Get value of checked radio button
            // var filter = d3.select('#select input[name="feature"]:checked').node().value;
            
            // Color codes for districts based on Literacy Rates
            // colorCode(districts.features, filter);
            districts.features.forEach(function (d) {d.color = "white";})

            // Map render
            var map = districtMap(districts).width(800).height(700).scale(1200);
            d3.select("#map").call(map);

            // On change of selection re-render
            d3.selectAll("#select input[name=feature]").on("change", function () {
                filter = d3.select('#select input[name="feature"]:checked').node().value;
                colorCode(districts.features, filter);
                map = districtMap(districts).width(800).height(700).scale(1200);
                d3.select("#map").call(map);
            });
        });
}());

function selectFilter(featureList, name) {
    function render(selection) {
        selection.each(function () {
            // d3.select(this) creates a 1-element selection containing the current
            // node. This allows you to use D3's operators to modify the element
            /*
            d3.select(this).html("<form>" +
                "<input type='radio' name='feature' value='Literacy' checked> Literacy<br>" +
                "<input type='radio' name='feature' value='FemaleLiteracy'> Female Literacy<br>" +
                "<input type='radio' name='feature' value='MaleLiteracy'> Male Literacy<br>" +
                "<input type='radio' name='feature' value='Num_Schools'> Num_Schools<br>" +
                "</form>");
            */
            let selectedOptions = "<form>"
            featureList.forEach(d => {
                selectedOptions += `<input type='radio' name='${name}' value='${d}' checked> ${d} <br>`;
            });
            selectedOptions += "</form>"
            //console.log(selectedOptions)
            d3.select(this).html(selectedOptions);
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
        else { d.color = color(d.properties[filter]); }
    });
}
