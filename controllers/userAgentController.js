const express = require("express");
const UserAgent = require('../models/userAgentModel')
const Chat = require("../models/chat");
const {University} = require('../models/desciplineUniversity');
const userModel = require("../models/userModel");
const Agent = require('../models/agent')


const randomAgentAssigned = async(req,res)=>{
    const {university_id} = req.body;
    try {
        const university = await University.findById(university_id)
        if(!university){
            return res.send({message:'university not found'})
        }
        const userId = req.userId;

        // Find user by ID
        const user = await userModel.findById(userId);
       // console.log(user,">>>>>>")
        if(!user){
            return res.send({message:'Invalid user'})
        }
       // console.log(user.agent,"agent" , " ", user.agent === true)
        if(user.agent.length==0){
            
            const randomAgent = await getRandomAgent(); // Assuming you have a function to get a random agent
            // console.log(randomAgent,"randomAgent")
            user.agent = randomAgent._id
            await user.save();
            await UserAgent.create({
                agent:randomAgent._id,
                user:userId,
                university:university_id
            })
            return res.send({message:'Agent assigned',user})
        }
        else{

            const userAgentData = await UserAgent.findOne({ user: userId })
            
            userAgentData.university = [...userAgentData.university, university_id];
            // console.log("userAgentData.university >>", userAgentData.university)

            await userAgentData.save();

            return res.send({message:'Applied successfully',user})
        }
       
        
    } catch (error) {
        return res.send({error:error.message})
        
    }
}

// Function to get a random agent
async function getRandomAgent() {
    try {
        // Count the total number of agents
        const count = await Agent.countDocuments();

        // Generate a random index
        const randomIndex = Math.floor(Math.random() * count);

        // Find a single agent skipping a random number of agents
        const randomAgent = await Agent.findOne().skip(randomIndex);

        return randomAgent;
    } catch (error) {
        throw new Error("Failed to get random agent: " + error.message);
    }
}

// Withdraw University Request

const withdrawAppliedRequest = async (req, res) => {
    try {
        const {university_id} = req.body;
        const userId = req.userId;

        const userAgent = await UserAgent.findOne({ user: userId })

        const newUniversityArr = [...userAgent.university].filter(uni => !uni._id.equals(university_id));

        userAgent.university = newUniversityArr;

        await userAgent.save();

        return res.send({message:'Request withdraw successfully'})


    } catch (error) {
        res.status(500).json({error:error.message});
    }
} 

const getUniversityData = async (req, res) => {
    
    try {
        const userId = req.userId;
        // Find the user-agent document for the given user ID
        const userAgent = await UserAgent.findOne({ user: userId }).populate("university");

        if (!userAgent) {
            return res.status(404).json({ message: "User not found" });
        }

        // Extract university data from the user-agent document
        const universities = userAgent.university;

        // Return the university data as the API response
       return res.json({ universities });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({error:error.message});
    }
};

const sendMessageAgent = async (req, res) => {
    try {
        const { message } = req.body;

        const userId = req.userId;
        
        const userData = await userModel.findById(userId)

        if(!userData.agent){
            const randomAgent = await getRandomAgent(); // Assuming you have a function to get a random agent
            userData.agent = randomAgent._id
            await userData.save();
        }

        const agentId = userData.agent[0];

        const chats = new Chat({
            message: message,
            agentId: agentId,
            userId: userId,
            sender: "user"
        });

        await chats.save();

        return res.send({message:'Message sent successfully'})

    } catch (error) {
        return res.send({error:error.message})
    }
}

const getAllMessages = async (req, res) => {
    try {
        const userId = req.userId;
        
        const userData = await userModel.findById(userId);

        const agentId = userData.agent[0];

        const chats = await Chat.find({ userId: userId, agentId: agentId });

        return res.send({message:'Message sent successfully', messages: chats})

    } catch (error) {
        return res.send({error:error.message})
    }
}

module.exports={randomAgentAssigned, getUniversityData, sendMessageAgent, getAllMessages, withdrawAppliedRequest}