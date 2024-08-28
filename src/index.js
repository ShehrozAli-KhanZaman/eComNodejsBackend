import dotenv from "dotenv";
import connectDB from "./db/index.js";
import app from "./app.js";

dotenv.config({
  path: "./.env",
});

connectDB()
  .then(() => {
    app.listen(process.env.PORT || 80, () => {
      console.log(`App is working fine now on port ${process.env.PORT}`);
    });
  })
  .catch((e) => console.log("DB Connection Error : ", e));
