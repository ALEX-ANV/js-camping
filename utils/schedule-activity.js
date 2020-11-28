const {ACTIVITY_TIMEOUT} = require('./constants');

const schedules = {};

const start = (userId, fn) => {
    const id = setInterval(fn, ACTIVITY_TIMEOUT)
    schedules[userId] = {id, fn};
}

const stop = (userId) => {
    clearInterval(schedules[userId].id);
}

const update = (userId) => {
    const fn = schedules[userId].fn;
    stop(userId);
    start(userId, fn);
}

module.exports.start = start;
module.exports.stop = stop;
module.exports.update = update;
