const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const loginRouter = require('express').Router()

var AWS = require("aws-sdk");
AWS.config.update({region: "ca-central-1"});
var credentials = new AWS.SharedIniFileCredentials({profile: "cmpt-474-prj-credentials"});
AWS.config.credentials = credentials;

const dynamoClient = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = "users";


loginRouter.post('/', async (request, response) => {
    const {username, password} = request.body
    const data = await dynamoClient.scan({TableName: TABLE_NAME}).promise();
    const user = data.Items.find(u => u.username === username);
    console.log("Logging in as: " + user)

    const passwordCorrect = user === null
        ? false
        : await bcrypt.compare(password, user.passwordHash)

    if (!(user && passwordCorrect)) {
        return response.status(401).json({
            error: 'invalid username or password'
        })
    }

    const userForToken = {
        username: user.username,
        id: user._id,
    }

    // token expires in 60*60 seconds, in 1 hour
    const token = jwt.sign(
        userForToken,
        process.env.SECRET,
        {
            expiresIn: 60 * 60
        }
    )

    response
        .status(200)
        .send({token, username: user.username, name: user.name, id: user._id})
})


module.exports = loginRouter