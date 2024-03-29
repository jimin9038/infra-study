import express from "express";
import fs from "fs";
import os from "os";
import SHA256 from "crypto-js/sha256";

const app = express();
app.use(express.json());

interface User {
  username: string;
  password: string;
  email: string;
}

function inspectCookie(res: any, req: any) {
  if (!req.headers.cookie || !req.headers.cookie.includes("login")) {
    return Promise.reject("Unauthorized");
  } else {
    fs.readFile("cookies.json", (err, data) => {
      if (err) {
        return Promise.reject("Error");
      }
      const json = JSON.parse(data.toString());
      const cookie = req.headers.cookie?.split("=")[1];
      const isAuthorized = json.find((c: string) => c === cookie);
      if (!isAuthorized) {
        return Promise.reject("Unauthorized");
      }
      return Promise.resolve();
    });
  }
}
app.get("/", (req, res) => {
  fs.readFile("week2.html", (err, data) => {
    if (err) {
      res.status(500).send("Error");
      return;
    }
    res.send(data.toString());
  });
});

app.post("/api/signup", (req, res) => {
  fs.readFile("week2.json", (err, data) => {
    if (err) {
      res.status(500).send("Error");
      return;
    }
    const json = JSON.parse(data.toString());
    json.push(req.body);
    fs.writeFile("week2.json", JSON.stringify(json), (err) => {
      if (err) {
        res.status(500).send("Error");
        return;
      }
      res.status(201).send("Success");
    });
  });
});

app.post("/api/login", (req, res) => {
  fs.readFile("week2.json", (err, data) => {
    if (err) {
      res.status(500).send("Error");
      return;
    }
    const json = JSON.parse(data.toString());
    const user = json.find(
      (user: User) =>
        user.username === req.body.username &&
        user.password === req.body.password
    );
    if (user) {
      const hash = SHA256(user.username + user.password).toString();
      fs.readFile("cookies.json", (err, data) => {
        if (err) {
          res.status(500).send("Error");
          return;
        }
        const json = JSON.parse(data.toString());
        json.push(hash);
        fs.writeFile("cookies.json", JSON.stringify(json), (err) => {
          if (err) {
            res.status(500).send("Error");
            return;
          }
        });
      });
      res.setHeader("Set-Cookie", "login=" + hash);
      res.status(200).send("Success");
    } else {
      res.status(401).end("Fail");
    }
  });
});

app.get("/api/users", async (req, res) => {
  try {
    await inspectCookie(res, req);
  } catch (e) {
    if (e === "Unauthorized") {
      res.status(401).send("Unauthorized");
    } else {
      res.status(500).send("Internal Server Error");
    }
    return;
  }
  fs.readFile("week2.json", (err, data) => {
    if (err) {
      res.status(500).send("Error");
      return;
    }
    const json = JSON.parse(data.toString());
    const users = json.map((user: User) => {
      return {
        username: user.username,
        email: user.email,
      };
    });
    res.send(data.toString());
  });
});

app.get("/api/os", async (req, res) => {
  try {
    await inspectCookie(res, req);
  } catch (e) {
    if (e === "Unauthorized") {
      res.status(401).send("Unauthorized");
    } else {
      res.status(500).send("Internal Server Error");
    }
    return;
  }

  res.send({
    type: os.type(),
    hostname: os.hostname(),
    cpu_num: os.availableParallelism(),
    total_mem: os.totalmem(),
  });
});

app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});
