import asyncHandler from 'express-async-handler';
import stripe from '../config/stripe.js';
import Course from '../models/Course.js';
import Center from '../models/Center.js';
import Enrollment from '../models/Enrollment.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import crypto from 'crypto';

const activateEnrollment = async (enrollment, transactionId, provider) => {
  const course = await Course.findById(enrollment.course);

  enrollment.status = 'active';
  enrollment.payment.status = 'paid';
  enrollment.payment.transactionId = transactionId;
  enrollment.payment.paidAt = new Date();
  enrollment.payment.provider = provider;
  await enrollment.save();

  if (course && !course.enrolledStudents.includes(enrollment.student)) {
    course.enrolledStudents.push(enrollment.student);
    course.popularity += 1;
    await course.save();
  }

  await User.findByIdAndUpdate(enrollment.student, {
    $addToSet: { enrolledCourses: enrollment.course },
  });

  if (course?.center) {
    await Center.findByIdAndUpdate(course.center, {
      $addToSet: { students: enrollment.student },
      $inc: { popularity: 1, revenue: enrollment.payment.amount || 0 },
    });
  }

  await Notification.create({
    user: enrollment.student,
    title: 'Payment Successful',
    message: `You are now enrolled in ${course?.title}`,
    type: 'payment',
    link: `/courses/${enrollment.course}`,
  });
};

// @desc    Create Stripe Checkout or CMI payment session
// @route   POST /api/payments/create-checkout
export const createCheckout = asyncHandler(async (req, res) => {
  const { courseId, provider = 'stripe' } = req.body;

  const course = await Course.findById(courseId);
  if (!course || !course.isPublished) {
    res.status(404);
    throw new Error('Course not found');
  }

  if (course.isFree || course.price === 0) {
    res.status(400);
    throw new Error('This course is free — use direct enrollment');
  }

  const existing = await Enrollment.findOne({
    student: req.user._id,
    course: courseId,
    status: { $in: ['active', 'completed'] },
  });

  if (existing) {
    res.status(400);
    throw new Error('Already enrolled in this course');
  }

  let enrollment = await Enrollment.findOne({
    student: req.user._id,
    course: courseId,
    status: 'pending',
  });

  if (!enrollment) {
    enrollment = await Enrollment.create({
      student: req.user._id,
      course: courseId,
      center: course.center,
      status: 'pending',
      payment: {
        amount: course.price,
        status: 'pending',
        provider,
      },
    });
  }

  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

  if (provider === 'stripe') {
    if (!stripe) {
      res.status(503);
      throw new Error('Stripe is not configured');
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: req.user.email,
      line_items: [
        {
          price_data: {
            currency: 'mad',
            product_data: {
              name: course.title,
              description: course.description?.slice(0, 200),
            },
            unit_amount: Math.round(course.price * 100),
          },
          quantity: 1,
        },
      ],
      metadata: {
        enrollmentId: enrollment._id.toString(),
        courseId: courseId.toString(),
        userId: req.user._id.toString(),
      },
      success_url: `${clientUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${clientUrl}/courses/${courseId}?payment=cancelled`,
    });

    enrollment.payment.transactionId = session.id;
    await enrollment.save();

    return res.json({
      success: true,
      provider: 'stripe',
      sessionId: session.id,
      url: session.url,
    });
  }

  if (provider === 'cmi') {
    const orderId = `CMI-${enrollment._id}-${Date.now()}`;
    const hash = crypto
      .createHmac('sha256', process.env.CMI_SECRET_KEY || 'cmi_dev_secret')
      .update(`${orderId}:${course.price}:${req.user._id}`)
      .digest('hex');

    enrollment.payment.transactionId = orderId;
    await enrollment.save();

    const cmiParams = new URLSearchParams({
      merchantId: process.env.CMI_MERCHANT_ID || 'dev_merchant',
      orderId,
      amount: course.price.toString(),
      currency: '504',
      okUrl: `${clientUrl}/payment/success?provider=cmi&order_id=${orderId}`,
      failUrl: `${clientUrl}/courses/${courseId}?payment=failed`,
      hash,
      enrollmentId: enrollment._id.toString(),
    });

    const cmiUrl = `${process.env.CMI_GATEWAY_URL || `${clientUrl}/payment/cmi-simulate`}?${cmiParams}`;

    return res.json({
      success: true,
      provider: 'cmi',
      orderId,
      url: cmiUrl,
    });
  }

  res.status(400);
  throw new Error('Invalid payment provider. Use "stripe" or "cmi"');
});

// @desc    Stripe webhook
// @route   POST /api/payments/webhook/stripe
export const stripeWebhook = asyncHandler(async (req, res) => {
  if (!stripe) {
    res.status(503);
    throw new Error('Stripe not configured');
  }

  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    res.status(400);
    throw new Error(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const enrollment = await Enrollment.findById(session.metadata.enrollmentId);

    if (enrollment && enrollment.status === 'pending') {
      await activateEnrollment(enrollment, session.payment_intent, 'stripe');
    }
  }

  res.json({ received: true });
});

// @desc    Verify payment status (Stripe session or CMI order)
// @route   GET /api/payments/verify
export const verifyPayment = asyncHandler(async (req, res) => {
  const { session_id, order_id, provider } = req.query;

  if (provider === 'cmi' && order_id) {
    const enrollment = await Enrollment.findOne({
      'payment.transactionId': order_id,
      student: req.user._id,
    }).populate('course', 'title');

    if (!enrollment) {
      res.status(404);
      throw new Error('Payment not found');
    }

    if (enrollment.status === 'pending') {
      await activateEnrollment(enrollment, order_id, 'cmi');
    }

    const updated = await Enrollment.findById(enrollment._id).populate('course', 'title');
    return res.json({ success: true, status: 'paid', enrollment: updated });
  }

  if (session_id && stripe) {
    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (session.payment_status !== 'paid') {
      return res.json({ success: false, status: session.payment_status });
    }

    let enrollment = await Enrollment.findById(session.metadata.enrollmentId).populate(
      'course',
      'title'
    );

    if (enrollment?.status === 'pending') {
      await activateEnrollment(enrollment, session.payment_intent, 'stripe');
    }

    const updated = await Enrollment.findById(session.metadata.enrollmentId).populate(
      'course',
      'title'
    );

    return res.json({ success: true, status: 'paid', enrollment: updated });
  }

  res.status(400);
  throw new Error('Invalid verification parameters');
});

// @desc    CMI callback (server-to-server)
// @route   POST /api/payments/cmi/callback
export const cmiCallback = asyncHandler(async (req, res) => {
  const { orderId, hash, status } = req.body;

  const expectedHash = crypto
    .createHmac('sha256', process.env.CMI_SECRET_KEY || 'cmi_dev_secret')
    .update(`${orderId}:${status}`)
    .digest('hex');

  if (hash !== expectedHash && process.env.NODE_ENV === 'production') {
    res.status(403);
    throw new Error('Invalid CMI hash');
  }

  if (status === 'approved') {
    const enrollment = await Enrollment.findOne({ 'payment.transactionId': orderId });
    if (enrollment && enrollment.status === 'pending') {
      await activateEnrollment(enrollment, orderId, 'cmi');
    }
  }

  res.json({ success: true });
});

// @desc    Get payment history
// @route   GET /api/payments/history
export const getPaymentHistory = asyncHandler(async (req, res) => {
  const enrollments = await Enrollment.find({
    student: req.user._id,
    'payment.status': 'paid',
  })
    .populate('course', 'title thumbnail')
    .sort('-payment.paidAt');

  res.json({ success: true, data: enrollments });
});
