const express = require('express');
const router = express.Router();
const db = require('../_helpers/db');
const authorize = require('../_middleware/authorize');
const Role = require('../_helpers/role');

router.post('/', authorize(Role.Admin), create);
router.get('/employee/:employeeId', authorize(), getByEmployeeId);
router.put('/:id/status', authorize(Role.Admin), updateStatus);
router.post('/onboarding', authorize(Role.Admin), onboarding);

async function create(req, res, next) {
    try {
        const workflow = await db.Workflow.create({
            employeeId: req.body.employeeId,
            type: req.body.type,
            details: req.body.details,
            status: req.body.status || 'Pending' // default to 'Pending' if not provided
        });
        res.status(201).json(workflow);
    } catch (err) { next(err); }
}


async function getByEmployeeId(req, res, next) {
    try {
        const workflows = await db.Workflow.findAll({
            where: { employeeId: req.params.employeeId }
        });

        const enrichedWorkflows = await Promise.all(workflows.map(async (workflow) => {
            const data = workflow.toJSON();

            if (data.type === 'Transfer' && data.details?.newDepartmentId) {
                const dept = await db.Department.findByPk(data.details.newDepartmentId);
                if (dept) {
                    data.details.newDepartmentName = dept.name;
                }
            }

            return data;
        }));

        res.json(enrichedWorkflows);
    } catch (err) { next(err); }
}


async function updateStatus(req, res, next) {
    try {
        const workflow = await db.Workflow.findByPk(req.params.id);
        if (!workflow) throw new Error('Workflow not found');
        await workflow.update({ status: req.body.status });
        res.json(workflow);
    } catch (err) { next(err); }
}

async function onboarding(req, res, next) {
    try {
        const workflow = await db.Workflow.create({
            employeeId: req.body.employeeId,
            type: 'Onboarding',
            details: req.body.details,
            status: 'Pending'
        });
        res.status(201).json(workflow);
    } catch (err) { next(err); }
}

module.exports = router;