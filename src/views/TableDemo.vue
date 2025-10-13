<template>
  <main class="container py-3">
    <h2 class="mb-3">Interactive Tables Demo</h2>

    <!-- Table 1: Cities -->
    <section class="mb-4">
      <h5 class="mb-2">Table A — Cities</h5>
      <DataTable :columns="cityCols" :rows="cityRows" />
    </section>

    <!-- Table 2: Courses -->
    <section>
      <h5 class="mb-2">Table B — Courses</h5>
      <DataTable :columns="courseCols" :rows="courseRows" />
    </section>
  </main>
</template>

<script setup>
import DataTable from '@/components/DataTable.vue'
import { ref } from 'vue'

const cityCols = [
  { key: 'name', label: 'City' },
  { key: 'country', label: 'Country' },
  { key: 'population', label: 'Population' },
  { key: 'airport', label: 'Airport' }
]

const cityRows = ref([
  { name: 'Melbourne', country: 'Australia', population: 5078000, airport: 'MEL' },
  { name: 'Sydney', country: 'Australia', population: 5312000, airport: 'SYD' },
  { name: 'Brisbane', country: 'Australia', population: 2564000, airport: 'BNE' },
  { name: 'Perth', country: 'Australia', population: 2141000, airport: 'PER' },
  { name: 'Adelaide', country: 'Australia', population: 1373000, airport: 'ADL' },
  { name: 'Hobart', country: 'Australia', population: 253000, airport: 'HBA' },
  { name: 'Canberra', country: 'Australia', population: 472000, airport: 'CBR' },
  { name: 'Auckland', country: 'New Zealand', population: 1697000, airport: 'AKL' },
  { name: 'Wellington', country: 'New Zealand', population: 215000, airport: 'WLG' },
  { name: 'Christchurch', country: 'New Zealand', population: 381000, airport: 'CHC' },
  { name: 'Tokyo', country: 'Japan', population: 13960000, airport: 'HND' },
  { name: 'Osaka', country: 'Japan', population: 2700000, airport: 'KIX' },
  { name: 'Kyoto', country: 'Japan', population: 1475000, airport: 'UKY' },
  { name: 'Seoul', country: 'South Korea', population: 9776000, airport: 'ICN' },
  { name: 'Busan', country: 'South Korea', population: 3360000, airport: 'PUS' },
  { name: 'Shanghai', country: 'China', population: 24870000, airport: 'PVG' },
  { name: 'Beijing', country: 'China', population: 21890000, airport: 'PEK' },
  { name: 'Shenzhen', country: 'China', population: 17560000, airport: 'SZX' },
  { name: 'Guangzhou', country: 'China', population: 18740000, airport: 'CAN' },
  { name: 'Hangzhou', country: 'China', population: 11900000, airport: 'HGH' },
])

const courseCols = [
  { key: 'code', label: 'Code' },
  { key: 'title', label: 'Title' },
  { key: 'campus', label: 'Campus' },
  { key: 'credits', label: 'Credits' }
]

const courseRows = ref([
  { code: 'FIT5137', title: 'Advanced Web Dev', campus: 'Clayton', credits: 6 },
  { code: 'FIT5032', title: 'Mobile & Web Apps', campus: 'Clayton', credits: 6 },
  { code: 'FIT9131', title: 'Programming Foundations', campus: 'Clayton', credits: 6 },
  { code: 'FIT5145', title: 'Data Exploration', campus: 'Caulfield', credits: 6 },
  { code: 'FIT5120', title: 'Enterprise Project', campus: 'Caulfield', credits: 12 },
  { code: 'FIT9136', title: 'Algorithms & Structures', campus: 'Clayton', credits: 6 },
  { code: 'FIT5046', title: 'Distributed Computing', campus: 'Clayton', credits: 6 },
  { code: 'FIT5152', title: 'Data Wrangling', campus: 'Clayton', credits: 6 },
  { code: 'FIT5165', title: 'Cloud Computing', campus: 'Caulfield', credits: 6 },
  { code: 'FIT5193', title: 'Web Services', campus: 'Clayton', credits: 6 },
  { code: 'FIT5101', title: 'Software Engineering', campus: 'Caulfield', credits: 6 },
  { code: 'FIT5202', title: 'Machine Learning', campus: 'Clayton', credits: 6 },
  { code: 'FIT5148', title: 'Big Data Processing', campus: 'Clayton', credits: 6 },
  { code: 'FIT5097', title: 'User Experience', campus: 'Caulfield', credits: 6 },
  { code: 'FIT5099', title: 'Cyber Security', campus: 'Clayton', credits: 6 },
])
</script>
