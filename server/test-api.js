import dotenv from "dotenv";
dotenv.config();

// We can just bypass Auth or check the db response
import connectToDatabase from "./config/db.js";
import JobService from "./services/jobService.js";
import Job from "./models/Job.js";

async function test() {
  await connectToDatabase();
  console.log("DB connected");
  
  const job = await Job.findOne().lean();
  if(!job) return console.log("No jobs in db");
  
  console.log(`Testing with user ${job.userId} and customer ${job.customerId}`);
  
  const jobs = await JobService.getJobsByCustomer(job.userId, job.customerId);
  console.log("Raw from Service:", JSON.stringify(jobs, null, 2));

  process.exit();
}
test();
