var pg = require('pg');
var str = 'postgres://test:' + require('./password.json').test + '@localhost:5432/users';
var redis = require('redis')
var crypt = require('./crypting.js');
var clientRE = redis.createClient({
    host: 'localhost',
    port: 6379
});

function updateRecord(body,session,tableName, callback){
    console.log(body)
    var arr = [session.user.id];
    var count = 1;
    var client = new pg.Client(str);
    client.connect();
    client.on('error', function(err){
        console.log(err);
    });
    query = 'update ' + tableName;
    for (var key in body) {
        count ++;
        arr.push(body[key]);
        if(count === 2){
            query += " SET " + key + '= $' + count;
        } else {
            query += ', ' + key + '= $' + count;
        }
    }
    tableName === 'registration' ? query += ' where id = $1': query += ' where idreg = $1';
    console.log(query);
    console.log(arr);
    client.query(query, arr, function(err, result){
        console.log(result)
        if(err){
            callback(err);
        } else {
            callback(null,result);
        }
    });
}

function checkUserAuth(email, password, callback){
    var client = new pg.Client(str);
    client.connect();
    client.on('error', function(err){
        console.log(err);
    });
    var query = 'select * from registration where email = $1';
    client.query(query, [email], function(err, result){
        if(!result.rows[0]){
            callback('err');
        } else {
            crypt.checkPassword(password,result.rows[0].password, function(err, doesMatch){
                if(err){
                    callback('err')
                }
                if(doesMatch){
                    callback(null, result.rows[0].id);
                } else {
                    callback('err');
                }
            });

        }
    });
}
function signUp(firstName, lastName,password,email) {
    var client = new pg.Client(str);
    client.connect();
    client.on('error', function(err){
        console.log(err)
    });
    var query = "INSERT INTO registration (firstname, lastname, password,email) VALUES ($1, $2, $3, $4) returning *;";
    return new Promise(function(resolve, reject){
        client.query(query,[firstName, lastName, email, password], function(err, results) {
        if(err){
            console.log(err)
        }
        console.log(results)
        resolve(results.rows[0].id)
        client.end();
        })
    });

}

function filterTable(city, color, age) {
    var client = new pg.Client(str);
    client.connect();
    client.on('error', function(err){
        console.log(err)
    });
    client.on('end', function(res){
        //console.log(res)
    });

    var query = "select * from registration JOIN user_profiles ON registration.id = user_profiles.idreg";
    var arr = [];
    var count = 1;
    if(city || color || age){
        query += ' where ';
    }

    if(city){
        query += 'city = $' + count + '';
        arr.push(city);
        count ++;
    }

    if (color) {
        if(count === 2) query += ' and ';
        query += 'color = $' + count + '';
        arr.push(color);
        count++;
    }

    if (age) {
        if(count === 2 || count === 3) query += ' and '
        query += 'age = $' + count + '';
        arr.push(age);
    }

    //var query = "select * from user_names JOIN user_profiles ON user_names.id=user_profiles.id where age = 26";
    return new Promise(function(resolve, reject) {
        client.query(query,arr, function(err,results) {
            resolve(results.rows);
            client.end();
        });
    }).catch(function(err){
        console.log(err);
    });
}

function makeUserProfileTable(age,city,url,color,id){
    clientRE.del('joinedTables')
    var client = new pg.Client(str);
    client.connect();
    client.on('error', function(err){
        console.log(err)
    });
    client.on('end', function(res){
        //console.log(res)
    });

    var query = 'INSERT INTO user_profiles (age,city,url,color,idreg) VALUES ($1, $2, $3, $4, $5) returning *;'

    return new Promise(function(resolve, reject){
        client.query(query,[age,city,url, color,id], function(err, results) {
            resolve(results)
            client.end();
        });
    })

}

function sendQuery(name, lastName){
    clientRE.del('joinedTables')
    var client = new pg.Client(str);
    client.connect();
    client.on('error', function(err){
        console.log(err)
    });
    client.on('end', function(res){
        //console.log(res)
    });
    return new Promise(function(resolve, reject) {
        var query = "INSERT INTO user_names (name, lastname) VALUES ($1, $2) returning id;";
        client.query(query,[name, lastName], function(err, results) {
            resolve(results.rows[0].id);
            client.end();
        });
    });
}

function joinTables(){
    var client = new pg.Client(str);
    client.connect();
    client.on('error', function(err){
        console.log(err)
    });
    client.on('end', function(res){
        //console.log(res)
    });

    return new Promise(function(resolve, reject) {
        var query = "select firstname, age, city, url, color from registration JOIN user_profiles ON registration.id = user_profiles.idreg;";
        clientRE.get('joinedTables', function(err, data) {
            if (err) {
                return console.log(err);
            }

            if(data) {
                console.log('get')
                resolve(JSON.parse(data));
            } else {
                console.log('set')
                client.query(query,[], function(err, results) {
                    if (err) {
                        console.log(err)
                    }
                    clientRE.setex('joinedTables', 600000, JSON.stringify(results.rows), function(err, data) {
                        if (err) {
                            return console.log(err);
                        }
                    });
                    resolve(results.rows);
                    client.end();
                });
            }
        });
    }).catch(function(err){
        console.log(err)
    });
}

function constructUsersTable(tableName) {
    console.log('constr')
    var client = new pg.Client(str);
    client.connect();
    client.on('error', function(err){
        console.log(err);
    });
    client.on('end', function(res){
        //console.log(res);
    });
    var query = "SELECT * FROM " + tableName;
    return new Promise(function(resolve, reject) {
        client.query(query,[], function(err, results) {
            if(err){
                reject(err);
            }
            resolve(results);
        client.end();
    });
    });
}

function addMsg(msg){
    var client = new pg.Client(str);
    client.connect();
    client.on('error', function(err){
        console.log(err)
    });
    client.on('end', function(res){
        //console.log(res)
    });
    var query = 'INSERT INTO messages (msg) VALUES ($1) returning *;'
    return new Promise(function(resolve, reject){
        client.query(query,[msg], function(err, results) {
            resolve(results)
            console.log(results)
            client.end();
        });
    })

}

exports.filterTable = filterTable;
exports.constructUsersTable = constructUsersTable;
exports.joinTables = joinTables;
exports.sendQuery = sendQuery;
exports.makeUserProfileTable = makeUserProfileTable;
exports.signUp = signUp;
exports.checkUserAuth = checkUserAuth;
exports.updateRecord = updateRecord;
exports.addMsg = addMsg;
