<template>
  <v-row class="fill-height"> 
    <v-col>
      <v-sheet height="64">
        <v-toolbar flat color="white">
          <v-btn class="mr-4" color="primary" @click="dialog = true">
            <v-icon small>mdi-plus</v-icon>Add New
          </v-btn>
          <v-btn outlined class="mr-4" color="grey darken-2" @click="setToday">
            Today
          </v-btn>
          <v-btn fab text small color="grey darken-2" @click="prev">
            <v-icon small>mdi-chevron-left</v-icon>
          </v-btn>
          <v-btn fab text small color="grey darken-2" @click="next" class="mr-4">
            <v-icon small>mdi-chevron-right</v-icon>
          </v-btn>
          <v-toolbar-title>{{ title }}</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-menu bottom right>
            <template v-slot:activator="{ on }">
              <v-btn
                outlined
                color="grey darken-2"
                v-on="on"
              >
                <span>{{ typeToLabel[type] }}</span>
                <v-icon right>mdi-menu-down</v-icon>
              </v-btn>
            </template>
            <v-list>
              <v-list-item @click="type = 'day'">
                <v-list-item-title>Day</v-list-item-title>
              </v-list-item>
              <v-list-item @click="type = 'week'">
                <v-list-item-title>Week</v-list-item-title>
              </v-list-item>
              <v-list-item @click="type = 'month'">
                <v-list-item-title>Month</v-list-item-title>
              </v-list-item>
              <v-list-item @click="type = '4day'">
                <v-list-item-title>4 days</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </v-toolbar>
      </v-sheet>
      <v-sheet height="600">
        <v-calendar
          ref="calendar"
          v-model="focus"
          color="primary"
          :events="events"
          :event-color="getEventColor"
          :now="today"
          :type="type"
          @click:event="showEvent"
          @click:more="viewDay"
          @click:date="viewDay"
          @change="updateRange"
        ></v-calendar>
        <v-menu
          v-model="selectedOpen"
          :close-on-content-click="false"
          :activator="selectedElement"
          offset-x
        >
          <v-card
            color="grey lighten-4"
            min-width="350px"
            flat
          >
            <v-toolbar
              :color="selectedEvent.color"
              dark
            >
              <v-btn @click="currentlyEditing = selectedEvent.id" icon>
                <v-icon>mdi-pencil</v-icon>
              </v-btn>
              <v-toolbar-title v-if="currentlyEditing !== selectedEvent.id" v-html="selectedEvent.name"></v-toolbar-title>
              <div v-else>
                <input type="text" v-model="selectedEvent.name" style="width: 100%; padding: 5px;" >
              </div>
              <v-spacer></v-spacer>
              <v-btn icon>
                <v-icon>mdi-heart</v-icon>
              </v-btn>
              <v-btn @click="deleteEvent(selectedEvent)" icon>
                <v-icon>mdi-delete</v-icon>
              </v-btn>
              <!-- <v-btn icon>
                <v-icon>mdi-dots-vertical</v-icon>
              </v-btn> -->
            </v-toolbar>
            <v-card-text>
              <span v-html="selectedEvent.details" v-if="currentlyEditing !== selectedEvent.id"></span>
              <div v-else>
                <textarea-autosize
                  v-model="selectedEvent.details"
                  type="text"
                  style="width: 100%; padding: 5px;"
                  :min-height="100"
                  placeholder="Add event details"
                >
                </textarea-autosize>
              </div>
            </v-card-text>
            <v-card-text v-if="currentlyEditing == selectedEvent.id">
              <input style="background: white" data-date="YYYY-MM-DD" data-date-format="DD MMMM YYYY" type="date" v-model="selectedEvent.start">
              <input style="background: white" data-date="YYYY-MM-DD" data-date-format="DD MMMM YYYY" type="date" v-model="selectedEvent.end">
              <v-color-picker v-model="selectedEvent.color" hide-inputs></v-color-picker>
            </v-card-text>
            <v-card-actions>
              <v-btn
                text
                color="secondary"
                @click="selectedOpen = false"
              >
                Close
              </v-btn>
              <v-btn
                v-if="currentlyEditing == selectedEvent.id"
                color="primary"
                @click="updateEvent(selectedEvent)"
                class="mr-4"
              >
                Save
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-menu>
      </v-sheet>

      <!-- Add new Event Dialog -->
      <v-dialog v-model="dialog" max-width="500">
        <v-card>
          <v-container>
            <v-form @submit.prevent="addNewEvent">
              <v-text-field label="Event Name" v-model="name" type="text"></v-text-field>
              <v-textarea
                  label="Event Details"
                  type="text"
                  v-model="details"
                  style="width: 100%; padding: 5px;"
                  :min-height="100"
                ></v-textarea>
              <v-text-field label="Start date" v-model="start" type="date"></v-text-field>
              <v-text-field label="End date" v-model="end" type="date"></v-text-field>
              <v-color-picker label="Color" v-model="color" hide-inputs></v-color-picker>
              <v-btn
                type="submit"
                color="primary"
                class="mr-4"
                @click.stop="dialog = false"
              >
                Create Event
              </v-btn>
            </v-form>
          </v-container>
        </v-card>
      </v-dialog>

    </v-col>
  </v-row>
</template>

<script>
import { db } from '@/main'

  export default {
    data: () => ({
      today: new Date().toISOString().substr(0, 10),
      focus: '',
      type: 'month',
      typeToLabel: {
        month: 'Month',
        week: 'Week',
        day: 'Day',
        '4day': '4 Days',
      },
      name: null,
      details: null,
      start: null,
      end: null,
      currentlyEditing: null,
      selectedEvent: {},
      selectedElement: null,
      selectedOpen: false,
      events: [],
      dialog: false,
      colors: ['blue', 'indigo', 'deep-purple', 'cyan', 'green', 'orange', 'grey darken-1'],
      names: []
    }),
    computed: {
      title () {
        const { start, end } = this
        if (!start || !end) {
          return ''
        }

        const startMonth = this.monthFormatter(start)
        const endMonth = this.monthFormatter(end)
        const suffixMonth = startMonth === endMonth ? '' : endMonth

        const startYear = start.year
        const endYear = end.year
        const suffixYear = startYear === endYear ? '' : endYear

        const startDay = start.day + this.nth(start.day)
        const endDay = end.day + this.nth(end.day)

        switch (this.type) {
          case 'month':
            return `${startMonth} ${startYear}`
          case 'week':
          case '4day':
            return `${startMonth} ${startDay} ${startYear} - ${suffixMonth} ${endDay} ${suffixYear}`
          case 'day':
            return `${startMonth} ${startDay} ${startYear}`
        }
        return ''
      },
      monthFormatter () {
        return this.$refs.calendar.getFormatter({
          timeZone: 'UTC', month: 'long',
        })
      },
    },
    mounted () {
      this.$refs.calendar.checkChange(),
      this.getEvents()
    },
    methods: {
      async getEvents() {
        let snapshot = await db.collection('calendarevents').get();
        let events = [];
        snapshot.forEach(doc => {
          let appData = doc.data()
          appData.id = doc.id;
          events.push(appData)
          this.names.push(appData.name);
          console.log(doc.data())
        });
        this.events = events;
        // console.log(snapshot);
      },
      async addNewEvent() {
        if(this.name && this.start && this.end){
          await db.collection('calendarevents').add({
            name: this.name,
            details: this.details,
            start: this.start,
            end: this.end,
            color: this.color.hex
          })
          this.getEvents()
          this.resetData()
        } else {
          alert('Please, fill the required fields')
        }
      },
      async deleteEvent(ev) {
        await db.collection('calendarevents').doc(ev.id).delete();
        this.selectedOpen = false
        this.getEvents()
      },
      async updateEvent(ev) {
        await db.collection('calendarevents')
              .doc(ev.id)
              .update(
                { 
                  name: ev.name,
                  details: ev.details,
                  start: ev.start,
                  end: ev.end,
                  color: ev.color
                }
              );
        this.selectedOpen = false;
        this.currentlyEditing = null;
      },
      resetData() {
        this.name = null
        this.details = null
        this.start = null
        this.end = null
        this.color = null
      },
      viewDay ({ date }) {
        this.focus = date
        this.type = 'day'
      },
      getEventColor (event) {
        return event.color
      },
      setToday () {
        this.focus = this.today
      },
      prev () {
        this.$refs.calendar.prev()
      },
      next () {
        this.$refs.calendar.next()
      },
      showEvent ({ nativeEvent, event }) {
        const open = () => {
          this.selectedEvent = event
          this.selectedElement = nativeEvent.target
          setTimeout(() => this.selectedOpen = true, 10)
        }

        if (this.selectedOpen) {
          this.selectedOpen = false
          setTimeout(open, 10)
        } else {
          open()
        }

        nativeEvent.stopPropagation()
      },
      updateRange ({ start, end }) {
        this.start = start
        this.end = end
      },
      nth (d) {
        return d > 3 && d < 21
          ? 'th'
          : ['th', 'st', 'nd', 'rd', 'th', 'th', 'th', 'th', 'th', 'th'][d % 10]
      },
      rnd (a, b) {
        return Math.floor((b - a + 1) * Math.random()) + a
      },
      formatDate (a, withTime) {
        return withTime
          ? `${a.getFullYear()}-${a.getMonth() + 1}-${a.getDate()} ${a.getHours()}:${a.getMinutes()}`
          : `${a.getFullYear()}-${a.getMonth() + 1}-${a.getDate()}`
      },
    },
  }
</script>

<style>

</style>