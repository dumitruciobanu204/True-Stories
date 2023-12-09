const express = require('express')
const app = express()
const path = require('path')
const bodyParser = require('body-parser');
var mysql = require('mysql')

var connection = mysql.createConnection({
    multipleStatements: true,
    user: 'lvl_1_crook',
    host: 'localhost',
    password: '1234',   
    database: 'truestoriesdb'
})

function blobToBase64(blob) {
    return blob.toString('base64');
}

app.use(express.static('static'))
app.use(bodyParser.urlencoded({ extended: true }));
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

app.get('/', (req,res) =>{
    const query = `
    SELECT * from stages; 
    SELECT * from lineups  
    INNER JOIN stages ON lineups.stage_ID = stages.stage_id 
    ORDER BY lineups.stage_ID; 
    SELECT * from contact_us 
    LEFT JOIN contact_question_responses on contact_us.contact_id = contact_question_responses.contact_id 
    ORDER BY contact_us.contact_id DESC LIMIT 5; 
    SELECT * from faq
    `;  

    connection.query(query, (err, results) =>{
        if (err){
            console.log(err)
        }
        else{
            const lnp = results[1].map(avatar =>{
                avatar.lineup_avatar = blobToBase64(avatar.lineup_avatar);
                return avatar;                
            })

            res.render('index', {stg: results[0], lnp: lnp, raq: results[2], faq: results[3]});
        }
    })
})

app.post('/submit-form', (req,res) =>{
    const { fname, lname, email, subject, message } = req.body;
    const query = `
    INSERT into contact_us (contact_name, contact_surname, contact_email, contact_subject, contact_message) 
    VALUES (?, ?, ?, ?, ?)
    `;
    connection.query(query, [fname, lname, email, subject, message], (err) => {
        if (err){
            console.log(err)
        }
        else {
            console.log('Message sent!')
            res.redirect('/')
        }
    })
})

app.get('/game', (req, res) =>{
    res.render('game')

})

app.listen(5000, ()=>{
    console.log("Listening to port 5000")
})