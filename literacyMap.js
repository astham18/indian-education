(function () {
    d3.queue()
        .defer(d3.json, "IND_adm2_Literacy.json")
        .defer(d3.csv, "num_schools.csv")
        .await(function (error, topoMain, master_csv) {
            var districts, disputed;
            if (error) throw error;

            // Extract Features for districts
            districts = topojson.feature(topoMain, topoMain.objects.IND_adm2);

            // Add csv data to districts
            // Need to add another loop for features
            for (var y = 0; y < districts.features.length; y++) {
                district_name = districts.features[y].id.toLowerCase()
                for (var i = 0; i < master_csv.length; i++) {
                    district_name_csv = master_csv[i].district.toLowerCase()
                    if (district_name == district_name_csv) {
                        // Only 576 were found, need to check missing
                        //console.log("true")
                        // This will only work for one feature for now
                        feature = master_csv[i].feature
                        value = master_csv[i].value
                        districts.features[y].properties[feature] = value
                    }

                }
            }

            // drop down 1
            // States List
            let stateList = districts.features.map(d => d.properties.NAME_1);
            stateList = [...new Set(stateList)];
            let stateOptions = `<option selected value='All State'>All States</option>`;
            stateList.forEach(d => {
                stateOptions = stateOptions + `<option>${d}</option>`;
            });
            d3.select('#stateList').html(stateOptions);

            // drop down 2
            // Categories List based on categories in csv
            let categoryList = master_csv.map(d => d.category);
            categoryList = [...new Set(categoryList)];
            let categoryOptions = `<option selected value='None'>None</option>`;
            categoryList.forEach(d => {
                categoryOptions = categoryOptions + `<option>${d}</option>`;
            });
            d3.select('#categoryList').html(categoryOptions);
            
            document.getElementById('stateList').addEventListener('change', function () {
                // Update state
                STATE_VAL = this.value
            console.log('statelist triggered')
            // Default width and height for map
            var width = 500,
                height = 600;


            // Prep data
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
            document.getElementById('categoryList').addEventListener('change', function () {
                // Update category
                CATEGORY_VAL = this.value
                console.log('categorylist triggered')
                // Filter csv data to category
                categoryData = master_csv.filter(function (row) {
                    return row['category'] == CATEGORY_VAL;
                });

                // Create featureList for that given category
                let featureList = categoryData.map(d => d.feature);
                featureList = [...new Set(featureList)];

                // Create radio buttons from featureList for category
                d3.select("#select").call(selectFilter(featureList, CATEGORY_VAL));

                // Create filter for checked value 
                var filter = d3.select(`#select input[name="${CATEGORY_VAL}"]:checked`).node().value;

                // Add Color
                colorCode(preparedData.features, filter);

                var map = districtMap(preparedData).width(width).height(height).scale(1200).propTag(filter);
                d3.select("#map").call(map);
                console.log('map rendered inside categorylist')

                // On change of selection re-render
                d3.selectAll(`#select input[name="${CATEGORY_VAL}"]`).on("change", function () {
                    console.log(CATEGORY_VAL)
                    filter = d3.select(`#select input[name="${CATEGORY_VAL}"]:checked`).node().value;
                    colorCode(preparedData.features, filter);
                    map = districtMap(preparedData).width(width).height(height).scale(1200).propTag(filter);
                    d3.select("#map").call(map);
                console.log('map re-rendered inside categorylist')
                });
                // if I've selected a category for a state and then I change the state and change the radio
                // buttons without changing the category, it renders the old image
            });

            var map = districtMap(preparedData).width(width).height(height).scale(1200).propTag(filter);
            d3.select("#map").call(map);
            console.log('map rendered inside statelist')
            /*
            // On change of selection re-render
            d3.selectAll(`#select input[name="${CATEGORY_VAL}"]`).on("change", function () {
                filter = d3.select(`#select input[name="${CATEGORY_VAL}"]:checked`).node().value;
                colorCode(preparedData.features, filter);
                map = districtMap(preparedData).width(width).height(height).scale(1200).propTag(filter);
                d3.select("#map").call(map);
                console.log('map rendered outside categorylist') 
            });
            */
                
            });


            // console.log(d3.select("#stateList").node().value)

            //let preparedData = districts.features.filter(d => d.properties.NAME_1 == d3.select("#stateList").node().value);
            //console.log(preparedData)

            // Radio HTML
            // selectFilter is the function that generates the radio buttons
            // The d3.select() function in D3.js is used to select the first element
            // that matches the specified selector string.
            
            // var name = "feature"
            let featureList = ['num_schools']
            d3.select("#select").call(selectFilter(featureList, "School Profile"));
            
            // Get value of checked radio button
            var filter = d3.select(`#select input[name="School Profile"]:checked`).node().value;
            
            // Color codes for districts based on Literacy Rates
            colorCode(districts.features, filter);
            // districts.features.forEach(function (d) {d.color = "white";})

            // Map render
            var map = districtMap(districts).width(800).height(700).scale(1200).propTag(filter);
            d3.select("#map").call(map);
            console.log('map rendered outside')
            // On change of selection re-render
            d3.selectAll("#select input[name=feature]").on("change", function () {
                filter = d3.select(`#select input[name="School Profile"]:checked`).node().value;
                colorCode(districts.features, filter);
                map = districtMap(districts).width(800).height(700).scale(1200).propTag(filter);
                d3.select("#map").call(map);
                console.log('map re-endered outside')
            });
        });
}());

function selectFilter(featureList, name) {
    function render(selection) {
        selection.each(function () {
            let selectedOptions = "<form>"
            featureList.forEach(d => {
                selectedOptions += `<input type='radio' name='${name}' value='${d}' checked> ${d} <br>`;
            });
            selectedOptions += "</form>"
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
