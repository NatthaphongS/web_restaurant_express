const { utcToZonedTime, format } = require("date-fns-tz");

const getCurrentThaiTime = () => {
  const thailandTimeZone = "Asia/Bangkok"; // Thailand time zone
  const currentUtcTime = new Date();
  const thailandTime = utcToZonedTime(currentUtcTime, thailandTimeZone);
  console.log(
    "New order created at:",
    format(thailandTime, "yyyy-MM-dd HH:mm:ss", { timeZone: "Asia/Bangkok" })
  );
  return thailandTime;
};

module.exports = getCurrentThaiTime;
