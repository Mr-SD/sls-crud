'use strict';

const AWS = require("aws-sdk");

const tn = process.env.TABLE_NAME

module.exports.create = async (event, context, callback) => {
  const data = (event.body === undefined ? {id: "1", whatever:"No-data"} : JSON.parse(event.body));

  const params = {
      TableName: tn,
      Item: {
          id: data.id,
          whatever: data.whatever
      }
  }

  try {
      const dynamoDb = new AWS.DynamoDB.DocumentClient();
      await dynamoDb["put"](params).promise();

      // console.log("success")

      const response = {
        statusCode: 200,
        body: JSON.stringify({
          data: data
        }),
      };

      callback(null, response);

    } catch (e) {
      console.log(e)
      callback(null);
    }
}

module.exports.read = async (event, context, callback) => {

  const params = {
    TableName: tn,
    Key: {
      id: event.pathParameters.id
    }
  };

  try {
    const dynamoDb = new AWS.DynamoDB.DocumentClient();
    const result = await dynamoDb["get"](params).promise();
    if (result.Item) {
      console.log(result.Item);

      const r = JSON.stringify(result.Item);
      // const r = result.Item;
      const response = {
          statusCode: 200,
          body: r
        };

      callback(null, response);
    } else {
      console.log("item not found");
      callback(null, "Item not found");
    }
  } catch (e) {
    console.log("error");
    console.log(e.message);
    return e;
  }
}

module.exports.update = async (event, context, callback) =>{
  const data = JSON.parse(event.body);
  const params = {
      TableName: tn,
      Key: {
          id: data.id
        },
      UpdateExpression: "SET whatever = :whatever",
      ExpressionAttributeValues: {
        ":whatever": data.whatever ? data.whatever : null
      },
      ReturnValues: "ALL_NEW"
  }
  try {
      const dynamoDb = new AWS.DynamoDB.DocumentClient();
      const result = await dynamoDb["update"](params).promise();
      
      const response = {
        statusCode: 200,
        body: JSON.stringify({message: "Update successful."})
      };

      callback(null, response);
    } catch (e) {
      console.log(data)
      console.log(e)
      return e;
    }
}

module.exports.deleteItem = async (event, context, callback) => {
  const data = JSON.parse(event.body);
  const params = {
    TableName: tn,
    Key: {
        id: data.id
    }
  };

  const response = {
    statusCode: 200,
    body: JSON.stringify({message: "Eliminated item: " + data.id})
  };

  try {
    const dynamoDb = new AWS.DynamoDB.DocumentClient();
    const result = await dynamoDb["delete"](params).promise();
    callback(null, response);
  } catch (e) {
    console.log(e.message);
    return e;
  }
}
