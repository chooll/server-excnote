const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();
const mysql = require("mysql2");
const crypto = require("crypto");

const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "root",
  database: "enote_base",
});

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "http://localhost:3000");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

app.use(bodyParser.json());

app.get("/getAllNotes", (req, res) => {
  const idUser = escape(req.query.id);
  connection.query(
    `CALL get_all_user_note ('${idUser}')`,
    (error, results, fields) => {
      if (error) {
        console.log(error);
        res.status(500).send("Error retrieving users from database");
        return;
      }
      res.json(results);
    }
  );
});

app.get("/getNoteData", (req, res) => {
  const idNote = escape(req.query.id || "");
  connection.query(
    `SELECT * FROM Note WHERE id='${idNote}'`,
    (error, results, fields) => {
      if (error) {
        console.log(error);
        res.status(500).send("Error retrieving users from database");
        return;
      }
      res.json(results);
    }
  );
});

app.post("/getSubtask", (req, res) => {
  const idTask = req.body.idTask;
  connection.query(
    "CALL get_subtask_for_task (?)",
    [idTask],
    (error, results, fields) => {
      if (error) {
        console.log(error);
        res.status(500).send("Error retrieving users from database");
        return;
      }
      res.json(results);
    }
  );
});

app.post("/deleteSubtask", (req, res) => {
  const idSubtask = req.body.idSubtask;
  connection.query(
    "CALL delete_subtask (?)",
    [idSubtask],
    (error, results, fields) => {
      if (error) {
        console.log(error);
      }
      res.json("Subtask was deleted");
    }
  );
});

app.post("/addTeam", (req, res) => {
  const nameTeam = req.body.nameTeam;
  const idUser = req.body.idUser;

  connection.query(
    "CALL add_team(?,?)",
    [nameTeam, idUser],
    (error, results, fields) => {
      if (error) {
        console.log(error);
        res.status(500).send("Error retrieving users from database");
        return;
      }
      res.json("Team was added");
    }
  );
});

app.post("/updateTeam", (req, res) => {
  const { idTeam, nameTeam } = req.body;

  connection.query(
    "CALL update_team(?,?)",
    [idTeam, nameTeam],
    (error, results, fields) => {
      if (error) {
        throw error;
      }
      res.json("Team was updated");
    }
  );
});

app.post("/addSubtask", (req, res) => {
  const title = req.body.title;
  const idTask = req.body.idTask;
  const status = req.body.status;

  connection.query(
    "CALL add_subtask(?,?,?)",
    [title, status, idTask],
    (error, results, fields) => {
      if (error) {
        console.log(error);
        res.status(500).send("Error retrieving users from database");
      }
      res.json("Subtask was added");
    }
  );
});

app.get("/getAllTask", (req, res) => {
  const idUser = escape(req.query.id);
  connection.query(
    `CALL get_all_user_task ('${idUser}')`,
    (error, results, fields) => {
      if (error) {
        console.log(error);
        res.status(500).send("Error retrieving users from database");
        return;
      }
      res.json(results);
    }
  );
});

app.post("/registerUser", (req, res) => {
  const { surname, name, password, email } = req.body;
  const hashedPassword = crypto
    .createHash("sha256")
    .update(password)
    .digest("hex");

  connection.query(
    "CALL reg_user(?, ?, ?, ?, @status)",
    [name, surname, hashedPassword, email],
    (err, results) => {
      if (err) {
        console.error("Ошибка выполнения хранимой процедуры:", err);
        res.status(500).json({ error: "Ошибка сервера" });
      } else {
        // Получаем результат хранимой процедуры
        connection.query("SELECT @status", (err, statusResult) => {
          if (err) {
            console.error("Ошибка получения результата:", err);
            res.status(500).json({ error: "Ошибка сервера" });
          } else {
            const status = statusResult[0]["@status"];
            res.status(status === 200 ? 200 : 400).json({ status });
          }
        });
      }
    }
  );
});

app.post("/updateSubtask", (req, res) => {
  const idSubtask = req.body.idSubtask;
  const title = req.body.title;
  const status = req.body.status;
  connection.query(
    "CALL update_subtask(?,?,?)",
    [idSubtask, title, status],
    (error, results, fields) => {
      if (error) {
        console.log(error);
        res.status(500).send("Error retrieving users from database");
        return;
      }
      res.json("Subtask was updated");
    }
  );
});

app.get("/loginUser", (req, res) => {
  const login = escape(req.query.login);
  const password = escape(req.query.password);
  const hashedPassword = crypto
    .createHash("sha256")
    .update(password)
    .digest("hex");

  connection.query(
    `SELECT ID, name, surname FROM User WHERE email = '${login}' and password='${hashedPassword}'`,
    (error, results, fields) => {
      if (error) {
        console.log(error);
        res.status(500).send("Error retrieving users from database");
      }
      res.json(results);
    }
  );
});

app.post("/addTeam", (req, res) => {
  const nameTeam = req.body.nameTeam;
  const idUser = req.body.idUser;

  connection.query(
    "CALL add_team(?,?)",
    [nameTeam, idUser],
    (error, results, fields) => {
      if (error) {
        console.log(error);
        throw error;
      }
      res.json("Team was added");
    }
  );
});

app.get("/getUserTeam", (req, res) => {
  const idUser = escape(req.query.id);
  connection.query(
    `CALL get_users_team (?)`,
    [idUser],
    (error, results, fields) => {
      if (error) {
        console.log(error);
        res.status(500).send("Error retrieving users from database");
        return;
      }
      res.json(results);
    }
  );
});

app.post("/getUserIdEmail", (req, res) => {
  const email = req.body.email;
  connection.query(
    "CALL get_user_by_email(?)",
    [email],
    (error, results, fields) => {
      if (error) {
        throw error;
      }
      console.log("CALL get_user_by_email (?)", email);
      console.log(results);
      res.json(results[0]);
    }
  );
});

app.post("/addMember", (req, res) => {
  const idUser = escape(req.body.idUser);
  const idTeam = escape(req.body.idTeam);

  connection.query("CALL add_member(?,?)", [idUser, idTeam], (err, results) => {
    if (err) {
      throw err;
    }
    res.json("Member was added");
  });
});

app.post("/addTask", (req, res) => {
  const name = req.body.name;
  const idUser = req.body.idUser;
  const dataEnd = req.body.dataEnd;

  connection.query(
    "CALL add_task(?,?, ?)",
    [name, idUser, dataEnd],
    (error, results, fields) => {
      if (error) {
        console.log(error);
        res.status(500).send("Error retrieving users from database");
        return;
      }
      res.json("Task was added");
    }
  );
});

app.post("/addNote", (req, res) => {
  const noteName = req.body.name;
  const noteDescription = req.body.description;
  const userId = req.body.userId;

  // Вызов хранимой процедуры
  const query = "CALL add_note(?, ?, ?)";
  connection.query(
    query,
    [noteName, noteDescription, userId],
    (err, results) => {
      if (err) throw err;
      console.log("Note added successfully");
      res.send("Note added successfully");
    }
  );
});

app.post("/deleteNote", (req, res) => {
  const idNote = escape(req.body.idNote);

  // Вызов хранимой процедуры
  const query = "CALL delete_note(?)";
  connection.query(query, [idNote], (err, results) => {
    if (err) throw err;
    console.log("Note was delete");
    res.send("Note was delete");
  });
});

app.post("/updateNote", (req, res) => {
  const noteName = req.body.noteName;
  const noteDescription = req.body.noteDescription;
  const idNote = req.body.idNote;

  const query = "CALL update_note(?, ?, ?)";
  connection.query(
    query,
    [idNote, noteName, noteDescription],
    (err, results) => {
      if (err) throw err;
      res.send("Note was update");
    }
  );
});

app.post("/updateTask", (req, res) => {
  const idTask = req.body.idTask;
  const nameTask = req.body.nameTask;
  const dateEnd = req.body.dateEnd;

  connection.query(
    "CALL update_task(?,?,?)",
    [idTask, nameTask, dateEnd],
    (error, results, fields) => {
      if (error) throw error;
      res.send("Task was update");
    }
  );
});

app.post("/getTeam", (req, res) => {
  const idTeam = req.body.idTeam;

  connection.query("CALL get_team(?)", [idTeam], (error, results, fields) => {
    if (error) {
      console.log(error);
      res.status(500).send("Error retrieving users from database");
      return;
    }
    res.send(results);
  });
});

app.post("/getTask", (req, res) => {
  const idTask = req.body.idTask;
  const query = "CALL get_task(?)";
  connection.query(query, [idTask], (err, results) => {
    if (err) throw err;
    res.send(results);
  });
});

app.post("/deleteMember", (req, res) => {
  const idMember = req.body.idMember;
  const idTeam = req.body.idTeam;
  connection.query(
    "CALL delete_member(?,?)",
    [idTeam, idMember],
    (error, results, fields) => {
      if (error) throw error;
      res.json("Member was deleted");
    }
  );
});

app.post("/getMembersTeam", (req, res) => {
  const idTeam = req.body.idTeam;
  const idUser = req.body.idUser;

  connection.query(
    "CALL get_members_team(?,?)",
    [idTeam, idUser],
    (error, results, fields) => {
      if (error) {
        throw error;
      }
      res.json(results);
    }
  );
});

app.post("/getProject", (req, res) => {
  const idProject = req.body.idProject;

  connection.query(
    "CALL get_project(?)",
    [idProject],
    (error, results, fields) => {
      if (error) {
        throw error;
      }
      res.json(results[0]);
    }
  );
});

app.post("/updateKanbanItem", (req, res) => {
  const itemId = req.body.itemId;
  const name = req.body.name;

  connection.query(
    "CALL update_project_item(?,?)",
    [itemId, name],
    (error, results, fields) => {
      if (error) {
        throw error;
      }
      res.json("Item was updated");
    }
  );
});

app.post("/addKanbanItem", (req, res) => {
  const itemName = req.body.itemName;
  const idKanban = req.body.idKanban;

  connection.query(
    "CALL add_kanban_item(?, ?)",
    [itemName, idKanban],
    (error, results, fields) => {
      if (error) {
        throw error;
      }
      res.json("Item was added");
    }
  );
});

app.post("/addTaskKanban", (req, res) => {
  const [nameTask, itemId, userId] = [
    req.body.nameTask,
    req.body.itemId,
    req.body.userId,
  ];

  connection.query(
    "CALL add_project_task(?,?,?)",
    [nameTask, itemId, userId],
    (error, results, fields) => {
      if (error) {
        throw error;
      }
      res.json("Task was added");
    }
  );
});

app.post("/updateProjectTask", (req, res) => {
  const taskId = req.body.idTask;
  const nameTask = req.body.nameTask;

  connection.query(
    "CALL update_project_task(?,?)",
    [taskId, nameTask],
    (error, results, fields) => {
      if (error) throw error;
      res.json("Task was updated");
    }
  );
});

app.post("/updateProject", (req, res) => {
  const idProject = req.body.project;
  const newName = req.body.name;

  console.log("CALL update_project(?,?)", [idProject, newName]);
  connection.query(
    "CALL update_project(?,?)",
    [idProject, newName],
    (error, results, fields) => {
      if (error) throw error;
      res.json("Project was updated");
    }
  );
});

app.post("/deleteProjectTask", (req, res) => {
  const idItem = req.body.idItem;

  connection.query(
    "CALL delete_project_task(?)",
    [idItem],
    (error, results, fields) => {
      if (error) throw error;
      console.log("Deleted project", idItem);
      res.json("Task was deleted");
    }
  );
});

app.post("/getItemKanban", (req, res) => {
  const idItem = req.body.idItem;

  connection.query(
    "CALL get_item_kanban(?)",
    [idItem],
    (error, results, fields) => {
      if (error) {
        throw error;
      }
      res.json(results);
    }
  );
});

app.post("/getTaskKanban", (req, res) => {
  const idItem = req.body.idItem;

  connection.query(
    "CALL get_project_task(?)",
    [idItem],
    (error, results, fields) => {
      if (error) {
        throw error;
      }
      res.json(results[0]);
    }
  );
});

app.get("/getUserProject", (req, res) => {
  const idUser = req.query.id;

  connection.query(
    "CALL get_user_project(?)",
    [idUser],
    (error, results, fields) => {
      if (error) {
        throw error;
      }
      res.json(results);
    }
  );
});

app.post("/deleteProjectItem", (req, res) => {
  const idItem = req.body.idItem;

  connection.query(
    "CALL delete_project_item(?)",
    [idItem],
    (error, results, fields) => {
      if (error) throw error;
      res.json("Item was deleted");
    }
  );
});

app.post("/addProject", (req, res) => {
  const name = req.body.name;
  const id = req.body.id;

  connection.query(
    "CALL add_project(?,?)",
    [name, id],
    (error, results, fields) => {
      if (error) {
        throw error;
      }
      res.json("Project was added");
    }
  );
});

app.post("/deleteTask", (req, res) => {
  const idTask = req.body.idTask;

  connection.query(
    "CALL delete_task(?)",
    [idTask],
    (error, results, fields) => {
      if (error) {
        console.log(error);
        res.status(500).send("Error retrieving users from database");
        return;
      }
      res.status(200).send("Task was deleted");
    }
  );
});

app.listen(5000, () => {
  // Запускаем сервер на порту 5000
  console.log("Сервер запущен на http://localhost:5000/");
});
