import * as nodeCron from 'node-cron'
import { deleteOldData } from './db'
import { updateOldData } from './onlineApi'

export const deleteCron = nodeCron.schedule('0 3 * * *', deleteOldData)

export const updateCron = nodeCron.schedule('0 * * * *', updateOldData)