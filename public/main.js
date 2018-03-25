Vue.config.productionTip = false;
app = new Vue({
    el: '#app',
    data: {
        states: [],
        score: 0.00,
        submitted_population: 0,
        total_population: 0,
        states_hash: {},
        error_message: ''
    },
    methods: {
        submitForm () {
            var vm = this;
            vm.error_message = '';
            var city_name = this.$refs.name.value;
            var state_id = this.$refs.state_id.value;
            if (city_name && state_id) {
                axios.get('https://w3a63j3u04.execute-api.us-west-2.amazonaws.com/production/cities?state_id=' + state_id + '&name=' + city_name)
                    .catch(function (error) {
                        if (error.response) {
                            vm.error_message = error.response.data;
                        }
                    })
                    .then(function (response) {
                        city_obj = response.data;
                        if (city_obj.state_id in vm.states_hash) {
                            if (city_obj.id in vm.states_hash[city_obj.state_id]) {
                                vm.error_message = "You've already entered " + city_obj.name + ".";
                            } else {
                                vm.states_hash[city_obj.state_id][city_obj.id] = city_obj.population
                                triggerAddedCity(city_obj);
                            }
                        } else {
                            vm.states_hash[city_obj.state_id] = { };
                            vm.states_hash[city_obj.state_id][city_obj.id] = city_obj.population;
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
                for (i in response.data) {
                    vm.states_hash[response.data[i].id] = response.data[i];
                    vm.states_hash[response.data[i].id].percentage_of_total = 0.0;
                    vm.states_hash[response.data[i].id].entered_population = 0;
                    vm.total_population += response.data[i].population;
                }
                vm.states = response.data;
            });
    }
});

function triggerAddedCity(city) {
    app.states_hash[city.state_id].entered_population += city.population;
    app.states_hash[city.state_id].percentage_of_total = ((app.states_hash[city.state_id].entered_population * 100.00) / app.states_hash[city.state_id].population).toFixed(2);
    app.submitted_population += city.population;
    app.score = ((app.submitted_population * 100.00 ) / app.total_population).toFixed(3);
    app.$refs.name.focus();
    app.$refs.name.select();
    $('tr#' + city.state_id).fadeOut(300).fadeIn(300);
    $('<span class="added-population">+' + city.population.toLocaleString('en')  + '!</span>').appendTo('#added-population-container');
    $('.added-population').animate({ top: -100, opacity: 0 }, 2000, "linear", function(){ $('.added-population').remove(); })
}