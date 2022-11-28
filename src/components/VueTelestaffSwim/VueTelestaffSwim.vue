<template>
  <div class="vwt__telestaff">
    <div class="vwt__contents align-self-center">
      <div class="vwt__loading" v-if="loading">
        <slot name="loading">
          <p><span class="vwt__title">Loading...</span></p>
          <p><font-awesome-icon icon="spinner" size="2x" /></p>
        </slot>
      </div>

      <div class="vwt__error" v-else-if="error || !roster">
        <slot name="error">
          <span class="vwt__title">{{ error || "Something went wrong!" }}</span>
        </slot>
      </div>

      <template v-else>
        <slot name="title">
          <span class="vwt__title" :data-shift="roster.shift">
            {{ roster.day }} ({{ roster.shift.toUpperCase() }} Shift)
          </span>
        </slot>
        <div class="container vwt__roster">
          <div
            class="container vwt_unit"
            :key="udx"
            v-for="(unit, udx) in roster.units"
          >
            <div class="row vwt__unit_title_row border-bottom">
              <span class="vwt__unit_title">{{ unit.title }}</span>
              <span v-if="unit.notes !== ''" class="vwt__unit_activities">
                : {{ unit.notes }}
              </span>
            </div>
            <div
              class="row vwt__position"
              :key="pdx"
              v-for="(position, pdx) in unit.Position"
            >
              <div class="vwt__position_title col">
                <font-awesome-icon
                  :icon="formatRank(position.title)"
                  fixed-width
                />
              </div>
              <div class="vwt__position_people col-11">
                <div
                  class="vwt__person"
                  :style="widthStartByTime(person)"
                  :key="persondx"
                  v-for="(person, persondx) in position.people"
                >
                  {{ formatName(person.name) }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script src="./script.js"></script>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style src="./style.css" scoped></style>
