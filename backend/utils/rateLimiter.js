import {RateLimiterMemory} from "rate-limiter-flexible";

const opts = {
    points: 6, // 6 points
    duration: 1, // Per second
};
const requestRateLimiter = new RateLimiterMemory({
    points: 10,
    duration: 15
});

const submitRateLimiter = new RateLimiterMemory({
    points: 2,
    duration: 60_000
});

const adminRateLimiter = new RateLimiterMemory({
    points: 10,
    duration: 6.5
});

const adminLoginRateLimiter = new RateLimiterMemory({
    points: 10,
    duration: 60 * 1.5,
    blockDuration: 60 * 30
});

const adminGlobalRateLimiter = new RateLimiterMemory({
    points: 6,
    duration: 3
});

export async function requestLimiter(req, res, next) {
    let rateLimiterRes;
    let reachedLimit = false;
    try {rateLimiterRes = await requestRateLimiter.consume(req.ip, 1)} catch (error) {
        reachedLimit = true;
        rateLimiterRes = error;
    } finally {
        // console.log("requestLimiter", `${reachedLimit && ", ERROR"}\n`, rateLimiterRes)
        if (reachedLimit) {
            res.status(429)
            .json({
                success: false,
                code: 429,
                message: "Too many requests"
            })
            return;
        }
    }

    next();
}

export async function submitLimiter(req, res) {
    let rateLimiterRes;
    let reachedLimit = false;
    try {rateLimiterRes = await submitRateLimiter.consume(req.ip, 1)} catch (error) {
        reachedLimit = true;
        rateLimiterRes = error;
    } finally {
        // console.log("submitLimiter", `${reachedLimit && ", ERROR"}\n`, rateLimiterRes)
        if (reachedLimit) {
            res.status(429)
            .json({
                success: false,
                code: 429,
                message: "Too many requests"
            })
            return false;
        }
    }

    return true;
}

export async function adminLimiter(req, res, next) {
    let rateLimiterRes;
    let reachedLimit = false;
    const sessionId = req.cookies.sessionId;

    try {rateLimiterRes = await adminRateLimiter.consume((sessionId || req.ip), 1)} catch (error) {
        reachedLimit = true;
        rateLimiterRes = error;
    } finally {
        // console.log("requestLimiter", `${reachedLimit && ", ERROR"}\n`, rateLimiterRes)
        if (reachedLimit) {
            res.status(429)
            .json({
                success: false,
                code: 429,
                message: "Too many requests"
            })
            return;
        }
    }

    next();
}

export async function adminLoginLimiter(req, res, next) {
    let rateLimiterRes;
    let reachedLimit = false;
    const sessionId = req.cookies.sessionId;

    try {rateLimiterRes = await adminLoginRateLimiter.consume((sessionId || req.ip), 1)} catch (error) {
        reachedLimit = true;
        rateLimiterRes = error;
    } finally {
        // console.log("requestLimiter", `${reachedLimit && ", ERROR"}\n`, rateLimiterRes)
        if (reachedLimit) {
            res.status(429)
            .json({
                success: false,
                code: 429,
                message: "Too many requests"
            })
            return;
        }
    }

    next();
}

export async function adminGlobalLimiter(req, res, next) {
    let rateLimiterRes;
    let reachedLimit = false;
    const sessionId = req.cookies.sessionId;

    try {rateLimiterRes = await adminGlobalRateLimiter.consume((sessionId || req.ip), 1)} catch (error) {
        reachedLimit = true;
        rateLimiterRes = error;
    } finally {
        // console.log("requestLimiter", `${reachedLimit && ", ERROR"}\n`, rateLimiterRes)
        if (reachedLimit) {
            res.status(429)
            .json({
                success: false,
                code: 429,
                message: "Too many requests"
            })
            return;
        }
    }

    next();
}

export default {
    requestLimiter,
    submitLimiter,
    adminLimiter,
    adminLoginLimiter,
    adminGlobalLimiter
};