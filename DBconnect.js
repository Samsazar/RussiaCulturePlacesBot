let info = {}

global.infoQuery = {}
global.likes = {}
const fs = require('fs')
const path = require('path')
const mysql = require('mysql');
var pool  = mysql.createPool({
  connectionLimit: 10,
  host: 'localhost',
  user: 'root',
  password: '',
  database : 'dbpp'
});


// TODO Нельзя чтобы он засыпал



// connection.query(`INSERT INTO 'users' set idTg = 0, typeOfPlace="Музей", city="Москва", keyword="Есенин" `, function (error, results, fields) {
//   // error will be an Error if one occurred during the query
//   // results will contain the results of the query
//   // fields will contain information about the returned results fields (if any)
// });

// ! TABLE SAVES

function addLike(idTg, idSys = " ", name=" ", image="https://zawenergy.md/wp-content/uploads/2021/08/1024px-No_image_available.svg.png") {
  pool.query(`INSERT INTO saves set id=(select id from users u where u.idTg = ${idTg}), personalId = (SELECT * FROM (SELECT COUNT(*) FROM saves where id = (select id from users u where u.idTg = ${idTg})) AS saves1), idOrigSys='${idSys}', name='${name}', image='${image}';`, function (error, results, fields) {
    if (error) throw error;
    console.log(results);
  });
}

function deleteLike(idTg, personalId=-1) {
  if (personalId == -1) {
    pool.query(`delete from saves where id = (select id from users u where u.idTg = ${idTg})`, function (error, results, fields) {
      if (error) throw error;
      console.log(results);
    });
  }
  else {
    pool.query(`delete from saves where id = (select id from users u where u.idTg = ${idTg}) and personalId = ${personalId}`, function (error, results, fields) {
      if (error) throw error;
      console.log(results);
    });
  }
}


function getLike(idTg) {
  pool.query(`select * from saves s where id = (select id from users u where u.idTg = ${idTg});`, function (error, results, fields) {
    if (error) throw error;
    console.log(results);
    global.likes = results;
  });
}

// delete from saves where id = 0;
// update saves set personalId=1 where idOrigSys="11841";

// ! TABLE USERS

// TODO Решить проблему с хранением

function isUserInBase(idTg) {
  pool.query(`select id from users where idTg = ${idTg}`, function (error, results, fields) {
    if (error) throw error;
    console.log(results)
    info = results;
  });
}


function addUser(idTg, typeOfplc="0", city="0", keyword="0") {
  isUserInBase(idTg);
  setTimeout(() => {
    console.log(info)

    if (info.length != 0) {

      console.log("TRUE", info)
      updateUserToP(idTg, typeOfplc);
    }
    else {
      pool.query(`INSERT INTO users set IdTg = ${idTg}, typeOfPlace = "${typeOfplc}", city = "${city}", keyword = "${keyword}", number = 0`, function (error, results, fields) {
        if (error) throw error;
        console.log(results);
        //INSERT INTO users set IdTg = 0, typeOfPlace = "Парки", city = "Москва", keyword = "Есенин";
      });
    }
  }, 1000)
}


function updateUserToP(idTg, typeOfplc) {
  pool.query(`update users set typeOfPlace = "${typeOfplc}" where idTg = ${idTg}`, function (error, results, fields) {
    if (error) throw error;
    console.log(results);
  });
}

function updateUserCity(idTg, city) {
  pool.query(`update users set city = "${city}" where idTg = ${idTg}`, function (error, results, fields) {
    if (error) throw error;
    console.log(results);
  });
}

function updateUserKeyword(idTg, keyword) {
  pool.query(`update users set keyword = "${keyword}" where idTg = ${idTg}`, function (error, results, fields) {
    if (error) throw error;
    console.log(results);
  });
}

function updateNumber(idTg) {
  pool.query(`update users set number = number + 1 where idTg = ${idTg}`, function (error, results, fields) {
    if (error) throw error;
    console.log(results);
  });
}

function zeroNumber(idTg) {
  pool.query(`update users set number = 0 where idTg = ${idTg}`, function (error, results, fields) {
    if (error) throw error;
    console.log(results);
  });
}

function getQuery(idTg) {
  pool.query(`select typeOfPlace, city, keyword, number from users where idTg = ${idTg}`, function (error, results, fields) {
    if (error) throw error;
    console.log(results);
    global.infoQuery = results;
  });
}



exports.addLike = addLike;
exports.deleteLike = deleteLike;
exports.getLike = getLike;
exports.addUser = addUser;
exports.updateUserToP = updateUserToP;
exports.updateUserCity = updateUserCity;
exports.updateUserKeyword = updateUserKeyword;
exports.updateNumber = updateNumber;
exports.getQuery = getQuery;
exports.zeroNumber = zeroNumber;


// ? Вывод всей таблицы
// * select * from users u join saves s where u.id = s.id; 
