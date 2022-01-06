const { Batch } = require('../Models/BatchModel');
const { Center } = require('../Models/CenterModel');
const { Course } = require('../Models/CourseModel');
const { Instructor } = require('../Models/InstructorModel');

const eachDayOfInterval = require('date-fns/eachDayOfInterval');
const addMonths = require('date-fns/addMonths');

const isSunday = require('date-fns/isSunday');
const isMonday = require('date-fns/isMonday');
const isTuesday = require('date-fns/isTuesday');
const isWednesday = require('date-fns/isWednesday');
const isThursday = require('date-fns/isThursday');
const isFriday = require('date-fns/isFriday');
const isSaturday = require('date-fns/isSaturday');

module.exports.addDataToLinkedModel = async (dataList, Model, select, addId) => {
  try {
    dataList.map(async (data) => {
      const actualModel =
        Model === Instructor
          ? Instructor
          : Model === Course
          ? Course
          : Model === Batch
          ? Batch
          : Model === Center
          ? Center
          : Instructor;
      const updatedData = await actualModel.findById(data, `${select}`);
      if (!updatedData[select].find((id) => id.toString() === addId.toString())) {
        updatedData[select].push(addId);
        await updatedData.save();
      }
    });
  } catch (error) {
    throw new Error(error.message);
  }
};

module.exports.getBatchDates = async (batchDays, numClasses) => {

  // const getDayAsString = (day) => {
  //   const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  //   return weekdays[day];
  // };

  //get number value for weekday
  const getDayAsNumber = (day) => {
    const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return weekdays.indexOf(day);
  };

  //checks if give date falls on the given day or not
  const checkWeekDayExists = (date, day) => {

    switch (day) {
      case 0:
        return isSunday(date);
      case 1:
        return isMonday(date);
      case 2:
        return isTuesday(date);
      case 3:
        return isWednesday(date);
      case 4:
        return isThursday(date);
      case 5:
        return isFriday(date);
      default:
        return isSaturday(date);
    }
  };

  //converts date's to readable format
  const formatDate = (date) => {
    return new Date(date).toJSON().substring(0, 10);
  };

  const batchDaysNumber = [];
  batchDays.forEach((d) => {
    batchDaysNumber.push(getDayAsNumber(d));
  });

  const today = new Date();

  const endDateRange = addMonths(today, 12);

  const dateRange = eachDayOfInterval({
    start: new Date(today),
    end: new Date(endDateRange),
  });


  const batchDates = [];
  

  var classesCounter = 0;
  for (let i = 0; i < dateRange.length; i++) {    

      const date = formatDate(dateRange[i]);

      batchDaysNumber.forEach((d) => {

        const result = checkWeekDayExists(new Date(date), d);
        if (result === true) {
          batchDates.push(formatDate(date));
          return;
        }

      }); 

  }

  return {
    batchStartDate: batchDates[0],
    batchDates,
  };
};

//sort classes (array of class objects) by date
module.exports.sortClassesByDate = async (classes) => {
  const sortedClasses = classes.sort((a, b) => (a.date > b.date ? 1 : b.date > a.date ? -1 : 0));
  return sortedClasses;
};

//get the closest next class date to the given joining date
module.exports.getClosestNextDate = async (joiningDate, batchClasses) => {
	
  const closestNextDate = batchClasses.find((c) => {
  	

    if (new Date(c.date).toJSON().substring(0, 10) > new Date(joiningDate).toJSON().substring(0, 10)) {
      return c;
    }
  });
  return closestNextDate.date;
};

//calculate attendance percentage
module.exports.getClosestNextDate = async (joiningDate, batchClasses) => {
	
  const closestNextDate = batchClasses.find((c) => { 	  	 
  	  	 
    if (new Date(c.date).toJSON().substring(0, 10) > new Date(joiningDate).toJSON().substring(0, 10)) {
      return c;
    }
  });
  return closestNextDate.date;
};
