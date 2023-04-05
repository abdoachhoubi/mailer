import nodemailer from "nodemailer";
import multer from "multer";
import fs from "fs";
import express from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";

dotenv.config();

const document = fs.readFileSync("./res/index.html", "utf8");

const app = express();

app.use(bodyParser.json());

app.use(express.static("res"));

const upload = multer({ dest: "uploads/" });

// Sending HTML
app.get("/", (req, res) => {
  res.send(document);
});

// Sending email
app.post("/emails", upload.single("file"), (req, res) => {
  try {
    const { path, originalname, encoding, mimetype } = req.file;
    fs.rename(path, `uploads/${originalname}`, () => {
      const attachment = fs.readFileSync(`uploads/${originalname}`);
      const { sender__email, password, email, subject, message } = req.body;
      const transporter = nodemailer.createTransport({
        host: "smtp.office365.com",
        port: 587,
        secure: false,
        auth: {
          user: sender__email,
          pass: password,
        },
      });

      const mailOptions = {
        from: sender__email,
        to: email,
        subject: subject,
        text: message,
        attachments: [
          {
            filename: originalname,
            content: attachment,
            encoding: encoding,
            contentType: mimetype,
          },
        ],
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          return res.status(404).send("Email not sent");
        } else {
          return res.status(200).send("Email sent");
        }
      });
    });
  } catch (error) {
    return res.status(404).send("Email not sent");
  }
});

// Listening on port 3000
app.listen(3000, () => {
  console.log("Listening on port 3000");
});
