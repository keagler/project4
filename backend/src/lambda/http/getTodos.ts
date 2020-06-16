import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import { getUserId} from '../../helpers/authHelper'
import { TodosAccess } from '../../dataLayer/todosAccess'
import { S3Helper } from '../../helpers/s3Helper'
import { ApiResponseHelper } from '../../helpers/apiResponseHelper'
import { createLogger } from '../../utils/logger'

const s3Helper = new S3Helper()
const apiResponseHelper= new ApiResponseHelper()
const logger = createLogger('todos')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info(`starttttttttttttttttttttttttttttttttttttttt`)
    console.log('starttttttttttttttttttttttttttttttttttttttt')
    const authHeader = event.headers['Authorization']
    console.log('authHeaderrrrrrrrrrrrrrrrrrrrrrr',authHeader)
    const userId = getUserId(authHeader) 
    console.log('userId',userId)
    logger.info(`get groups for user ${userId}`)
    const result = await new TodosAccess().getUserTodos(userId)
      
    for(const record of result){
        record.attachmentUrl = await s3Helper.getTodoAttachmentUrl(record.todoId)
    }

    return apiResponseHelper.generateDataSuccessResponse(200,'items',result)
}