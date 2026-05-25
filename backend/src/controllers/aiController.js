import asyncHandler from 'express-async-handler';
import { requireOpenAI } from '../config/openai.js';
import Center from '../models/Center.js';
import Course from '../models/Course.js';
import Quiz from '../models/Quiz.js';

// @desc    Smart search with AI
// @route   POST /api/ai/smart-search
export const smartSearch = asyncHandler(async (req, res) => {
  const { query, lat, lng } = req.body;
  const openai = await requireOpenAI();

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: `You are a search assistant for CentreHub Morocco, an educational platform.
Extract search parameters from user queries. Return JSON only with:
{ "subject": string|null, "location": string|null, "preferences": string[], "keywords": string[] }`,
      },
      { role: 'user', content: query },
    ],
    response_format: { type: 'json_object' },
  });

  const parsed = JSON.parse(completion.choices[0].message.content);

  let centerQuery = Center.find({ isActive: true });

  if (parsed.subject) {
    centerQuery = centerQuery.find({ subjects: { $in: [parsed.subject] } });
  }

  if (parsed.keywords?.length) {
    const regex = parsed.keywords.join('|');
    centerQuery = centerQuery.find({
      $or: [
        { name: { $regex: regex, $options: 'i' } },
        { description: { $regex: regex, $options: 'i' } },
      ],
    });
  }

  if (lat && lng) {
    centerQuery = centerQuery.find({
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates: [lng, lat] },
          $maxDistance: 50000,
        },
      },
    });
  }

  const centers = await centerQuery
    .populate('owner', 'name avatar')
    .limit(20)
    .sort('-rating');

  res.json({
    success: true,
    interpretation: parsed,
    data: centers,
  });
});

// @desc    Get recommendations
// @route   GET /api/ai/recommendations
export const getRecommendations = asyncHandler(async (req, res) => {
  const user = req.user;

  const enrolledSubjects = await Course.find({
    _id: { $in: user.enrolledCourses || [] },
  }).distinct('subject');

  const [recommendedCourses, recommendedCenters] = await Promise.all([
    Course.find({
      isPublished: true,
      _id: { $nin: user.enrolledCourses || [] },
      subject: { $in: enrolledSubjects.length ? enrolledSubjects : ['Programming', 'Mathematics', 'Languages'] },
    })
      .sort('-rating -popularity')
      .limit(6)
      .populate({ path: 'teacher', populate: { path: 'user', select: 'name avatar' } }),

    Center.find({ isActive: true, isVerified: true })
      .sort('-rating -popularity')
      .limit(6),
  ]);

  res.json({
    success: true,
    data: { courses: recommendedCourses, centers: recommendedCenters },
  });
});

// @desc    AI course assistant
// @route   POST /api/ai/assistant
export const courseAssistant = asyncHandler(async (req, res) => {
  const { message, context, courseId } = req.body;
  const openai = await requireOpenAI();

  let courseContext = '';
  if (courseId) {
    const course = await Course.findById(courseId).populate('pdfs videos');
    if (course) {
      courseContext = `Course: ${course.title}. Description: ${course.description}. Subject: ${course.subject}.`;
    }
  }

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: `You are an AI tutor for CentreHub Morocco. Help students understand lessons, summarize content, and answer questions. ${courseContext} ${context || ''}`,
      },
      { role: 'user', content: message },
    ],
  });

  res.json({
    success: true,
    reply: completion.choices[0].message.content,
  });
});

// @desc    Generate quiz with AI
// @route   POST /api/ai/generate-quiz
export const generateQuiz = asyncHandler(async (req, res) => {
  const { topic, numQuestions = 5, courseId, difficulty = 'medium' } = req.body;
  const openai = await requireOpenAI();

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: `Generate a quiz with ${numQuestions} multiple choice questions about "${topic}" at ${difficulty} difficulty.
Return JSON: { "title": string, "questions": [{ "question": string, "options": string[4], "correctAnswer": number (0-3), "explanation": string }] }`,
      },
      { role: 'user', content: `Create quiz about: ${topic}` },
    ],
    response_format: { type: 'json_object' },
  });

  const quizData = JSON.parse(completion.choices[0].message.content);

  if (courseId) {
    const quiz = await Quiz.create({
      title: quizData.title,
      course: courseId,
      questions: quizData.questions,
      isAIGenerated: true,
      createdBy: req.user._id,
    });

    await Course.findByIdAndUpdate(courseId, { $push: { quizzes: quiz._id } });

    res.status(201).json({ success: true, data: quiz });
  } else {
    res.json({ success: true, data: quizData });
  }
});

// @desc    AI study planner
// @route   POST /api/ai/study-planner
export const studyPlanner = asyncHandler(async (req, res) => {
  const { courses, hoursPerDay, deadline, goals } = req.body;
  const openai = await requireOpenAI();

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: `Create a detailed study plan. Return JSON with:
{ "plan": [{ "day": number, "date": string, "tasks": [{ "course": string, "activity": string, "duration": number }] }], "tips": string[] }`,
      },
      {
        role: 'user',
        content: `Courses: ${JSON.stringify(courses)}. Hours/day: ${hoursPerDay}. Deadline: ${deadline}. Goals: ${goals}`,
      },
    ],
    response_format: { type: 'json_object' },
  });

  const plan = JSON.parse(completion.choices[0].message.content);

  res.json({ success: true, data: plan });
});

// @desc    AI chatbot support
// @route   POST /api/ai/chatbot
export const chatbot = asyncHandler(async (req, res) => {
  const { message, history = [] } = req.body;
  const openai = await requireOpenAI();

  const messages = [
    {
      role: 'system',
      content: `You are CentreHub Morocco support chatbot. Help users with:
- Finding educational centers and courses
- Account and enrollment questions
- Platform features (live classes, AI assistant, progress tracking)
- General education guidance in Morocco
Be friendly, concise, and helpful.`,
    },
    ...history.slice(-10),
    { role: 'user', content: message },
  ];

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages,
  });

  res.json({
    success: true,
    reply: completion.choices[0].message.content,
  });
});

// @desc    Summarize PDF content
// @route   POST /api/ai/summarize
export const summarizeContent = asyncHandler(async (req, res) => {
  const { content, type = 'pdf' } = req.body;
  const openai = await requireOpenAI();

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: `Summarize this ${type} content for a student. Include key points, definitions, and a brief overview.`,
      },
      { role: 'user', content },
    ],
  });

  res.json({
    success: true,
    summary: completion.choices[0].message.content,
  });
});
