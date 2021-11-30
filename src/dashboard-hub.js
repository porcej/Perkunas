import { HubConnectionBuilder, LogLevel } from '@aspnet/signalr';

export default {
  install (Vue) {
    // use a new Vue instance as the interface for Vue components to receive/send SignalR events
    // this way every component can listen to events or send new events using this.$dashboardHub
    const dashboardHub = new Vue();
    Vue.prototype.$dashboardHub = dashboardHub;

    // Provide methods to connect/disconnect from the SignalR hub
    let connection = null
    let startedPromise = null
    let manuallyClosed = false

    Vue.prototype.startSignalR = () => {

      connection = new HubConnectionBuilder()
        .withUrl( "https://fire-173822vma.alexgov.net:5001/dashboardHub")
        .configureLogging(LogLevel.Information)
        .build()


      // Forward hub events through the event, so we can listen for them in the Vue components
      connection.on('ReceiveGroupMessage', (groupName, user, message) => {
        // const msg = JSON.parse(message)
        //{"EventId":"8d9994c0a8f0c5b","EventCategory":"IncidentChanged","EventType":"IncidentAssigned","Key":2240758,"Payload":""}
        // if (msg.EventType === "IncidentAssigned"){
        //    dashboardHub.$emit('incident-added', msg  );
        // } else {
        //   dashboardHub.$emit('other-added', msg );
        // }
        dashboardHub.$emit('group-message-received', { groupName, user, message })
        console.log(`RGM: ${groupName} - ${message}`)
      })

      connection.on('IncidentFieldChanged', (incidentId, field, value) => {
        console.log("+++++++++++++++++++");
        console.log(incidentId);
        console.log(`Incident: ${incidentId} - ${field}: ${value}`);
        dashboardHub.$emit('incident-updated', {'incidentId': incidentId, 'field':field, 'value': value});
      });

      connection.on('IncidentUnitStatusChanged', (incidentId, unit) => {
        console.log(`Incident Unit: ${incidentId} - ${unit}`);
        dashboardHub.$emit('incident-unit-updated', {'incidentId': incidentId, 'unit': unit});
      });

      connection.on('IncidentAdded', (incident) => {
        console.log(incident);
        dashboardHub.$emit('incident-added', incident);
        console.log("\t************************************************************************");
        console.log(incident);
        console.log("\t************************************************************************");
      });

      // You need to call connection.start() to establish the connection but the client wont handle reconnecting for you!
      // Docs recommend listening onclose and handling it there.
      // This is the simplest of the strategies
      function start () {
        startedPromise = connection.start()
          .catch(err => {
            console.error('Failed to connect with hub', err)
            return new Promise((resolve, reject) => setTimeout(() => start().then(resolve).catch(reject), 5000))
          })
        return startedPromise
      }
      connection.onclose(() => {
        if (!manuallyClosed) start()
      })

      // Start everything
      manuallyClosed = false
      start()
    }

    Vue.prototype.stopSignalR = () => {
      if (!startedPromise) return

      manuallyClosed = true
      return startedPromise
        .then(() => connection.stop())
        .then(() => { startedPromise = null })
    }

    // Provide methods for components to send messages back to server
    // Make sure no invocation happens until the connection is established
    dashboardHub.incidentOpened = (incidentId) => {
      if (!startedPromise) return

      return startedPromise
        // .then(() => connection.invoke('JoinIncidentGroup', `${incidentId}`))
        .then(() => connection.invoke('JoinIncidentGroup', incidentId))
        .catch(console.error)
    }

    dashboardHub.incidentClosed = (incidentId) => {
      if (!startedPromise) return

      return startedPromise
        .then(() => connection.invoke('LeaveIncidentGroup', incidentId))
        .catch(console.error)
    }

    dashboardHub.JoinDashboard = () => {
      if (!startedPromise) return

      return startedPromise
        .then(() => connection.invoke('JoinDashboard'))
        .catch(console.error);
    }

    dashboardHub.subscribe = (group) => {
      if (!startedPromise) return

      return startedPromise
        .then(() => connection.invoke('Subscribe', group))
        .catch(console.error);
    }

    // dashboardHub.sendMessage = (message) => {
    //   if (!startedPromise) return

    //   return startedPromise
    //     .then(() => connection.invoke('SendLiveChatMessage', message))
    //     .catch(console.error)
    // }
  }
}




// export default {
//   install (Vue) {
//     // use a new Vue instance as the interface for Vue components to receive/send SignalR events
//     // this way every component can listen to events or send new events using this.$dashboardHub
//     const dashboardHub = new Vue();
//     Vue.prototype.$dashboardHub = dashboardHub;

//     // connection.on('ReceiveGroupMessage', (groupName, user, message) => {
//     //   dashboardHub.$emit('group-message-received', { groupName, user, message })
//     //   console.log(message)
//     // });

//     // Provide methods to connect/disconnect from the SignalR hub
//     let connection = null
//     let startedPromise = null
//     let manuallyClosed = false

//     Vue.prototype.startSignalR = () => {
//         	console.log("Hello World");
//           connection = new HubConnectionBuilder()
//           .withUrl(`${Vue.prototype.$http.defaults.baseURL}/dashboardHub`)
//           .configureLogging(LogLevel.Information)
//           .build()

//       // Forward hub events through the event, so we can listen for them in the Vue components
//       connection.on('IncidentAdded', (incident) => {
//         dashboardHub.$emit('incident-added', incident)
//       })
//       connection.on('IncidentScoreChange', (incidentId, score) => {
//         dashboardHub.$emit('score-changed', { incidentId, score })
//       })
//       connection.on('AnswerCountChange', (incidentId, answerCount) => {
//         dashboardHub.$emit('answer-count-changed', { incidentId, answerCount })
//       })
//       connection.on('AnswerAdded', answer => {
//         dashboardHub.$emit('answer-added', answer)
//       })
//       connection.on('LiveChatMessageReceived', (username, text) => {
//         dashboardHub.$emit('chat-message-received', { username, text })
//       })

//       // You need to call connection.start() to establish the connection but the client wont handle reconnecting for you!
//       // Docs recommend listening onclose and handling it there.
//       // This is the simplest of the strategies
//       function start () {
//       	console.log("Starting WS");
//         startedPromise = connection.start()
//           .catch(err => {
//             console.error('Failed to connect with hub', err)
//             return new Promise((resolve, reject) => setTimeout(() => start().then(resolve).catch(reject), 5000))
//           })
//         return startedPromise
//       }
//       connection.onclose(() => {
//         if (!manuallyClosed) start()
//       })

//       // Start everything
//       manuallyClosed = false
//       start()
//     }

//     Vue.prototype.startSignalR();

//     Vue.prototype.stopSignalR = () => {
//       if (!startedPromise) return

//       manuallyClosed = true
//       return startedPromise
//         .then(() => connection.stop())
//         .then(() => { startedPromise = null })
//     }

      // Provide methods for components to send messages back to server
      // Make sure no invocation happens until the connection is established
    // dashboardHub.incidentOpened = (incidentId) => {
    //   if (!startedPromise) return

    //   return startedPromise
    //     .then(() => connection.invoke('JoinIncidentGroup', incidentId))
    //     .catch(console.error)
    // }
    // dashboardHub.incidentClosed = (incidentId) => {
    //   if (!startedPromise) return

    //   return startedPromise
    //     .then(() => connection.invoke('LeaveIncidentGroup', incidentId))
    //     .catch(console.error)
    // }

//     dashboardHub.sendMessage = (message) => {
//       if (!startedPromise) return

//       return startedPromise
//         .then(() => connection.invoke('SendLiveChatMessage', message))
//         .catch(console.error)
//     }
//     let startedPromise = null;
//     function start () {
//       startedPromise = connection.start()
//         .catch(err => {
//           console.error('Failed to connect with hub', err)
//           return new Promise((resolve, reject) => setTimeout(() => start().then(resolve).catch(reject), 5000))
//         });
//       return startedPromise;
//     };
//     connection.onclose(() => start());
//     start();
//   },};