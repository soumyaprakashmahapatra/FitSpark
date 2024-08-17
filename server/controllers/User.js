import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { createError } from "../error.js";
import User from "../models/User.js";
import Workout from "../models/Workout.js";

dotenv.config();


//Api functions
export const UserRegister = async (req, res, next) => {
  try {
    const { email, password, name, img } = req.body;

    // Check if the email is in use
    const existingUser = await User.findOne({ email }).exec();
    if (existingUser) {
      return next(createError(409, "Email is already in use."));
    }

    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);

    const user = new User({
      name,
      email,
      password: hashedPassword,
      img,
    });
    const createdUser = await user.save();
    const token = jwt.sign({ id: createdUser._id }, process.env.JWT, {
      expiresIn: "9999 years",
    });
    return res.status(200).json({ token, user });
  } catch (error) {
    return next(error);
  }
};

export const UserLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email });
    // Check if user exists
    if (!user) {
      return next(createError(404, "User not found"));
    }
    console.log(user);
    // Check if password is correct
    const isPasswordCorrect = await bcrypt.compareSync(password, user.password);
    if (!isPasswordCorrect) {
      return next(createError(403, "Incorrect password"));
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT, {
      expiresIn: "9999 years",
    });

    return res.status(200).json({ token, user });
  } catch (error) {
    return next(error);
  }
};






//----------------------------------------------------------------------------------------------------------------

//Now we will create Api functionlity for DashBoard
export const getUserDashboard = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const user = await User.findById(userId);
    if (!user) {
      return next(createError(404, "User not found"));
    }


    //Set Date Range for Today:
    const currentDateFormatted = new Date();
    const startToday = new Date(
      currentDateFormatted.getFullYear(),
      currentDateFormatted.getMonth(),
      currentDateFormatted.getDate()
    );
    const endToday = new Date(
      currentDateFormatted.getFullYear(),
      currentDateFormatted.getMonth(),
      currentDateFormatted.getDate() + 1
    );
    /*
    The purpose of setting startToday and endToday is to create a time range that covers the entire current day. This range can then be used to filter database queries to include only records from today. For example, if you want to find all workouts done by the user on July 25, 2024, you can use this time range to filter the results.
 
    for an example : 
    Assume the current date and time is July 25, 2024, 10:30 AM. Here's what each step does:
 
    // startToday = July 25, 2024, 00:00:00
    // endToday = July 26, 2024, 00:00:00
 
    */


    //calculte total calories burnt
    const totalCaloriesBurnt = await Workout.aggregate([
      { $match: { user: user._id, date: { $gte: startToday, $lt: endToday } } },
      {
        $group: {
          _id: null,
          totalCaloriesBurnt: { $sum: "$caloriesBurned" },
        },
      },
    ]);
    /*Workout is a Mongoose model representing the workout data in your MongoDB collection.
     aggregate is a method used to perform aggregation operations on the Workout collection.
     Here basically on the basis of start date and End Date and the particular all the exercise are grouped together.
     After the calorie is added

     */


    //Calculate total no of workouts
    const totalWorkouts = await Workout.countDocuments({
      user: userId,
      date: { $gte: startToday, $lt: endToday },
    });

    //Calculate average calories burnt per workout
    const avgCaloriesBurntPerWorkout =
      totalCaloriesBurnt.length > 0
        ? totalCaloriesBurnt[0].totalCaloriesBurnt / totalWorkouts
        : 0;

    // Fetch category of workouts
    const categoryCalories = await Workout.aggregate([
      { $match: { user: user._id, date: { $gte: startToday, $lt: endToday } } },
      {
        $group: {
          _id: "$category",
          totalCaloriesBurnt: { $sum: "$caloriesBurned" },
        },
      },
    ]);

    //It is creating an array

    /*First it aggregate(Filtering) all the workouts of a particular user on the basis of start date and end date 
        Then it group them on the basis of category and sum of all calories burnt for that particular workout.
    */


    //Format category data for pie chart
    const pieChartData = categoryCalories.map((category, index) => ({
      id: index,
      value: category.totalCaloriesBurnt,//(us particular category ka totalCalorie burnt)
      label: category._id,
    }));




    //Weekly Calorie burnt----->Bar graph
    const weeks = [];
    const caloriesBurnt = [];
    for (let i = 6; i >= 0; i--) {

      /*Here we are find the date like for first iteration it is finding the date just 6 less than today and so on */
      const date = new Date(
        currentDateFormatted.getTime() - i * 24 * 60 * 60 * 1000
        //i * 24 * 60 * 60 * 1000 is the number of milliseconds in i days.
      );



      weeks.push(`${date.getDate()}th`);

      const startOfDay = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate()
      );
      const endOfDay = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate() + 1
      );





      const weekData = await Workout.aggregate([
        {
          $match: {
            user: user._id,
            date: { $gte: startOfDay, $lt: endOfDay },
          },
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
            totalCaloriesBurnt: { $sum: "$caloriesBurned" },
          },
        },
        {
          $sort: { _id: 1 }, // Sort by date in ascending order
        },
      ]);

      /*$match: Filters workouts for the current user and date range (startOfDay to endOfDay).
      $group: Groups results by date and calculates the total calories burned.
      $sort: Sorts results by date in ascending order. */






      caloriesBurnt.push(
        weekData[0]?.totalCaloriesBurnt ? weekData[0]?.totalCaloriesBurnt : 0
      );
    }

    //---------------for loop end -----------------------

    /*Pushes the total calories burned for the day into the caloriesBurnt array.
    If no data is available for the day, it defaults to 0 */

    return res.status(200).json({
      totalCaloriesBurnt:
        totalCaloriesBurnt.length > 0
          ? totalCaloriesBurnt[0].totalCaloriesBurnt
          : 0,
      totalWorkouts: totalWorkouts,
      avgCaloriesBurntPerWorkout: avgCaloriesBurntPerWorkout,
      totalWeeksCaloriesBurnt: {
        weeks: weeks,
        caloriesBurned: caloriesBurnt,
      },
      pieChartData: pieChartData,
    });
  } catch (err) {
    next(err);
  }
};

/*Just see the dashboard picture--->So here the api function is returning the data like calories Burned , Workouts,Average Calorie burned , Weekly Calorie Burnd , Workout Category */

//Here the return is the data that api is providing from backend to frontend 


/*Sets the HTTP status code of the response to 200 OK, indicating that the request was successful and the server is returning the requested data.
This code constructs and sends a JSON response with various workout statistics for a user. The response includes:

totalCaloriesBurnt: The total calories burned by the user today. If no workouts are found for today, it defaults to 0.
totalWorkouts: The total number of workouts the user completed today.
avgCaloriesBurntPerWorkout: The average calories burned per workout today.
totalWeeksCaloriesBurnt: An object containing:
weeks: Labels for each of the past seven days.
caloriesBurned: Total calories burned on each of those days.
pieChartData: Data formatted for a pie chart, showing the total calories burned per workout category for today.
 */



//----------------Get Workout By date--------------------------------------------------------

//Now we will create Api functionlity for Workouts


//We are finding all the workouts on a particular day.
export const getWorkoutsByDate = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const user = await User.findById(userId);
    let date = req.query.date ? new Date(req.query.date) : new Date();
    /*The function checks if a date query parameter is provided in the request.
    If a date is provided, it converts it to a Date object.
    If no date is provided, it defaults to the current date (new Date()). */
    if (!user) {
      return next(createError(404, "User not found"));
    }
    const startOfDay = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    );
    const endOfDay = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate() + 1
    );

    // Find today's workouts for the user
    const todaysWorkouts = await Workout.find({
      userId: userId,
      date: { $gte: startOfDay, $lt: endOfDay },
    });


    // Calculate total calories burned from today's workouts
    const totalCaloriesBurnt = todaysWorkouts.reduce(
      (total, workout) => total + workout.caloriesBurned,
      0
    );
    /*reduce method iterates over todaysWorkouts to sum up the caloriesBurned for each workout. */

    return res.status(200).json({ todaysWorkouts, totalCaloriesBurnt });
  } catch (err) {
    next(err);
  }
};



//-------------------------addWorkout-------------------------------------------------------------------
export const addWorkout = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const { workoutString } = req.body;
    if (!workoutString) {
      return next(createError(400, "Workout string is missing"));
    }

    // Split workoutString into lines
    const eachworkout = workoutString.split(";").map((line) => line.trim());


    // Check if any workouts start with "#" to indicate categories
    const categories = eachworkout.filter((line) => line.startsWith("#"));

    if (categories.length === 0) {
      return next(createError(400, "No categories found in workout string"));
    }
    /*Filters lines that start with # (indicating categories).
     If no categories are found, it returns a 400 error.
   */

    const parsedWorkouts = [];
    //Initializes an empty array parsedWorkouts to store parsed workout details.
    let currentCategory = "";
    let count = 0;

    // Loop through each line to parse workout details
    await eachworkout.forEach((line) => {
      count++;


      //----------------------------------------------------------------------------------------------------
      if (line.startsWith("#")) {
        const parts = line?.split("\n").map((part) => part.trim());
        console.log(parts);
        if (parts.length < 5) {
          return next(
            createError(400, `Workout string is missing for ${count}th workout`)
          );
        }

        /*The forEach method is used to iterate over each element in the eachworkout array.
        The count variable is incremented with each iteration to keep track of the current workout being processed 
        This checks if the current line starts with #, which indicates the beginning of a new category.
        This line splits the current workout line into multiple parts based on newline characters (\n).
        The map method is used to trim whitespace from each part.
        The optional chaining (?.) ensures that if line is null or undefined, it won't cause an error.
        
        */
        // Update current category
        currentCategory = parts[0].substring(1).trim();
        /*This refers to the first element of the parts array. Typically, this is the category line that starts with #.
        .substring(1):
  
        The substring method extracts a part of the string starting from the specified index. In this case, substring(1) means "start from the second character (index 1)".
        Since categories start with #, this removes the # from the beginning of the string.
        .trim():
  
        The trim method removes any whitespace from both ends of the string.
        This ensures that any extra spaces around the category name are removed. */



        // Extract workout details
        const workoutDetails = parseWorkoutLine(parts);
        //From parseWorkoutLine method i.e defined below we get all the workout details tat we want add to database

        if (workoutDetails == null) {
          return next(createError(400, "Please enter in proper format "));
        }

        if (workoutDetails) {
          // Add category to workout details
          workoutDetails.category = currentCategory;
          parsedWorkouts.push(workoutDetails);
        }
      } else {
        return next(
          createError(400, `Workout string is missing for ${count}th workout`)
        );
      }
    });

    // Calculate calories burnt for each workout
    await parsedWorkouts.forEach(async (workout) => {
      workout.caloriesBurned = parseFloat(calculateCaloriesBurnt(workout));
      await Workout.create({ ...workout, user: userId });
    });

    /*Uses await to wait for the Workout.create method to complete.
    Workout.create is an asynchronous method that saves the workout to the database.
    The { ...workout, user: userId } syntax uses the spread operator to include all properties of the workout object and adds a user property with the userId. This associates the workout with the specific user. */

    return res.status(201).json({
      message: "Workouts added successfully",
      workouts: parsedWorkouts,
    });
  } catch (err) {
    next(err);
  }
};

// Function to parse workout details from a line
const parseWorkoutLine = (parts) => {
  const details = {};
  console.log(parts);
  if (parts.length >= 5) {
    details.workoutName = parts[1].substring(1).trim();
    details.sets = parseInt(parts[2].split("sets")[0].substring(1).trim());
    details.reps = parseInt(
      parts[2].split("sets")[1].split("reps")[0].substring(1).trim()
    );
    details.weight = parseFloat(parts[3].split("kg")[0].substring(1).trim());
    details.duration = parseFloat(parts[4].split("min")[0].substring(1).trim());
    console.log(details);
    return details;
  }
  return null;
};
/*details.workoutName extracts the workout name from the second element, trims it, and removes any leading character (like a space or special character).
details.sets parses the number of sets from the third element, assuming the format includes the word "sets".
details.reps parses the number of reps from the third element, assuming the format includes the word "reps" after "sets".
details.weight parses the weight from the fourth element, assuming the format includes the unit "kg".
details.duration parses the duration from the fifth element, assuming the format includes the unit "min".
Logs the details object to the console for debugging.
Returns the details object. */



// Function to calculate calories burnt for a workout
const calculateCaloriesBurnt = (workoutDetails) => {
  const durationInMinutes = parseInt(workoutDetails.duration);
  const weightInKg = parseInt(workoutDetails.weight);
  const caloriesBurntPerMinute = 5; // Sample value, actual calculation may vary
  return durationInMinutes * caloriesBurntPerMinute * weightInKg;
};
