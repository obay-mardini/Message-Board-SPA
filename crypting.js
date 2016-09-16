var bcrypt = require('bcrypt');


function hashPassword(plainTextPassword) {

    return new Promise(function(resolve, reject){
        bcrypt.genSalt(function(err, salt) {
            if (err) {
                return console.log(err);
            }

            console.log('salt   ' + salt);
            bcrypt.hash(plainTextPassword, salt, function(err, hash) {
                    if (err) {
                        console.log(err)
                    }
                    console.log(hash)
                    resolve(hash);
                    /*
                    checkPassword(checkWith, hash, function(err, doesMatch) {
                      console.log('number or rounds ' + bcrypt.getRounds(hash));
                      if(err){
                        console.log(err)
                      }else {
                        console.log(hash)
                        console.log(doesMatch)
                      }
                  })*/

                });
            });
    })
}

function checkPassword(textEnteredInLoginForm, hashedPasswordFromDatabase, callback) {
    bcrypt.compare(textEnteredInLoginForm, hashedPasswordFromDatabase, function(err, doesMatch) {
        if (err) {
            return callback(err);
        }
        callback(null, doesMatch);
    });
}


exports.hashPassword = hashPassword;
exports.checkPassword = checkPassword;
