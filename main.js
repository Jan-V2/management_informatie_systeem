var mysql = require('mysql');

function Message_To_Db() {

    var messages = [];

    var con = mysql.createConnection({
        host: "livechat-database.cr21jhmlybpv.eu-central-1.rds.amazonaws.com",
        user: "dev",
        password: "mealtime_pants"
    });

    function Message(text, employee_id, customer_indentifier, customer_is_talking, is_annon) {
        this.is_annon = is_annon;
        if (is_annon){
            this.table_name = ["anonymous"]
        } else {
            this.table_name = ["k" + customer_indentifier.toString()]
        }
        this.customer_identifier = customer_indentifier.toString();
        this.message = text;
        this.employee_id = employee_id;
        this.timestamp = new Date().toISOString();
        this.get_data = function () {
            return [[this.message, this.customer_identifier, this.employee_id, this.timestamp ]]
        }
    }

    this.add_customer_message = function (text, customer_id, employee_id, customer_is_talking) {
        messages.push(new Message(text, customer_id, employee_id, customer_is_talking, false))
    };

    this.add_annon_message = function (text, ip, employee_id, customer_is_talking) {
        messages.push(new Message(text, ip, employee_id, customer_is_talking, true))
    };
    this.send_messages = function () {
      for (var message in messages){
          message_to_db(message) //todo optimisation. it connects to db for each message
      }
      messages = []
    };

    this.stored_messages = function () {
        return messages.length
    };

    function message_to_db (message) {//message is een message object

        var sql_select_db = "use livechats;";
        var sql_table_customer = "CREATE TABLE ??" +
            "(" +
            "    id INT PRIMARY KEY AUTO_INCREMENT," +
            "    message TEXT NOT NULL," +
            "    customer_id INT NOT NULL," +
            "    employee_id INT NOT NULL," +
            "    time TIMESTAMP NOT NULL" +
            ");";
        var sql_insert_message_customer = "INSERT INTO ?? (message, customer_id, employee_id, time) VALUES ?;";
        var sql_table_annon = "CREATE TABLE ??" +
            "(" +
            "    id INT PRIMARY KEY AUTO_INCREMENT," +
            "    message TEXT NOT NULL," +
            "    customer_ip INT NOT NULL," +
            "    employee_id INT NOT NULL," +
            "    time TIMESTAMP NOT NULL" +
            ");";
        var sql_insert_message_annon = "INSERT INTO ?? (message, customer_ip, employee_id, time) VALUES ?;";

        con.connect(function(err) {
            if (err) throw err;
            console.log("Connected to database");
            con.query(sql_select_db);
            if(messages.is_annon){
                con.query(sql_table_annon, [message.table_name]);
                con.query(sql_insert_message_annon, [message.table_name, message.get_data()]);
            } else {
                con.query(sql_table_customer, [message.table_name]);
                con.query(sql_insert_message_customer, [message.table_name, message.get_data()]);
            }
            con.end();
            console.log("Inserted message");
        });
    }
}

var test_message = new Message("k100" , "testedytest", "developer");
message_to_db( test_message, con);
