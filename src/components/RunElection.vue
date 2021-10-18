<template>
  <b-container>
    <b-form @submit="onSubmit">
      <b-row>
        <b-col col md="6">
          <h2>Election Data</h2>
          <b-form-group label="Election Data" label-for="data">
            <b-form-textarea
              id="data"
              v-model="data"
              rows="3"
              max-rows="6"
            ></b-form-textarea>
          </b-form-group>
          <b-form-group label="Which Election" label-for="which_election">
            <b-form-input
              id="which_election"
              v-model="which_election"
              required
            ></b-form-input>
          </b-form-group>

          <b-form-group label="Exclude" label-for="exclude">
            <b-form-input id="exclude" v-model="exclude"></b-form-input>
          </b-form-group>
        </b-col>
        <b-col col md="6">
          <h2>Config</h2>
          <b-alert variant="success" show="resultOK === true"
            >Election Generated -- download below.</b-alert
          >
          <b-alert variant="danger" show="resultOK === false"
            >Could Not Generate Election</b-alert
          >
          <b-button type="submit" variant="primary">Run Election</b-button>
          <div v-html="result"></div>
          <b-button
            type="submit"
            v-if="resultOK === true"
            @click="download('my_election.qsf', JSON.stringify(resultText))"
            >Download</b-button
          >
        </b-col>
      </b-row>
    </b-form>
  </b-container>
</template>

<script>
import { parse_results } from "../lib/election_run";

export default {
  name: "CreateElection",
  data() {
    return {
      data: "",
      which_election: "",
      exclude: "[]",
      resultOK: null,
      result: null
    };
  },
  methods: {
    onSubmit(event) {
      event.preventDefault();

        const excludeList = JSON.parse(this.exclude);
        console.log(excludeList);
      [this.resultOK, this.result] = parse_results(
        this.data,
        this.which_election,
        excludeList
      );
        this.result = this.result.join('\n');
    }
  }
};
</script>

<style>
.scroll {
  overflow-y: "scroll";
  max-height: 200px;
}
</style>
