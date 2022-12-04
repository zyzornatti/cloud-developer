import * as AWS from 'aws-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate';

const AWSXRay = require('aws-xray-sdk')
const XAWS = AWSXRay.captureAWS(AWS)
const logger = createLogger('TodosAccess')

export class TodosAccess {
    constructor(
        private dynamoDBClient: DocumentClient = new XAWS.DynamoDB.DocumentClient(),
        private todosTable = process.env.TODOS_TABLE,
        private userIdIndex = process.env.TODOS_CREATED_AT_INDEX
    ) {

    }
    // get todos
    async getTodos(userId: string) {
        logger.info('Start get todos', {
            userId: userId
        })
        const result = await this.dynamoDBClient.query({
            TableName: this.todosTable,
            IndexName: this.userIdIndex,
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId': userId
            }
        }).promise();
        logger.info('End get todos', {
            userId: userId
        })
        return result.Items;
    }
    // create todo
    async createTodo(item: TodoItem) {
        logger.info('Start create todo', {
            userId: item.userId
        })
        await this.dynamoDBClient.put({
            TableName: this.todosTable,
            Item: item
        }).promise();
        logger.info('End create todo', {
            userId: item.userId
        })
    }

    // get todo by id
    async getTodoById(todoId: string, userId: string) {
        logger.info('Start get todo', {
            todoId: todoId,
            userId: userId
        })
        const result = await this.dynamoDBClient.get({
            TableName: this.todosTable,
            Key: {
                todoId,
                userId
            }
        }).promise();
        logger.info('End get todo', {
            todoId: todoId,
            userId: userId
        })
        return result.Item;
    }
    // update todo by id
    async updateTodoById(todoId: string, userId: string, todoUpdate: TodoUpdate) {
        logger.info('Start update todo', {
            userId: userId,
            todoId: todoId
        })
        await this.dynamoDBClient.update({
            TableName: this.todosTable,
            Key: {
                todoId,
                userId
            },
            UpdateExpression: 'set #name = :n, #dueDate = :due, #done = :d',
            ExpressionAttributeValues: {
                ':n': todoUpdate.name,
                ':due': todoUpdate.dueDate,
                ':d': todoUpdate.done
            },
            ExpressionAttributeNames: {
                '#name': 'name',
                '#dueDate': 'dueDate',
                '#done': 'done'
            }
        }).promise();
        logger.info('End update todo', {
            userId: userId,
            todoId: todoId
        })
    }
    // delete todo by id
    async deleteTodoById(todoId: string, userId: string) {
        logger.info('Start delete todo', {
            userId: userId,
            todoId: todoId
        })
        await this.dynamoDBClient.delete({
            TableName: this.todosTable,
            Key: {
                todoId,
                userId
            }
        }).promise();
        logger.info('End delete todo', {
            userId: userId,
            todoId: todoId
        })
    }
}