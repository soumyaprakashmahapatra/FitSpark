import mongoose from "mongoose";

const WorkoutSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    workoutName: {
      type: String,
      required: true,
      unique: true,
    },
    sets: {
      type: Number,
    },
    reps: {
      type: Number,
    },
    weight: {
      type: Number,
    },
    duration: {
      type: Number,
    },
    caloriesBurned: {
      type: Number,
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);


/*sets: Number of sets performed in the workout.
reps: Number of repetitions per set.
weight: Weight used during the workout (if applicable).
duration: Duration of the workout in minutes.
caloriesBurned: Number of calories burned during the workout. */

export default mongoose.model("Workout", WorkoutSchema);
