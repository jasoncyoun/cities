new Vue({
    el: '#city-form',
    data: {
        states: []
    },
    methods: {
        submitForm () {
            city_table.error_message = '';
            var city_name = this.$refs.name.value;
            var state_id = this.$refs.state_id.value;
            if (city_name && state_id) {
                axios.get('https://w3a63j3u04.execute-api.us-west-2.amazonaws.com/production/cities?state_id=' + state_id + '&name=' + city_name)
                    .catch(function (error) {
                        if (error.response) {
                            city_table.error_message = error.response.data;
                        }
                    })
                    .then(function (response) {
                        city_obj = response.data;
                        if (city_obj.state_id in city_table.states_hash) {
                            if (city_obj.id in city_table.states_hash[city_obj.state_id]) {
                                city_table.error_message = "You've already entered " + city_obj.name + ".";
                            } else {
                                city_table.states_hash[city_obj.state_id][city_obj.id] = city_obj.population
                                triggerAddedCity(city_obj);
                            }
                        } else {
                            city_table.states_hash[city_obj.state_id] = { };
                            city_table.states_hash[city_obj.state_id][city_obj.id] = city_obj.population;
                            triggerAddedCity(city_obj);
                        }
                    });
            }
        }
    },
    created () {
        var vm = this;
        axios.get('https://w3a63j3u04.execute-api.us-west-2.amazonaws.com/production/states')
            .then(function (response) {
            initCityTable(vm, response.data);
      });
    }
});

function initCityTable(cf, states_response) {
    city_table = new Vue({
        el: '#city-table',
        data: {
            score: 0.00,
            //submitted_cities: submitted_cities,
            submitted_population: 0,
            total_population: 0,
            states_hash: {},
            error_message: ''
        },
        created () {
            var vm = this;
            
            for (i in states_response) {
                vm.states_hash[states_response[i].id] = states_response[i];
                vm.states_hash[states_response[i].id].percentage_of_total = 0.0;
                vm.states_hash[states_response[i].id].entered_population = 0;
                vm.total_population += states_response[i].population;
            }
            cf.states = states_response;
        }
    });
}

function triggerAddedCity(city) {
    city_table.states_hash[city.state_id].entered_population += city.population;
    city_table.states_hash[city.state_id].percentage_of_total = ((city_table.states_hash[city.state_id].entered_population * 100.00) / city_table.states_hash[city.state_id].population).toFixed(2);
    city_table.submitted_population += city.population;
    city_table.score = ((city_table.submitted_population * 100.00 ) / city_table.total_population).toFixed(3);
    $('tr#' + city.state_id).fadeOut(300).fadeIn(300);
    $('<span id="added-population">+' + city.population.toLocaleString('en')  + '!</span>').appendTo('#added-population-container');
    $('#added-population').animate({ top: -100, opacity: 0 }, 2000, "linear", function(){ $(this).remove(); })
}