const { Discipline, University } = require("../models/desciplineUniversity");
const Agent = require("../models/agent");
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const path = require("path");
const fs = require('fs');

const agentPage = async (req, res) => {
    return res.render("agent/list");
};

const agentAddPage = async (req, res) => {
    return res.render("agent/add");
};

const agentsList = async (req, res) => {
    const reqData = req.query;
    const columnNo = parseInt(reqData.order[0].column, 10);
    const sortOrder = reqData.order[0].dir === "desc" ? -1 : 1;
    const query = {};

    if (reqData.search.value) {
        const searchValue = new RegExp(
            reqData.search.value
                .split(" ")
                .filter((val) => val)
                .map((value) => value.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&"))
                .join(" "),
            "i"
        );

        query.$or = [{ firstName: searchValue }];
    }

    let sortCond;
    const response = {};
    switch (columnNo) {
        case 1:
            sortCond = {
                firstName: sortOrder,
            };
            break;
        default:
            sortCond = { created: sortOrder };
            break;
    }

    const count = await Agent.countDocuments(query);
    response.draw = 0;
    if (reqData.draw) {
        response.draw = parseInt(reqData.draw, 10) + 1;
    }
    response.recordsTotal = count;
    response.recordsFiltered = count;
    const skip = parseInt(reqData.start, 10);
    const limit = parseInt(reqData.length, 10);
    let agent = await Agent.find(query)
        .sort(sortCond)
        .skip(skip)
        .limit(limit);
    let srNo = skip;
    if (agent.length) {
        agent = agent.map((data) => {
            srNo += 1;

            let actions = `<a href="/admin/agent-edit/${data._id}" title="Edit"> <i class="fas fa-edit"></i> </a>&nbsp;<a class="text-danger" onclick="return confirm('Are you sure?')" href="/admin/agent-delete/${data._id}" title="Delete"> <i class="fas fa-trash"></i> </a>`;

            return {
                0: srNo,
                1: data.firstName + ' ' + data.lastName,

                2: data.email,
                3:
                    actions ||
                    '<span class="badge label-table badge-secondary">N/A</span>',
            };
        });
    }
    response.data = agent;
    return res.send(response);
};

const insertAgent = async (req, res) => {
    const {
        firstName,
        lastName,
        email,
        password
    } = req.body;

    const agent = await Agent.findOne({ email });

    if(agent){
        req.flash("error", "Email already exists");
        return res.redirect("/admin/add");
    }

    const university = new Agent({
        firstName: firstName,
        lastName: lastName,
        email: email,
        password: password
    });

    await university.save();

    req.flash("success", "Agent added successfully");
    return res.redirect("/admin/agent");
};

const agentEditPage = async (req, res) => {
    const { id } = req.params;
    const agent = await Agent.findOne({ _id: id });
    if (!agent) {
        return res.redirect("/admin/agent", "Agent not exist");
    }
    return res.render("agent/edit", { agent });
};

const updateAgent = async (req, res) => {
    const {
        firstName,
        lastName,
    } = req.body;
    const { id } = req.params;
    const agent = await Agent.findOne({ _id: id });

    if (!agent) {
        return res.redirect("/admin/agent", "Agent not exist");
    }

    agent.firstName = firstName;
    agent.lastName = lastName;

    await agent.save();

    req.flash("success", "Agent updated successfully");
    return res.redirect("/admin/agent");
};

const deleteAgent = async (req, res) => {
    const { id } = req.params;

    const users = await  User.find({
        "agent": {
            "$in": [id]
        }
    })

    if(users.length > 0) {
        req.flash("error", "You can not delete, students has been assigned to this agent");

    }else{
        await Agent.deleteOne({ _id: id });
        req.flash("success", "Agent deleted successfully");
    }

    return res.redirect("/admin/agent");
}

module.exports = {
    agentPage,
    agentAddPage,
    insertAgent,
    agentsList,
    agentEditPage,
    updateAgent,
    deleteAgent
};
