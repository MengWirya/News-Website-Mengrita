import express from "express";
import nodemailer from "nodemailer";
import bodyParser from "body-parser";
import cors from "cors";

const app = express();
app.use(cors({ origin: "http://127.0.0.1:5500" }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const ADMIN_EMAIL = "mengwirya@gmail.com";
const ADMIN_PASS = "ihve dbzb zgbk siep";

app.post("/send", async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message)
    return res.status(400).send("Semua form harus diisi.");

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: ADMIN_EMAIL,
      pass: ADMIN_PASS,
    },
  });

  try {
    await transporter.sendMail({
      from: email,
      to: ADMIN_EMAIL,
      subject: `Pesan baru dari ${name}`,
      text: `Kamu mendapatkan pesan baru dari website Mengrita :\n\nName: ${name}\nEmail: ${email}\nMessage: ${message}`,
    });

    await transporter.sendMail({
      from: ADMIN_EMAIL,
      to: email,
      subject: "Terima kasih sudah menghubungi kami!",
      text: `Halo ${name},\n\nKami telah menerima pesanmu:\n"${message}"\n\nKami akan membalas secepatnya!\n\nSalam,\nDengan hormat, Wiryateja Pamungkas`,
    });

    res.status(200).send("Emails berhasil dikirim");
  } catch (error) {
    console.error("Email error:", error);
    res.status(500).send("Email gagal dikirim");
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
``