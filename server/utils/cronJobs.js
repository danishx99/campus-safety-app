const cron = require('node-cron');
const axios = require('axios');
const _sendNotification  = require('./sendNotification');
const User = require('../schemas/User');
const notification = require('../schemas/notification');

// Function to check for tomorrow's events
const checkForTomorrowEvents = async () => {
  try {
    const response = await axios.get('https://eventsapi3a.azurewebsites.net/api/events/upcoming-events');
    const events = response.data.data;

    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 4);



    const tomorrowFormatted = formatDate(tomorrow);

    console.log('Tomorrow\'s date:', tomorrowFormatted);

    const tomorrowEvents = events.filter(event => event.date === tomorrowFormatted);

    if (tomorrowEvents.length > 0) {
      console.log("We found events for tomorrow! There are", tomorrowEvents.length, "events");
      doSomething(tomorrowEvents); // Call doSomething with the events
    } else {
      console.log('No events found for tomorrow.');
    }
  } catch (error) {
    console.error('Error fetching events:', error);
  }
};

// Helper function to format date as "DD/MM/YYYY"
const formatDate = (date) => {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

// Function to be called when events are found
const doSomething = async (events) => {
  console.log('Events happening tomorrow:', events);
  //Get all users FCM tokens
  const everyone = await User.find({});
  const fcmTokens = everyone.map(user => user.FCMtoken);

  //Create notification for each event
   // Send a notification to all users
  for(ev of events){

    const newNotification = new notification({
        recipient: "everyone",
        sender: "Admin Team",
        read: false,
        message: `Please be reminded that the event is happening tomorrow at ${ev.startTime}. Safety resources and emergency contacts are always available on the website.`,
        title:"Event Reminder : " + ev.title,
        notificationType: "announcement",
    });

    await newNotification.save();
    await _sendNotification(fcmTokens, {
        title: 'Event Reminder : ' + ev.title,
        body: `Please be reminded that the event is happening tomorrow at ${ev.startTime}. Safety resources and emergency contacts are always available on the website.`,
        notificationType: 'announcement',
        recipient: 'everyone',
        sender:"Admin Team"
      });
  }
};

// Function to initialize the cron job
const initializeCronJob = () => {
  // Runs every day at 5 AM
  cron.schedule('0 5 * * *', () => {
    console.log('Running cron job: Checking for tomorrow\'s events');
    checkForTomorrowEvents();
  });
};

module.exports = {
  initializeCronJob,
};