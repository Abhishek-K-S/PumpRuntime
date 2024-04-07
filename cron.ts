import * as nodeCron from 'node-cron'
import { deleteOldData } from './db'

export const deleteCron = nodeCron.schedule('0 3 * * *', deleteOldData)