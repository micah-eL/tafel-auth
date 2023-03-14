const uuidv4 = require('uuid').v4;
const bcrypt = require('bcrypt')
const router = require('express').Router()

var AWS = require("aws-sdk");
AWS.config.update({region: "ca-central-1"});
var credentials = new AWS.SharedIniFileCredentials({profile: "cmpt-474-prj-credentials"});
AWS.config.credentials = credentials;

const dynamoClient = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = "users";


// Create new User
router.post('/', async (request, response) => {
    const {username, name, role, password} = request.body

    if (!password || password.length < 3) {
        return response.status(400).json({
            error: '`password` is shorter than the minimum allowed length (3)'
        })
    }

    const saltRounds = 10
    const passwordHash = await bcrypt.hash(password, saltRounds)

    var params = {
        TableName: TABLE_NAME,
        Item: {
            _id: String(uuidv4()),
            username : username,
            name: name,
            role: role,
            passwordHash: passwordHash
        }
    };
    dynamoClient.put(params, function(err, data) {
        if (err) response.status(400).json(err);
        else response.status(201).json(data);
    });
})

// Get all Users
router.get('/', async (request, response) => {
    const users = await dynamoClient.scan({TableName: TABLE_NAME}).promise();
    
    console.log(users);

    response.json(users)
})

// Get individual User
router.get('/:id', async (request, response) => {
    const data = await dynamoClient.get({
        TableName: TABLE_NAME,
        Key: {
            _id: request.params.id
        }
    }).promise();
    const user = data.Item;
    if (user) {
        response.json(user)
    } else {
        response.status(404).end()
    }
})

// Test - Update User
/*
router.put('/:id', (request, response, next) => {
    const body = request.body

    const user = {
        username: body.username,
        name: body.name,
        role: body.role,
        passwordHash: body.passwordHash,
    }

    User.findByIdAndUpdate(request.params.id, user, { new: true })
        .then(updatedUser => {
            response.json(updatedUser)
        })
        .catch(error => next(error))
})
*/


module.exports = router