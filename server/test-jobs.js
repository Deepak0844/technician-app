import dotenv from "dotenv";
dotenv.config();

import connectToDatabase from "./config/db.js";
import Job from "./models/Job.js";

async function test() {
  await connectToDatabase();
  console.log("Connected");
  // Find a job
  const job = await Job.findOne().lean();
  console.log({ sampleJob: job });
  
  if (job) {
    const custJobs = await Job.find({ customerId: job.customerId }).lean();
    console.log(`Jobs for customer ${job.customerId}:`, custJobs.length);
  }
  process.exit();
}
test();
