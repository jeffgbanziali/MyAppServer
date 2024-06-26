const express = require('express');
const app = express();
const bodyParser = require('body-parser');


module.exports.sendNotification = (token, title, body) => {
    const message = {
      notification: {
        title: title,
        body: body,
      },
      token: token,
    };
  
    return admin.messaging().send(message);
  };

