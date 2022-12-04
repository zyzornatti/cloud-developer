import { TodosAccess } from '../dataLayer/todosAcess'
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'
import * as createError from 'http-errors'
import AttachmentUtils from '../fileStorage/attachmentUtils'

// TODO: Implement businessLogic
const logger = createLogger('TodosAccess')
const todosAccess = new TodosAccess();
const attachmentUtils = new AttachmentUtils();

export async function createTodo(createTodoRequest: CreateTodoRequest, userId: string): Promise<TodoItem> {
    const todoId = uuid.v4();
    const createdAt = new Date(Date.now()).toISOString();

    const item = {
        userId,
        todoId,
        createdAt,
        done: false,
        attachmentUrl: `https://${attachmentUtils.getBucketName()}.s3.us-east-2.amazonaws.com/${todoId}`,
        ...createTodoRequest
    };
    await todosAccess.createTodo(item);
    return item;
}
export async function getTodosForUser(userId: string) {
    return await todosAccess.getTodos(userId);
}

export async function getTodo(todoId: string, userId: string) {
    return await todosAccess.getTodoById(todoId, userId);
}

export async function generateUploadUrl(todoId: string) {
    const bucketName = attachmentUtils.getBucketName();
    const urlExpiration = process.env.SIGNED_URL_EXPIRATION;
    return attachmentUtils.getPresignedUploadURL(bucketName, todoId, parseInt(urlExpiration));
}

export async function updateTodo(todoId: string, userId: string,
    updateTodoRequest: UpdateTodoRequest) {

    if (!(await todosAccess.getTodoById(todoId, userId))) {
        logger.error('can not get todo', {
            key: todoId
        })
        throw createError(404, 'Todo does not exist')
    }
    await todosAccess.updateTodoById(todoId, userId, updateTodoRequest);

    return true;
}

export async function deleteTodo(todoId: string, userId: string) {
    if (!(await todosAccess.getTodoById(todoId, userId))) {
        logger.error('can not get todo', {
            key: todoId
        })
        throw createError(404, 'Todo does not exist')
    }

    await todosAccess.deleteTodoById(todoId, userId);

    return true;
}
