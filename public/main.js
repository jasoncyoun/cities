var submitted_cities = {};
var state_list = [];
new Vue({
    el: '#city-form',
    data: {
        states: []
    },
    methods: {
        submitForm () {
            var city_name = this.$refs.name.value;
            var state_id = this.$refs.state_id.value;
        }
    },
    created () {
        var vm = this;
        axios.get('https://w3a63j3u04.execute-api.us-west-2.amazonaws.com/production/states')
            .then(function (response) {
            vm.states = response.data;
            state_list = response.data;
            initCityTable();
      })
    }
});

function initCityTable() {
    new Vue({
        el: '#city-table',
        data: {
          submitted_cities: submitted_cities,
          states: []
        },
        created () {
            var vm = this;
            for (i in state_list) {
                state_list[i].percentage_of_total = 0.0;
                state_list[i].population = state_list[i].population.toLocaleString('en');
            }
            vm.states = state_list;
        }
    });
}