import Session from "../models/Session.js"
import Question from "../models/Question.js"

// API to create a new session with questions
const createSession = async (req, res) => {
    console.log("Create session request body:", req.body);
    
    try {

        const { role, experience, topicsToFocus, description, questions } = req.body
        console.log(req.user);

        const userId = req.user && req.user.id

        // checking if user is logged-in
        if (!userId) {
            return res.json({ success: false, message: "User not authenticated" })
        }

        console.log("User ID:", userId);
        console.log("Role:", role);
        console.log("Experience:", experience);
        console.log("Topics to Focus:", topicsToFocus);
        console.log("Questions:", questions);

        // checking if all required values are coming from frontend
        if (!role || !experience || !topicsToFocus || !Array.isArray(questions)) {
            return res.json({ success: false, message: "Missing required fields" })
        }

        console.log("All required fields are present. Proceeding to create session.");

        // creating a new interview session document in database
        // data is stored in Session model
        const session = await Session.create({
            user: userId,
            role,
            experience,
            topicsToFocus,
            description: description || ""
        })

        console.log("Session created with ID:", session._id);

        // saving multiple questions for this session
        // mapping array and linking each question with session id
        const questionData = questions.map((q) => ({
            session: session._id,
            question: q.question,
            answer: q.answer
        }))

        console.log("Prepared question data for insertion:", questionData);
        // inserting multiple questions at once into Question collection
        const savedQuestions = await Question.insertMany(questionData)

        console.log("Questions saved with IDs:", savedQuestions.map((q) => q._id));
        // storing all created question document IDs in the session document
        session.questions = savedQuestions.map((q) => q._id)
        await session.save()
        console.log("Session updated with question IDs.");
        res.json({ success: true, session })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: "Server error" })
    }
}


// API to get all sessions created by logged-in user
const getMySessions = async (req, res) => {
    try {
        const userId = req.user && req.user._id

        if (!userId) {
            return res.json({ success: false, message: "User not authenticated" })
        }

        // find all sessions linked with the logged-in user
        // populate questions means: fetch full question documents, not just IDs
        const sessions = await Session.find({ user: userId })
            .populate("questions")
            .sort({ createdAt: -1 })   // latest session first

        res.json({ success: true, sessions })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: "Server error" })
    }
}


// API to get a single session by its ID along with questions
const getSessionById = async (req, res) => {
    try {
        // find session with id from params and fetch its questions
        const session = await Session.findById(req.params.id)
            .populate({
                path: "questions",
                options: { sort: { isPinned: -1, createdAt: 1 } }  // pinned questions first
            })
                                  
        if (!session) {
            return res.json({ success: false, message: "Session not found" })
        }

        res.json({ success: true, session })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: "Server error" })
    }
}


// API to delete a session and its questions
const deleteSession = async (req, res) => {
    try {
        const session = await Session.findById(req.params.id)

        if (!session) {
            return res.json({ success: false, message: "Session not found" })
        }

        // only the owner of the session can delete it
        if (session.user.toString() !== req.user._id.toString()) {
            return res.json({ success: false, message: "Not authorized to delete this session" })
        }

        // delete all questions related to this session
        await Question.deleteMany({ session: session._id })

        // delete session document
        await session.deleteOne()

        res.json({ success: true, message: "Session deleted successfully" })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: "Server error" })
    }
}

export {
    createSession,
    getMySessions,
    getSessionById,
    deleteSession
}
