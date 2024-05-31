const User = require("../models/userModel");
const Admin = require("../models/admin");
const Chat = require("../models/chat");
const { Discipline, University } = require("../models/desciplineUniversity");
const UserAgentSchema = require("../models/userAgentModel");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const path = require("path");
const fs = require('fs');
const mongoose = require('mongoose');

const usersPage = async (req, res) => {

    // const { user } = req;

    // const agentId = user._id;

    // const { ObjectId } = mongoose.Types;

    // const response = await User.find({ agent:{$in:[new ObjectId("662f62436ca4a0947a032a98")]} })

    // console.log("user >>", response)

    return res.render("agent-panel/user/list");
};

const usersList = async (req, res) => {
    const reqData = req.query;
    const columnNo = parseInt(reqData.order[0].column, 10);
    const sortOrder = reqData.order[0].dir === "desc" ? -1 : 1;
    const { ObjectId } = mongoose.Types;
    const { _id } = req.session.user;
    const query = { agent:{$in:[new ObjectId(_id)]} };

    if (reqData.search.value) {
        const searchValue = new RegExp(
            reqData.search.value
                .split(" ")
                .filter((val) => val)
                .map((value) => value.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&"))
                .join(" "),
            "i"
        );

        query.$or = [{ fullName: searchValue }];
    }

    let sortCond;
    const response = {};
    switch (columnNo) {
        case 1:
            sortCond = {
                fullName: sortOrder,
            };
            break;
        default:
            sortCond = { created: sortOrder };
            break;
    }

    const count = await User.countDocuments(query);
    response.draw = 0;
    if (reqData.draw) {
        response.draw = parseInt(reqData.draw, 10) + 1;
    }
    response.recordsTotal = count;
    response.recordsFiltered = count;
    const skip = parseInt(reqData.start, 10);
    const limit = parseInt(reqData.length, 10);
    let user = await User.find(query)
        .sort(sortCond)
        .skip(skip)
        .limit(limit);
    let srNo = skip;
    if (user.length) {
        user = user.map((data) => {
            srNo += 1;

            let actions = `<a href="/agent/users/details/${data._id}" title="Edit"> <i class="fas fa-eye"></i> </a>`;

            return {
                0: srNo,
                1: data.fullName,

                2: data.email,
                3:
                    actions ||
                    '<span class="badge label-table badge-secondary">N/A</span>',
            };
        });
    }
    response.data = user;
    return res.send(response);
};

const usersDetailsPage = async (req, res) => {

    const { id } = req.params;

    const user = await User.findOne({ _id: id });
    if (!user) {
        req.flash("error", "User not found!");
        return res.redirect("/agent/users");
    }

    return res.render("agent-panel/user/view", { user });
};

const usersAddCustomDoc = async (req, res) => {
    const {
        docName,
    } = req.body;

    const { id } = req.params;

    const user = await User.findOne({ _id: id });

    user.customDocuments = [...user.customDocuments, {name: docName, path: ""}];

    user.save();

    req.flash("success", "New document field added successfully");
    return res.redirect(`/agent/users/details/${id}`);
}

const usersUniversitiesPage = async (req, res) => {

    const { id } = req.params;

    const user = { id: id }

    return res.render("agent-panel/user/universities", { user });
};

const universitiesList = async (req, res) => {
    const reqData = req.query;
    const userId = `${reqData._id}`;
    const columnNo = parseInt(reqData.order[0].column, 10);
    const sortOrder = reqData.order[0].dir === "desc" ? -1 : 1;
    const { ObjectId } = mongoose.Types;
    // const query = { user:{$in:[new ObjectId(userId)]} };
    const query = { user: userId };

    if (reqData.search.value) {
        const searchValue = new RegExp(
            reqData.search.value
                .split(" ")
                .filter((val) => val)
                .map((value) => value.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&"))
                .join(" "),
            "i"
        );

        // query.$or = [{ fullName: searchValue }];
    }

    let sortCond;
    const response = {};
    switch (columnNo) {
        case 1:
            sortCond = {
                fullName: sortOrder,
            };
            break;
        default:
            sortCond = { created: sortOrder };
            break;
    }

    const count = await UserAgentSchema.countDocuments(query);
    response.draw = 0;
    if (reqData.draw) {
        response.draw = parseInt(reqData.draw, 10) + 1;
    }
    response.recordsTotal = count;
    response.recordsFiltered = count;
    const skip = parseInt(reqData.start, 10);
    const limit = parseInt(reqData.length, 10);
    let user = await UserAgentSchema.findOne(query)
        .skip(skip)
        .limit(limit)
        .populate("university");
    let srNo = skip;
    
    if (user.university.length) {
        user = user.university.map((data) => {
            srNo += 1;

            let actions = `<a href="${process.env.FRONT_URL}/studies/${data.slug}" target="_blank" title="View Details"> <i class="fas fa-eye"></i> </a>`;

            return {
                0: srNo,
                1: data.university_name,

                // 2: data.university[0].university_name,
                2:
                    actions ||
                    '<span class="badge label-table badge-secondary">N/A</span>',
            };
        });
    }
    response.data = user;
    return res.send(response);
};

const usersChatPage = async (req, res) => {

    const { id } = req.params;

    const user = { id: id }
    const userId = id;
    const { _id } = req.session.user;

    const chats = await Chat.find({ userId: id, agentId: _id });

    return res.render("agent-panel/user/chat", { user, chats, userId });
};

const insertUsersChat = async (req, res) => {

    const {
        chat,
    } = req.body;

    const { id } = req.params;

    const { _id } = req.session.user;

    const chats = new Chat({
        message: chat,
        agentId: _id,
        userId: id,
        sender: "agent"
    });

    await chats.save();

    req.flash("success", "Message sent successfully");
    return res.redirect(`/agent/users/chat/${id}`);
};

const deleteAChat = async (req, res) => {
    
    const { chatId, userId } = req.params;

    await Chat.deleteOne({
        "_id": chatId
    })

    req.flash("success", "Message deleted successfully");
    return res.redirect(`/agent/users/chat/${userId}`);
}

module.exports = {
    usersPage,
    usersDetailsPage,
    usersUniversitiesPage,
    usersList,
    universitiesList,
    usersChatPage,
    insertUsersChat,
    usersAddCustomDoc,
    deleteAChat
};
