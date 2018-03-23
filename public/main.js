var submitted_cities = {};
var state_list = [];

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
                        window.x = response;
                    });
            }
        }
    },
    created () {
        var vm = this;
        axios.get('https://w3a63j3u04.execute-api.us-west-2.amazonaws.com/production/states')
            .then(function (response) {
            vm.states = response.data;
            state_list = response.data;
            initCityTable();
      });
    }
});

function initCityTable() {
    city_table = new Vue({
        el: '#city-table',
        data: {
            score: 0.00,
            submitted_cities: submitted_cities,
            submitted_population: 0,
            total_population: 0,
            states: [],
            error_message: ''
        },
        created () {
            var vm = this;
            var total_population = 0;
            for (i in state_list) {
                state_list[i].percentage_of_total = 0.0;
                state_list[i].entered_population = 0;
                total_population += state_list[i].population;
            }
            vm.states = state_list;
            vm.total_population = total_population;
        }
    });
}