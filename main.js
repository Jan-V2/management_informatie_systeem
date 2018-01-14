var mysql = require('mysql');

function Message_To_Db() {//todo cleanup and refinement
    this.messages = [];

    this.con = mysql.createConnection({
        host: "livechat-database.cr21jhmlybpv.eu-central-1.rds.amazonaws.com",
        user: "dev",
        password: "mealtime_pants"
    });

    function Message(text, customer_indentifier, employee_id, customer_is_talking, is_annon) {
        this.is_annon = is_annon;
        if (!is_annon) {
            this.table_name = ["k" + customer_indentifier.toString()]
        }
        this.customer_identifier = customer_indentifier.toString();
        this.message = text;
        this.employee_id = employee_id.toString();
        this.timestamp = new Date().toISOString();
        this.get_data = function () {
            return [[this.message, this.customer_identifier, this.employee_id, this.timestamp ]]
        }
    }

    this.add_customer_message = function (text, customer_id, employee_id, customer_is_talking) {
        this.messages.push(new Message(text, customer_id, employee_id, customer_is_talking, false))
    };

    this.add_annon_message = function (text, ip, employee_id, customer_is_talking) {
        this.messages.push(new Message(text, ip, employee_id, customer_is_talking, true))
    };


    this.number_of_stored_messages = function () {
        return this.messages.length
    };

    this.send_messages = function () {
        var local_messages = this.messages;
        var local_con = this.con;
        local_con.connect(function(err) {
            if (err) throw err;
            console.log("Connected to database");
            for (var i = 0; i < local_messages.length; i++) {
                message_to_db(local_messages[i], local_con)
            }
            local_con.end();
            console.log("done");
        });
        this.messages = []
    };

    function message_to_db (message, db_con) {//message is een message object
        var sql_select_db = "use livechats;";
        var sql_table_customer = "CREATE TABLE IF NOT EXISTS ??" +
            "(" +
            "    id INT PRIMARY KEY AUTO_INCREMENT," +
            "    message TEXT NOT NULL," +
            "    customer_id TINYTEXT NOT NULL," +
            "    employee_id INT NOT NULL," +
            "    time TIMESTAMP NOT NULL" +
            ");";
        var sql_insert_message_customer = "INSERT INTO ?? (message, customer_id, employee_id, time) VALUES ?;";
        var sql_table_annon = "CREATE TABLE IF NOT EXISTS anonymous" +
            "(" +
            "    id INT PRIMARY KEY AUTO_INCREMENT," +
            "    message TEXT NOT NULL," +
            "    customer_ip TINYTEXT NOT NULL," +
            "    employee_id INT NOT NULL," +
            "    time TIMESTAMP NOT NULL" +
            ");";
        var sql_insert_message_annon = "INSERT INTO anonymous (message, customer_ip, employee_id, time) VALUES ?;";



        db_con.query(sql_select_db);
        if(message.is_annon){
            db_con.query(sql_table_annon);
            db_con.query(sql_insert_message_annon, [message.get_data()]);
        } else {
            db_con.query(sql_table_customer, [message.table_name]);
            db_con.query(sql_insert_message_customer, [message.table_name, message.get_data()]);
        }
        console.log("inserted message");
    }
}


var message_handler = new Message_To_Db();
message_handler.add_annon_message("an annoymous message", "127.0.0.1", 4, true);
message_handler.add_customer_message("a message send by a customer", 234, 5, false);
console.log(message_handler.number_of_stored_messages().toString());
message_handler.send_messages();
console.log(message_handler.number_of_stored_messages().toString());
