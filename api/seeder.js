const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('../common/db');
const Problem = require('../common/models/Problem');

dotenv.config();
connectDB();

const problems = [
    {
        title: "Two Sum",
        description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
        inputFormat: "First line contains N. Second line contains N integers. Third line contains target.",
        outputFormat: "Two integers representing the indices.",
        testCases: [
            { input: "4\n2 7 11 15\n9", output: "0 1" }
        ]
    },
    {
        title: "Hello World",
        description: "Print 'Hello World' to stdout.",
        inputFormat: "None",
        outputFormat: "String 'Hello World'",
        testCases: [
            { input: " ", output: "Hello World" }
        ]
    }
];

const seedDB = async () => {
    try {
        await Problem.deleteMany({});
        await Problem.insertMany(problems);
        console.log("Database Seeded!");
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedDB();
