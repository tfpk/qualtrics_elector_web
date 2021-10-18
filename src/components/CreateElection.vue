<template>
  <b-container>
    <b-form @submit="onSubmit">
      <b-row>
        <b-col col md="6">
          <h2>Metadata</h2>

          <b-form-group label="Election Name:" label-for="name">
            <b-form-input
              id="name"
              v-model="metadata.name"
              placeholder="My Election"
              required
            ></b-form-input>
          </b-form-group>

          <b-form-group label="Election Description:" label-for="desc">
            <b-form-textarea
              id="desc"
              v-model="metadata.desc"
              placeholder="What's your election about?"
              rows="3"
              max-rows="6"
            ></b-form-textarea>
          </b-form-group>

          <b-form-group label="Start Date: " label-for="start_date">
            <b-form-input
              id="start_date"
              v-model="metadata.start_date"
              required
            ></b-form-input>
          </b-form-group>

          <b-form-group label="End Date: " label-for="end_date">
            <b-form-input
              id="end_date"
              v-model="metadata.end_date"
              required
            ></b-form-input>
          </b-form-group>
        </b-col>
        <b-col col md="6">
          <h2>Positions</h2>
          <b-form-group label="Positions" label-for="positions">
            <b-form-textarea
              id="positions"
              v-model="positions"
              placeholder="code,question"
              rows="3"
            ></b-form-textarea>
          </b-form-group>
        </b-col>
        <b-col col md="6">
          <h2>Candidates</h2>
          <b-form-group label="Candidates" label-for="candidates">
            <b-form-textarea
              id="candidates"
              v-model="candidates"
              placeholder="position_code, candidate_name, candidate_desc"
              rows="3"
            ></b-form-textarea>
          </b-form-group>
        </b-col>
        <b-col col md="6">
          <h2>Results</h2>
          <b-alert variant="success" show="resultOK === true"
            >Election Generated -- download below.</b-alert
          >
          <b-alert variant="danger" show="resultOK === false"
            >Could Not Generate Election</b-alert
          >
          <b-button type="submit" variant="primary">Generate Election</b-button>
          <pre class="scroll">{{ resultText || "No Results Yet." }}</pre>
          <b-button type="submit" v-if="resultOK === true" @click="download('my_election.qsf', JSON.stringify(resultText))">Download</b-button>
        </b-col>
      </b-row>
    </b-form>
  </b-container>
</template>

<script>
import { qualtrics_setup } from "../lib/election_setup";

function download(filename, text) {
  var element = document.createElement("a");
  element.setAttribute(
    "href",
    "data:text/plain;charset=utf-8," + encodeURIComponent(text)
  );
  element.setAttribute("download", filename);

  element.style.display = "none";
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}

export default {
  name: "CreateElection",
  data() {
    return {
      metadata: {
        name: "",
        desc: "",
        start_date: "2021-10-10 23:59:59",
        end_date: "2021-12-10 23:59:59"
      },
      positions: "",
      candidates: "",
      resultOK: null,
      resultText: null
    };
  },
  methods: {
    onSubmit(event) {
      event.preventDefault();
      [this.resultOK, this.resultText] = qualtrics_setup(
        this.metadata,
        this.positions,
        this.candidates
      );
    },
    download
  }
};
</script>

<style>
.scroll {
  overflow-y: "scroll";
  max-height: 200px;
}
</style>
