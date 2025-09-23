import express from "express";
import { processVideoFromQueue } from "./queueProcessor"; // We will create this file next

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Conversion service is running!");
});

// Route to trigger processing of video queue messages
app.post("/process-video-queue", async (req, res) => {
  try {
    console.log("Received request to process video queue.");
    req.on("close", async () => {
      await processVideoFromQueue();
    });
    
    res.status(200).send("Video queue processing initiated.");

    // In a real application, you might want to add authentication/authorization here
  } catch (error) {
    console.error("Error processing video queue:", error);
    res.status(500).send("Error processing video queue.");
  }
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
