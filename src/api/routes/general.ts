import { AuditRepository } from './../repository/oracle/AuditRepository';
import { groupBy } from '../utils/groupBy';
import { helper } from "../utils";
import express, { Request, Response } from "express";
import { param } from "express-validator";
import { SubmissionStatusRepository } from "../repository/oracle/SubmissionStatusRepository";
import knex from "knex";
import { DB_CONFIG_DENTAL, SCHEMA_DENTAL, SCHEMA_GENERAL, DB_CONFIG_GENERAL } from "../config";
var _ = require('lodash');
let db = knex(DB_CONFIG_GENERAL);
var RateLimit = require('express-rate-limit');
const submissionStatusRepo = new SubmissionStatusRepository();
const auditRepo = new AuditRepository();

export const generalRouter = express.Router();
generalRouter.use(RateLimit({
    windowMs: 1*60*1000, // 1 minute
    max: 5000
}));
/**
 * Obtain data to show in the index view
 *
 * @param { action_id } action id.
 * @param { action_value } action value.
 * @return json
 */
generalRouter.get("/submissions/status/:action_id/:action_value", [
    param("action_id").notEmpty(), 
    param("action_value").notEmpty()
], async (req: Request, res: Response) => {

    try {

        const actionId = req.params.action_id;
        const actionVal = req.params.action_value;
        const permissions = req.user?.db_user.permissions ?? [];
        const result = await submissionStatusRepo.getSubmissionsStatus(actionId, actionVal, permissions);
        res.send({data: result});

    } catch(e) {
        console.log(e);  // debug if needed
        res.send( {
            status: 400,
            message: 'Request could not be processed'
        });
    }
});

/**
 * Obtain data to show in the index view
 *
 * @param { action_id } action id.
 * @param { action_value } action value.
 * @return json
 */
generalRouter.get("/submissions/:action_id/:action_value", [
    param("action_id").notEmpty(), 
    param("action_value").notEmpty()
], async (req: Request, res: Response) => {

    try {

        const actionId = req.params.action_id;
        const actionVal = req.params.action_value;
        const permissions = req.user?.db_user.permissions ?? [];
        const result = await submissionStatusRepo.getSubmissions(actionId, actionVal, permissions);
        const groupedId = groupBy(result, i => i.id);
        const labels = groupBy(result, i => i.date_code);
        res.send(
            {
                data: groupedId,
                labels: labels
            });

    } catch(e) {
        console.log(e);  // debug if needed
        res.send( {
            status: 400,
            message: 'Request could not be processed'
        });
    }
});

/**
 * Obtain data to show in the index view
 *
 * @param { event_type } event type.
 * @return json
 */
generalRouter.get("/audit/data/:event_type", [
    param("event_type").notEmpty()
], async (req: Request, res: Response) => {

    try {

        const event_type = parseInt(req.params.event_type);
        const result = await auditRepo.getAudit(event_type);
        res.send({ data: result });

    } catch(e) {
        console.log(e);  // debug if needed
        res.send( {
            status: 400,
            message: 'Request could not be processed'
        });
    }
});

/**
 * Obtain data to show the audit timeline data.
 *
 * @return json
 */
generalRouter.get("/audit/timeline", async (req: Request, res: Response) => {

    try {
        const permissions = req.user?.db_user.permissions ?? [];
        const result = await auditRepo.getAuditTimeline(permissions);
        res.send({ data: result });

    } catch(e) {
        console.log(e);  // debug if needed
        res.send( {
            status: 400,
            message: 'Request could not be processed'
        });
    }
});

/**
 * Obtain age from Dental Service data to show in the index view
 *
 * @param { action_id } action id.
 * @param { action_value } action value.
 * @return json
 */
generalRouter.get("/submissions/age/:action_id/:action_value", [
    param("action_id").notEmpty(),
    param("action_value").notEmpty()
], async (req: Request, res: Response) => {

    try {

        const actionId = req.params.action_id;
        const actionVal = req.params.action_value;
        const permissions = req.user?.db_user.permissions ?? [];
        const result = await submissionStatusRepo.getAgeSubmissions(actionId, actionVal, permissions);
        const labels = groupBy(result, i => i.age_range);
        res.send(
            {
                data: result,
                labels: labels
            });

    } catch(e) {
        console.log(e);  // debug if needed
        res.send( {
            status: 400,
            message: 'Request could not be processed'
        });
    }
});


/**
 * Obtain gender from Dental Service data to show in the index view
 *
 * @param { action_id } action id.
 * @param { action_value } action value.
 * @return json
 */
generalRouter.get("/submissions/gender/:action_id/:action_value", [
    param("action_id").notEmpty(),
    param("action_value").notEmpty()
], async (req: Request, res: Response) => {

    try {

        const actionId = req.params.action_id;
        const actionVal = req.params.action_value;
        const permissions = req.user?.db_user.permissions ?? [];
        const result = await submissionStatusRepo.getGenderSubmissions(actionId, actionVal, permissions);
        const groupedId = groupBy(result, i => i.id);
        const labels = groupBy(result, i => i.gender_name);
        res.send(
            {
                data: groupedId,
                labels: labels
            });

    } catch(e) {
        console.log(e);  // debug if needed
        res.send( {
            status: 400,
            message: 'Request could not be processed'
        });
    }
});

/**
 * Obtain data to show in the index view
 *
 * @return json
 */
generalRouter.post("/logs", async (req: Request, res: Response) => {
    try {
        let moduleName = req.body.params.moduleName;
        let userId = req.body.params.userName;
        let dateFrom = req.body.params.dateFrom;
        let dateTo = req.body.params.dateTo;
        let firstName = req.body.params.firstName;
        let lastName = req.body.params.lastName;

        db = await helper.getOracleClient(db, DB_CONFIG_GENERAL);

        let query = db(`${SCHEMA_GENERAL}.SUBMISSIONS_LOGS`)
            .whereIn('SCHEMA_NAME', moduleName)
            .orderBy('ID', 'DESC');

        if (userId) {
            const userRow = await db(`${SCHEMA_GENERAL}.USER_DATA`)
                .select('USER_EMAIL')
                .where('ID', userId)
                .first();

            if (userRow && userRow.user_email) {
                const rows = await db(`${SCHEMA_GENERAL}.USER_DATA`)
                .select('ID')
                .whereRaw('LOWER("USER_EMAIL") = ?', [userRow.user_email.toLowerCase()]);

                const matchedUserIds = rows.map(r => Number(r.id));

                if (matchedUserIds.length === 1 && matchedUserIds[0] === userId) {
                    query.where("USER_ID", userId);
                }

                else if (matchedUserIds.length > 0) {
                    query.whereIn("USER_ID", matchedUserIds);
                }else {
                    query.where("USER_ID", -1);
                }
            }
        }

        if(dateFrom && dateTo) {
            query.where(db.raw("TO_CHAR(TO_DATE(ACTION_DATE, 'YYYY-MM-DD HH24:MI:SS'), 'YYYY-MM-DD') >=  ? "+
                                "AND TO_CHAR(TO_DATE(ACTION_DATE, 'YYYY-MM-DD HH24:MI:SS'), 'YYYY-MM-DD') <= ?",
                [dateFrom, dateTo]));
        }

        if (firstName && firstName.trim() !== '') {
            const lowerSearchFn = firstName.trim().toLowerCase();

            query.where(function () {
                this.whereRaw(`LOWER(FIRST_NAME_CLIENT) LIKE ?`, [`%${lowerSearchFn}%`]);
            });
        }

        if (lastName && lastName.trim() !== '') {
            const lowerSearchLn = lastName.trim().toLowerCase();

            query.where(function () {
                this.whereRaw(`LOWER(LAST_NAME_CLIENT) LIKE ?`, [`%${lowerSearchLn}%`]);
            });
        }

        const queryUsers = await db(`${SCHEMA_GENERAL}.SUBMISSIONS_LOGS`)
            .select(
                db.raw('LOWER("USER_EMAIL") as "text"'),
                db.raw('MIN("USER_ID") as "value"')
            )
            .whereNotNull('USER_ID')
            .groupByRaw('LOWER("USER_EMAIL")')
            .orderBy('text', 'ASC');

        const moduleLogs = await query;

        res.send({data: moduleLogs, users: queryUsers});

    } catch(e) {
        console.log(e);  // debug if needed
        res.send( {
            status: 400,
            message: 'Dashboard logs could not be processed'
        });
    }
});

/**
 * Obtain data to show in export file
 *
 * @param {status} status of request
 * @return json
 */
generalRouter.post("/export/", async (req: Request, res: Response) => {
    try {
        var requests = req.body.params.requests;
        let moduleName = req.body.params.moduleName;
        var dateFrom = req.body.params.dateFrom;
        var dateTo = req.body.params.dateTo;
        let firstName = req.body.params.firstName;
        let lastName = req.body.params.lastName;
        db = await helper.getOracleClient(db, DB_CONFIG_GENERAL);
        let userId = req.body.params.userName;

        let query = db(`${SCHEMA_GENERAL}.SUBMISSIONS_LOGS`)
                    .select('SCHEMA_NAME',
                            'TITLE',
                            'ACTION_TYPE_DESCRIPTION',
                            'SUBMISSION_ID',
                            'FIRST_NAME_CLIENT',
                            'LAST_NAME_CLIENT',
                            'USER_NAME',
                            'USER_EMAIL',
                            'ACTION_DATE'
                    )
                    .whereIn('SCHEMA_NAME', moduleName);

        if(requests.length > 0){
            query.whereIn("ID", requests);
        }

        if (userId) {
            const userRow = await db(`${SCHEMA_GENERAL}.USER_DATA`)
                .select('USER_EMAIL')
                .where('ID', userId)
                .first();

            if (userRow && userRow.user_email) {
                const rows = await db(`${SCHEMA_GENERAL}.USER_DATA`)
                .select('ID')
                .whereRaw('LOWER("USER_EMAIL") = ?', [userRow.user_email.toLowerCase()]);

                const matchedUserIds = rows.map(r => Number(r.id));

                if (matchedUserIds.length === 1 && matchedUserIds[0] === userId) {
                    query.where("USER_ID", userId);
                }

                else if (matchedUserIds.length > 0) {
                    query.whereIn("USER_ID", matchedUserIds);
                }else {
                    query.where("USER_ID", -1);
                }
            }
        }

        if(dateFrom && dateTo) {
            query.where(db.raw("TO_CHAR(TO_DATE(ACTION_DATE, 'YYYY-MM-DD HH24:MI:SS'), 'YYYY-MM-DD') >=  ? "+
                                "AND TO_CHAR(TO_DATE(ACTION_DATE, 'YYYY-MM-DD HH24:MI:SS'), 'YYYY-MM-DD') <= ?",
                [dateFrom, dateTo]));
        }

        if (firstName) {
            const lowerSearchFn = firstName.trim().toLowerCase();

            query.where(function () {
                this.whereRaw(`LOWER(FIRST_NAME_CLIENT) LIKE ?`, [`%${lowerSearchFn}%`]);
            });
        }

        if (lastName) {
            const lowerSearchLn = lastName.trim().toLowerCase();

            query.where(function () {
                this.whereRaw(`LOWER(LAST_NAME_CLIENT) LIKE ?`, [`%${lowerSearchLn}%`]);
            });
        }

        query.orderBy('ID', 'ASC');

        const moduleLogs = await query;

        var bufferQuery = Object();
        let stringQuery = query.toString();

        // Verify the length of the serialized JSON
        const maxLengthInBytes = 1 * (1024 * 1024); // 1MB to  bytes

        if (Buffer.byteLength(stringQuery, 'utf8') > maxLengthInBytes) {
            console.log('The object exceeds 1MB. It will be truncated.');
            stringQuery = stringQuery.substring(0, maxLengthInBytes);
        }

        if(!_.isEmpty(query)) {
            bufferQuery = Buffer.from(stringQuery);
        }else{
            bufferQuery = null;
        }

        res.json({ status: 200, dataLogs: moduleLogs});

    } catch(e) {
        console.log(e);  // debug if needed
        res.send( {
            status: 400,
            message: 'Request could not be processed'
        });
    }
});