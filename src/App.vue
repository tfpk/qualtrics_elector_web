<template>
  <b-container>
    <h1>Step 1: Create Election</h1>
    <CreateElection/>
    <hr />
    <h1>Step 2: Run Election</h1>
    <RunElection/>
  </b-container>
</template>

<script>
import CreateElection from './components/CreateElection.vue'
import RunElection from './components/RunElection.vue'

export default {
  name: 'App',
  components: {
      CreateElection,
      RunElection,
  }
}
</script>

