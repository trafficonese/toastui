import "widgets";
import Calendar from '@toast-ui/calendar';
import '@toast-ui/calendar/dist/toastui-calendar.min.css';
import "tui-date-picker/dist/tui-date-picker.css";
import "tui-time-picker/dist/tui-time-picker.css";
import dayjs from "dayjs";

import { ProxyCalendar } from "../modules/proxy-calendar";

import { formatDateNav, addNavigation } from "../modules/calendar-utils";

HTMLWidgets.widget({
  name: "calendar",

  type: "output",

  factory: function (el, width, height) {
    var cal,
      renderRange,
      formatNav = "YYYY-MM-DD",
      navigationOptions;

    return {
      renderValue: function (x) {
        var menu = document.getElementById(el.id + "_menu");

        if (!x.navigation) {
          if (menu !== null) {
            menu.parentNode.removeChild(menu);
          }
        }

        if (typeof cal !== "undefined") {
          cal.destroy();
          el.innerHTML = "";
        }

        var options = x.options;

        cal = new Calendar(el, options);
        var schd = x.schedules;
        cal.createEvents(schd);
        if (x.hasOwnProperty("defaultDate")) {
          cal.setDate(x.defaultDate);
        }

        // Navigation buttons
        if (x.navigation) {
          addNavigation(cal, el.id, x.navigationOptions);
          navigationOptions = x.navigationOptions;
        }

        if (x.events.hasOwnProperty("beforeCreateSchedule")) {
          if (x.events.beforeCreateSchedule === "auto") {
            cal.on("beforeCreateEvent", function (event) {
              cal.createEvents([
                {
                  title: event.title,
                  location: event.location,
                  start: dayjs(event.start._date).format(),
                  end: dayjs(event.end._date).format(),
                  isAllDay: event.isAllDay,
                  category: event.isAllDay ? "allday" : "time",
                  calendarId: event.calendarId,
                },
              ]);
            });
          } else {
            cal.on("beforeCreateEvent", x.events.beforeCreateSchedule);
          }
        } else if (HTMLWidgets.shinyMode) {
          cal.on("beforeCreateEvent", function (event) {
            //console.log(event);
            Shiny.setInputValue(el.id + "_add", {
              title: event.title,
              location: event.location,
              start: dayjs(event.start._date).format(),
              end: dayjs(event.end._date).format(),
              isAllDay: event.isAllDay,
              category: event.isAllDay ? "allday" : "time",
              calendarId: event.calendarId,
            }, {priority: "event"});
          }, {priority: "event"});
        }

        if (x.events.hasOwnProperty("afterRenderSchedule")) {
          cal.on("afterRenderEvent", x.events.afterRenderSchedule);
        } else if (HTMLWidgets.shinyMode) {
          cal.on("afterRenderEvent", function (event) {
            var schedule = event.schedule;
            schedule = cal.getSchedule(schedule.id, schedule.calendarId);
            Shiny.setInputValue(el.id + "_schedules", schedule, {priority: "event"});
          });
        }

        if (x.events.hasOwnProperty("clickSchedule")) {
          cal.on("clickEvent", x.events.clickSchedule);
        } else if (HTMLWidgets.shinyMode) {
          cal.on("clickEvent", function (event) {
            var schedule = event.schedule;
            schedule = cal.getSchedule(schedule.id, schedule.calendarId);
            Shiny.setInputValue(el.id + "_click", schedule, {priority: "event"});
          });
        }

        if (x.events.hasOwnProperty("beforeDeleteSchedule")) {
          cal.on("beforeDeleteEvent", x.events.beforeDeleteSchedule);
        } else if (HTMLWidgets.shinyMode) {
          cal.on("beforeDeleteEvent", function (event) {
            var schedule = event.schedule;
            schedule = cal.getSchedule(schedule.id, schedule.calendarId);
            Shiny.setInputValue(el.id + "_delete", {
              id: schedule.id,
              title: schedule.title,
              location: schedule.location,
              start: dayjs(schedule.start._date).format(),
              end: dayjs(schedule.end._date).format(),
              isAllDay: schedule.isAllDay,
              category: schedule.isAllDay ? "allday" : "time",
              calendarId: schedule.calendarId,
            }, {priority: "event"});
          });
        }

        if (x.events.hasOwnProperty("beforeUpdateSchedule")) {
          cal.on("beforeUpdateEvent", x.events.beforeUpdateSchedule);
        } else if (HTMLWidgets.shinyMode) {
          cal.on("beforeUpdateEvent", function (event) {
            var schedule = event.schedule;
            schedule = cal.getSchedule(schedule.id, schedule.calendarId);
            var changes = event.changes;
            //cal.updateSchedule(schedule.id, schedule.calendarId, changes);
            if (changes.hasOwnProperty("end")) {
              changes.end = dayjs(changes.end._date).format();
            }
            if (changes.hasOwnProperty("start")) {
              changes.start = dayjs(changes.start._date).format();
            }
            Shiny.setInputValue(el.id + "_update", {
              schedule: {
                id: schedule.id,
                title: schedule.title,
                location: schedule.location,
                start: dayjs(schedule.start._date).format(),
                end: dayjs(schedule.end._date).format(),
                isAllDay: schedule.isAllDay,
                category: schedule.isAllDay ? "allday" : "time",
                calendarId: schedule.calendarId,
              },
              changes: changes,
            }, {priority: "event"});
          });
        }

        if (x.events.hasOwnProperty("clickDayname")) {
          cal.on("clickDayname", x.events.clickDayname);
        }

        if (x.events.hasOwnProperty("clickMorecalendar")) {
          cal.on("clickMoreEventsBtn", x.events.clickMorecalendar);
        }

        if (x.events.hasOwnProperty("clickTimezonesCollapseBtncalendar")) {
          cal.on(
            "clickTimezoneCollapseBtn",
            x.events.clickTimezonesCollapseBtncalendar
          );
        }

        if (HTMLWidgets.shinyMode) {
          Shiny.setInputValue(el.id + "_dates", {
            current: dayjs(cal.getDate()._date).format(),
            start: dayjs(cal.getDateRangeStart()._date).format(),
            end: dayjs(cal.getDateRangeEnd()._date).format(),
          }, {priority: "event"});
        }
      },

      getWidget: function () {
        return cal;
      },

      getNavOptions: function() {
        return navigationOptions;
      },

      resize: function (width, height) {
        // TODO: code to re-render the widget with a new size
      },
    };
  },
});

ProxyCalendar();
