var express = require('express');
var router = express.Router();
const CryptoJS = require('crypto-js');
const fs = require('fs');
/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');

  var userPass = "Lösen123";

  console.log(userPass);

  var cryptPass = CryptoJS.AES.encrypt(userPass, "Saltnyckel").toString();
  console.log(cryptPass);

  var originalPass = CryptoJS.AES.decrypt(cryptPass, "Saltnyckel").toString(CryptoJS.enc.Utf8);

  console.log(originalPass);
});

router.post('/add', function(req,res){
  let newUser = req.body;
  let username = newUser.user;
  let password = newUser.password;
  let cryptPass = CryptoJS.AES.encrypt(password, "Saltnyckel").toString();

  fs.readFile("users.json", function(err, data){

    if(err){
      console.log(err);

      if(err.code == "ENOENT"){
        console.log("err is ENOENT");

        let newestUser= [newUser];
        
        fs.writeFile("users.json", JSON.stringify(newestUser, null, 2), function(err){
          if(err){
            console.log(err)
          } 
          });
      }

      res.send({message: "Ny användare skapad"})
      return
    }
  
    const users = JSON.parse(data);

    const foundUser = users.find((u) => u.username === username);

    if(foundUser){
      res.send({message: "Username is already taken"});
      return
    }

    let newestUser = {"username": username, "password": cryptPass};
    users.push(newestUser);

    fs.writeFile("users.json", JSON.stringify(users, null, 2), function(err){
      if(err){
        console.log(err)
      } 
    })
    res.send({message: "added new"});
    })
});

router.post('/login', function(req, res){
  let newUser = req.body;
  let username = newUser.user;
  let password = newUser.password;

  fs.readFile("users.json", function(err, data){

    const users = JSON.parse(data);

    const foundUser = users.find((u) => u.username === username);

    if(foundUser){
      // let decrypted = CryptoJS.AES.decrypt(foudUser.password, "Saltnyckel").toString(CryptoJS.enc.Utf8);
      let uncryptedPass = foundUser.password;
      let decrypted = CryptoJS.AES.decrypt(uncryptedPass, "Saltnyckel").toString(CryptoJS.enc.Utf8);
      if(password == decrypted){
        res.send({message: "Login successfull!"});
        return
      } else{
        res.send({message: "wrong password!"});
        return
      }
    } else{
      res.send({message: "user not found"});
    }
  })
})

module.exports = router;
